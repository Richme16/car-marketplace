const express = require("express");
const router = express.Router();
const Car = require("../models/Car");
const requireAuth = require("../middleware/auth");

// GET /api/cars - fetch all cars (this is what your listings page will call)
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars", error: error.message });
  }
});

// GET /api/cars/:id - fetch a single car (for the details page)
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car", error: error.message });
  }
});

// POST /api/cars - add a new car (protected: requires admin login)
router.post("/", requireAuth, async (req, res) => {
  try {
    const newCar = new Car(req.body);
    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (error) {
    res.status(400).json({ message: "Failed to create car", error: error.message });
  }
});

// PUT /api/cars/:id - update an existing car (protected: requires admin login)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated document instead of the old one
      runValidators: true,
    });
    if (!updatedCar) return res.status(404).json({ message: "Car not found" });
    res.json(updatedCar);
  } catch (error) {
    res.status(400).json({ message: "Failed to update car", error: error.message });
  }
});

// DELETE /api/cars/:id - remove a car listing (protected: requires admin login)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) return res.status(404).json({ message: "Car not found" });
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete car", error: error.message });
  }
});

module.exports = router;
