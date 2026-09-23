const mongoose = require("mongoose");

// Represents a customer's request to have THEIR OWN car repaired or upgraded.
// This is separate from Booking, which is for buying/renting a car FROM the inventory.
const serviceRequestSchema = new mongoose.Schema(
  {
    serviceType: { type: String, enum: ["repair", "upgrade"], required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    carMake: { type: String, required: true },
    carModel: { type: String, required: true },
    carYear: { type: Number, required: true },
    description: { type: String, required: true }, // what needs fixing/upgrading
    preferredDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "contacted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
