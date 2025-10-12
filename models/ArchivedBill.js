// models/ArchivedBill.js
const mongoose = require('mongoose');

const archivedBillSchema = new mongoose.Schema({
    items: [{
        serial: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: Number
    }],
    total: Number,
    payment: { type: String, default: 'Not Paid' },
    createdAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('ArchivedBill', archivedBillSchema);
