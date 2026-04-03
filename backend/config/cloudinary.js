const cloudinary = require('cloudinary').v2;

// Cloudinary configuration relies on the CLOUDINARY_URL environment variable if set
// If CLOUDINARY_URL is in the environment, cloudinary automatically uses it
// Otherwise, we can still configure it if needed via cloudinary.config({})

module.exports = cloudinary;
