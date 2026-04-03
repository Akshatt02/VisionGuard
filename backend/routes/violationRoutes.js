const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const {
  detectViolation,
  resolveViolation,
  verifyViolation,
  getViolations
} = require('../controllers/violationController');

// Edge device creates new violation
// We expect a single file 'image' to be uploaded
router.post('/detect', upload.single('image'), detectViolation);

// Worker resolves a violation
router.put('/:id/resolve', upload.single('image'), resolveViolation);

// Admin verifies a resolution
router.patch('/:id/verify', verifyViolation);

// Get all violations
router.get('/', getViolations);

module.exports = router;
