import axios from 'axios';
import type {
  Recipe,
  RecipeQueryParams,
  RecipeListResponse,
  RecipeSingleResponse,
  FavoriteListResponse,
  FavoriteIdsResponse,
  FavoriteToggleResponse,
  AIGenerateRequest,
  AIGenerateResponse,
  StoryboardResponse,
  RecommendationsResponse,
} from '@/types/recipe';

// ─── Axios instance ───────────────────────────────────────────────────────────

// API base URL — unchanged from Phase 1
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach authToken on every request (unchanged from Phase 1)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 response interceptor — clears stale token and redirects to /login.
// This handles expired JWTs on any API call without requiring each page to
// individually check for 401 responses.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Only clear and redirect if a token was actually present
      // (avoids redirect loops on unauthenticated public routes)
      const hadToken = !!localStorage.getItem('authToken');
      if (hadToken) {
        localStorage.removeItem('authToken');
        // Navigate without React Router to avoid being inside a component context
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Recipe API ───────────────────────────────────────────────────────────────

export const recipeApi = {
  /**
   * GET /api/recipes
   * Supports: search, category ('veg'|'non-veg'|'vegan'), cuisine,
   *           difficulty ('Easy'|'Medium'|'Hard'), page, limit.
   * Backend also annotates isFavorited per-recipe when a token is present
   * (via optionalAuth middleware) — no extra work needed on the frontend.
   */
  getAll: async (params?: RecipeQueryParams) => {
    // Strip out undefined/empty values so they don't appear as empty query params
    const cleanParams: Record<string, string | number> = {};
    if (params) {
      for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== '' && val !== null) {
          cleanParams[key] = val;
        }
      }
    }
    return api.get<RecipeListResponse>('/recipes', { params: cleanParams });
  },

  /**
   * GET /api/recipes/:id
   * Returns a single recipe. isFavorited is annotated when token is present.
   */
  getById: async (id: string) => {
    return api.get<RecipeSingleResponse>(`/recipes/${id}`);
  },

  /**
   * POST /api/recipes   (requires auth)
   * Creates a new recipe. createdBy is set from the JWT on the backend.
   */
  create: async (recipe: {
    title: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    cuisine?: string;
    cookTime?: string;
    prepTime?: string;
    servings?: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    category?: 'veg' | 'non-veg' | 'vegan';
    tags?: string[];
    image?: string;
    nutrition?: {
      calories?: string;
      protein?: string;
      carbs?: string;
      fat?: string;
      fiber?: string;
    };
  }) => {
    return api.post<RecipeSingleResponse>('/recipes', recipe);
  },

  /**
   * GET /api/recipes/my   (requires auth)
   * Returns only recipes created by the authenticated user, newest first.
   */
  getMyRecipes: async () => {
    return api.get<{ success: boolean; data: Recipe[] }>('/recipes/my');
  },

  /**
   * PUT /api/recipes/:id   (requires auth, must be creator)
   * Partial update — only provided fields are changed.
   */
  update: async (id: string, recipe: {
    title?: string;
    description?: string;
    ingredients?: string[];
    instructions?: string[];
    cuisine?: string;
    cookTime?: string;
    prepTime?: string;
    servings?: number;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    category?: 'veg' | 'non-veg' | 'vegan';
    tags?: string[];
    image?: string;
    nutrition?: {
      calories?: string;
      protein?: string;
      carbs?: string;
      fat?: string;
      fiber?: string;
    };
  }) => {
    return api.put<RecipeSingleResponse>(`/recipes/${id}`, recipe);
  },

  /**
   * DELETE /api/recipes/:id   (requires auth, must be creator)
   */
  delete: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/recipes/${id}`);
  },

  /**
   * GET /api/recipes/:id/recommendations   (public — optionalAuth)
   * Returns top 4 content-based recommendations for the given recipe.
   * Each result includes the recipe, its similarity score, and human-readable
   * reasons explaining why it was recommended.
   * Logged-in users also get isFavorited annotated on each recipe.
   */
  getRecommendations: async (id: string) => {
    return api.get<RecommendationsResponse>(`/recipes/${id}/recommendations`);
  },
};

// ─── Favorites API ────────────────────────────────────────────────────────────

export const favoriteApi = {
  /**
   * GET /api/favorites   (requires auth)
   * Returns full recipe objects for all of the current user's favorites,
   * each with isFavorited: true already set.
   */
  getAll: async () => {
    return api.get<FavoriteListResponse>('/favorites');
  },

  /**
   * GET /api/favorites/ids   (requires auth)
   * Lightweight — returns only an array of recipe _id strings.
   * Use this for hydrating a Set<string> of favorited IDs on app mount
   * without fetching full recipe data.
   */
  getIds: async () => {
    return api.get<FavoriteIdsResponse>('/favorites/ids');
  },

  /**
   * POST /api/favorites/:recipeId   (requires auth)
   * Toggle endpoint — adds if not favorited, removes if already favorited.
   * Returns { success, isFavorited: boolean, message }.
   * No separate add/remove calls needed.
   */
  toggle: async (recipeId: string) => {
    return api.post<FavoriteToggleResponse>(`/favorites/${recipeId}`);
  },
};

// ─── AI API (Phase 3.1) ───────────────────────────────────────────────────────

export const aiApi = {
  /**
   * POST /api/ai/generate-recipe   (requires auth — Gemini costs money)
   * Generates a recipe from the given ingredients via Gemini, persists it to
   * MongoDB with isAIGenerated: true (no separate save call needed), and
   * returns the missing-ingredient diff plus a YouTube search URL alongside
   * the saved recipe.
   */
  generateRecipe: async (payload: AIGenerateRequest) => {
    return api.post<AIGenerateResponse>('/ai/generate-recipe', payload);
  },

  /**
   * POST /api/ai/generate-storyboard   (requires auth)
   * Returns one Pollinations AI image URL per instruction step.
   * No Gemini call — purely a URL builder on the backend.
   * Images are loaded on demand by the browser when each slide renders.
   */
  generateStoryboard: async (recipeId: string) => {
    return api.post<StoryboardResponse>('/ai/generate-storyboard', { recipeId });
  },
};

// ─── Auth API (unchanged from Phase 1) ───────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },

  register: async (name: string, email: string, password: string) => {
    return api.post('/auth/register', { name, email, password });
  },

  logout: async () => {
    localStorage.removeItem('authToken');
  },

  getMe: async () => {
    return api.get('/auth/me');
  },
};

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  updateProfile: async (data: { name?: string; avatar?: string; dietaryPreferences?: string[] }) => {
    return api.put('/auth/me', data);
  },
};

export default api;