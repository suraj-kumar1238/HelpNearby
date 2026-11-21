const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Check user login
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login again.",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
};

// Allow only Admin
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  next();
};

// Allow only Provider
const providerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "provider") {
    return res.status(403).json({
      message: "Access denied. Provider only.",
    });
  }

  next();
};

// Allow only Customer
const customerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({
      message: "Access denied. Customer only.",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  providerOnly,
  customerOnly,
};