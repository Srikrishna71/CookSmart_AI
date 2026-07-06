/**
 * Seed script — run with: npm run seed
 * Inserts starter recipes into MongoDB so the app has content on first launch.
 * Safe to run multiple times (clears existing seeded recipes first).
 *
 * Changes from original:
 *  - Added authorName field (chef name for each seeded recipe)
 *  - Added image URLs (Unsplash, free-to-use)
 */

const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");

const seedRecipes = [
  {
    title: "Classic Margherita Pizza",
    description: "A timeless Italian pizza with fresh tomatoes, mozzarella, and basil.",
    authorName: "Chef Marco Rossi",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
    ingredients: ["2 cups flour", "1 tsp yeast", "3/4 cup warm water", "1 cup tomato sauce", "200g mozzarella", "Fresh basil leaves", "2 tbsp olive oil", "Salt to taste"],
    instructions: ["Mix flour, yeast, salt, and water. Knead for 10 minutes.", "Let dough rise for 1 hour.", "Preheat oven to 250°C.", "Roll dough, spread tomato sauce.", "Top with mozzarella.", "Bake 12-15 minutes until crust is golden.", "Add fresh basil and drizzle olive oil before serving."],
    cuisine: "Italian", cookTime: "15 minutes", prepTime: "1 hour 15 minutes",
    servings: 4, difficulty: "Medium", category: "veg",
    tags: ["pizza", "italian", "vegetarian", "classic"],
    nutrition: { calories: "320 kcal per serving", protein: "14g", carbs: "48g", fat: "9g", fiber: "2g" },
    rating: 4.8, ratingCount: 124, isAIGenerated: false, createdBy: null,
  },
  {
    title: "Chicken Tikka Masala",
    description: "Tender chicken in a rich, spiced tomato cream sauce — a beloved classic.",
    authorName: "Chef Arjun Mehta",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    ingredients: ["500g chicken breast", "1 cup yogurt", "2 tbsp tikka masala paste", "1 can crushed tomatoes", "1/2 cup heavy cream", "1 onion chopped", "3 garlic cloves", "1 inch ginger", "2 tbsp oil", "Coriander to garnish"],
    instructions: ["Marinate chicken in yogurt and tikka paste for 30 minutes.", "Grill or pan-fry chicken until charred.", "Sauté onion, garlic, ginger until soft.", "Add crushed tomatoes and simmer 15 minutes.", "Stir in cream and add chicken.", "Simmer 10 minutes. Garnish with coriander."],
    cuisine: "Indian", cookTime: "30 minutes", prepTime: "35 minutes",
    servings: 4, difficulty: "Medium", category: "non-veg",
    tags: ["curry", "indian", "chicken", "comfort food"],
    nutrition: { calories: "410 kcal per serving", protein: "32g", carbs: "18g", fat: "22g", fiber: "3g" },
    rating: 4.9, ratingCount: 218, isAIGenerated: false, createdBy: null,
  },
  {
    title: "Avocado Toast with Poached Egg",
    description: "Creamy avocado on toasted sourdough topped with a perfectly poached egg.",
    authorName: "Chef Olivia Carter",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80",
    ingredients: ["2 slices sourdough bread", "1 ripe avocado", "2 eggs", "1 lemon (juiced)", "Red pepper flakes", "Salt and pepper", "Microgreens (optional)"],
    instructions: ["Toast sourdough bread until golden.", "Mash avocado with lemon juice, salt, and pepper.", "Bring water to a gentle simmer. Add a splash of vinegar.", "Poach eggs for 3 minutes.", "Spread avocado on toast.", "Top with poached egg, red pepper flakes, and microgreens."],
    cuisine: "American", cookTime: "10 minutes", prepTime: "5 minutes",
    servings: 2, difficulty: "Easy", category: "veg",
    tags: ["breakfast", "healthy", "quick", "eggs"],
    nutrition: { calories: "285 kcal per serving", protein: "12g", carbs: "28g", fat: "16g", fiber: "7g" },
    rating: 4.5, ratingCount: 87, isAIGenerated: false, createdBy: null,
  },
  {
    title: "Vegan Buddha Bowl",
    description: "A nourishing bowl of roasted vegetables, quinoa, and tahini dressing.",
    authorName: "Chef Emma Green",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    ingredients: ["1 cup quinoa", "1 can chickpeas", "1 sweet potato", "2 cups kale", "1 avocado", "1/4 cup tahini", "2 tbsp lemon juice", "1 garlic clove", "Olive oil", "Cumin, paprika, salt"],
    instructions: ["Cook quinoa according to package directions.", "Toss chickpeas and sweet potato with oil and spices. Roast at 200°C for 25 minutes.", "Massage kale with olive oil and salt.", "Blend tahini, lemon juice, garlic, and water for dressing.", "Assemble bowl: quinoa, vegetables, avocado, chickpeas.", "Drizzle with tahini dressing."],
    cuisine: "International", cookTime: "30 minutes", prepTime: "15 minutes",
    servings: 2, difficulty: "Easy", category: "vegan",
    tags: ["vegan", "healthy", "bowl", "meal prep"],
    nutrition: { calories: "520 kcal per serving", protein: "18g", carbs: "62g", fat: "22g", fiber: "14g" },
    rating: 4.7, ratingCount: 156, isAIGenerated: false, createdBy: null,
  },
  {
    title: "Beef Tacos",
    description: "Seasoned ground beef in corn tortillas with fresh toppings.",
    authorName: "Chef Carlos Ramirez",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
    ingredients: ["500g ground beef", "8 corn tortillas", "1 onion", "2 garlic cloves", "1 tbsp cumin", "1 tbsp chili powder", "1 tsp paprika", "Salt", "Salsa, sour cream, cheese, lettuce to serve"],
    instructions: ["Cook onion and garlic until soft.", "Add ground beef and cook until browned.", "Season with cumin, chili powder, paprika, salt.", "Warm tortillas on a dry pan.", "Assemble tacos with beef and desired toppings."],
    cuisine: "Mexican", cookTime: "20 minutes", prepTime: "10 minutes",
    servings: 4, difficulty: "Easy", category: "non-veg",
    tags: ["tacos", "mexican", "beef", "quick"],
    nutrition: { calories: "380 kcal per serving", protein: "28g", carbs: "32g", fat: "16g", fiber: "4g" },
    rating: 4.6, ratingCount: 203, isAIGenerated: false, createdBy: null,
  },
  {
    title: "Lemon Garlic Pasta",
    description: "Light and bright pasta with a zesty lemon-garlic sauce.",
    authorName: "Chef Sofia Romano",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
    ingredients: ["400g spaghetti", "4 garlic cloves", "2 lemons (zest and juice)", "1/4 cup olive oil", "1/2 cup parmesan", "Fresh parsley", "Salt and pepper", "Red pepper flakes"],
    instructions: ["Cook pasta al dente. Reserve 1 cup pasta water.", "Sauté garlic in olive oil until golden.", "Add lemon juice and zest.", "Toss pasta with sauce, adding pasta water as needed.", "Finish with parmesan, parsley, and red pepper flakes."],
    cuisine: "Italian", cookTime: "15 minutes", prepTime: "5 minutes",
    servings: 4, difficulty: "Easy", category: "veg",
    tags: ["pasta", "quick", "vegetarian", "lemon"],
    nutrition: { calories: "420 kcal per serving", protein: "14g", carbs: "68g", fat: "12g", fiber: "3g" },
    rating: 4.4, ratingCount: 92, isAIGenerated: false, createdBy: null,
  },
  {
    title: "Miso Soup with Tofu",
    description: "A warming Japanese soup with silken tofu, wakame seaweed, and miso.",
    authorName: "Chef Kenji Tanaka",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    ingredients: ["4 cups dashi stock", "3 tbsp white miso paste", "200g silken tofu", "2 tbsp dried wakame", "2 green onions", "1 tsp soy sauce"],
    instructions: ["Heat dashi stock to just below boiling.", "Rehydrate wakame in cold water for 5 minutes.", "Whisk miso paste into a small amount of warm stock, then add to pot.", "Add cubed tofu and wakame.", "Do not boil — heat gently.", "Serve topped with sliced green onions."],
    cuisine: "Japanese", cookTime: "10 minutes", prepTime: "5 minutes",
    servings: 4, difficulty: "Easy", category: "vegan",
    tags: ["soup", "japanese", "vegan", "quick", "healthy"],
    nutrition: { calories: "95 kcal per serving", protein: "8g", carbs: "8g", fat: "3g", fiber: "1g" },
    rating: 4.3, ratingCount: 67, isAIGenerated: false, createdBy: null,
  },
  {
    title: "Shakshuka",
    description: "Eggs poached in a spiced tomato and pepper sauce — perfect for brunch.",
    authorName: "Chef Layla Hassan",
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&q=80",
    ingredients: ["6 eggs", "2 cans crushed tomatoes", "1 red bell pepper", "1 onion", "4 garlic cloves", "2 tsp cumin", "2 tsp paprika", "1 tsp cayenne", "Olive oil", "Fresh parsley", "Feta to serve"],
    instructions: ["Sauté onion and pepper in olive oil until soft.", "Add garlic and spices, cook 1 minute.", "Add tomatoes and simmer 15 minutes.", "Make wells in the sauce and crack in eggs.", "Cover and cook until whites are set (5-8 minutes).", "Top with parsley and crumbled feta."],
    cuisine: "Middle Eastern", cookTime: "25 minutes", prepTime: "10 minutes",
    servings: 4, difficulty: "Easy", category: "veg",
    tags: ["brunch", "eggs", "vegetarian", "one-pan"],
    nutrition: { calories: "245 kcal per serving", protein: "14g", carbs: "22g", fat: "12g", fiber: "5g" },
    rating: 4.7, ratingCount: 134, isAIGenerated: false, createdBy: null,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Remove previously seeded recipes (createdBy === null)
    const deleted = await Recipe.deleteMany({ createdBy: null, isAIGenerated: false });
    console.log(`🗑  Cleared ${deleted.deletedCount} existing seeded recipes`);

    const inserted = await Recipe.insertMany(seedRecipes);
    console.log(`🌱 Seeded ${inserted.length} recipes successfully`);

    await mongoose.disconnect();
    console.log("✅ Done — database connection closed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
