import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { RecipeCard } from '@/components/RecipeCard';
import { FilterPanel } from '@/components/FilterPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useRecipes } from '@/hooks/useRecipes';
import { favoriteApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Recipe } from '@/types/recipe';

const RecipeFeed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── Filter state ──────────────────────────────────────────────────────────
  const [selectedCuisine, setSelectedCuisine]   = useState('All');
  const [selectedDietary, setSelectedDietary]   = useState<string[]>([]);
  const [selectedType, setSelectedType]         = useState('all');
  const [sortBy, setSortBy]                     = useState('newest');

  // ─── API params ────────────────────────────────────────────────────────────
  // Only params the backend actually supports are included here.
  // selectedCategory (meal occasion: Breakfast/Lunch/Dinner…) is intentionally
  // excluded — the backend's `category` field holds dietary type (veg/non-veg/vegan),
  // not meal occasion. The Category dropdown is marked "Coming soon" in FilterPanel.
  const searchQuery = searchParams.get('search') ?? '';

  const apiParams = useMemo(() => ({
    ...(searchQuery.trim()               ? { search: searchQuery.trim() }                    : {}),
    ...(selectedCuisine !== 'All'        ? { cuisine: selectedCuisine }                      : {}),
    ...(selectedType !== 'all'           ? { category: selectedType as 'veg' | 'non-veg' | 'vegan' } : {}),
    limit: 24,
  }), [searchQuery, selectedCuisine, selectedType]);

  const { recipes: rawRecipes, pagination, isLoading, error, refetch } = useRecipes(apiParams);

  // ─── Client-side processing ────────────────────────────────────────────────
  // Applied to the page returned by the API after backend filtering.
  // • Dietary tags  — backend has no tag-based filter param
  // • Sorting       — backend always sorts by createdAt desc; popular/rating
  //                   are sorted client-side on the returned page
  const recipes = useMemo(() => {
    let result: Recipe[] = [...rawRecipes];

    // Dietary tag filter (Vegetarian / Vegan / Gluten-Free / Keto / Dairy-Free)
    if (selectedDietary.length > 0) {
      result = result.filter((recipe) =>
        selectedDietary.some((dietary) =>
          recipe.tags.some((tag) => tag.toLowerCase().includes(dietary.toLowerCase()))
        )
      );
    }

    // Sort — 'newest' is already the backend default; re-sorting is a no-op
    // but kept for consistency if the user explicitly reselects it
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        // ratingCount replaces old reviewCount field
        result.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [rawRecipes, selectedDietary, sortBy]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleDietaryChange = (value: string, checked: boolean) => {
    setSelectedDietary((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleFavoriteToggle = async (id: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      navigate('/login');
      return;
    }
    try {
      const res = await favoriteApi.toggle(id);
      toast.success(res.data.message);
      refetch();
    } catch {
      toast.error('Failed to update favorite. Please try again.');
    }
  };

  // ─── Skeleton ──────────────────────────────────────────────────────────────
  const CardSkeleton = () => (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );

  // ─── Recipe count label ────────────────────────────────────────────────────
  // During loading: no count shown.
  // After load: prefer the backend total (pagination.total) when no client-side
  // dietary filter is active; fall back to the length of the processed list.
  const recipeCount = isLoading
    ? null
    : selectedDietary.length > 0
      ? recipes.length
      : (pagination?.total ?? recipes.length);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header — layout unchanged */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Recipes</h1>
          <p className="text-muted-foreground">
            {recipeCount === null
              ? 'Loading recipes…'
              : `${recipeCount} ${recipeCount === 1 ? 'recipe' : 'recipes'} found`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filters — layout unchanged */}
          <aside className="hidden lg:block">
            <FilterPanel
              selectedCuisine={selectedCuisine}
              selectedDietary={selectedDietary}
              selectedType={selectedType}
              onCuisineChange={setSelectedCuisine}
              onDietaryChange={handleDietaryChange}
              onTypeChange={setSelectedType}
            />
          </aside>

          {/* Main Content — layout unchanged */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls Bar — layout unchanged */}
            <div className="flex items-center justify-between">
              {/* Mobile Filter Toggle */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel
                      selectedCuisine={selectedCuisine}
                      selectedDietary={selectedDietary}
                      selectedType={selectedType}
                      onCuisineChange={setSelectedCuisine}
                      onDietaryChange={handleDietaryChange}
                      onTypeChange={setSelectedType}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Options — unchanged */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recipe Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-lg text-muted-foreground">Failed to load recipes.</p>
                <Button variant="outline" onClick={refetch}>Try Again</Button>
              </div>
            ) : recipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              // Empty state — layout and text unchanged
              <div className="text-center py-12 space-y-2">
                <p className="text-2xl">😔</p>
                <p className="text-lg text-muted-foreground">No recipes found for your search</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeFeed;
