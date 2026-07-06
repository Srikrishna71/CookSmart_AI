const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("./AppError");

/**
 * protect — requires a valid JWT.
 * Attaches req.user for use in downstream controllers.
 */
const protect = async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Not authenticated. Please log in.", 401);
  }

  const token = authHeader.split(" ")[1];

  // Verify signature and expiry
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Fresh DB lookup — catches deleted/disabled users
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError("User no longer exists.", 401);
  }

  req.user = user;
  next();
};

/**
 * optionalAuth — attaches req.user if a valid token is present,
 * but does NOT reject the request if no token is provided.
 * Used on public routes that enrich responses for logged-in users
 * (e.g. GET /recipes adds isFavorited when user is known).
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // No token — continue as anonymous
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // Invalid / expired token on an optional route — ignore silently
  }

  next();
};

module.exports = { protect, optionalAuth };
