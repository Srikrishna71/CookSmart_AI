import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { RecipeCard } from '@/components/RecipeCard';
import { FilterPanel } from '@/components/FilterPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockRecipes } from '@/data/mockRecipes';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const RecipeFeed = () => {
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState(mockRecipes);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    let filtered = [...mockRecipes];

    // Apply search filter - enhanced to search title, description, cuisine, category, ingredients, and tags
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase())) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply cuisine filter
    if (selectedCuisine !== 'All') {
      filtered = filtered.filter((recipe) => recipe.cuisine === selectedCuisine);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((recipe) => recipe.category === selectedCategory);
    }

    // Apply dietary filters
    if (selectedDietary.length > 0) {
      filtered = filtered.filter((recipe) =>
        selectedDietary.some((dietary) =>
          recipe.tags.some((tag) => tag.toLowerCase().includes(dietary.toLowerCase()))
        )
      );
    }

    // Apply type filter (veg/non-veg)
    if (selectedType !== 'all') {
      filtered = filtered.filter((recipe) => recipe.type === selectedType);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    setRecipes(filtered);
  }, [searchParams, selectedCuisine, selectedCategory, selectedDietary, selectedType, sortBy]);

  const handleDietaryChange = (value: string, checked: boolean) => {
    setSelectedDietary((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleFavoriteToggle = (id: string) => {
    console.log('Toggled favorite for recipe:', id);
    // TODO: Implement favorite toggle with backend
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Recipes</h1>
          <p className="text-muted-foreground">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <FilterPanel
              selectedCuisine={selectedCuisine}
              selectedCategory={selectedCategory}
              selectedDietary={selectedDietary}
              selectedType={selectedType}
              onCuisineChange={setSelectedCuisine}
              onCategoryChange={setSelectedCategory}
              onDietaryChange={handleDietaryChange}
              onTypeChange={setSelectedType}
            />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls Bar */}
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
                      selectedCategory={selectedCategory}
                      selectedDietary={selectedDietary}
                      selectedType={selectedType}
                      onCuisineChange={setSelectedCuisine}
                      onCategoryChange={setSelectedCategory}
                      onDietaryChange={handleDietaryChange}
                      onTypeChange={setSelectedType}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Options */}
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
            {recipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
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
