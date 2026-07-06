import { useState, useEffect, useCallback, useRef } from 'react';
import { recipeApi } from '@/services/api';
import type { RecommendationItem } from '@/types/recipe';

// ─── Return shape ─────────────────────────────────────────────────────────────

export interface UseRecommendationsResult {
  recommendations: RecommendationItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useRecommendations
 *
 * Fetches content-based recipe recommendations for a given recipe ID from
 * GET /api/recipes/:id/recommendations.
 *
 * - Automatically re-fetches when `recipeId` changes (i.e. when the user
 *   navigates from one recipe detail page to another via a recommendation card).
 * - Respects component unmount — won't set state after the component is gone.
 * - Provides a `refetch` function for manual refresh.
 *
 * Usage:
 *   const { recommendations, isLoading, error } = useRecommendations(id);
 */
export const useRecommendations = (
  recipeId: string | undefined
): UseRecommendationsResult => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [error, setError]                     = useState<string | null>(null);

  // refetch counter — increment to manually re-trigger without changing recipeId
  const [fetchCount, setFetchCount] = useState(0);
  const refetch = useCallback(() => setFetchCount((n) => n + 1), []);

  // Track mount state — prevents state updates after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!recipeId) {
      setIsLoading(false);
      setError('No recipe ID provided');
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await recipeApi.getRecommendations(recipeId);

        if (!cancelled && isMounted.current) {
          setRecommendations(res.data.data);
        }
      } catch (err: unknown) {
        if (!cancelled && isMounted.current) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to load recommendations.';
          setError(message);
          setRecommendations([]);
        }
      } finally {
        if (!cancelled && isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };

    // fetchCount included so refetch() re-triggers with the same recipeId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId, fetchCount]);

  return { recommendations, isLoading, error, refetch };
};