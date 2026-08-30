const AppError = require("./AppError");

/**
 * Global error handler — must be the last middleware in index.js.
 * express-async-errors forwards all async throws here automatically.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Mongoose: bad ObjectId (e.g. /api/recipes/not-a-valid-id) ──────────────
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found`;
  }

  // ── Mongoose: duplicate key (e.g. email already registered) ────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // ── Mongoose: validation error ──────────────────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── JWT errors ──────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
  }

  // ── Log unexpected errors (not operational AppErrors) ──────────────────────
  if (!err.isOperational) {
    // Build a safe log payload — never include API keys, JWTs, or passwords.
    const safeLog = {
      name:    err.name,
      status:  err.status  ?? err.statusCode ?? "unknown",
      code:    err.code    ?? undefined,
      message: err.message ?? "no message",
      // Gemini SDK wraps errors with errorDetails — safe to log (no secrets there)
      details: err.errorDetails ?? undefined,
    };
    console.error("🔥 Unexpected error:", JSON.stringify(safeLog));
    if (process.env.NODE_ENV === "development") {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;