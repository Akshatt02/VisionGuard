const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  station_id: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Station', stationSchema);
