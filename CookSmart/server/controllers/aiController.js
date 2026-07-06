const { getGeminiModel } = require("../config/gemini");
const Recipe = require("../models/Recipe");
const MealPlan = require("../models/MealPlan");
const AppError = require("../middleware/AppError");

// ─── Helper: parse Gemini response safely ─────────────────────────────────────
const parseGeminiJSON = (text) => {
  const clean = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    throw new AppError("AI returned an unexpected response format. Please try again.", 502);
  }
};

// ─── Helper: normalize a single ingredient string into word tokens ─────────────
//
// Strategy (in order):
//   1. Lowercase the entire string.
//   2. Strip quantities:  "2", "1/2", "2.5", "¼", "½", "¾" etc.
//   3. Strip common unit words:   cup(s), tbsp, tsp, gram(s), g, kg, ml, l,
//                                 oz, lb(s), pound(s), piece(s), slice(s), etc.
//   4. Strip parenthetical notes: "(chopped)", "(optional)" …
//   5. Strip punctuation so it doesn't interfere with word-boundary stripping.
//   6. Strip common descriptors: chopped, diced, sliced, minced, fresh,
//                                dried, ground, large, small, medium, whole,
//                                finely, roughly, coarsely, heaped, packed, etc.
//   7. Collapse whitespace and split into individual words.
//   8. Singularize each word individually (eggs→egg, tomatoes→tomato,
//      berries→berry, boxes→box; asparagus is left untouched).
//
const normalizeIngredient = (raw) => {
  let s = raw.toLowerCase();

  s = s.replace(/[\d]+[./][\d]+/g, "");
  s = s.replace(/[\d]+/g, "");
  s = s.replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, "");

  const units = [
    "tablespoons?", "teaspoons?", "tbsps?", "tsps?",
    "cups?", "litres?", "liters?", "millilitres?", "milliliters?",
    "kilograms?", "grams?", "pounds?", "ounces?",
    "kgs?", "lbs?", "ozs?", "mls?",
    "pieces?", "slices?", "cloves?", "bunches?", "heads?",
    "stalks?", "sprigs?", "handfuls?", "pinch(?:es)?", "dash(?:es)?",
    "cans?", "tins?", "jars?", "packets?", "bags?",
  ];
  const unitPattern = new RegExp(`\\b(${units.join("|")})\\b`, "g");
  s = s.replace(unitPattern, "");
  s = s.replace(/\(.*?\)/g, "");
  s = s.replace(/[,.;:\-]/g, " ");

  const descriptors = [
    "finely", "roughly", "coarsely", "thinly", "thickly",
    "chopped", "diced", "sliced", "minced", "crushed", "grated",
    "peeled", "deseeded", "seeded", "trimmed", "halved", "quartered",
    "fresh", "dried", "frozen", "canned", "tinned", "cooked", "raw",
    "ground", "powdered", "whole", "cracked", "toasted", "roasted",
    "large", "medium", "small", "extra",
    "heaped", "packed", "level",
    "ripe", "firm", "soft",
    "boneless", "skinless", "lean",
    "optional", "to", "taste", "and", "or", "of",
  ];
  const descPattern = new RegExp(`\\b(${descriptors.join("|")})\\b`, "g");
  s = s.replace(descPattern, "");

  return s.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
};

const singularizeWord = (word) => {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (/(s|x|z|ch|sh)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss") && !word.endsWith("us")) {
    return word.slice(0, -1);
  }
  return word;
};

const tokenizeIngredient = (raw) => normalizeIngredient(raw).map(singularizeWord);

// ─── Helper: strict phrase-equality match ─────────────────────────────────────
const phrasesMatch = (wordsA, wordsB) => {
  if (wordsA.length === 0 || wordsB.length === 0) return false;
  if (wordsA.length !== wordsB.length) return false;
  const a = [...wordsA].sort().join(" ");
  const b = [...wordsB].sort().join(" ");
  return a === b;
};

// ─── Helper: compute ingredient diff ─────────────────────────────────────────
const computeIngredientDiff = (userIngredients, recipeIngredients) => {
  const userTokenSets = userIngredients.map(tokenizeIngredient);
  const youHave = [];
  const missing = [];

  for (const recipeIng of recipeIngredients) {
    const recipeTokens = tokenizeIngredient(recipeIng);
    if (recipeTokens.length === 0) continue;
    const matched = userTokenSets.some((ut) => phrasesMatch(ut, recipeTokens));
    if (matched) youHave.push(recipeIng);
    else missing.push(recipeIng);
  }

  return { youHaveIngredients: youHave, missingIngredients: missing };
};

