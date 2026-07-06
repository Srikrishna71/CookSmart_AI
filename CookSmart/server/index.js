require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipes");
const favoriteRoutes = require("./routes/favorites");
const aiRoutes = require("./routes/ai");
const mealPlanRoutes = require("./routes/mealPlans");
const shoppingRoutes = require("./routes/shopping");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Stricter limiter for AI routes (Gemini API calls cost money)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { success: false, message: "AI request limit reached. Please try again in an hour." },
});
app.use("/api/ai/", aiLimiter);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/shopping", shoppingRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CookSmart API is running", env: process.env.NODE_ENV });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CookSmart server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
