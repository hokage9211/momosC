const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const runCronManually=require("../services/cronService");
router.get('/bills/today',auth, adminController.getTodayBills);

router.get('/items-report',auth, adminController.itemWiseSales);
router.get('/items-live-report',auth, adminController.liveItemWiseSales);
router.patch('/bills/:id/toggle',auth, adminController.togglePayment);
router.patch('/bills/:id/delete',auth, adminController.deleteBill);
router.patch('/bills/:id/undelete',auth, adminController.undeleteBill);

// For admin-archive.html
router.get('/archive',auth, adminController.getArchivedBillsByDate);

// Manual cron test
router.post('/test-cron',auth, adminController.runCronManually);
module.exports = router;


// app.get('/test-report', (req, res) => {
//     runCronManually();
//     res.json({ message: 'Manual report triggered' });
// });
