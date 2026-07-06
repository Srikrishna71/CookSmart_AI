const Recipe = require("../models/Recipe");
const Favorite = require("../models/Favorite");
const AppError = require("../middleware/AppError");

// ─── GET /api/recipes ─────────────────────────────────────────────────────────
const getAllRecipes = async (req, res) => {
  const {
    search,
    category,
    cuisine,
    difficulty,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (category && ["veg", "non-veg", "vegan"].includes(category)) {
    filter.category = category;
  }
  if (cuisine) {
    filter.cuisine = new RegExp(cuisine, "i");
  }
  if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) {
    filter.difficulty = difficulty;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Recipe.countDocuments(filter);

  const recipes = await Recipe.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  let favoritedIds = new Set();
  if (req.user) {
    const favs = await Favorite.find({
      userId: req.user._id,
      recipeId: { $in: recipes.map((r) => r._id) },
    }).select("recipeId");
    favoritedIds = new Set(favs.map((f) => f.recipeId.toString()));
  }

  const data = recipes.map((r) => ({
    ...r,
    _id: r._id.toString(),
    isFavorited: favoritedIds.has(r._id.toString()),
  }));

  res.json({
    success: true,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
};

// ─── GET /api/recipes/my ─────────────────────────────────────────────────────
// Returns only recipes created by the authenticated user, newest first.
// Must be registered BEFORE /:id so Express doesn't match "my" as an ObjectId.
const getMyRecipes = async (req, res) => {
  const recipes = await Recipe.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  const data = recipes.map((r) => ({
    ...r,
    _id: r._id.toString(),
    isFavorited: false, // owner's own recipes — not relevant, default false
  }));

  res.json({ success: true, data });
};

// ─── GET /api/recipes/:id ─────────────────────────────────────────────────────
const getRecipeById = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).lean();
  if (!recipe) {
    throw new AppError("Recipe not found", 404);
  }

  let isFavorited = false;
  if (req.user) {
    const fav = await Favorite.findOne({
      userId: req.user._id,
      recipeId: recipe._id,
    });
    isFavorited = !!fav;
  }

  res.json({
    success: true,
    data: {
      ...recipe,
      _id: recipe._id.toString(),
      isFavorited,
    },
  });
};

// ─── POST /api/recipes ────────────────────────────────────────────────────────
const createRecipe = async (req, res) => {
  const {
    title,
    description,
    ingredients,
    instructions,
    cuisine,
    cookTime,
    prepTime,
    servings,
    difficulty,
    category,
    tags,
    image,
    nutrition,
  } = req.body;

  if (!title || !ingredients?.length || !instructions?.length) {
    throw new AppError("Title, ingredients, and instructions are required", 400);
  }

  if (ingredients.length < 2) {
    throw new AppError("Recipe must have at least 2 ingredients", 400);
  }

  if (instructions.length < 2) {
    throw new AppError("Recipe must have at least 2 instruction steps", 400);
  }

  const recipe = await Recipe.create({
    title,
    description,
    ingredients,
    instructions,
    cuisine,
    cookTime,
    prepTime,
    servings,
    difficulty,
    category,
    tags,
    image,
    nutrition,
    createdBy: req.user._id,
    authorName: req.user.name, // store name at creation time as a fallback
    isAIGenerated: false,
  });

  res.status(201).json({
    success: true,
    data: recipe,
  });
};

// ─── PUT /api/recipes/:id ─────────────────────────────────────────────────────
const updateRecipe = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    throw new AppError("Recipe not found", 404);
  }

  // Only the creator can update
  if (recipe.createdBy?.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to edit this recipe", 403);
  }

  const {
    title,
    description,
    ingredients,
    instructions,
    cuisine,
    cookTime,
    prepTime,
    servings,
    difficulty,
    category,
    tags,
    image,
    nutrition,
  } = req.body;

  // Validate required fields
  if (title !== undefined && !title.trim()) {
    throw new AppError("Title cannot be empty", 400);
  }
  if (ingredients !== undefined && ingredients.length < 2) {
    throw new AppError("Recipe must have at least 2 ingredients", 400);
  }
  if (instructions !== undefined && instructions.length < 2) {
    throw new AppError("Recipe must have at least 2 instruction steps", 400);
  }

  // Apply only the fields that were provided in the request body
  if (title        !== undefined) recipe.title        = title;
  if (description  !== undefined) recipe.description  = description;
  if (ingredients  !== undefined) recipe.ingredients  = ingredients;
  if (instructions !== undefined) recipe.instructions = instructions;
  if (cuisine      !== undefined) recipe.cuisine      = cuisine;
  if (cookTime     !== undefined) recipe.cookTime     = cookTime;
  if (prepTime     !== undefined) recipe.prepTime     = prepTime;
  if (servings     !== undefined) recipe.servings     = servings;
  if (difficulty   !== undefined) recipe.difficulty   = difficulty;
  if (category     !== undefined) recipe.category     = category;
  if (tags         !== undefined) recipe.tags         = tags;
  if (image        !== undefined) recipe.image        = image;
  if (nutrition    !== undefined) recipe.nutrition    = nutrition;

  await recipe.save();

  res.json({
    success: true,
    data: recipe,
  });
};

