/**
 * Custom operational error class.
 * throw new AppError("Not found", 404) in any controller — express-async-errors
 * forwards it to errorHandler.js automatically.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes known errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
