import { useState, useRef, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  X,
  Check,
  Clock,
  Users,
  ChefHat,
  ShoppingCart,
  Youtube,
  RotateCcw,
  Eye,
  Leaf,
  Drumstick,
  Flame,
  Zap,
  UtensilsCrossed,
  ListOrdered,
} from "lucide-react";
import { toast } from "sonner";
import { aiApi, favoriteApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import type { AIGenerateResult, AIGenerateMode } from "@/types/recipe";

// ─── Constants ────────────────────────────────────────────────────────────────

const CUISINES = [
  "Any",
  "Indian",
  "Italian",
  "Chinese",
  "Mexican",
  "American",
  "Japanese",
  "International",
];
const DIETS = ["Any", "Veg", "Non-Veg", "Vegan"];
const DIFFICULTIES = ["Any", "Easy", "Medium", "Hard"];
const COOK_TIMES: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "15 mins", value: 15 },
  { label: "30 mins", value: 30 },
  { label: "45 mins", value: 45 },
  { label: "60 mins", value: 60 },
];

const DIET_API_MAP: Record<string, "veg" | "non-veg" | "vegan" | undefined> = {
  Any: undefined,
  Veg: "veg",
  "Non-Veg": "non-veg",
  Vegan: "vegan",
};

// Placeholder recipe names shown as greyed hint text in recipe-name mode
const RECIPE_NAME_EXAMPLES = [
  "Butter Chicken",
  "Chocolate Lava Cake",
  "Paneer Tikka",
  "Beef Lasagna",
  "Pad Thai",
];

// ─── Page states ──────────────────────────────────────────────────────────────

