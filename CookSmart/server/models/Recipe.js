const mongoose = require("mongoose");

const nutritionSchema = new mongoose.Schema(
  {
    // All nutrition fields are strings so AI can include units inline,
    // e.g. "350 kcal per serving", "28g", "12g". Frontend renders as-is.
    calories: { type: String, default: "" },
    protein:  { type: String, default: "" },
    carbs:    { type: String, default: "" },
    fat:      { type: String, default: "" },
    fiber:    { type: String, default: "" },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    ingredients: {
      type: [String],
      required: [true, "At least one ingredient is required"],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "Recipe must have at least one ingredient",
      },
    },
    instructions: {
      type: [String],
      required: [true, "At least one instruction step is required"],
    },
    cuisine: {
      type: String,
      trim: true,
      default: "International",
    },
    cookTime: {
      type: String,
      default: "",
    },
    prepTime: {
      type: String,
      default: "",
    },
    servings: {
      type: Number,
      default: 2,
      min: [1, "Servings must be at least 1"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    // NOTE: field is "category", NOT "type". Frontend must use recipe.category.
    // Frontend FilterPanel also needs a "Vegan" option added for full coverage.
    category: {
      type: String,
      enum: ["veg", "non-veg", "vegan"],
      default: "non-veg",
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "",
    },
    // Plain-string author name for seeded / AI-generated recipes that have no
    // createdBy User reference. When createdBy is set, the frontend should
    // prefer the User's name; this field is the fallback for seeded content.
    authorName: {
      type: String,
      default: "",
      trim: true,
    },
    nutrition: {
      type: nutritionSchema,
      default: () => ({}),
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = public/seeded recipe
    },
    // Ingredients the user originally provided to the AI (AI recipes only)
    sourceIngredients: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // NOTE: field is "ratingCount". Frontend currently calls this "reviewCount" —
    // all frontend references to recipe.reviewCount must be updated to ratingCount.
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
recipeSchema.index({ title: "text", cuisine: "text", tags: "text" });
recipeSchema.index({ category: 1 });
recipeSchema.index({ isAIGenerated: 1, createdBy: 1 });
recipeSchema.index({ rating: -1 });
recipeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Recipe", recipeSchema);
