const express = require("express");
const {
  getAllRecipes,
  getMyRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecommendations,
} = require("../controllers/recipeController");
const { protect, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// ── Literal-segment routes — MUST precede /:id ────────────────────────────────
router.get("/my", protect, getMyRecipes);

// ── Public routes ─────────────────────────────────────────────────────────────
router.get("/", optionalAuth, getAllRecipes);
router.get("/:id", optionalAuth, getRecipeById);

// ── Sub-resource routes — registered after /:id ───────────────────────────────
// Express correctly reads /:id/recommendations as id=<recipeId> + sub-path.
// optionalAuth: guests see recommendations; logged-in users get isFavorited.
router.get("/:id/recommendations", optionalAuth, getRecommendations);

// ── Protected CRUD routes ─────────────────────────────────────────────────────
router.post("/", protect, createRecipe);
router.put("/:id", protect, updateRecipe);
router.delete("/:id", protect, deleteRecipe);

module.exports = router;