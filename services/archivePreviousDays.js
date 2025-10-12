// services/archivePreviousDays.js
const Bill = require('../models/Bill');
const ArchivedBill = require('../models/ArchivedBill');
const { sendSalesReportEmail } = require('./emailService');

async function archivePreviousDaysBills() {
    try {
        console.log('🔄 Starting previous days archive process...');
        
        // Get today's date at 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find bills from BEFORE today (previous days)
        const previousDaysBills = await Bill.find({
            createdAt: { $lt: today }
        });
        
        if (previousDaysBills.length === 0) {
            console.log('📭 No previous days bills found to archive');
            return { archived: 0, message: 'No previous days bills found' };
        }

        console.log(`📊 Found ${previousDaysBills.length} bills from previous days`);
        
        // Check for duplicates before archiving
        const billIds = previousDaysBills.map(bill => bill._id);
        const existingArchived = await ArchivedBill.find({
            _id: { $in: billIds }
        });
        
        if (existingArchived.length > 0) {
            console.log(`⚠️  ${existingArchived.length} bills already archived, skipping duplicates`);
            
            // Filter out already archived bills
            const existingIds = new Set(existingArchived.map(bill => bill._id.toString()));
            const billsToArchive = previousDaysBills.filter(bill => 
                !existingIds.has(bill._id.toString())
            );
            
            if (billsToArchive.length === 0) {
                console.log('📭 All bills already archived');
                return { archived: 0, message: 'All bills already archived' };
            }
            
            console.log(`📊 Archiving ${billsToArchive.length} new bills`);
            await ArchivedBill.insertMany(billsToArchive);
            
            // Generate report for the archived bills
            const { subject, html } = generateSalesReport(billsToArchive, 'Previous Days Recovery');
            await sendSalesReportEmail(subject, html);
            
            // Delete only the archived bills from current collection
            const archivedBillIds = billsToArchive.map(bill => bill._id);
            await Bill.deleteMany({ _id: { $in: archivedBillIds } });
            
            console.log(`✅ Successfully archived ${billsToArchive.length} bills from previous days`);
            console.log(`🗑️  Removed ${billsToArchive.length} bills from current collection`);
            
            return { 
                archived: billsToArchive.length, 
                skipped: existingArchived.length,
                message: `Archived ${billsToArchive.length} bills, skipped ${existingArchived.length} duplicates`
            };
        } else {
            // No duplicates found, archive all
            await ArchivedBill.insertMany(previousDaysBills);
            
            // Generate report
            const { subject, html } = generateSalesReport(previousDaysBills, 'Previous Days Recovery');
            await sendSalesReportEmail(subject, html);
            
            // Delete all previous days bills from current collection
            await Bill.deleteMany({
                createdAt: { $lt: today }
            });
            
            console.log(`✅ Successfully archived ${previousDaysBills.length} bills from previous days`);
            console.log(`🗑️  Removed ${previousDaysBills.length} bills from current collection`);
            
            return { 
                archived: previousDaysBills.length,
                message: `Archived ${previousDaysBills.length} bills from previous days`
            };
        }
        
    } catch (err) {
        console.error('❌ Previous days archive failed:', err);
        throw err;
    }
}

function generateSalesReport(bills, title = 'Previous Days Recovery') {
    let totalSales = 0;
    let deletedCount = 0;
    let unpaidCount = 0;
    let unpaidBillAmount = 0;
    let deletedAmount = 0;

    const billRows = bills.map((bill) => {
        const itemDetails = bill.items.map(item => `${item.name} x${item.quantity}`).join(', ');
        const billDate = new Date(bill.createdAt);
        
        if (!bill.deleted) totalSales += bill.total;
        if (bill.deleted) {
            deletedCount++;
            deletedAmount += bill.total;
        }
        if (bill.payment !== 'Paid' && (!bill.deleted)) {
            unpaidCount++;
            unpaidBillAmount += bill.total;
        }

        return `
            <tr>
                <td>${billDate.toLocaleString('en-IN')}</td>
                <td>${itemDetails}</td>
                <td>${bill.total}</td>
                <td>${bill.payment}</td>
                <td>${bill.deleted ? 'Yes' : 'No'}</td>
            </tr>
        `;
    });

    return {
        subject: `${title} - ${new Date().toLocaleDateString('en-IN')}`,
        html: `
            <h2>${title} - ${new Date().toLocaleDateString('en-IN')}</h2>
            <p><strong>Total Bills Processed:</strong> ${bills.length}</p>
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

// Manual trigger function
async function runPreviousDaysArchive() {
    console.log('🔧 Manual previous days archive triggered');
    await archivePreviousDaysBills();
}

module.exports = { 
    archivePreviousDaysBills,
    runPreviousDaysArchive
};