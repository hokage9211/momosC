const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const billsController = require('../billerControllers/billsController');

router.post('/',auth, billsController.createBill);
router.get('/',auth, billsController.getBills);
router.patch('/:id/payment',auth, billsController.togglePayment);
router.delete('/:id',auth, billsController.deleteBill);

const authController = require('../controllers/authController');

router.post("/authenticationFrontend",authController.login)

module.exports = router;
