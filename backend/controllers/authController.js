const Station = require('../models/Station');

// @desc    Login and authenticate admin/station
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { station_id, password } = req.body;

    if (!station_id || !password) {
      return res.status(400).json({ message: 'Please provide station_id and password' });
    }

    // Check for hardcoded admin
    if (station_id === 'admin' && password === 'admin') {
      return res.status(200).json({
        role: 'ADMIN',
        station_id: 'admin',
        message: 'Admin logged in'
      });
    }

    // Check station
    const station = await Station.findOne({ station_id });
    if (!station || station.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      role: 'STATION',
      station_id: station.station_id,
      location: station.location,
      message: 'Station logged in'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
