const express = require('express');
const router = express.Router();
const statusController = require('../billerControllers/statusController');

router.post('/start', statusController.logStart);
router.post('/finish', statusController.logFinish);
router.post('/help', statusController.logHelp);

module.exports = router;