// ─── DELETE /api/recipes/:id ──────────────────────────────────────────────────
const deleteRecipe = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    throw new AppError("Recipe not found", 404);
  }

  if (recipe.createdBy?.toString() !== req.user._id.toString()) {
    throw new AppError("Not authorized to delete this recipe", 403);
  }

  await recipe.deleteOne();
  await Favorite.deleteMany({ recipeId: recipe._id });

  res.json({ success: true, message: "Recipe deleted successfully" });
};

// ─── Ingredient normalisation helpers (self-contained, no aiController import) ─
// Mirrors the Phase 3.1 normalizer but lives here independently.
// Returns an array of singularized core word tokens from a raw ingredient string.

const _normalizeIngredient = (raw) => {
  let s = raw.toLowerCase();

  // Strip quantities
  s = s.replace(/[\d]+[./][\d]+/g, '');
  s = s.replace(/[\d]+/g, '');
  s = s.replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, '');

  // Strip unit words
  const units = [
    'tablespoons?','teaspoons?','tbsps?','tsps?',
    'cups?','litres?','liters?','millilitres?','milliliters?',
    'kilograms?','grams?','pounds?','ounces?',
    'kgs?','lbs?','ozs?','mls?',
    'pieces?','slices?','cloves?','bunches?','heads?',
    'stalks?','sprigs?','handfuls?','pinch(?:es)?','dash(?:es)?',
    'cans?','tins?','jars?','packets?','bags?',
  ];
  const unitRx = new RegExp(`\\b(${units.join('|')})\\b`, 'g');
  s = s.replace(unitRx, '');

  // Strip parenthetical notes
  s = s.replace(/\(.*?\)/g, '');

  // Strip punctuation
  s = s.replace(/[,.;:\-]/g, ' ');

  // Strip descriptor words (preparation/style adjectives).
  // Deliberately does NOT strip variety qualifiers like "spring", "coconut",
  // "black" so "spring onion" stays distinct from "onion".
  const descriptors = [
    'finely','roughly','coarsely','thinly','thickly',
    'chopped','diced','sliced','minced','crushed','grated',
    'peeled','deseeded','seeded','trimmed','halved','quartered',
    'fresh','dried','frozen','canned','tinned','cooked','raw',
    'ground','powdered','whole','cracked','toasted','roasted',
    'large','medium','small','extra',
    'heaped','packed','level',
    'ripe','firm','soft',
    'boneless','skinless','lean',
    'optional','to','taste','and','or','of',
  ];
  const descRx = new RegExp(`\\b(${descriptors.join('|')})\\b`, 'g');
  s = s.replace(descRx, '');

  // Collapse whitespace and split into words
  return s.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
};

const _singularizeWord = (word) => {
  if (word.length <= 3) return word;
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('oes')) return word.slice(0, -2);
  if (/(s|x|z|ch|sh)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) {
    return word.slice(0, -1);
  }
  return word;
};

// Returns a Set of normalised, singularized core tokens for one ingredient string
const _tokenizeIngredient = (raw) =>
  new Set(_normalizeIngredient(raw).map(_singularizeWord));

