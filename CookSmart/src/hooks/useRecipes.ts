import { useState, useEffect, useCallback, useRef } from 'react';
import { recipeApi } from '@/services/api';
import type { Recipe, PaginationMeta, RecipeQueryParams } from '@/types/recipe';

// ─── Return shape ─────────────────────────────────────────────────────────────

export interface UseRecipesResult {
  recipes: Recipe[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useRecipes
 *
 * Fetches recipes from GET /api/recipes whenever `params` changes.
 * Params are compared by value (not reference) so callers can pass
 * inline objects without causing infinite loops.
 *
 * Usage:
 *   const { recipes, isLoading, error, pagination, refetch } = useRecipes({
 *     search: 'pasta',
 *     category: 'veg',
 *     limit: 6,
 *   });
 */
export const useRecipes = (params?: RecipeQueryParams): UseRecipesResult => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize params to a stable string for the useEffect dependency.
  // This means callers can safely write useRecipes({ limit: 6 }) inline
  // without triggering a refetch on every render.
  const paramsKey = JSON.stringify(params ?? {});

  // refetch counter — increment to manually trigger a re-fetch
  // without changing params (e.g. after a favorite toggle or recipe create).
  const [fetchCount, setFetchCount] = useState(0);
  const refetch = useCallback(() => setFetchCount((n) => n + 1), []);

  // Track mount state to avoid setting state after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Re-parse from the serialized key so this effect only re-runs
        // when the actual param values change, not the object reference.
        const parsedParams: RecipeQueryParams = JSON.parse(paramsKey);
        const res = await recipeApi.getAll(parsedParams);

        if (!cancelled && isMounted.current) {
          setRecipes(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err: unknown) {
        if (!cancelled && isMounted.current) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to load recipes. Please try again.';
          setError(message);
          setRecipes([]);
          setPagination(null);
        }
      } finally {
        if (!cancelled && isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetch();

    // If this effect re-runs before the previous fetch completes,
    // mark the previous fetch as cancelled so it won't update state.
    return () => {
      cancelled = true;
    };

    // fetchCount is intentionally included so refetch() triggers a new call
    // with the same params.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, fetchCount]);

  return { recipes, pagination, isLoading, error, refetch };
};

// ─── Single-recipe hook ───────────────────────────────────────────────────────

export interface UseRecipeResult {
  recipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useRecipe
 *
 * Fetches a single recipe from GET /api/recipes/:id.
 * Returns null while loading or if not found.
 *
 * Usage:
 *   const { recipe, isLoading, error } = useRecipe(id);
 */
export const useRecipe = (id: string | undefined): UseRecipeResult => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const refetch = useCallback(() => setFetchCount((n) => n + 1), []);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError('No recipe ID provided');
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await recipeApi.getById(id);

        if (!cancelled && isMounted.current) {
          setRecipe(res.data.data);
        }
      } catch (err: unknown) {
        if (!cancelled && isMounted.current) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to load recipe. Please try again.';
          setError(message);
          setRecipe(null);
        }
      } finally {
        if (!cancelled && isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [id, fetchCount]);

  return { recipe, isLoading, error, refetch };
};
