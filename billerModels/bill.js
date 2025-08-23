const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    items: [{
        serial: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: Number
    }],
    total: Number,
    deleted: { type: Boolean, default: false },
deletedBy: { type: String, default: null },
    payment: { type: String, default: 'Not Paid' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