// ─── Helper: shared Gemini JSON schema block ───────────────────────────────────
// Used verbatim in both prompt builders so the response contract never drifts.
const RECIPE_JSON_SCHEMA = `
Return ONLY a JSON object matching this EXACT schema (no extra fields, no markdown):
{
  "title": "string — recipe name",
  "description": "string — 1-2 sentence description (max 200 chars)",
  "ingredients": ["string — each ingredient with quantity, e.g. '2 cups flour'"],
  "instructions": ["string — each step as a complete sentence"],
  "cuisine": "string — e.g. Italian, Indian, Mexican, International",
  "cookTime": "string — e.g. '25 minutes'",
  "prepTime": "string — e.g. '10 minutes'",
  "servings": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "category": "veg" | "non-veg" | "vegan",
  "tags": ["string"],
  "nutrition": {
    "calories": "string — e.g. '320 kcal per serving'",
    "protein": "string — e.g. '18g'",
    "carbs": "string — e.g. '42g'",
    "fat": "string — e.g. '9g'",
    "fiber": "string — e.g. '4g'"
  }
}

Rules:
- nutrition values must be strings with units included.
- category must be exactly "veg", "non-veg", or "vegan" (lowercase).
- difficulty must be exactly "Easy", "Medium", or "Hard" (title case).
- instructions must have at least 3 steps.
- ingredients must have at least 2 items.
`.trim();

// ─── Helper: build Pollinations AI image URL ───────────────────────────────────
// Free, no API key required. URL format:
//   https://image.pollinations.ai/prompt/<url-encoded-prompt>
const buildImageUrl = (recipeTitle) => {
  const prompt = recipeTitle
    ? `${recipeTitle} food`
    : "delicious food";
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
};

// ─── POST /api/ai/generate-recipe ─────────────────────────────────────────────
//
// Supports two modes:
//
//   Ingredients mode (default / backward-compatible):
//     { mode: "ingredients", ingredients: ["rice", "eggs"], cuisine?, diet?, difficulty?, cookTime? }
//
//   Recipe name mode:
//     { mode: "recipe-name", recipeName: "Butter Chicken" }
//
const generateRecipe = async (req, res) => {
  const { mode = "ingredients" } = req.body;

  if (mode !== "ingredients" && mode !== "recipe-name") {
    throw new AppError('mode must be "ingredients" or "recipe-name"', 400);
  }

  // ── Branch: ingredient mode ────────────────────────────────────────────────
  if (mode === "ingredients") {
    return generateFromIngredients(req, res);
  }

  // ── Branch: recipe-name mode ───────────────────────────────────────────────
  return generateFromRecipeName(req, res);
};

