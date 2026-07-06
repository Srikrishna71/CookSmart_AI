import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Settings, Heart, BookMarked, ChefHat, Trash2, Pencil, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { favoriteApi, recipeApi } from '@/services/api';
import { toast } from 'sonner';
import type { Recipe } from '@/types/recipe';

// Derive up-to-2-character initials from a display name.
// "Test User" → "TU" | "Alice" → "A"
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState('recipes');
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── Favorites state ───────────────────────────────────────────────────────
  const [favorites, setFavorites]             = useState<Recipe[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError]   = useState<string | null>(null);

  // ─── My Recipes state ──────────────────────────────────────────────────────
  const [myRecipes, setMyRecipes]             = useState<Recipe[]>([]);
  const [myRecipesLoading, setMyRecipesLoading] = useState(true);
  const [myRecipesError, setMyRecipesError]   = useState<string | null>(null);

  // ─── Delete dialog state ───────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget]       = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting]           = useState(false);

  // ─── Fetch favorites ───────────────────────────────────────────────────────
  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setFavoritesLoading(true);
    setFavoritesError(null);
    try {
      const res = await favoriteApi.getAll();
      setFavorites(res.data.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load favorites.';
      setFavoritesError(message);
    } finally {
      setFavoritesLoading(false);
    }
  }, [user]);

  // ─── Fetch my recipes ──────────────────────────────────────────────────────
  const fetchMyRecipes = useCallback(async () => {
    if (!user) return;
    setMyRecipesLoading(true);
    setMyRecipesError(null);
    try {
      const res = await recipeApi.getMyRecipes();
      setMyRecipes(res.data.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load your recipes.';
      setMyRecipesError(message);
    } finally {
      setMyRecipesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
    fetchMyRecipes();
  }, [fetchFavorites, fetchMyRecipes]);

  // ─── Favorite toggle ───────────────────────────────────────────────────────
  const handleFavoriteToggle = async (id: string) => {
    try {
      const res = await favoriteApi.toggle(id);
      toast.success(res.data.message);
      await fetchFavorites();
    } catch {
      toast.error('Failed to update favorite. Please try again.');
    }
  };

  // ─── Delete recipe ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await recipeApi.delete(deleteTarget._id);
      toast.success('Recipe deleted.');
      setDeleteTarget(null);
      await fetchMyRecipes();
    } catch {
      toast.error('Failed to delete recipe. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Derived display values ────────────────────────────────────────────────
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  // ─── Skeleton helpers ──────────────────────────────────────────────────────
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header — layout unchanged */}
        <Card className="p-6 md:p-8 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar — replaced DiceBear with Radix Avatar + initials fallback.
                No external service required. AvatarImage loads user.avatar if
                set (e.g. OAuth providers); AvatarFallback renders initials from
                user.name when avatar is empty or fails to load. */}
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/20">
                <AvatarImage src={user?.avatar || ''} alt={user?.name} />
                <AvatarFallback className="text-2xl md:text-3xl bg-primary/10 text-primary font-semibold">
                  {user?.name ? getInitials(user.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-gradient-primary text-primary-foreground rounded-full p-2">
                <ChefHat className="h-5 w-5" />
              </div>
            </div>

            {/* User Info — layout unchanged */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold">{user?.name}</h1>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <p className="text-muted-foreground mb-4">{user?.email}</p>

              {/* Dietary Preference Tags */}
              {user?.dietaryPreferences && user.dietaryPreferences.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.dietaryPreferences.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats
                  - Recipes:   0 — backend has no GET /api/recipes?createdBy=me endpoint yet
                  - Favorites: real count from favoriteApi.getAll()
                  - Followers: cosmetic placeholder (no backend support) */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="font-semibold text-lg text-primary">
                    {myRecipesLoading ? '—' : myRecipes.length}
                  </span>
                  <span className="text-muted-foreground ml-2">Recipes</span>
                </div>
                <div>
                  <span className="font-semibold text-lg text-secondary">
                    {favoritesLoading ? '—' : favorites.length}
                  </span>
                  <span className="text-muted-foreground ml-2">Favorites</span>
                </div>
                <div>
                  <span className="font-semibold text-lg text-accent">—</span>
                  <span className="text-muted-foreground ml-2">Followers</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">Member since {joinDate}</p>
            </div>
          </div>
        </Card>

        {/* Content Tabs — layout unchanged */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              My Recipes
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              Saved
            </TabsTrigger>
          </TabsList>

          {/* My Recipes Tab — populated from GET /api/recipes/my */}
          <TabsContent value="recipes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Recipes</h2>
              <Button
                className="bg-gradient-primary hover:opacity-90"
                onClick={() => navigate('/create')}
              >
                Create New Recipe
              </Button>
            </div>

            {myRecipesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeleton /><CardSkeleton /><CardSkeleton />
              </div>
            ) : myRecipesError ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">Failed to load your recipes.</p>
                <Button variant="outline" onClick={fetchMyRecipes}>Try Again</Button>
              </div>
            ) : myRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRecipes.map((recipe) => (
                  <div key={recipe._id} className="relative group">
                    <RecipeCard recipe={recipe} onFavoriteToggle={handleFavoriteToggle} />
                    {/* Edit / Delete overlay — visible on hover */}
                    <div className="absolute top-14 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-background/90 backdrop-blur-sm shadow"
                        onClick={(e) => { e.preventDefault(); navigate(`/recipe/${recipe._id}/edit`); }}
                        title="Edit recipe"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-background/90 backdrop-blur-sm shadow hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => { e.preventDefault(); setDeleteTarget(recipe); }}
                        title="Delete recipe"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      {recipe.isAIGenerated && (
                        <div className="h-8 w-8 flex items-center justify-center rounded-md bg-background/90 backdrop-blur-sm shadow" title="AI Generated">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No recipes created yet</h3>
                <p className="text-muted-foreground mb-6">
                  Share your first recipe with the community
                </p>
                <Button
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => navigate('/create')}
                >
                  Create Recipe
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Delete confirmation dialog */}
          <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Recipe</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-foreground">"{deleteTarget?.title}"</span>?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                  {isDeleting ? 'Deleting…' : 'Delete Recipe'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Favorites Tab — populated from GET /api/favorites */}
          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-2xl font-bold">Favorite Recipes</h2>

            {favoritesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : favoritesError ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">Failed to load favorites.</p>
                <Button variant="outline" onClick={fetchFavorites}>Try Again</Button>
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring and save your favorite recipes
                </p>
                <Button variant="outline" onClick={() => navigate('/recipes')}>
                  Browse Recipes
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Saved Tab — layout unchanged */}
          <TabsContent value="saved" className="space-y-6">
            <h2 className="text-2xl font-bold">Saved Recipes</h2>

            <Card className="p-12 text-center">
              <BookMarked className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No saved recipes</h3>
              <p className="text-muted-foreground mb-6">
                Save recipes you want to try later
              </p>
              <Button variant="outline" onClick={() => navigate('/recipes')}>
                Browse Recipes
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

