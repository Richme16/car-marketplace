const mongoose = require("mongoose");

// This defines the "shape" every car document in the database must follow.
// Similar to the mock car objects we had in cars-data.js on the frontend.
const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    type: { type: String, enum: ["sale", "rent"], required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },
    transmission: { type: String, default: "Automatic" },
    fuel: { type: String, default: "Petrol" },
    color: { type: String, default: "" },
    seats: { type: Number, default: 5 },
    description: { type: String, default: "" },
    features: { type: [String], default: [] },
    images: { type: [String], default: [] },
  },
  {
    timestamps: true, // automatically adds createdAt / updatedAt fields
  }
);

module.exports = mongoose.model("Car", carSchema);
