const mongoose = require("mongoose");

// Represents one customer's request to buy or rent a specific car.
const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId, // links this booking to a specific Car document
      ref: "Car",
      required: true,
    },
    type: { type: String, enum: ["sale", "rent"], required: true },
    customerName: { type: String, required: true },
    
    customerPhone: { type: String, required: true },
    // Only relevant for rentals — left blank for purchases
    startDate: { type: Date },
    endDate: { type: Date },
    message: { type: String, default: "" },
    // Lets the admin track progress on each request
    status: {
      type: String,
      enum: ["pending", "contacted", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