// ─── Mode A: Generate from ingredients (Phase 3.1 logic, unchanged) ───────────
const generateFromIngredients = async (req, res) => {
  const {
    ingredients,
    cuisine,
    diet,
    difficulty,
    cookTime,
  } = req.body;

  // Validate
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw new AppError("Please provide at least one ingredient", 400);
  }
  const ingredientList = ingredients.map((i) => String(i).trim()).filter(Boolean);
  if (ingredientList.length === 0) {
    throw new AppError("Ingredients cannot be empty strings", 400);
  }

  // Sanitise optional fields
  const validDiets        = ["veg", "non-veg", "vegan"];
  const validDifficulties = ["Easy", "Medium", "Hard"];
  const cleanDiet         = diet       && validDiets.includes(diet)              ? diet       : null;
  const cleanDifficulty   = difficulty && validDifficulties.includes(difficulty) ? difficulty : null;
  const cleanCuisine      = cuisine    && typeof cuisine === "string"             ? cuisine.trim() : null;
  const cleanCookTime     = cookTime   && Number.isInteger(Number(cookTime)) && Number(cookTime) > 0
    ? Number(cookTime) : null;

  // Build soft-constraint block
  const constraints = [];
  if (cleanCuisine)              constraints.push(`- Prefer ${cleanCuisine} cuisine style.`);
  if (cleanDiet === "veg")       constraints.push("- The recipe MUST be vegetarian (no meat, no seafood, no eggs).");
  if (cleanDiet === "vegan")     constraints.push("- The recipe MUST be vegan (no meat, no dairy, no eggs, no honey).");
  if (cleanDiet === "non-veg")   constraints.push("- The recipe may include meat, poultry, or seafood.");
  if (cleanDifficulty)           constraints.push(`- Aim for a ${cleanDifficulty} difficulty level.`);
  if (cleanCookTime)             constraints.push(`- Try to keep total cook time under ${cleanCookTime} minutes.`);
  const constraintBlock = constraints.length > 0
    ? `\nAdditional constraints:\n${constraints.join("\n")}`
    : "";

  const prompt = `
You are a professional chef AI. Generate a complete recipe using ONLY or MOSTLY these ingredients: ${ingredientList.join(", ")}.
${constraintBlock}

${RECIPE_JSON_SCHEMA}

Extra rule: Use ONLY the provided ingredients plus common pantry staples (salt, pepper, oil, water, basic spices).
`.trim();

  // Call Gemini
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const recipeData = parseGeminiJSON(result.response.text());

  if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
    throw new AppError("AI generated an incomplete recipe. Please try again.", 502);
  }

  // Assign Pollinations AI image — replaces any placeholder
  recipeData.image = buildImageUrl(recipeData.title);

  // Persist
  const recipe = await Recipe.create({
    ...recipeData,
    isAIGenerated: true,
    createdBy: req.user._id,
    sourceIngredients: ingredientList,
  });

  // Ingredient diff
  const { youHaveIngredients, missingIngredients } = computeIngredientDiff(
    ingredientList,
    recipeData.ingredients
  );

  // YouTube search URL
  const youTubeQuery = `${recipe.title} ${recipe.cuisine} recipe`;
  const youTubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youTubeQuery)}`;

  res.status(201).json({
    success: true,
    data: { recipe, youHaveIngredients, missingIngredients, youTubeSearchUrl },
  });
};

// ─── Mode B: Generate from recipe name ────────────────────────────────────────
const generateFromRecipeName = async (req, res) => {
  const { recipeName } = req.body;

  if (!recipeName || typeof recipeName !== "string" || !recipeName.trim()) {
    throw new AppError("Please provide a recipe name", 400);
  }

  const cleanName = recipeName.trim();

  const prompt = `
You are a professional chef AI. Generate a complete, authentic recipe for: "${cleanName}".

Make the recipe as accurate and traditional as possible for this dish.

${RECIPE_JSON_SCHEMA}
`.trim();

  // Call Gemini
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const recipeData = parseGeminiJSON(result.response.text());

  if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
    throw new AppError("AI generated an incomplete recipe. Please try again.", 502);
  }

  // Assign Pollinations AI image
  recipeData.image = buildImageUrl(recipeData.title);

  // Persist — no sourceIngredients for recipe-name mode
  const recipe = await Recipe.create({
    ...recipeData,
    isAIGenerated: true,
    createdBy: req.user._id,
    // sourceIngredients deliberately omitted — not applicable for this mode
  });

  // In recipe-name mode the user hasn't declared any ingredients,
  // so they need to buy everything the recipe requires.
  const youHaveIngredients = [];
  const missingIngredients = [...recipeData.ingredients];

  // YouTube search URL
  const youTubeQuery = `${recipe.title} ${recipe.cuisine} recipe`;
  const youTubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youTubeQuery)}`;

  res.status(201).json({
    success: true,
    data: { recipe, youHaveIngredients, missingIngredients, youTubeSearchUrl },
  });
};

// ─── POST /api/ai/substitute ──────────────────────────────────────────────────
const getSubstitutions = async (req, res) => {
  const { ingredient, context } = req.body;

  if (!ingredient || typeof ingredient !== "string" || !ingredient.trim()) {
    throw new AppError("Please provide an ingredient to substitute", 400);
  }

  const prompt = `
You are a culinary expert AI. Suggest substitutes for: "${ingredient.trim()}"
${context ? `Cooking context: ${context}` : ""}

Return ONLY a JSON object matching this EXACT schema:
{
  "ingredient": "string — the original ingredient",
  "substitutes": [
    {
      "name": "string — substitute ingredient name",
      "ratio": "string — conversion ratio, e.g. '1:1' or 'use 3/4 the amount'",
      "notes": "string — brief usage note (max 100 chars)",
      "flavorImpact": "string — how it changes the dish flavor/texture"
    }
  ]
}

Rules:
- Provide 3-5 substitutes ordered from best to worst match.
- Keep notes concise and practical.
- flavorImpact should be a short phrase, not a full sentence.
`.trim();

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const data = parseGeminiJSON(result.response.text());

  res.json({ success: true, data });
};

