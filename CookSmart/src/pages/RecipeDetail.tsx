import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { RatingStars } from '@/components/RatingStars';
import { SmartSubstitutionModal } from '@/components/SmartSubstitutionModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockRecipes, Recipe } from '@/data/mockRecipes';
import { Clock, Users, Heart, ChefHat, Share2, Bookmark, Lightbulb, Leaf, Drumstick } from 'lucide-react';
import { toast } from 'sonner';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSubstitutions, setShowSubstitutions] = useState(false);

  useEffect(() => {
    const found = mockRecipes.find((r) => r.id === id);
    if (found) {
      setRecipe(found);
      setIsFavorite(found.isFavorite);
    }
  }, [id]);

  if (!recipe) {
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

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Info Card */}
          <Card className="p-6 md:p-8 shadow-hover mb-8 animate-fade-in">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-gradient-primary text-primary-foreground border-0">
                {recipe.cuisine}
              </Badge>
              <Badge variant="secondary">{recipe.category}</Badge>
              <Badge variant="outline">{recipe.difficulty}</Badge>
              {recipe.type === 'veg' ? (
                <Badge className="bg-green-500 text-white border-0 flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  Vegetarian
                </Badge>
              ) : (
                <Badge className="bg-red-500 text-white border-0 flex items-center gap-1">
                  <Drumstick className="h-3 w-3" />
                  Non-Vegetarian
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{recipe.title}</h1>
            
            <p className="text-lg text-muted-foreground mb-6">{recipe.description}</p>

            {/* Author & Rating */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src={recipe.authorAvatar}
                  alt={recipe.author}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{recipe.author}</p>
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
                <span className="text-muted-foreground">({recipe.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Quick Stats */}
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

            {/* Action Buttons */}
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
            </div>
          </Card>

          {/* Nutrition Info */}
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

          {/* Ingredients */}
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

          {/* Smart Substitution Modal */}
          <SmartSubstitutionModal
            open={showSubstitutions}
            onOpenChange={setShowSubstitutions}
            ingredients={recipe.ingredients}
          />

          {/* Instructions */}
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

          {/* Tags */}
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
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
