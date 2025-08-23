const express = require('express');
const router = express.Router();
const billsController = require('../billerControllers/billsController');

router.post('/', billsController.createBill);
router.get('/', billsController.getBills);
router.patch('/:id/payment', billsController.togglePayment);
router.delete('/:id', billsController.deleteBill);

module.exports = router;
