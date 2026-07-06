const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../middleware/AppError");

// ─── Helper ───────────────────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }

  // Duplicate email is caught by the unique index → errorHandler maps to 409
  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Explicitly select password — it is excluded from queries by default (select: false)
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user._id);

  res.json({
    success: true,
    token,
    user: user.toPublicJSON(),
  });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is attached by protect middleware (fresh DB lookup already done)
  res.json({
    success: true,
    user: req.user.toPublicJSON(),
  });
};

// ─── PUT /api/auth/me ─────────────────────────────────────────────────────────
const updateMe = async (req, res) => {
  const { name, dietaryPreferences } = req.body;

  // Whitelist — password changes are not allowed through this endpoint
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (dietaryPreferences !== undefined) updates.dietaryPreferences = dietaryPreferences;

  if (Object.keys(updates).length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    user: user.toPublicJSON(),
  });
};

module.exports = { register, login, getMe, updateMe };