// Count how many ingredient strings from `candidateList` share at least one
// token with any token from `targetList`.
const _countIngredientMatches = (targetList, candidateList) => {
  // Build a flat set of all tokens across all target ingredients
  const targetTokens = new Set();
  for (const ing of targetList) {
    for (const tok of _tokenizeIngredient(ing)) {
      if (tok.length > 1) targetTokens.add(tok);
    }
  }

  let matches = 0;
  for (const ing of candidateList) {
    const candidateTokens = _tokenizeIngredient(ing);
    for (const tok of candidateTokens) {
      if (tok.length > 1 && targetTokens.has(tok)) {
        matches++;
        break; // count each candidate ingredient once even if multiple tokens match
      }
    }
  }
  return matches;
};

// ─── Score + explain one candidate against the target ─────────────────────────
const _scoreCandidate = (target, candidate) => {
  const reasons = [];
  let score = 0;

  // 1. Ingredient overlap (weight 5 per matching ingredient)
  const ingredientMatches = _countIngredientMatches(
    target.ingredients,
    candidate.ingredients
  );
  if (ingredientMatches > 0) {
    score += ingredientMatches * 5;
    reasons.push('Similar ingredients');
  }

  // 2. Same cuisine (weight 3) — case-insensitive
  const sameCuisine =
    target.cuisine &&
    candidate.cuisine &&
    target.cuisine.toLowerCase() === candidate.cuisine.toLowerCase();
  if (sameCuisine) {
    score += 3;
    reasons.push('Same cuisine');
  }

  // 3. Same category (weight 2)
  const sameCategory = target.category && candidate.category === target.category;
  if (sameCategory) {
    score += 2;
    // Friendly label for the category reason
    const categoryLabel =
      candidate.category === 'veg'     ? 'Vegetarian'
      : candidate.category === 'vegan' ? 'Vegan'
      :                                  'Non-Vegetarian';
    reasons.push(categoryLabel);
  }

  // 4. Tag overlap (weight 2 per shared tag)
  const targetTagSet = new Set((target.tags || []).map((t) => t.toLowerCase()));
  const tagMatches = (candidate.tags || []).filter((t) =>
    targetTagSet.has(t.toLowerCase())
  ).length;
  if (tagMatches > 0) {
    score += tagMatches * 2;
    reasons.push('Shared tags');
  }

  // 5. Same difficulty (weight 1)
  const sameDifficulty =
    target.difficulty && candidate.difficulty === target.difficulty;
  if (sameDifficulty) {
    score += 1;
    reasons.push(`${candidate.difficulty} difficulty`);
  }

  return { score, reasons };
};

// ─── GET /api/recipes/:id/recommendations ─────────────────────────────────────
const getRecommendations = async (req, res) => {
  const target = await Recipe.findById(req.params.id).lean();
  if (!target) {
    throw new AppError('Recipe not found', 404);
  }

  // Fetch all other recipes. We select only the fields needed for scoring
  // plus those needed to render a RecipeCard on the frontend.
  const candidates = await Recipe.find({ _id: { $ne: target._id } })
    .select(
      '_id title description image cuisine category difficulty tags ' +
      'ingredients cookTime prepTime servings rating ratingCount ' +
      'authorName isAIGenerated createdBy createdAt'
    )
    .lean();

  // Score and explain every candidate
  const scored = candidates
    .map((candidate) => {
      const { score, reasons } = _scoreCandidate(target, candidate);
      return { candidate, score, reasons };
    })
    .filter(({ score }) => score > 0)           // exclude zero-similarity recipes
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;  // descending score
      // Tie-break: newest first
      return new Date(b.candidate.createdAt) - new Date(a.candidate.createdAt);
    })
    .slice(0, 4);                               // top 4 only

  // Annotate isFavorited if user is authenticated (optionalAuth sets req.user)
  let favoritedIds = new Set();
  if (req.user && scored.length > 0) {
    const ids = scored.map(({ candidate }) => candidate._id);
    const favs = await Favorite.find({
      userId: req.user._id,
      recipeId: { $in: ids },
    }).select('recipeId');
    favoritedIds = new Set(favs.map((f) => f.recipeId.toString()));
  }

  const data = scored.map(({ candidate, score, reasons }) => ({
    recipe: {
      ...candidate,
      _id: candidate._id.toString(),
      isFavorited: favoritedIds.has(candidate._id.toString()),
    },
    score,
    reasons,
  }));

  res.json({ success: true, data });
};

module.exports = {
  getAllRecipes,
  getMyRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecommendations,
};