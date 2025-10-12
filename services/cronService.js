// // services/cronService.js
// const Bill = require('../models/Bill');
// const ArchivedBill = require('../models/ArchivedBill');
// const { sendSalesReportEmail } = require('./emailService');

// function generateSalesReport(bills) {
//     let totalSales = 0;
//     let deletedCount = 0;
//     let unpaidCount = 0;
//     let unpaidBillAmount = 0;
//     let deletedAmount = 0;

//     const billRows = bills.map((bill) => {
//         const itemDetails = bill.items.map(item => `${item.name} x${item.quantity}`).join(', ');
//         if (!bill.deleted) totalSales += bill.total;
//         if (bill.deleted) {
//             deletedCount++;
//             deletedAmount += bill.total;
//         }
//         if (bill.payment !== 'Paid' && (!bill.deleted)) {
//             unpaidCount++;
//             unpaidBillAmount += bill.total;
//         }

//         return `
//             <tr>
//                 <td>${new Date(bill.createdAt).toLocaleString('en-IN')}</td>
//                 <td>${itemDetails}</td>
//                 <td>${bill.total}</td>
//                 <td>${bill.payment}</td>
//                 <td>${bill.deleted ? 'Yes' : 'No'}</td>
//             </tr>
//         `;
//     });

//     return {
//         subject: `Daily Sales Report - ${new Date().toLocaleDateString('en-IN')}`,
//         html: `
//             <h2>Sales Summary for ${new Date().toLocaleDateString('en-IN')}</h2>
//             <p><strong>Total Sales:</strong> ₹${totalSales}</p>
//             <p><strong>Actual Sale(Total Sale - Udhaari):</strong> ₹${totalSales-unpaidBillAmount}</p>
//             <p><strong>Unpaid Bills(Udhaari):</strong> ${unpaidCount}:₹ =>:${unpaidBillAmount}</p>
//             <p><strong>Deleted Bills:</strong> ${deletedCount}:₹ => ${deletedAmount}</p>
//             <br/>
//             <table border="1" cellpadding="5" cellspacing="0">
//                 <thead>
//                     <tr>
//                         <th>Time</th>
//                         <th>Items</th>
//                         <th>Total</th>
//                         <th>Payment</th>
//                         <th>Deleted</th>
//                     </tr>
//                 </thead>
//                 <tbody>${billRows.join('')}</tbody>
//             </table>
//         `
//     };
// }

// async function archiveTodayBillsAndSendReport() {
//     try {
//         console.log('🔄 Starting daily sales report process...');
        
//         const bills = await Bill.find({});
//         if (bills.length === 0) {
//             console.log('📭 No bills found for archiving');
//             return;
//         }

//         console.log(`📊 Found ${bills.length} bills to archive`);
        
//         await ArchivedBill.insertMany(bills);
//         console.log('✅ Bills archived successfully');
        
//         const { subject, html } = generateSalesReport(bills);
//         await sendSalesReportEmail(subject, html);
//         console.log('📧 Email sent successfully');
        
//         await Bill.deleteMany({});
//         console.log('🗑️ Current bills cleared');
        
//         console.log('🎉 Daily report completed successfully');
        
//     } catch (err) {
//         console.error('❌ Daily report failed:', err);
//     }
// }

// // Simple interval-based scheduler for Android
// function startSimpleScheduler() {
//     console.log('⏰ Simple scheduler started for Android');
    
//     let lastRunDate = null; // Prevent multiple runs on the same day
    
//     // Check every minute if it's 10:40 PM
//     setInterval(() => {
//         const now = new Date();
//         const today = now.toDateString(); // Get just the date part
//         const hours = now.getHours();
//         const minutes = now.getMinutes();
        
//         // Check if it's 22:40 (10:40 PM) AND we haven't run today
//         if (hours === 22 && minutes === 40 && lastRunDate !== today) {
//             console.log('⏰ 10:40 PM detected, running report...');
//             lastRunDate = today; // Mark today as processed
//             archiveTodayBillsAndSendReport();
//         }
//     }, 60000); // Check every minute
    
//     console.log('⏰ Scheduler will run at 22:40 (10:40 PM) daily');
// }

// // Manual trigger for testing
// function runCronManually() {
//     console.log('🔧 Manual trigger initiated');
//     archiveTodayBillsAndSendReport();
// }

// module.exports = { 
//     archiveTodayBillsAndSendReport,
//     startSimpleScheduler,
//     runCronManually
// };
// services/cronService.js
const Bill = require('../models/Bill');
const ArchivedBill = require('../models/ArchivedBill');
const { sendSalesReportEmail } = require('./emailService');

