import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { mockRecipes } from '@/data/mockRecipes';
import { Settings, Heart, BookMarked, ChefHat } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('recipes');
  
  // Mock user data - replace with actual user data from backend
  const user = {
    name: 'Chef Marco',
    email: 'chef.marco@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
    bio: 'Passionate about Italian cuisine and sharing delicious recipes with the world.',
    joinDate: 'January 2024',
    recipeCount: 12,
    favoriteCount: 24,
    dietaryTags: ['Vegetarian-Friendly', 'Italian Cuisine', 'Healthy'],
  };

  const myRecipes = mockRecipes.slice(0, 2);
  const favoriteRecipes = mockRecipes.filter((recipe) => recipe.isFavorite);

  const handleFavoriteToggle = (id: string) => {
    console.log('Toggled favorite for recipe:', id);
    // TODO: Implement favorite toggle with backend
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-6 md:p-8 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-primary/20"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-primary text-primary-foreground rounded-full p-2">
                <ChefHat className="h-5 w-5" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <p className="text-muted-foreground mb-4">{user.bio}</p>

              {/* Dietary Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {user.dietaryTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="font-semibold text-lg text-primary">{user.recipeCount}</span>
                  <span className="text-muted-foreground ml-2">Recipes</span>
                </div>
                <div>
                  <span className="font-semibold text-lg text-secondary">{user.favoriteCount}</span>
                  <span className="text-muted-foreground ml-2">Favorites</span>
                </div>
                <div>
                  <span className="font-semibold text-lg text-accent">2.5K</span>
                  <span className="text-muted-foreground ml-2">Followers</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">Member since {user.joinDate}</p>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
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

          {/* My Recipes Tab */}
          <TabsContent value="recipes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Recipes</h2>
              <Button className="bg-gradient-primary hover:opacity-90">
                Create New Recipe
              </Button>
            </div>

            {myRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No recipes yet</h3>
                <p className="text-muted-foreground mb-6">
                  Share your first recipe with the community
                </p>
                <Button className="bg-gradient-primary hover:opacity-90">
                  Create Recipe
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-2xl font-bold">Favorite Recipes</h2>

            {favoriteRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
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
                <Button variant="outline">Browse Recipes</Button>
              </Card>
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved" className="space-y-6">
            <h2 className="text-2xl font-bold">Saved Recipes</h2>

            <Card className="p-12 text-center">
              <BookMarked className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No saved recipes</h3>
              <p className="text-muted-foreground mb-6">
                Save recipes you want to try later
              </p>
              <Button variant="outline">Browse Recipes</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
