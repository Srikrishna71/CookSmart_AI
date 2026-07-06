const Recipe = require("../models/Recipe");
const Favorite = require("../models/Favorite");
const MealPlan = require("../models/MealPlan");

// ─── GET /api/dashboard ───────────────────────────────────────────────────────
// Single endpoint — all queries run in parallel via Promise.all.
// No waterfall loading on the dashboard page.
//
// Response shape:
// {
//   success: true,
//   data: {
//     stats: { totalFavorites, totalAIRecipes, totalMealPlans, memberSince },
//     favorites: Recipe[],       // last 6 favorited recipes (full objects)
//     aiRecipes: Recipe[],       // last 6 AI-generated recipes by this user
//     mealPlans: MealPlan[],     // last 3 meal plans
//     user: PublicUser
//   }
// }
const getDashboard = async (req, res) => {
  const userId = req.user._id;

  const [
    totalFavorites,
    totalAIRecipes,
    totalMealPlans,
    recentFavoriteDocs,
    recentAIRecipes,
    recentMealPlans,
  ] = await Promise.all([
    // Counts
    Favorite.countDocuments({ userId }),
    Recipe.countDocuments({ createdBy: userId, isAIGenerated: true }),
    MealPlan.countDocuments({ userId }),

    // Recent favorites — populate recipe details
    Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("recipeId", "title image cuisine category rating ratingCount cookTime difficulty")
      .lean(),

    // Recent AI recipes created by user
    Recipe.find({ createdBy: userId, isAIGenerated: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("title image cuisine category rating ratingCount cookTime difficulty createdAt sourceIngredients")
      .lean(),

    // Recent meal plans
    MealPlan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title goal durationDays targetCalories isActive createdAt")
      .lean(),
  ]);

  // Strip orphaned favorites (recipe deleted after being favorited)
  const favorites = recentFavoriteDocs
    .filter((f) => f.recipeId !== null)
    .map((f) => ({
      ...f.recipeId,
      _id: f.recipeId._id.toString(),
      isFavorited: true,
    }));

  const aiRecipes = recentAIRecipes.map((r) => ({
    ...r,
    _id: r._id.toString(),
  }));

  res.json({
    success: true,
    data: {
      stats: {
        totalFavorites,
        totalAIRecipes,
        totalMealPlans,
        memberSince: req.user.createdAt,
      },
      favorites,
      aiRecipes,
      mealPlans: recentMealPlans,
      user: req.user.toPublicJSON(),
    },
  });
};

module.exports = { getDashboard };
