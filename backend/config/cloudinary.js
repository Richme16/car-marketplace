const cloudinary = require("cloudinary").v2;

// Configures the Cloudinary SDK using the credentials from .env.
// Once configured, any file in this project can `require` this file
// and use `cloudinary.uploader.upload(...)` to send images to Cloudinary.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
