const mongoose = require('mongoose');

const deletedBillSchema = new mongoose.Schema({
    originalBillId: mongoose.Types.ObjectId,
    items: Array,
    total: Number,
    deletedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeletedBill', deletedBillSchema);
