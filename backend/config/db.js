const mongoose = require("mongoose");

// Connects to MongoDB Atlas using the connection string from .env
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Stop the server if we can't connect to the database
  }
}

module.exports = connectDB;
