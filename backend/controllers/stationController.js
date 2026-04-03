const Station = require('../models/Station');

// @desc    Create a new station 
// @route   POST /api/stations
exports.createStation = async (req, res) => {
  try {
    const { station_id, password, location } = req.body;

    if (!station_id || !password || !location) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const existingStation = await Station.findOne({ station_id });
    if (existingStation) {
      return res.status(400).json({ message: 'Station ID already exists' });
    }

    const station = await Station.create({
      station_id,
      password,
      location
    });

    res.status(201).json(station);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all stations
// @route   GET /api/stations
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json(stations);
  } catch (error) {
    console.error('Error getting stations:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