type PageState = "input" | "loading" | "result";

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const LoadingSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <Card className="p-6 md:p-8">
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-9 w-3/4 mb-3" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-5/6 mb-6" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>
    </Card>
    <Card className="p-6">
      <Skeleton className="h-7 w-48 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-3/4" />
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AIKitchen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Page state ───────────────────────────────────────────────────────────────
  const [pageState, setPageState] = useState<PageState>("input");

  // ── Generation mode ──────────────────────────────────────────────────────────
  const [generationMode, setGenerationMode] =
    useState<AIGenerateMode>("ingredients");

  // ── Ingredients mode state ───────────────────────────────────────────────────
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [diet, setDiet] = useState("Any");
  const [difficulty, setDifficulty] = useState("Any");
  const [cookTime, setCookTime] = useState<string>("Any");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Recipe name mode state ───────────────────────────────────────────────────
  const [recipeName, setRecipeName] = useState("");

  // ── Result state ─────────────────────────────────────────────────────────────
  const [result, setResult] = useState<AIGenerateResult | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // ─── Mode switch — reset input state when switching modes ──────────────────
  const switchMode = (mode: AIGenerateMode) => {
    setGenerationMode(mode);
    // Clear mode-specific inputs so there's no stale data
    setIngredients([]);
    setInputValue("");
    setRecipeName("");
  };

  // ─── Ingredient tag helpers ────────────────────────────────────────────────

  const addIngredient = (raw: string) => {
    const trimmed = raw.trim().replace(/,+$/, "").trim();
    if (!trimmed) return;
    if (ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase()))
      return;
    setIngredients((prev) => [...prev, trimmed]);
    setInputValue("");
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient(inputValue);
    } else if (e.key === ",") {
      e.preventDefault();
      addIngredient(inputValue);
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      ingredients.length > 0
    ) {
      removeIngredient(ingredients.length - 1);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) addIngredient(inputValue);
  };

  // ─── Generate recipe ───────────────────────────────────────────────────────

  const handleGenerate = async () => {
    // Mode-specific validation
    if (generationMode === "ingredients") {
      if (ingredients.length === 0) {
        toast.error("Please add at least one ingredient.");
        inputRef.current?.focus();
        return;
      }
    } else {
      if (!recipeName.trim()) {
        toast.error("Please enter a recipe name.");
        return;
      }
    }

    setPageState("loading");

    try {
      let response;

      if (generationMode === "ingredients") {
        const cookTimeEntry = COOK_TIMES.find((ct) => ct.label === cookTime);
        response = await aiApi.generateRecipe({
          mode: "ingredients",
          ingredients,
          cuisine: cuisine !== "Any" ? cuisine : undefined,
          diet: DIET_API_MAP[diet],
          difficulty:
            difficulty !== "Any"
              ? (difficulty as "Easy" | "Medium" | "Hard")
              : undefined,
          cookTime: cookTimeEntry?.value ?? undefined,
        });
      } else {
        response = await aiApi.generateRecipe({
          mode: "recipe-name",
          recipeName: recipeName.trim(),
        });
      }

      const payload = response.data.data;
      setResult(payload);
      setIsFavorited(false);
      setPageState("result");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 401
      ) {
        toast.error("Your session has expired. Please sign in again.");
        navigate("/login");
        return;
      }
      toast.error("Failed to generate recipe. Please try again.");
      setPageState("input");
    }
  };

  // ─── Favorite toggle ───────────────────────────────────────────────────────

  const handleFavorite = async () => {
    if (!result) return;
    if (!user) {
      toast.error("Please sign in to save favorites");
      navigate("/login");
      return;
    }
    try {
      setIsFavorited((prev) => !prev);
      const res = await favoriteApi.toggle(result.recipe._id);
      setIsFavorited(res.data.isFavorited);
      toast.success(res.data.message);
    } catch {
      setIsFavorited((prev) => !prev);
      toast.error("Failed to update favorite. Please try again.");
    }
  };

  // ─── Reset to input form ───────────────────────────────────────────────────

  const handleReset = () => {
    setResult(null);
    setIsFavorited(false);
    setIngredients([]);
    setInputValue("");
    setRecipeName("");
    setCuisine("Any");
    setDiet("Any");
    setDifficulty("Any");
    setCookTime("Any");
    setPageState("input");
    // Keep the generation mode — user likely wants to generate another in the same mode
  };

  // ─── Dietary badge ─────────────────────────────────────────────────────────

  const DietaryBadge = ({ category }: { category: string }) => {
    if (category === "veg") {
      return (
        <Badge className="bg-green-500 text-white border-0 flex items-center gap-1">
          <Leaf className="h-3 w-3" />
          Vegetarian
        </Badge>
      );
    }
    if (category === "vegan") {
      return (
        <Badge className="bg-green-700 text-white border-0 flex items-center gap-1">
          <Leaf className="h-3 w-3" />
          Vegan
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500 text-white border-0 flex items-center gap-1">
        <Drumstick className="h-3 w-3" />
        Non-Vegetarian
      </Badge>
    );
  };

  // ─── Mode selector — rendered above the input area ────────────────────────

  const ModeSelector = () => (
    <div className="mb-6">
      <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        Generation Mode
      </p>
      <div className="flex rounded-lg border border-input overflow-hidden w-full">
        <button
          type="button"
          onClick={() => switchMode("ingredients")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${generationMode === "ingredients"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted/50"
            }`}
        >
          <UtensilsCrossed className="h-4 w-4" />
          From Ingredients
        </button>
        <button
          type="button"
          onClick={() => switchMode("recipe-name")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-l border-input ${generationMode === "recipe-name"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted/50"
            }`}
        >
          <ListOrdered className="h-4 w-4" />
          From Recipe Name
        </button>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">AI Kitchen Assistant</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {generationMode === "ingredients"
              ? "Tell us what ingredients you have and we'll generate a personalised recipe."
              : "Enter any dish name and we'll generate the complete recipe using AI."}
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* STATE 1 — INPUT FORM                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {pageState === "input" && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 md:p-8">
              {/* Mode selector */}
              <ModeSelector />

              {/* ── INGREDIENTS MODE INPUT ──────────────────────────────── */}
              {generationMode === "ingredients" && (
                <>
                  <div className="mb-6">
                    <Label className="text-base font-semibold mb-2 block">
                      What ingredients do you have?
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Type an ingredient and press Enter or comma to add it.
                    </p>

                    {/* Tag + input container */}
                    <div
                      className="min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex flex-wrap gap-2 cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-shadow"
                      onClick={() => inputRef.current?.focus()}
                    >
                      {ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium"
                        >
                          {ing}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeIngredient(i);
                            }}
                            className="hover:text-destructive transition-colors ml-0.5"
                            aria-label={`Remove ${ing}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        onBlur={handleInputBlur}
                        placeholder={
                          ingredients.length === 0
                            ? "e.g. rice, eggs, onion…"
                            : ""
                        }
                        className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                      />
                    </div>

                    {ingredients.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {ingredients.length} ingredient
                        {ingredients.length !== 1 ? "s" : ""} added
                      </p>
                    )}
                  </div>

                  {/* Optional preferences — only shown in ingredients mode */}
                  <div className="mb-8">
                    <p className="text-base font-semibold mb-3">
                      Optional Preferences
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="cuisine">Cuisine</Label>
                        <Select value={cuisine} onValueChange={setCuisine}>
                          <SelectTrigger id="cuisine">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CUISINES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="diet">Diet</Label>
                        <Select value={diet} onValueChange={setDiet}>
                          <SelectTrigger id="diet">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIETS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={difficulty}
                          onValueChange={setDifficulty}
                        >
                          <SelectTrigger id="difficulty">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTIES.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cooktime">Cook Time</Label>
                        <Select value={cookTime} onValueChange={setCookTime}>
                          <SelectTrigger id="cooktime">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COOK_TIMES.map((ct) => (
                              <SelectItem key={ct.label} value={ct.label}>
                                {ct.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── RECIPE NAME MODE INPUT ───────────────────────────────── */}
              {generationMode === "recipe-name" && (
                <div className="mb-8">
                  <Label
                    htmlFor="recipeName"
                    className="text-base font-semibold mb-2 block"
                  >
                    Recipe Name
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enter the name of any dish and we'll generate the full
                    recipe.
                  </p>
                  <Input
                    id="recipeName"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder={`e.g. ${RECIPE_NAME_EXAMPLES[Math.floor(Date.now() / 10000) % RECIPE_NAME_EXAMPLES.length]}`}
                    className="text-base"
                    autoFocus
                  />
                  {/* Example chips */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <p className="text-xs text-muted-foreground w-full mb-0.5">
                      Try:
                    </p>
                    {RECIPE_NAME_EXAMPLES.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setRecipeName(name)}
                        className="text-xs px-2.5 py-1 rounded-full border border-border hover:bg-muted/50 hover:border-primary/50 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-base py-5"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Recipe
              </Button>
            </Card>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* STATE 2 — LOADING                                               */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {pageState === "loading" && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8 py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-muted-foreground font-medium">
                {generationMode === "recipe-name"
                  ? `Generating recipe for "${recipeName}"…`
                  : "Generating your recipe…"}
              </p>
            </div>
            <LoadingSkeleton />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* STATE 3 — RESULT                                                */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {pageState === "result" && result && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* ── Recipe Header Card ─────────────────────────────────────── */}
            <Card className="p-6 md:p-8 animate-fade-in">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-gradient-primary text-primary-foreground border-0">
                  {result.recipe.cuisine}
                </Badge>
                <DietaryBadge category={result.recipe.category} />
                <Badge variant="outline">{result.recipe.difficulty}</Badge>
                {result.recipe.isAIGenerated && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    AI Generated
                  </Badge>
                )}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {result.recipe.title}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {result.recipe.description}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Cook Time</p>
                  <p className="font-semibold text-sm">
                    {result.recipe.cookTime}
                  </p>
                </div>
                {result.recipe.prepTime ? (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-secondary" />
                    <p className="text-sm text-muted-foreground">Prep Time</p>
                    <p className="font-semibold text-sm">
                      {result.recipe.prepTime}
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-secondary" />
                    <p className="text-sm text-muted-foreground">Servings</p>
                    <p className="font-semibold text-sm">
                      {result.recipe.servings}
                    </p>
                  </div>
                )}
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <ChefHat className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <p className="font-semibold text-sm">
                    {result.recipe.difficulty}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate(`/recipe/${result.recipe._id}`)}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  View Recipe
                </Button>
                <Button
                  variant={isFavorited ? "default" : "outline"}
                  onClick={handleFavorite}
                >
                  {isFavorited ? (
                    <Check className="h-5 w-5 mr-2" />
                  ) : (
                    <Leaf className="h-5 w-5 mr-2" />
                  )}
                  {isFavorited ? "Favorited" : "Add to Favorites"}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Generate Another
                </Button>
              </div>
            </Card>

            {/* ── Nutrition Panel ────────────────────────────────────────── */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Nutrition Facts</h3>
                <span className="text-xs text-muted-foreground">
                  (per serving)
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg col-span-2 md:col-span-1">
                  <p className="text-2xl font-bold text-primary">
                    {result.recipe.nutrition.calories}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Calories</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-secondary">
                    {result.recipe.nutrition.protein}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Protein</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-accent">
                    {result.recipe.nutrition.carbs}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Carbs</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-muted-foreground">
                    {result.recipe.nutrition.fat}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Fat</p>
                </div>
                {result.recipe.nutrition.fiber && (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {result.recipe.nutrition.fiber}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Fiber</p>
                  </div>
                )}
              </div>
            </Card>

            {/* ── Ingredient diff — You Have / Missing ──────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.youHaveIngredients.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    You Already Have
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0 text-xs">
                      {result.youHaveIngredients.length}
                    </Badge>
                  </h3>
                  <ul className="space-y-2">
                    {result.youHaveIngredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 mt-0.5 flex items-center justify-center h-4 w-4 rounded-full bg-green-500 text-white">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        <span className="text-foreground">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {result.missingIngredients.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <X className="h-5 w-5 text-destructive" />
                    {result.youHaveIngredients.length === 0
                      ? "Ingredients Needed"
                      : "Still Needed"}
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-0 text-xs">
                      {result.missingIngredients.length}
                    </Badge>
                  </h3>
                  <ul className="space-y-2">
                    {result.missingIngredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="flex-shrink-0 mt-0.5 flex items-center justify-center h-4 w-4 rounded-full bg-destructive text-destructive-foreground">
                          <X className="h-2.5 w-2.5" />
                        </span>
                        <span className="text-foreground">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* ── Shopping List ─────────────────────────────────────────── */}
            {result.missingIngredients.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Shopping List</h3>
                  <Badge variant="secondary" className="text-xs">
                    {result.missingIngredients.length} item
                    {result.missingIngredients.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.missingIngredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex-shrink-0 h-4 w-4 rounded border-2 border-muted-foreground/40" />
                      <span className="text-sm text-foreground">{ing}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ── Full Ingredients List ─────────────────────────────────── */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Full Ingredients</h3>
              <ul className="space-y-3">
                {result.recipe.ingredients.map((ing, i) => {
                  const isOwned = result.youHaveIngredients.includes(ing);
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 mt-1 inline-block w-2 h-2 rounded-full ${isOwned ? "bg-green-500" : "bg-destructive"
                          }`}
                      />
                      <span
                        className={`text-sm ${isOwned ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {ing}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* ── Instructions ─────────────────────────────────────────── */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Instructions</h3>
              <ol className="space-y-4">
                {result.recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground font-bold text-sm">
                      {i + 1}
                    </span>
                    <p className="flex-1 pt-1 text-sm leading-relaxed">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </Card>

            {/* ── YouTube Recommendation ───────────────────────────────── */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Youtube className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-bold">Watch It Being Made</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Find video tutorials for{" "}
                <span className="font-medium text-foreground">
                  {result.recipe.title}
                </span>{" "}
                on YouTube.
              </p>
              <a
                href={result.youTubeSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                <Youtube className="h-4 w-4" />
                Watch Recipe on YouTube
              </a>
            </Card>

            {/* ── Bottom action bar ─────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 pb-8">
              <Button
                onClick={() => navigate(`/recipe/${result.recipe._id}`)}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Eye className="h-5 w-5 mr-2" />
                View Full Recipe
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Generate Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIKitchen;
