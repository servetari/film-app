const cloudinary = require('cloudinary').v2;

if (!process.env.CLOUDINARY_URL) {
  console.warn('CLOUDINARY_URL is not set. Cloudinary uploads will fail until it is configured.');
}

cloudinary.config({
  secure: true,
});

module.exports = cloudinary;
