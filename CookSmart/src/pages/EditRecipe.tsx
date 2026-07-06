import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { recipeApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipe } from '@/hooks/useRecipes';

const CUISINES = ['International', 'Indian', 'Italian', 'Chinese', 'Mexican', 'American', 'Japanese', 'Thai', 'Mediterranean'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const CATEGORIES = [
  { value: 'veg',     label: 'Vegetarian'     },
  { value: 'non-veg', label: 'Non-Vegetarian' },
  { value: 'vegan',   label: 'Vegan'          },
] as const;

const EditRecipe = () => {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { recipe, isLoading, error } = useRecipe(id);

  // ── Form fields — all initialised empty, populated once recipe loads ─────────
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [cuisine,      setCuisine]      = useState('International');
  const [category,     setCategory]     = useState<'veg' | 'non-veg' | 'vegan'>('non-veg');
  const [difficulty,   setDifficulty]   = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [cookTime,     setCookTime]     = useState('');
  const [prepTime,     setPrepTime]     = useState('');
  const [servings,     setServings]     = useState('2');
  const [image,        setImage]        = useState('');
  const [tagInput,     setTagInput]     = useState('');
  const [tags,         setTags]         = useState<string[]>([]);
  const [ingredients,  setIngredients]  = useState<string[]>(['', '']);
  const [instructions, setInstructions] = useState<string[]>(['', '']);
  const [calories,     setCalories]     = useState('');
  const [protein,      setProtein]      = useState('');
  const [carbs,        setCarbs]        = useState('');
  const [fat,          setFat]          = useState('');
  const [fiber,        setFiber]        = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefilled,    setPrefilled]    = useState(false);

  // ── Pre-fill once recipe loads ───────────────────────────────────────────────
  useEffect(() => {
    if (!recipe || prefilled) return;
    setTitle(recipe.title || '');
    setDescription(recipe.description || '');
    setCuisine(recipe.cuisine || 'International');
    setCategory(recipe.category || 'non-veg');
    setDifficulty(recipe.difficulty || 'Medium');
    setCookTime(recipe.cookTime || '');
    setPrepTime(recipe.prepTime || '');
    setServings(String(recipe.servings ?? 2));
    setImage(recipe.image || '');
    setTags(recipe.tags || []);
    setIngredients(recipe.ingredients?.length >= 2 ? recipe.ingredients : [...(recipe.ingredients || []), '']);
    setInstructions(recipe.instructions?.length >= 2 ? recipe.instructions : [...(recipe.instructions || []), '']);
    setCalories(recipe.nutrition?.calories || '');
    setProtein(recipe.nutrition?.protein || '');
    setCarbs(recipe.nutrition?.carbs || '');
    setFat(recipe.nutrition?.fat || '');
    setFiber(recipe.nutrition?.fiber || '');
    setPrefilled(true);
  }, [recipe, prefilled]);

  // ── Tag helpers ───────────────────────────────────────────────────────────────
  const addTag = (raw: string) => {
    const t = raw.trim().replace(/,+$/, '').trim();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagInput('');
  };
  const removeTag = (i: number) => setTags((prev) => prev.filter((_, idx) => idx !== i));

  // ── Ingredient helpers ────────────────────────────────────────────────────────
  const setIngredient = (i: number, val: string) => {
    setIngredients((prev) => { const next = [...prev]; next[i] = val; return next; });
  };
  const addIngredient    = () => setIngredients((prev) => [...prev, '']);
  const removeIngredient = (i: number) => {
    if (ingredients.length <= 2) return;
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Instruction helpers ───────────────────────────────────────────────────────
  const setInstruction = (i: number, val: string) => {
    setInstructions((prev) => { const next = [...prev]; next[i] = val; return next; });
  };
  const addInstruction    = () => setInstructions((prev) => [...prev, '']);
  const removeInstruction = (i: number) => {
    if (instructions.length <= 2) return;
    setInstructions((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanIngredients  = ingredients.map((s) => s.trim()).filter(Boolean);
    const cleanInstructions = instructions.map((s) => s.trim()).filter(Boolean);

    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }
    if (cleanIngredients.length < 2) {
      toast.error('Please add at least 2 ingredients.');
      return;
    }
    if (cleanInstructions.length < 2) {
      toast.error('Please add at least 2 instruction steps.');
      return;
    }

    setIsSubmitting(true);
    try {
      await recipeApi.update(id!, {
        title:        title.trim(),
        description:  description.trim(),
        ingredients:  cleanIngredients,
        instructions: cleanInstructions,
        cuisine,
        cookTime:     cookTime.trim(),
        prepTime:     prepTime.trim(),
        servings:     Number(servings) || 2,
        difficulty,
        category,
        tags,
        image:        image.trim(),
        nutrition: {
          calories: calories.trim(),
          protein:  protein.trim(),
          carbs:    carbs.trim(),
          fat:      fat.trim(),
          fiber:    fiber.trim(),
        },
      });

      toast.success('Recipe updated successfully!');
      navigate(`/recipe/${id}`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      if (status === 403) {
        toast.error('You are not allowed to edit this recipe.');
        navigate(`/recipe/${id}`);
        return;
      }
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update recipe. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────────────────────────
  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Recipe not found.</p>
          <Button onClick={() => navigate('/profile')}>Go to Profile</Button>
        </div>
      </div>
    );
  }

  // ── Ownership check ───────────────────────────────────────────────────────────
  // createdBy is the MongoDB ObjectId string; user._id is also a string.
  const isOwner = user && recipe.createdBy && recipe.createdBy === user._id;

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            You are not allowed to edit this recipe.
          </p>
          <Button onClick={() => navigate(`/recipe/${id}`)}>View Recipe</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Edit Recipe</h1>
            <p className="text-muted-foreground">Update your recipe details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Basic Information ─────────────────────────────────────── */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Recipe Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cuisine">Cuisine</Label>
                    <Select value={cuisine} onValueChange={setCuisine}>
                      <SelectTrigger id="cuisine" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CUISINES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                      <SelectTrigger id="category" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                      <SelectTrigger id="difficulty" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cookTime">Cook Time</Label>
                    <Input id="cookTime" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="mt-1" placeholder="e.g. 30 minutes" />
                  </div>
                  <div>
                    <Label htmlFor="prepTime">Prep Time</Label>
                    <Input id="prepTime" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="mt-1" placeholder="e.g. 15 minutes" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="servings">Servings</Label>
                    <Input id="servings" type="number" min="1" max="100" value={servings} onChange={(e) => setServings(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="image">Image URL (optional)</Label>
                    <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} className="mt-1" placeholder="https://…" />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div
                    className="mt-1 min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex flex-wrap gap-2 cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                    onClick={() => document.getElementById('tagInputEdit')?.focus()}
                  >
                    {tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-secondary/20 text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {tag}
                        <button type="button" onClick={() => removeTag(i)} className="hover:text-destructive ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      id="tagInputEdit"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); }
                        if (e.key === ',')      { e.preventDefault(); addTag(tagInput); }
                      }}
                      onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                      placeholder={tags.length === 0 ? 'e.g. quick, healthy…' : ''}
                      className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Press Enter or comma to add a tag</p>
                </div>
              </div>
            </Card>

            {/* ── Ingredients ───────────────────────────────────────────── */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Ingredients <span className="text-destructive">*</span></h2>
                  <p className="text-sm text-muted-foreground mt-1">Minimum 2 required</p>
                </div>
                <Button type="button" onClick={addIngredient} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />Add Ingredient
                </Button>
              </div>
              <div className="space-y-3">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Ingredient ${i + 1}`}
                      value={ing}
                      onChange={(e) => setIngredient(i, e.target.value)}
                    />
                    {ingredients.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Instructions ──────────────────────────────────────────── */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Instructions <span className="text-destructive">*</span></h2>
                  <p className="text-sm text-muted-foreground mt-1">Minimum 2 steps required</p>
                </div>
                <Button type="button" onClick={addInstruction} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />Add Step
                </Button>
              </div>
              <div className="space-y-4">
                {instructions.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground font-bold text-sm">
                      {i + 1}
                    </span>
                    <Textarea
                      placeholder={`Step ${i + 1}`}
                      rows={2}
                      value={step}
                      onChange={(e) => setInstruction(i, e.target.value)}
                      className="flex-1"
                    />
                    {instructions.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeInstruction(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Nutrition ─────────────────────────────────────────────── */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-2">Nutrition Facts</h2>
              <p className="text-sm text-muted-foreground mb-6">Optional — include units, e.g. "320 kcal" or "18g"</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { id: 'cal2', label: 'Calories', val: calories, set: setCalories, ph: '320 kcal' },
                  { id: 'pro2', label: 'Protein',  val: protein,  set: setProtein,  ph: '18g'     },
                  { id: 'car2', label: 'Carbs',    val: carbs,    set: setCarbs,    ph: '42g'     },
                  { id: 'fat2', label: 'Fat',      val: fat,      set: setFat,      ph: '9g'      },
                  { id: 'fib2', label: 'Fiber',    val: fiber,    set: setFiber,    ph: '4g'      },
                ].map(({ id, label, val, set, ph }) => (
                  <div key={id}>
                    <Label htmlFor={id}>{label}</Label>
                    <Input id={id} placeholder={ph} value={val} onChange={(e) => set(e.target.value)} className="mt-1" />
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Submit buttons ────────────────────────────────────────── */}
            <div className="flex gap-4 justify-end pb-8">
              <Button type="button" variant="outline" onClick={() => navigate(`/recipe/${id}`)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRecipe;

