const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const requireAuth = require("../middleware/auth");

// POST /api/bookings - a customer submits a buy/rent request (public — no login needed)
router.post("/", async (req, res) => {
  try {
    // Make sure the car being requested actually exists
    const car = await Car.findById(req.body.car);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error) {
    res.status(400).json({ message: "Failed to submit booking", error: error.message });
  }
});

// GET /api/bookings - view all booking requests (protected: admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    // .populate("car") replaces the car's ID with its full details (make, model, etc.)
    // so the admin panel doesn't have to make a second request per booking.
    const bookings = await Booking.find().populate("car").sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
});

// PUT /api/bookings/:id - update a booking's status (protected: admin only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update booking", error: error.message });
  }
});

// DELETE /api/bookings/:id - remove a booking (protected: admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete booking", error: error.message });
  }
});

module.exports = router;
