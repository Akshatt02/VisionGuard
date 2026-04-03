const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  station_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['DETECTED', 'PENDING_REVIEW', 'CLOSED'],
    default: 'DETECTED'
  },
  detection_image_url: {
    type: String,
    required: true
  },
  resolution_image_url: {
    type: String,
    default: null
  },
  detected_at: {
    type: Date,
    default: Date.now
  },
  resolved_at: {
    type: Date,
    default: null
  },
  admin_notes: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Violation', violationSchema);
