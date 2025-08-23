const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

router.get('/bills/today',auth, adminController.getTodayBills);
router.patch('/bills/:id/toggle', adminController.togglePayment);
router.patch('/bills/:id/delete', adminController.deleteBill);
router.patch('/bills/:id/undelete', adminController.undeleteBill);

// For admin-archive.html
router.get('/archive',auth, adminController.getArchivedBillsByDate);

// Manual cron test
router.post('/test-cron', adminController.runCronManually);
module.exports = router;
