const Violation = require('../models/Violation');

// @desc    Detect new violation (Edge device)
// @route   POST /api/violations/detect
exports.detectViolation = async (req, res) => {
  try {
    const { station_id } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Detection image is required' });
    }

    const violation = await Violation.create({
      station_id: station_id,
      detection_image_url: req.file.path, // Cloudinary URL
      status: 'DETECTED'
    });

    // Emit socket event
    req.io.emit('NEW_VIOLATION', violation);

    res.status(201).json(violation);
  } catch (error) {
    console.error(`Error detecting violation:`, error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Resolve a violation (Worker)
// @route   PUT /api/violations/:id/resolve
exports.resolveViolation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Resolution image is required' });
    }

    const violation = await Violation.findByIdAndUpdate(
      id,
      {
        resolution_image_url: req.file.path,
        resolved_at: Date.now(),
        status: 'PENDING_REVIEW'
      },
      { new: true, runValidators: true }
    );

    if (!violation) {
      return res.status(404).json({ message: 'Violation not found' });
    }

    // Emit socket event
    req.io.emit('UPDATE_VIOLATION', violation);

    res.status(200).json(violation);
  } catch (error) {
    console.error(`Error resolving violation:`, error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Verify a violation (Admin)
// @route   PATCH /api/violations/:id/verify
exports.verifyViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const violation = await Violation.findByIdAndUpdate(
      id,
      {
        status: 'CLOSED',
        admin_notes: admin_notes || ''
      },
      { new: true, runValidators: true }
    );

    if (!violation) {
      return res.status(404).json({ message: 'Violation not found' });
    }

    // Emit socket event
    req.io.emit('UPDATE_VIOLATION', violation);

    res.status(200).json(violation);
  } catch (error) {
    console.error(`Error verifying violation:`, error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all violations
// @route   GET /api/violations
exports.getViolations = async (req, res) => {
  try {
    const violations = await Violation.find().sort({ detected_at: -1 });
    res.status(200).json(violations);
  } catch (error) {
    console.error(`Error getting violations:`, error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
