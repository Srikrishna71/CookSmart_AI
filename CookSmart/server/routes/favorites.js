const express = require("express");
const {
  getFavorites,
  getFavoriteIds,
  toggleFavorite,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All favorites routes require authentication
router.use(protect);

router.get("/", getFavorites);
router.get("/ids", getFavoriteIds);
router.post("/:recipeId", toggleFavorite);

module.exports = router;
