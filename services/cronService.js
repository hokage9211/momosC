// services/cronService.js
const cron = require('node-cron');
const Bill = require('../models/Bill');
const ArchivedBill = require('../models/ArchivedBill');
const { sendSalesReportEmail } = require('./emailService');

function generateSalesReport(bills) {
    let totalSales = 0;
    let deletedCount = 0;
    let unpaidCount = 0;
    let unpaidBillAmount=0;
let deletedAmount=0;
    const billRows = bills.map((bill) => {
        const itemDetails = bill.items.map(item => `${item.name} x${item.quantity}`).join(', ');
        if (!bill.deleted) totalSales += bill.total;
        if (bill.deleted) {

            deletedCount++
            deletedAmount+=bill.total;
        };
        if (bill.payment !== 'Paid' && (!bill.deleted)) unpaidCount++;
        if (bill.payment !== 'Paid' && (!bill.deleted)) unpaidBillAmount+=bill.total;


        return `
            <tr>
                <td>${new Date(bill.createdAt).toLocaleString()}</td>
                <td>${itemDetails}</td>
                <td>${bill.total}</td>
                <td>${bill.payment}</td>
                <td>${bill.deleted ? 'Yes' : 'No'}</td>
            </tr>
        `;
    });

    return {
        subject: `Daily Sales Report - ${new Date().toLocaleDateString()}`,
        html: `
            <h2>Sales Summary for ${new Date().toLocaleDateString()}</h2>
            <p><strong>Total Sales:</strong> ₹${totalSales}</p>
            <p><strong>Actual Sale(Total Sale - Udhaari):</strong> ₹${totalSales-unpaidBillAmount}</p>
            <p><strong>Unpaid Bills(Udhaari):</strong> ${unpaidCount}:₹ =>:${unpaidBillAmount}</p>
            <p><strong>Deleted Bills:</strong> ${deletedCount}:₹ => ${deletedAmount}</p>
            <br/>
            <table border="1" cellpadding="5" cellspacing="0">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Deleted</th>
                    </tr>
                </thead>
                <tbody>${billRows.join('')}</tbody>
            </table>
        `
    };
}

async function archiveTodayBillsAndSendReport() {
    try{
           const bills = await Bill.find({});
    if (bills.length === 0) return;

    await ArchivedBill.insertMany(bills);
    const { subject, html } = generateSalesReport(bills);
    await sendSalesReportEmail(subject, html);
    await Bill.deleteMany({});
    console.log('Cron job completed: Bills archived and email sent.');
        
    }catch(err){
        console.log(err)
    }
 
}

// Schedule cron for 11:59 PM every day
cron.schedule('19 12 * * *', () => {
    console.log('Running daily sales cron job...');
    archiveTodayBillsAndSendReport();
},{
    timezone: "Asia/Kolkata"   // 👈 Force it to IST
}
);

// Expose manual trigger
module.exports = { archiveTodayBillsAndSendReport };
