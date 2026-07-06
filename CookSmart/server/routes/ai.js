const express = require("express");
const {
  generateRecipe,
  getSubstitutions,
  generateMealPlan,
  generateStoryboard,
} = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All AI routes require authentication
router.use(protect);

router.post("/generate-recipe",     generateRecipe);
router.post("/substitute",          getSubstitutions);
router.post("/meal-plan",           generateMealPlan);
router.post("/generate-storyboard", generateStoryboard);

module.exports = router;