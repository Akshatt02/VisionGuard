const express = require('express');
const router = express.Router();
const { createStation, getStations } = require('../controllers/stationController');

router.post('/', createStation);
router.get('/', getStations);

module.exports = router;
