import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Users, Star, Leaf, Drumstick } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Recipe } from '@/types/recipe';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteToggle?: (id: string) => void;
}

// Derive up-to-2-character initials from a display name.
// "Chef Marco" → "CM" | "CookSmart" → "CS" | "A" → "A"
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const RecipeCard = ({ recipe, onFavoriteToggle }: RecipeCardProps) => {
  // isFavorited is optional on the new type (absent for anonymous users).
  // Default to false so the heart renders correctly when no token is present.
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorited ?? false);
  const [isHovered, setIsHovered] = useState(false);

  // Image fallback — seeded recipes have image: "" so we fall back to the
  // static placeholder served from public/placeholder-recipe.jpg.
  const recipeImage = recipe.image?.trim() || '/placeholder-recipe.jpg';

  // Author resolution priority:
  //   1. recipe.authorName  — plain string stored on seeded recipes
  //   2. recipe.author      — legacy field (kept for forward compat)
  //   3. 'CookSmart'        — final fallback
  const authorName   = recipe.authorName?.trim() || recipe.author?.trim() || 'CookSmart';
  const authorAvatar = recipe.authorAvatar?.trim() || '';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    // Pass _id — MongoDB ObjectId string, replaces the old numeric string id
    onFavoriteToggle?.(recipe._id);
  };

  return (
    // Route uses _id — matches GET /api/recipes/:id on the backend
    <Link to={`/recipe/${recipe._id}`}>
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-300 hover:shadow-hover border-border",
          "animate-fade-in-up"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={recipeImage}
            alt={recipe.title}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500",
              isHovered && "scale-110"
            )}
          />
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={handleFavoriteClick}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all",
                isFavorite ? "fill-primary text-primary" : "text-foreground"
              )}
            />
          </Button>

          {/* Difficulty Badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "bg-background/80 backdrop-blur-sm border-border",
                recipe.difficulty === 'Easy'   && "border-accent/50",
                recipe.difficulty === 'Medium' && "border-primary/50",
                recipe.difficulty === 'Hard'   && "border-secondary/50"
              )}
            >
              {recipe.difficulty}
            </Badge>

            {/* Dietary Badge — veg / vegan / non-veg */}
            {recipe.category === 'veg' ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                Veg
              </Badge>
            ) : recipe.category === 'vegan' ? (
              <Badge className="bg-green-700 hover:bg-green-800 text-white border-0 shadow-lg flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                Vegan
              </Badge>
            ) : (
              <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg flex items-center gap-1">
                <Drumstick className="h-3 w-3" />
                Non-Veg
              </Badge>
            )}
          </div>

          {/* Cuisine Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-gradient-primary text-primary-foreground border-0">
              {recipe.cuisine}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {recipe.description}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{recipe.cookTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-medium text-foreground">{recipe.rating}</span>
              {/* ratingCount replaces reviewCount — same field, renamed in MongoDB schema */}
              <span className="text-muted-foreground">({recipe.ratingCount})</span>
            </div>
          </div>

          {/* Author */}
          <div className="mt-3 pt-3 border-t border-border flex items-center space-x-2">
            {/* Avatar with Radix fallback — no external service needed.
                AvatarImage loads the URL if present; AvatarFallback renders
                initials on broken/missing URLs automatically. */}
            <Avatar className="h-6 w-6">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{authorName}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
