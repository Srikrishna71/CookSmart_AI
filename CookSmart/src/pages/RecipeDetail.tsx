import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { RatingStars } from '@/components/RatingStars';
import { SmartSubstitutionModal } from '@/components/SmartSubstitutionModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRecipe } from '@/hooks/useRecipes';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecipeCard } from '@/components/RecipeCard';
import { favoriteApi, recipeApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Users, Heart, ChefHat, Share2, Bookmark, Lightbulb, Leaf, Drumstick, Pencil, Trash2, Clapperboard, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { RecipeStoryboard } from '@/components/RecipeStoryboard';
import { aiApi } from '@/services/api';
import type { StoryboardSlide } from '@/types/recipe';

// Derive up-to-2-character initials — mirrors RecipeCard helper
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // useRecipe fetches GET /api/recipes/:id and handles loading/error state.
  // isFavorited on the returned recipe is annotated by the backend when a
  // valid JWT is present in the request (via the axios interceptor).
  const { recipe, isLoading, error, refetch } = useRecipe(id);
  const { recommendations, isLoading: recoLoading } = useRecommendations(id);

  // Local isFavorite state — seeded from recipe.isFavorited once the fetch
  // completes, then toggled optimistically on user action.
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Storyboard state ──────────────────────────────────────────────────────
  const [storyboardSlides,  setStoryboardSlides]  = useState<StoryboardSlide[] | null>(null);
  const [storyboardImage,   setStoryboardImage]   = useState<string>('');
  const [storyboardLoading, setStoryboardLoading] = useState(false);

  // Sync local isFavorite whenever the recipe loads or refetches
  useEffect(() => {
    if (recipe) {
      setIsFavorite(recipe.isFavorited ?? false);
    }
  }, [recipe]);

  // Image fallback — seeded recipes have image: "" so we fall back to the
  // static placeholder served from public/placeholder-recipe.jpg.
  const recipeImage = recipe?.image?.trim() || '/placeholder-recipe.jpg';

  // Author resolution priority:
  //   1. recipe.authorName  — plain string stored on seeded recipes
  //   2. recipe.author      — legacy field (kept for forward compat)
  //   3. 'CookSmart'        — final fallback
  const authorName   = recipe?.authorName?.trim() || recipe?.author?.trim() || 'CookSmart';
  const authorAvatar = recipe?.authorAvatar?.trim() || '';

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 md:p-8 shadow-hover mb-8">
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-5/6 mb-6" />
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error / not found state ────────────────────────────────────────────────
  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Recipe not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // ─── Favorite toggle ────────────────────────────────────────────────────────
  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      navigate('/login');
      return;
    }
    try {
      // Optimistic update — flip immediately so the button feels instant
      setIsFavorite((prev) => !prev);
      const res = await favoriteApi.toggle(recipe._id);
      // Confirm with the authoritative value from the backend response
      setIsFavorite(res.data.isFavorited);
      toast.success(res.data.message);
      refetch();
    } catch {
      // Revert on failure
      setIsFavorite((prev) => !prev);
      toast.error('Failed to update favorite. Please try again.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // ── Generate storyboard ───────────────────────────────────────────────────
  const handleStoryboard = async () => {
    if (!recipe) return;
    setStoryboardLoading(true);
    try {
      const res = await aiApi.generateStoryboard(recipe._id);
      setStoryboardImage(res.data.data.image);
      setStoryboardSlides(res.data.data.slides);
    } catch {
      toast.error('Failed to generate storyboard. Please try again.');
    } finally {
      setStoryboardLoading(false);
    }
  };

  // Owner check — compare createdBy (string | null) with user._id (string)
  const isOwner = !!(user && recipe && recipe.createdBy && recipe.createdBy === user._id);

  const handleDelete = async () => {
    if (!recipe) return;
    setIsDeleting(true);
    try {
      await recipeApi.delete(recipe._id);
      toast.success('Recipe deleted.');
      navigate('/profile');
    } catch {
      toast.error('Failed to delete recipe. Please try again.');
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Image — layout unchanged */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={recipeImage}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="max-w-4xl mx-auto">

          {/* Main Info Card */}
          <Card className="p-6 md:p-8 shadow-hover mb-8 animate-fade-in">
            {/* Badge row: Cuisine · Dietary classification · Difficulty (once).
                The old meal-occasion badge (Dinner/Lunch) has no backend equivalent
                so difficulty fills that slot as variant="outline". The dietary badge
                below carries all the veg/non-veg/vegan information. */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-gradient-primary text-primary-foreground border-0">
                {recipe.cuisine}
              </Badge>
              {recipe.category === 'veg' ? (
                <Badge className="bg-green-500 text-white border-0 flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  Vegetarian
                </Badge>
              ) : recipe.category === 'vegan' ? (
                <Badge className="bg-green-700 text-white border-0 flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  Vegan
                </Badge>
              ) : (
                <Badge className="bg-red-500 text-white border-0 flex items-center gap-1">
                  <Drumstick className="h-3 w-3" />
                  Non-Vegetarian
                </Badge>
              )}
              <Badge variant="outline">{recipe.difficulty}</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{recipe.title}</h1>
            
            <p className="text-lg text-muted-foreground mb-6">{recipe.description}</p>

            {/* Author & Rating */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                {/* Avatar with Radix fallback — same pattern as RecipeCard.
                    AvatarImage loads authorAvatar if present.
                    AvatarFallback shows initials when URL is empty/broken. */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">
                    {getInitials(authorName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{authorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <RatingStars rating={recipe.rating} size="lg" />
                <span className="text-lg font-semibold">{recipe.rating}</span>
                {/* ratingCount replaces old reviewCount field */}
                <span className="text-muted-foreground">({recipe.ratingCount} reviews)</span>
              </div>
            </div>

            {/* Quick Stats — layout unchanged */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Cook Time</p>
                <p className="font-semibold">{recipe.cookTime}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-secondary" />
                <p className="text-sm text-muted-foreground">Servings</p>
                <p className="font-semibold">{recipe.servings}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <ChefHat className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <p className="font-semibold">{recipe.difficulty}</p>
              </div>
            </div>

            {/* Action Buttons — layout unchanged */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleFavorite}
                variant={isFavorite ? 'default' : 'outline'}
                className="flex-1 sm:flex-none"
              >
                <Heart
                  className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`}
                />
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <Bookmark className="h-5 w-5 mr-2" />
                Save
              </Button>

              {/* Storyboard button — available to all logged-in users */}
              {user && (
                <Button
                  variant="outline"
                  onClick={handleStoryboard}
                  disabled={storyboardLoading}
                  className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                >
                  {storyboardLoading ? (
                    <>
                      <span className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent inline-block" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Clapperboard className="h-5 w-5 mr-2" />
                      Cooking Storyboard
                    </>
                  )}
                </Button>
              )}

              {/* Owner-only actions */}
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/recipe/${recipe._id}/edit`)}
                  >
                    <Pencil className="h-5 w-5 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>

            {/* Delete confirmation dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Recipe</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete <span className="font-medium text-foreground">"{recipe.title}"</span>?
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting…' : 'Delete Recipe'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>

          {/* Nutrition Info — layout unchanged */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Nutrition Facts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{recipe.nutrition.calories}</p>
                <p className="text-sm text-muted-foreground">Calories</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-secondary">{recipe.nutrition.protein}</p>
                <p className="text-sm text-muted-foreground">Protein</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-accent">{recipe.nutrition.carbs}</p>
                <p className="text-sm text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-muted-foreground">{recipe.nutrition.fat}</p>
                <p className="text-sm text-muted-foreground">Fat</p>
              </div>
            </div>
          </Card>

          {/* Ingredients — layout unchanged */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Ingredients</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubstitutions(true)}
                className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                Smart Substitutions
              </Button>
            </div>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                  <span className="text-foreground">{ingredient}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Smart Substitution Modal — unchanged */}
          <SmartSubstitutionModal
            open={showSubstitutions}
            onOpenChange={setShowSubstitutions}
            ingredients={recipe.ingredients}
          />

          {/* Instructions — layout unchanged */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </span>
                  <p className="flex-1 pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </Card>

          {/* Tags — layout unchanged */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>

          {/* ── You May Also Like ─────────────────────────────────────── */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>

            {/* Loading skeleton — 4 cards matching RecipeCard proportions */}
            {recoLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Results grid */}
            {!recoLoading && recommendations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map(({ recipe: rec, reasons }) => (
                  <div key={rec._id} className="flex flex-col gap-0">
                    {/* Recipe card — full existing component, no changes */}
                    <RecipeCard recipe={rec} />

                    {/* Why recommended — shown below each card */}
                    <div className="mt-2 px-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Why recommended
                      </p>
                      <ul className="space-y-1">
                        {reasons.map((reason) => (
                          <li
                            key={reason}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!recoLoading && recommendations.length === 0 && (
              <Card className="p-10 text-center">
                <ChefHat className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No similar recipes found yet.
                </p>
              </Card>
            )}
          </section>

        </div>
      </div>

      {/* ── Cooking Storyboard Modal ──────────────────────────────────── */}
      {storyboardSlides && storyboardSlides.length > 0 && (
        <RecipeStoryboard
          title={recipe.title}
          image={storyboardImage}
          slides={storyboardSlides}
          onClose={() => { setStoryboardSlides(null); setStoryboardImage(''); }}
        />
      )}
    </div>
  );
};

export default RecipeDetail;

