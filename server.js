require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const cors=require("cors")
app.use(cors())
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// billerCode
const statusRoutes = require('./billerRoutes/statusRoutes')
app.use('/api/bills', require('./billerRoutes/bills'));
// const auth = require('../middleware/authMiddleware');



app.use('/api/status', statusRoutes);  // Section 3 actions






const authRoutes = require('./routes/authRoutes');


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));
app.use('/api/auth', authRoutes);

app.use('/api/admin', require('./routes/adminRoutes'));
app.get('/api/health', (req, res) => {
  res.status(200).send('OKkk running');
});


app.get('/', (req, res) => {
    res.redirect('/admin.html');
});

// ----------------------------------------------
const { archiveTodayBillsAndSendReport } = require('./services/cronService');

// REPLACE it with:
// const { startSimpleScheduler, runCronManually } = require('./services/cronService');

// Then find where you start the cron job, it might look like:
// archiveTodayBillsAndSendReport(); or similar

// REPLACE it with:
// startSimpleScheduler();

// Optional: Add a manual trigger route for testing


// --------------------

// Add to server.js after other routes
const { runPreviousDaysArchive, archivePreviousDaysBills } = require('./services/archivePreviousDays');
const Bill=require("./models/Bill")

// Route to manually trigger previous days archive
// app.get('/api/archive/previous-days', async (req, res) => {
//     try {
//         const result = await archivePreviousDaysBills();
//         res.json({ 
//             success: true, 
//             message: 'Previous days archive completed',
//             details: result
//         });
//     } catch (error) {
//         console.error('Archive route error:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Archive failed',
//             error: error.message 
//         });
//     }
// });
// Route to check what bills would be archived
app.get('/api/archive/check-previous', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const previousDaysBills = await Bill.find({
            createdAt: { $lt: today }
        });
        
        // Group by date for better overview
        const billsByDate = {};
        previousDaysBills.forEach(bill => {
            const dateStr = new Date(bill.createdAt).toLocaleDateString('en-IN');
            if (!billsByDate[dateStr]) {
                billsByDate[dateStr] = [];
            }
            billsByDate[dateStr].push(bill);
        });
        
        res.json({
            totalBills: previousDaysBills.length,
            dates: Object.keys(billsByDate),
            billsByDate: billsByDate,
            summary: Object.entries(billsByDate).map(([date, bills]) => ({
                date,
                count: bills.length,
                total: bills.reduce((sum, bill) => sum + bill.total, 0)
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// -----------------------

// Add to server.js after other routes
const { getSchedulerStatus, runCronManually } = require('./services/cronService');

// Debug route to check cron status
// app.get('/api/cron/status', (req, res) => {
//     const status = getSchedulerStatus();
//     res.json(status);
// });

// Manual trigger route for testing this was through localhost
// app.get('/api/cron/trigger', async (req, res) => {
//     try {
//         const result = await runCronManually();
//         res.json({ 
//             success: true, 
//             message: 'Manual cron trigger completed',
//             details: result 
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success: false, 
//             message: 'Manual cron failed',
//             error: error.message 
//         });
//     }
// });
const ArchivedBill=require("./models/ArchivedBill")
// Route to check if already archived today
// this below functions is just to check if its already been archived
// app.get('/api/cron/check-today', async (req, res) => {
//     try {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const tomorrow = new Date(today);
//         tomorrow.setDate(tomorrow.getDate() + 1);

//         const existingArchivedToday = await ArchivedBill.findOne({
//             createdAt: { 
//                 $gte: today, 
//                 $lt: tomorrow 
//             }
//         });

//         res.json({ 
//             alreadyArchivedToday: !!existingArchivedToday,
//             today: today.toString(),
//             archivedBill: existingArchivedToday 
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });



const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Load Cron Job (automatically schedules itself)
// for replit
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));







// -------------------------------------- manually deleting bills from archived database collection

// Helper function to preview bills for a specific date without deleting
async function previewArchivedBillsByDate(targetDate) {
    try {
        console.log(`👀 Previewing archived bills for date: ${targetDate}`);
        
        const previewDate = new Date(targetDate);
        if (isNaN(previewDate.getTime())) {
            throw new Error('Invalid date format');
        }

        const startOfDay = new Date(previewDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(previewDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bills = await ArchivedBill.find({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ createdAt: 1 });

        console.log(`📊 Found ${bills.length} archived bills for ${targetDate}:`);
        
        if (bills.length > 0) {
            let totalAmount = 0;
            bills.forEach((bill, index) => {
                totalAmount += bill.total;
                console.log(`${index + 1}. ID: ${bill._id} | Total: ₹${bill.total} | Items: ${bill.items.length} | Created: ${bill.createdAt.toLocaleString('en-IN')}`);
            });
            console.log(`💰 Total amount for ${targetDate}: ₹${totalAmount}`);
        } else {
            console.log('📭 No bills found for this date');
        }

        return {
            count: bills.length,
            totalAmount: bills.reduce((sum, bill) => sum + bill.total, 0),
            bills: bills.map(bill => ({
                id: bill._id,
                total: bill.total,
                items: bill.items.length,
                createdAt: bill.createdAt,
                payment: bill.payment
            }))
        };

    } catch (err) {
        console.error('❌ Failed to preview archived bills:', err);
        throw err;
    }
}

// Add this function to cronService.js
async function deleteArchivedBillsByDate(targetDate) {
    try {
        console.log(`🗑️ Starting deletion of archived bills for date: ${targetDate}`);
        
        // Parse the target date (accepts various formats)
        const deleteDate = new Date(targetDate);
        if (isNaN(deleteDate.getTime())) {
            throw new Error('Invalid date format. Use YYYY-MM-DD or any valid JS date string');
        }

        // Set time boundaries for the entire day
        const startOfDay = new Date(deleteDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(deleteDate);
        endOfDay.setHours(23, 59, 59, 999);

        console.log(`📅 Searching for bills between: ${startOfDay} and ${endOfDay}`);

        // Find bills for the specific date
        const billsToDelete = await ArchivedBill.find({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (billsToDelete.length === 0) {
            console.log('📭 No archived bills found for the specified date');
            return { 
                success: true, 
                deletedCount: 0, 
                message: 'No bills found for the specified date' 
            };
        }

        console.log(`📊 Found ${billsToDelete.length} bills to delete`);

        // Show preview of what will be deleted
        console.log('📋 Bills to be deleted:');
        billsToDelete.forEach((bill, index) => {
            console.log(`${index + 1}. Bill ID: ${bill._id}, Total: ₹${bill.total}, Items: ${bill.items.length}, Created: ${bill.createdAt}`);
        });

        // Ask for confirmation (in console)
        console.log(`❓ Are you sure you want to delete ${billsToDelete.length} bills? This cannot be undone!`);
        
        // For safety, we'll proceed with deletion but you can add confirmation logic
        const result = await ArchivedBill.deleteMany({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        console.log(`✅ Successfully deleted ${result.deletedCount} archived bills for ${targetDate}`);
        
        return {
            success: true,
            deletedCount: result.deletedCount,
            date: targetDate,
            message: `Deleted ${result.deletedCount} archived bills for ${targetDate}`
        };

    } catch (err) {
        console.error('❌ Failed to delete archived bills:', err);
        throw err;
    }
}

setTimeout(()=>{
// console.log("settimeout")
// year month date 
// previewArchivedBillsByDate('2025-10-12');
// deleteArchivedBillsByDate('2025-10-12');


},4000)

// Delete bills for a specific date




// Manual archive trigger endpoint this will happen through finish button in section 3 operations
app.post('/api/bills/cron/manual', async (req, res) => {
  try {
    console.log('🔧 Manual archive triggered via Finish button');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingArchivedToday = await ArchivedBill.findOne({
      createdAt: { 
        $gte: today, 
        $lt: tomorrow 
      }
    });

    if (existingArchivedToday) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bills already archived today',
        alreadyArchivedToday: true 
      });
    }

    await runCronManually();
    
    res.json({ 
      success: true, 
      message: 'Bills archived successfully' 
    });
    
  } catch (error) {
    console.error('Manual archive error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Archive failed',
      error: error.message 
    });
  }
});

// Check if already archived today
app.get('/api/bills/check-archive-today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingArchivedToday = await ArchivedBill.findOne({
      createdAt: { 
        $gte: today, 
        $lt: tomorrow 
      }
    });

    res.json({ 
      alreadyArchivedToday: !!existingArchivedToday 
    });
    
  } catch (error) {
    console.error('Check archive error:', error);
    res.status(500).json({ 
      error: 'Failed to check archive status' 
    });
  }
});