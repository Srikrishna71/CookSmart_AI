import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { substitutionsData } from '@/data/substitutions';
import { Copy, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface SmartSubstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredients: string[];
}

export const SmartSubstitutionModal = ({ open, onOpenChange, ingredients }: SmartSubstitutionModalProps) => {
  const getSubstitution = (ingredient: string) => {
    const normalized = ingredient.toLowerCase();
    for (const [key, value] of Object.entries(substitutionsData)) {
      if (normalized.includes(key.toLowerCase())) {
        return { original: key, substitutes: value.substitutes, category: value.category };
      }
    }
    return null;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const categoryIcons: Record<string, string> = {
    dairy: '🥛',
    meat: '🍗',
    spices: '🌶️',
    vegetables: '🥬',
    grains: '🌾',
    sweeteners: '🍯',
    oils: '🫒',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            Smart Ingredient Substitutions
          </DialogTitle>
          <DialogDescription>
            AI-powered suggestions for alternative ingredients you can use in this recipe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {ingredients.map((ingredient, index) => {
            const substitution = getSubstitution(ingredient);
            
            if (!substitution) return null;

            return (
              <div key={index} className="border border-border rounded-lg p-4 hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{categoryIcons[substitution.category] || '🍴'}</span>
                      <Badge variant="outline" className="text-xs">
                        {substitution.category}
                      </Badge>
                    </div>
                    <p className="font-semibold text-foreground">{ingredient}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(ingredient)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 pl-7">
                  <p className="text-sm text-muted-foreground mb-2">Can be replaced with:</p>
                  <div className="flex flex-wrap gap-2">
                    {substitution.substitutes.map((sub, subIndex) => (
                      <Button
                        key={subIndex}
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopy(sub)}
                        className="h-auto py-1.5 px-3 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {sub}
                        <Copy className="h-3 w-3 ml-2" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Click on any substitution to copy it. These suggestions are based on culinary compatibility and dietary patterns. Always adjust quantities based on your taste preferences.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
