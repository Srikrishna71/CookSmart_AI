import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Leaf, Drumstick } from 'lucide-react';

interface FilterPanelProps {
  selectedCuisine: string;
  selectedDietary: string[];
  selectedType?: string;
  onCuisineChange: (value: string) => void;
  onDietaryChange: (value: string, checked: boolean) => void;
  onTypeChange?: (value: string) => void;
  /**
   * When true, the Category dropdown is rendered in a disabled/dimmed state
   * and labelled "Coming soon" to indicate it is reserved for future backend
   * support. The handler is still wired — state is preserved — but the control
   * is not interactive.
   */
}

const cuisines = ['All', 'Italian', 'Thai', 'Mexican', 'Japanese', 'Mediterranean', 'American', 'Indian', 'Chinese'];
const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Dairy-Free'];

export const FilterPanel = ({
  selectedCuisine,
  selectedDietary,
  selectedType = 'all',
  onCuisineChange,
  onDietaryChange,
  onTypeChange,
}: FilterPanelProps) => {
  return (
    <div className="space-y-6 p-6 bg-card border border-border rounded-lg shadow-card">
      <div>
        <h3 className="font-semibold text-lg mb-4">Filters</h3>
      </div>

      {/* Recipe Type Filter */}
      {onTypeChange && (
        <>
          <div className="space-y-3">
            <Label>Recipe Type</Label>
            <RadioGroup value={selectedType} onValueChange={onTypeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="type-all" />
                <Label htmlFor="type-all" className="font-normal cursor-pointer">
                  All Recipes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="veg" id="type-veg" />
                <Label htmlFor="type-veg" className="font-normal cursor-pointer flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  Vegetarian
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-veg" id="type-non-veg" />
                <Label htmlFor="type-non-veg" className="font-normal cursor-pointer flex items-center gap-2">
                  <Drumstick className="h-4 w-4 text-red-600" />
                  Non-Vegetarian
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Separator />
        </>
      )}

      {/* Cuisine Filter */}
      <div className="space-y-2">
        <Label htmlFor="cuisine">Cuisine</Label>
        <Select value={selectedCuisine} onValueChange={onCuisineChange}>
          <SelectTrigger id="cuisine">
            <SelectValue placeholder="Select cuisine" />
          </SelectTrigger>
          <SelectContent>
            {cuisines.map((cuisine) => (
              <SelectItem key={cuisine} value={cuisine}>
                {cuisine}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dietary Preferences */}
      <div className="space-y-3">
        <Label>Dietary Preferences</Label>
        <div className="space-y-2">
          {dietaryOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={selectedDietary.includes(option)}
                onCheckedChange={(checked) => onDietaryChange(option, checked as boolean)}
              />
              <label
                htmlFor={option}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
