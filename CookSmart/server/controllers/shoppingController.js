const Recipe = require("../models/Recipe");
const AppError = require("../middleware/AppError");

// ─── POST /api/shopping/generate ─────────────────────────────────────────────
const generateShoppingList = async (req, res) => {
  const { recipeIds } = req.body;

  if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
    throw new AppError("Please provide at least one recipe ID", 400);
  }

  const recipes = await Recipe.find({ _id: { $in: recipeIds } })
    .select("title ingredients")
    .lean();

  if (recipes.length === 0) {
    throw new AppError("No recipes found for the provided IDs", 404);
  }

  // Aggregate all ingredients, tracking which recipes need each item
  const ingredientMap = new Map(); // ingredient string → Set of recipe titles

  recipes.forEach((recipe) => {
    (recipe.ingredients || []).forEach((ingredient) => {
      const key = ingredient.trim().toLowerCase();
      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, { display: ingredient.trim(), recipes: new Set() });
      }
      ingredientMap.get(key).recipes.add(recipe.title);
    });
  });

  // Convert to sorted array for consistent rendering
  const items = Array.from(ingredientMap.values())
    .map(({ display, recipes: recipeSet }) => ({
      ingredient: display,
      recipes: Array.from(recipeSet),
      checked: false,
    }))
    .sort((a, b) => a.ingredient.localeCompare(b.ingredient));

  res.json({
    success: true,
    data: {
      items,
      totalItems: items.length,
      forRecipes: recipes.map((r) => ({ _id: r._id.toString(), title: r.title })),
    },
  });
};

module.exports = { generateShoppingList };