function generateSalesReport(bills) {
    let totalSales = 0;
    let deletedCount = 0;
    let unpaidCount = 0;
    let unpaidBillAmount = 0;
    let deletedAmount = 0;

    const billRows = bills.map((bill) => {
        const itemDetails = bill.items.map(item => `${item.name} x${item.quantity}`).join(', ');
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
                <td>${new Date(bill.createdAt).toLocaleString('en-IN')}</td>
                <td>${itemDetails}</td>
                <td>${bill.total}</td>
                <td>${bill.payment}</td>
                <td>${bill.deleted ? 'Yes' : 'No'}</td>
            </tr>
        `;
    });

    return {
        subject: `Daily Sales Report - ${new Date().toLocaleDateString('en-IN')}`,
        html: `
            <h2>Sales Summary for ${new Date().toLocaleDateString('en-IN')}</h2>
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
    let bills = [];
    try {
        console.log('🔄 Starting daily sales report process...');
        
        // Get today's date boundaries for checking
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if we already archived today
        const existingArchivedToday = await ArchivedBill.findOne({
            createdAt: { 
                $gte: today, 
                $lt: tomorrow 
            }
        });

        if (existingArchivedToday) {
            console.log('📭 Already archived bills today, skipping...');
            return { success: false, message: 'Already archived today' };
        }

        bills = await Bill.find({});
        if (bills.length === 0) {
            console.log('📭 No bills found for archiving');
            return { success: true, message: 'No bills to archive' };
        }

        console.log(`📊 Found ${bills.length} bills to archive`);
        
        // Step 1: Archive bills
        await ArchivedBill.insertMany(bills);
        console.log('✅ Bills archived successfully');
        
        // Step 2: Generate and send report
        const { subject, html } = generateSalesReport(bills);
        await sendSalesReportEmail(subject, html);
        console.log('📧 Email sent successfully');
        
        // Step 3: Delete current bills (only if archiving was successful)
        await Bill.deleteMany({});
        console.log('🗑️ Current bills cleared');
        
        console.log('🎉 Daily report completed successfully');
        return { success: true, message: `Archived ${bills.length} bills` };
        
    } catch (err) {
        console.error('❌ Daily report failed:', err);
        
        // If archiving failed but bills were fetched, at least log what we have
        if (bills.length > 0) {
            console.log(`⚠️  Archive failed but we had ${bills.length} bills ready`);
        }
        
        throw err;
    }
}

// // Improved scheduler with better time handling
// function startSimpleScheduler() {
//     console.log('⏰ Simple scheduler started for Android');
//     console.log('⏰ Current server time:', new Date().toString());
//     console.log('⏰ Scheduler will run at 22:40 (10:40 PM) server time daily');
    
//     let isRunning = false;
    
//     // Check every minute if it's 10:40 PM
//     setInterval(async () => {
//         if (isRunning) {
//             console.log('⏰ Archive already in progress, skipping...');
//             return;
//         }
        
//         const now = new Date();
//         const hours = now.getHours();
//         const minutes = now.getMinutes();
        
//         // Debug logging
//         if (minutes === 0) {
//             console.log(`⏰ Scheduler check - Current time: ${hours}:${minutes}`);
//         }
        
//         // Check if it's 22:40 (10:40 PM)
//         if (hours === 22 && minutes === 50) {
//             console.log('⏰ 10:40 PM detected, running archive process...');
//             isRunning = true;
            
//             try {
//                 await archiveTodayBillsAndSendReport();
//                 console.log('⏰ Archive process completed successfully');
//             } catch (error) {
//                 console.error('⏰ Archive process failed:', error);
//             } finally {
//                 // Reset after a reasonable time to prevent multiple runs
//                 setTimeout(() => {
//                     isRunning = false;
//                 }, 5 * 60 * 1000); // 5 minutes
//             }
//         }
//     }, 60000); // Check every minute
// }

// Manual trigger for testing
function runCronManually() {
    console.log('🔧 Manual trigger initiated');
    return archiveTodayBillsAndSendReport();
}

// Add a function to check current status
function getSchedulerStatus() {
    const now = new Date();
    return {
        running: true,
        currentTime: now.toString(),
        hours: now.getHours(),
        minutes: now.getMinutes(),
        nextCheck: 'Every minute'
    };
}

module.exports = { 
    archiveTodayBillsAndSendReport,

    runCronManually,
    getSchedulerStatus
};