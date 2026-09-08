const express = require("express");
const router = express.Router();
const ServiceRequest = require("../models/ServiceRequest");
const requireAuth = require("../middleware/auth");

// POST /api/services - a customer submits a repair/upgrade request (public — no login needed)
router.post("/", async (req, res) => {
  try {
    const newRequest = new ServiceRequest(req.body);
    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Failed to submit service request", error: error.message });
  }
});

// GET /api/services - view all service requests (protected: admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch service requests", error: error.message });
  }
});

// PUT /api/services/:id - update a request's status (protected: admin only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const updated = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Service request not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update service request", error: error.message });
  }
});

// DELETE /api/services/:id - remove a request (protected: admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Service request not found" });
    res.json({ message: "Service request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete service request", error: error.message });
  }
});

module.exports = router;
