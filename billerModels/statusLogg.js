const mongoose = require('mongoose');

const statusLogSchema = new mongoose.Schema({
    action: { type: String, enum: ['Start', 'Finish', 'Help'], required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StatusLog', statusLogSchema);
