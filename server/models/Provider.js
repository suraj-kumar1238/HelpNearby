const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    providerName: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    mobile: {
      type: String,
      required: true
    },

    service: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Provider", providerSchema);