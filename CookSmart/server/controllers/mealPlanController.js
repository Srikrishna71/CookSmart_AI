const MealPlan = require("../models/MealPlan");
const AppError = require("../middleware/AppError");

// ─── GET /api/meal-plans ──────────────────────────────────────────────────────
const getMealPlans = async (req, res) => {
  const plans = await MealPlan.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: plans, total: plans.length });
};

// ─── GET /api/meal-plans/:id ──────────────────────────────────────────────────
const getMealPlanById = async (req, res) => {
  const plan = await MealPlan.findOne({
    _id: req.params.id,
    userId: req.user._id, // Scope to owner — prevents users viewing others' plans
  }).lean();

  if (!plan) {
    throw new AppError("Meal plan not found", 404);
  }

  res.json({ success: true, data: plan });
};

// ─── DELETE /api/meal-plans/:id ───────────────────────────────────────────────
const deleteMealPlan = async (req, res) => {
  const plan = await MealPlan.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!plan) {
    throw new AppError("Meal plan not found", 404);
  }

  await plan.deleteOne();
  res.json({ success: true, message: "Meal plan deleted successfully" });
};

module.exports = { getMealPlans, getMealPlanById, deleteMealPlan };
