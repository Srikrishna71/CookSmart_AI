const express = require("express");
const {
  getMealPlans,
  getMealPlanById,
  deleteMealPlan,
} = require("../controllers/mealPlanController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getMealPlans);
router.get("/:id", getMealPlanById);
router.delete("/:id", deleteMealPlan);

module.exports = router;
