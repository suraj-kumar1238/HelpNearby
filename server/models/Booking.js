const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    customerName: {
      type: String,
      required: true,
      trim: true
    },

    mobile: {
      type: String,
      required: true
    },

    service: {
      type: String,
      required: true
    },

    bookingDate: {
      type: Date,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);