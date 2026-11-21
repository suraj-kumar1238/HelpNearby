const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("JWT_SECRET or MONGO_URI missing in .env");
  process.exit(1);
}

const Provider = require("./models/Provider");
const Booking = require("./models/Booking");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");

const {
  protect,
  adminOnly,
} = require("./middleware/authMiddleware");

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "https://help-nearby-six.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

// ROLE CHECKS
const requireCustomer = (req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Customer access only",
    });
  }
  next();
};

const requireProvider = (req, res, next) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({
      success: false,
      message: "Provider access only",
    });
  }
  next();
};

// HOME
app.get("/", (req, res) => {
  res.send("HelpNearby Backend is Running!");
});

// REGISTER PROVIDER
app.post(
  "/api/providers/register",
  protect,
  requireProvider,
  async (req, res) => {
    try {
      const {
        providerName,
        mobile,
        service,
        state,
        city,
        address,
      } = req.body;

      if (!providerName || !mobile || !service || !state || !city || !address) {
        return res.status(400).json({
          success: false,
          message: "Please fill all fields",
        });
      }

      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Provider account not found",
        });
      }

      const existingProvider = await Provider.findOne({
        $or: [{ email: user.email }, { user: user._id }],
      });

      if (existingProvider) {
        return res.status(400).json({
          success: false,
          message: "Provider already registered",
        });
      }

      const newProvider = await Provider.create({
        user: user._id,
        providerName,
        email: user.email,
        mobile,
        service,
        state,
        city,
        address,
      });

      res.status(201).json({
        success: true,
        message: "Provider Registered Successfully!",
        provider: newProvider,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET ALL PROVIDERS
app.get("/api/providers", async (req, res) => {
  try {
    const providers = await Provider.find();

    res.json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// SEARCH PROVIDERS
app.get("/api/providers/search", async (req, res) => {
  try {
    const { service, city, state } = req.query;
    const filter = {};

    if (service) {
      filter.service = { $regex: service, $options: "i" };
    }

    if (city) {
      filter.city = { $regex: city, $options: "i" };
    }

    if (state) {
      filter.state = { $regex: state, $options: "i" };
    }

    const providers = await Provider.find(filter);

    res.json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE BOOKING - CUSTOMER ONLY
app.post(
  "/api/bookings",
  protect,
  requireCustomer,
  async (req, res) => {
    try {
      const {
        service,
        bookingDate,
        address,
        description,
        provider,
      } = req.body;

      if (!service || !bookingDate || !address || !provider) {
        return res.status(400).json({
          success: false,
          message: "Please fill all required fields",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(provider)) {
        return res.status(400).json({
          success: false,
          message: "Invalid provider ID",
        });
      }

      const existingProvider = await Provider.findById(provider);

      if (!existingProvider) {
        return res.status(404).json({
          success: false,
          message: "Provider not found",
        });
      }

      const newBooking = await Booking.create({
        customer: req.user._id,
        customerName: req.user.name,
        mobile: req.user.mobile,
        service,
        bookingDate,
        address,
        description: description || "",
        provider: existingProvider._id,
      });

      res.status(201).json({
        success: true,
        message: "Booking created successfully!",
        booking: newBooking,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET BOOKINGS - ROLE BASED
app.get("/api/bookings", protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "customer") {
      filter.customer = req.user._id;
    } else if (req.user.role === "provider") {
      const provider = await Provider.findOne({
        user: req.user._id,
      });

      if (!provider) {
        return res.json({
          success: true,
          count: 0,
          bookings: [],
        });
      }

      filter.provider = provider._id;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const bookings = await Booking.find(filter)
      .populate("provider", "providerName service city")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE BOOKING STATUS - ADMIN ONLY
app.patch(
  "/api/bookings/:id/status",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { status } = req.body;
      const bookingId = req.params.id;

      const allowedStatuses = [
        "Accepted",
        "Rejected",
        "Completed",
      ];

      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking ID",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status",
        });
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true, runValidators: true }
      ).populate("provider", "providerName service city");

      if (!updatedBooking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.json({
        success: true,
        message: "Booking status updated successfully!",
        booking: updatedBooking,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// SERVER START
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
    console.log("JWT_SECRET loaded:", Boolean(process.env.JWT_SECRET));

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server Start Error:", error.message);
    process.exit(1);
  }
}

startServer();