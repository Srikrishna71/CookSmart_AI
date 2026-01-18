import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Users, Star, Leaf, Drumstick } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/data/mockRecipes';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteToggle?: (id: string) => void;
}

export const RecipeCard = ({ recipe, onFavoriteToggle }: RecipeCardProps) => {
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    onFavoriteToggle?.(recipe.id);
  };

  return (
    <Link to={`/recipe/${recipe.id}`}>
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
            src={recipe.image}
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
                recipe.difficulty === 'Easy' && "border-accent/50",
                recipe.difficulty === 'Medium' && "border-primary/50",
                recipe.difficulty === 'Hard' && "border-secondary/50"
              )}
            >
              {recipe.difficulty}
            </Badge>
            
            {/* Veg/Non-Veg Badge */}
            {recipe.type === 'veg' ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                Veg
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
              <span className="text-muted-foreground">({recipe.reviewCount})</span>
            </div>
          </div>

          {/* Author */}
          <div className="mt-3 pt-3 border-t border-border flex items-center space-x-2">
            <img
              src={recipe.authorAvatar}
              alt={recipe.author}
              className="h-6 w-6 rounded-full"
            />
            <span className="text-sm text-muted-foreground">{recipe.author}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
