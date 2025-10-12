const StatusLog = require('../billerModels/statusLogg');

// Start Controller
exports.logStart = async (req, res) => {
    try {
        const log = new StatusLog({ action: 'Start' });
        await log.save();
        res.status(201).json({ message: 'Start time logged successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging start time' });
    }
};

// Finish Controller
exports.logFinish = async (req, res) => {
    try {
        const log = new StatusLog({ action: 'Finish' });
        await log.save();
        res.status(201).json({ message: 'Finish time logged successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging finish time' });
    }
};

// Help Controller
exports.logHelp = async (req, res) => {
    try {
        const log = new StatusLog({ action: 'Help' });
        await log.save();

        // TODO: Add Twilio/MSG91 code here to send SMS.
        console.log('🚨 Help request received');

        res.status(201).json({ message: 'Help request logged successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging help request' });
    }
};
