require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const carRoutes = require("./routes/carRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

const app = express();

// ============ MIDDLEWARE ============
app.use(cors()); // allows your frontend (running on a different port) to call this API
app.use(express.json()); // lets the server understand JSON in request bodies

// ============ ROUTES ============
app.get("/", (req, res) => {
  res.send("Motorline API is running");
});

app.use("/api/cars", carRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
