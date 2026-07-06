const mongoose = require("mongoose");

const mealItemSchema = new mongoose.Schema(
  {
    name:        { type: String, default: "" },
    description: { type: String, default: "" },
    calories:    { type: String, default: "" },
    prepTime:    { type: String, default: "" },
    ingredients: { type: [String], default: [] },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    day:           { type: String, required: true }, // e.g. "Day 1" or "Monday"
    breakfast:     { type: mealItemSchema, default: () => ({}) },
    lunch:         { type: mealItemSchema, default: () => ({}) },
    dinner:        { type: mealItemSchema, default: () => ({}) },
    snack:         { type: mealItemSchema, default: () => ({}) },
    totalCalories: { type: String, default: "" },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "My Meal Plan",
      trim: true,
    },
    goal: {
      type: String,
      enum: ["weight-loss", "muscle-gain", "maintenance", "balanced"],
      required: [true, "Goal is required"],
    },
    durationDays: {
      type: Number,
      default: 7,
      min: [1, "Duration must be at least 1 day"],
      max: [30, "Duration cannot exceed 30 days"],
    },
    days: {
      type: [daySchema],
      default: [],
    },
    targetCalories: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

mealPlanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("MealPlan", mealPlanSchema);
