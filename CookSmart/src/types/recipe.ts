/**
 * Recipe types matching the MongoDB schema exactly.
 *
 * Key differences from the old mockRecipes interface:
 *   _id          (was: id)
 *   category     (was: type)       — values: 'veg' | 'non-veg' | 'vegan'
 *   ratingCount  (was: reviewCount)
 *   isFavorited  (was: isFavorite) — annotated per-user by the backend
 *
 * nutrition.calories is a string here ("320 kcal per serving"),
 * not a number, because the AI generates it with units inline.
 */

export interface RecipeNutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  image: string;

  // Author — populated from createdBy reference, or null for seeded recipes
  // authorName is a plain string stored directly on the recipe document for
  // seeded/AI recipes that have no createdBy User reference.
  authorName?: string;
  author?: string;
  authorAvatar?: string;

  cookTime: string;
  prepTime?: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';

  // NOTE: 'category' maps to what the frontend previously called 'type'
  category: 'veg' | 'non-veg' | 'vegan';

  cuisine: string;
  tags: string[];

  ingredients: string[];
  instructions: string[];

  nutrition: RecipeNutrition;

  rating: number;
  // NOTE: 'ratingCount' is what the frontend previously called 'reviewCount'
  ratingCount: number;

  // Annotated per-request by the backend when a valid token is present.
  // Undefined when the user is not logged in (anonymous GET).
  isFavorited?: boolean;

  isAIGenerated: boolean;
  createdBy: string | null;
  sourceIngredients?: string[];

  createdAt: string;
  updatedAt: string;
}

// ─── API Response shapes ──────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface RecipeListResponse {
  success: boolean;
  data: Recipe[];
  pagination: PaginationMeta;
}

export interface RecipeSingleResponse {
  success: boolean;
  data: Recipe;
}

export interface FavoriteToggleResponse {
  success: boolean;
  isFavorited: boolean;
  message: string;
}

export interface FavoriteListResponse {
  success: boolean;
  data: Recipe[];
  total: number;
}

export interface FavoriteIdsResponse {
  success: boolean;
  data: string[];
}

// ─── Query params for GET /api/recipes ───────────────────────────────────────

export interface RecipeQueryParams {
  search?: string;
  category?: 'veg' | 'non-veg' | 'vegan';
  cuisine?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  page?: number;
  limit?: number;
}

// ─── AI Kitchen Assistant (Phase 3.1 + 3.3) ───────────────────────────────────

/**
 * Request payload for POST /api/ai/generate-recipe.
 *
 * Two modes:
 *
 *   Ingredients mode (default):
 *     { mode: 'ingredients', ingredients: ['rice', 'eggs'], cuisine?, diet?, difficulty?, cookTime? }
 *
 *   Recipe name mode:
 *     { mode: 'recipe-name', recipeName: 'Butter Chicken' }
 */
export type AIGenerateMode = 'ingredients' | 'recipe-name';

export interface AIGenerateRequest {
  mode?: AIGenerateMode;

  // ── Ingredients mode ──────────────────────────────────────────────────────
  ingredients?: string[];
  cuisine?: string;
  diet?: 'veg' | 'non-veg' | 'vegan';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  /** Desired max cook time in minutes (e.g. 30). */
  cookTime?: number;

  // ── Recipe name mode ──────────────────────────────────────────────────────
  /** The name of the dish to generate, e.g. "Butter Chicken". */
  recipeName?: string;
}

/**
 * The `data` payload returned by POST /api/ai/generate-recipe.
 * `recipe` is a full Recipe document — already persisted to MongoDB with
 * isAIGenerated: true, so it can be opened in RecipeDetail or favorited
 * immediately, with no separate save step required.
 */
export interface AIGenerateResult {
  recipe: Recipe;
  /** Original-text recipe ingredients the user already has, matched by phrase. */
  youHaveIngredients: string[];
  /** Original-text recipe ingredients the user still needs — doubles as the shopping list. */
  missingIngredients: string[];
  /** Pre-built YouTube search results URL for the generated recipe. */
  youTubeSearchUrl: string;
}

/** Full response envelope for POST /api/ai/generate-recipe. */
export interface AIGenerateResponse {
  success: boolean;
  data: AIGenerateResult;
}

// ─── Smart Recommendations (Phase 3.5) ───────────────────────────────────────

/**
 * A single recommendation result — recipe + relevance score + human-readable
 * reasons explaining why it was recommended.
 */
export interface RecommendationItem {
  recipe: Recipe;
  /** Raw similarity score — higher is more similar. Not displayed to the user. */
  score: number;
  /**
   * Human-readable explanation phrases, e.g.
   * ["Similar ingredients", "Same cuisine", "Vegetarian"]
   */
  reasons: string[];
}

/** Response shape for GET /api/recipes/:id/recommendations. */
export interface RecommendationsResponse {
  success: boolean;
  data: RecommendationItem[];
}

/** One slide in a recipe storyboard — one per instruction step. */
export interface StoryboardSlide {
  step: number;
  instruction: string;
  // No per-slide image — the single recipe image is used for all slides.
}

/** Response shape for POST /api/ai/generate-storyboard. */
export interface StoryboardResponse {
  success: boolean;
  data: {
    title: string;
    /** The recipe's existing image URL — used for every slide. */
    image: string;
    slides: StoryboardSlide[];
  };
}