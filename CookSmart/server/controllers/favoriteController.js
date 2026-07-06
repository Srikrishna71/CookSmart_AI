const Favorite = require("../models/Favorite");
const Recipe = require("../models/Recipe");
const AppError = require("../middleware/AppError");

// ─── GET /api/favorites ───────────────────────────────────────────────────────
const getFavorites = async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id })
    .populate("recipeId")
    .sort({ createdAt: -1 })
    .lean();

  // Filter out any orphaned favorites where the recipe was deleted
  const data = favorites
    .filter((f) => f.recipeId !== null)
    .map((f) => ({
      ...f.recipeId,
      _id: f.recipeId._id.toString(),
      isFavorited: true,
    }));

  res.json({ success: true, data, total: data.length });
};

// ─── GET /api/favorites/ids ───────────────────────────────────────────────────
// Lightweight endpoint — returns only an array of recipe ID strings.
// Used on app mount to hydrate the favorites set without fetching full recipe objects.
const getFavoriteIds = async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id })
    .select("recipeId")
    .lean();

  const data = favorites.map((f) => f.recipeId.toString());
  res.json({ success: true, data });
};

// ─── POST /api/favorites/:recipeId ───────────────────────────────────────────
// Toggle endpoint — adds if not present, removes if present.
// Returns the new isFavorited state so the frontend can update UI without
// needing to re-fetch the full favorites list.
const toggleFavorite = async (req, res) => {
  const { recipeId } = req.params;

  // Confirm recipe exists before creating a favorite for it
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new AppError("Recipe not found", 404);
  }

  const existing = await Favorite.findOne({
    userId: req.user._id,
    recipeId,
  });

  if (existing) {
    await existing.deleteOne();
    return res.json({
      success: true,
      isFavorited: false,
      message: "Removed from favorites",
    });
  }

  await Favorite.create({ userId: req.user._id, recipeId });
  res.status(201).json({
    success: true,
    isFavorited: true,
    message: "Added to favorites",
  });
};

module.exports = { getFavorites, getFavoriteIds, toggleFavorite };
