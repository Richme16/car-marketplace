const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Multer config: keep uploaded files in memory (RAM) temporarily instead of
// saving them to disk, since we're immediately forwarding them to Cloudinary.
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per photo
});

// Helper: uploads a single file buffer to Cloudinary and returns the result.
// Cloudinary's SDK expects a "stream" of data, so we wrap it in a Promise
// to use it comfortably with async/await.
function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "motorline-cars" }, // organizes uploads into a folder in your Cloudinary account
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// POST /api/upload - accepts up to 5 photos under the field name "photos"
// and returns an array of the resulting Cloudinary URLs.
router.post("/", requireAuth, upload.array("photos", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    // Upload every photo to Cloudinary in parallel, then collect their URLs
    const uploadResults = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer))
    );

    const urls = uploadResults.map((result) => result.secure_url);

    res.status(201).json({ urls });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

module.exports = router;
