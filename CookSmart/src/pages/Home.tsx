import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Clock, Leaf, Drumstick } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecipes } from '@/hooks/useRecipes';
import { favoriteApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-image.jpg';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'veg' | 'non-veg' | 'vegan'>('all');

  // Fetch 6 recipes from MongoDB — first 3 shown as Trending, next 3 as Recently Added.
  // Backend sorts by createdAt desc. No params needed beyond limit.
  const { recipes, isLoading, error, refetch } = useRecipes({ limit: 6 });

  // Client-side dietary filter applied to the fetched page.
  // 'category' is the MongoDB field — replaces old 'type' field.
  const filterByCategory = (list: typeof recipes) => {
    if (typeFilter === 'all') return list;
    return list.filter((r) => r.category === typeFilter);
  };

  const trendingRecipes = filterByCategory(recipes.slice(0, 3));
  const recentRecipes   = filterByCategory(recipes.slice(3, 6));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${searchQuery}`);
    }
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
      // Refetch so isFavorited state on all cards stays in sync
      refetch();
    } catch {
      toast.error('Failed to update favorite. Please try again.');
    }
  };

  // ─── Skeleton grid — 3 cards matching RecipeCard dimensions ──────────────
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

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={(query) => navigate(`/recipes?search=${query}`)} />

      {/* Hero Section — unchanged */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Delicious food"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <TrendingUp className="h-4 w-4 mr-2" />
                Discover Amazing Recipes
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Your Kitchen,{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Your Masterpiece
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore thousands of delicious recipes from around the world. Create, share, and discover your next favorite meal.
            </p>

            {/* Hero Search */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base bg-background/80 backdrop-blur-sm border-border"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 transition-opacity px-8"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">50+</div>
                <div className="text-sm text-muted-foreground">Chefs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-muted-foreground">AI Generations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Recipes */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              <TrendingUp className="inline h-8 w-8 mr-2 text-primary" />
              Trending Now
            </h2>
            <p className="text-muted-foreground">Most popular recipes this week</p>
          </div>
          
          {/* Dietary Filter Buttons — layout unchanged */}
          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              All
            </Button>
            <Button
              variant={typeFilter === 'veg' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('veg')}
              className={typeFilter === 'veg' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <Leaf className="h-4 w-4 mr-1" />
              Veg
            </Button>
            <Button
              variant={typeFilter === 'non-veg' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('non-veg')}
              className={typeFilter === 'non-veg' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <Drumstick className="h-4 w-4 mr-1" />
              Non-Veg
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <SkeletonGrid />
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">Failed to load recipes.</p>
            <Button variant="outline" onClick={refetch}>Try Again</Button>
          </div>
        ) : trendingRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No {typeFilter === 'veg' ? 'vegetarian' : 'non-vegetarian'} recipes found in trending.
            </p>
          </div>
        )}
      </section>

      {/* Recently Added */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                <Clock className="inline h-8 w-8 mr-2 text-secondary" />
                Recently Added
              </h2>
              <p className="text-muted-foreground">Fresh recipes from our community</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/recipes')}
              className="hover:text-primary"
            >
              View All
            </Button>
          </div>

          {isLoading ? (
            <SkeletonGrid />
          ) : error ? null : recentRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recently added recipes.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section — unchanged */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Start Cooking?
            </h2>
            <p className="text-lg text-primary-foreground/90">
              Join our community of food lovers and share your culinary creations with the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/login')}
                className="bg-background hover:bg-background/90 text-foreground"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/recipes')}
                className="border-white/60 text-primary-foreground hover:bg-white/20 hover:border-white hover:text-white"
              >
                Explore Recipes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — unchanged */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-xl mb-2 bg-gradient-primary bg-clip-text text-transparent">
                CookSmart
              </h3>
              <p className="text-sm text-muted-foreground">
                Your kitchen, your masterpiece
              </p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2026 CookSmart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