// ─── POST /api/ai/meal-plan ───────────────────────────────────────────────────
const generateMealPlan = async (req, res) => {
  const { goal, durationDays = 7, dietaryPreferences = [] } = req.body;

  const validGoals = ["weight-loss", "muscle-gain", "maintenance", "balanced"];
  if (!goal || !validGoals.includes(goal)) {
    throw new AppError(`Goal must be one of: ${validGoals.join(", ")}`, 400);
  }
  if (durationDays < 1 || durationDays > 30) {
    throw new AppError("Duration must be between 1 and 30 days", 400);
  }

  const prefStr = dietaryPreferences.length > 0
    ? `Dietary preferences/restrictions: ${dietaryPreferences.join(", ")}.`
    : "";

  const prompt = `
You are a certified nutritionist AI. Create a ${durationDays}-day meal plan for goal: "${goal}".
${prefStr}

Return ONLY a JSON object matching this EXACT schema:
{
  "title": "string — descriptive plan name",
  "targetCalories": "string — e.g. '1800 kcal/day'",
  "notes": "string — 1-2 sentences of nutritional advice",
  "days": [
    {
      "day": "string — e.g. 'Day 1'",
      "totalCalories": "string — e.g. '1820 kcal'",
      "breakfast": {
        "name": "string",
        "description": "string — max 80 chars",
        "calories": "string — e.g. '380 kcal'",
        "prepTime": "string — e.g. '10 minutes'",
        "ingredients": ["string"]
      },
      "lunch": { "name": "string", "description": "string", "calories": "string", "prepTime": "string", "ingredients": ["string"] },
      "dinner": { "name": "string", "description": "string", "calories": "string", "prepTime": "string", "ingredients": ["string"] },
      "snack": { "name": "string", "description": "string", "calories": "string", "prepTime": "string", "ingredients": ["string"] }
    }
  ]
}

Rules:
- Generate exactly ${durationDays} day objects in the "days" array.
- All calories fields must be strings with "kcal" included.
- Meals must align with the "${goal}" goal.
- Vary meals across days — do not repeat the same meal more than twice.
`.trim();

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const planData = parseGeminiJSON(result.response.text());

  if (!planData.days || planData.days.length !== Number(durationDays)) {
    throw new AppError("AI generated an incomplete meal plan. Please try again.", 502);
  }

  const mealPlan = await MealPlan.create({
    userId: req.user._id,
    title: planData.title || "My Meal Plan",
    goal,
    durationDays: Number(durationDays),
    days: planData.days,
    targetCalories: planData.targetCalories || "",
    notes: planData.notes || "",
  });

  res.status(201).json({ success: true, data: mealPlan });
};

// ─── POST /api/ai/generate-storyboard ────────────────────────────────────────
//
// Returns the recipe's existing image plus its instructions as caption slides.
// No image generation, no Gemini call, no DB writes — just a DB read.
// Opens almost instantly; only one image request happens (recipe.image).
//
const generateStoryboard = async (req, res) => {
  const { recipeId } = req.body;

  if (!recipeId || typeof recipeId !== "string" || !recipeId.trim()) {
    throw new AppError("recipeId is required", 400);
  }

  const Recipe = require("../models/Recipe");
  const recipe = await Recipe.findById(recipeId.trim()).lean();
  if (!recipe) {
    throw new AppError("Recipe not found", 404);
  }

  if (!recipe.instructions || recipe.instructions.length === 0) {
    throw new AppError("This recipe has no instructions to create a storyboard from", 400);
  }

  // One slide per instruction — no image per slide.
  // The single recipe image is returned once at the top level.
  const slides = recipe.instructions.map((instruction, index) => ({
    step: index + 1,
    instruction,
  }));

  // Fallback image if the recipe has no image stored
  const image = recipe.image?.trim() ||
    `https://image.pollinations.ai/prompt/${encodeURIComponent(recipe.title + " food")}`;

  res.json({
    success: true,
    data: {
      title: recipe.title,
      image,
      slides,
    },
  });
};

module.exports = { generateRecipe, getSubstitutions, generateMealPlan, generateStoryboard };