export const substitutionsData: Record<string, { substitutes: string[]; category: string }> = {
  // Dairy
  "Yogurt": { substitutes: ["Sour Cream", "Greek Yogurt", "Buttermilk", "Coconut Yogurt"], category: "dairy" },
  "Butter": { substitutes: ["Olive Oil", "Coconut Oil", "Ghee", "Margarine", "Avocado Oil"], category: "dairy" },
  "Milk": { substitutes: ["Almond Milk", "Oat Milk", "Soy Milk", "Coconut Milk", "Cashew Milk"], category: "dairy" },
  "Cream": { substitutes: ["Coconut Cream", "Cashew Cream", "Greek Yogurt", "Evaporated Milk"], category: "dairy" },
  "Cheese": { substitutes: ["Nutritional Yeast", "Cashew Cheese", "Vegan Cheese", "Tofu"], category: "dairy" },
  "Mozzarella": { substitutes: ["Provolone", "Monterey Jack", "Vegan Mozzarella", "Fontina"], category: "dairy" },
  
  // Meat & Protein
  "Chicken": { substitutes: ["Turkey", "Tofu", "Tempeh", "Seitan", "Jackfruit"], category: "meat" },
  "Beef": { substitutes: ["Ground Turkey", "Lentils", "Mushrooms", "Impossible Meat", "Tempeh"], category: "meat" },
  "Pork": { substitutes: ["Chicken", "Turkey", "Tempeh", "Jackfruit", "Mushrooms"], category: "meat" },
  "Tofu": { substitutes: ["Paneer", "Tempeh", "Seitan", "Chickpeas", "Chicken"], category: "meat" },
  "Eggs": { substitutes: ["Flax Eggs", "Chia Seeds", "Applesauce", "Mashed Banana", "Aquafaba"], category: "meat" },
  
  // Spices & Seasonings
  "Soy Sauce": { substitutes: ["Tamari", "Coconut Aminos", "Worcestershire Sauce", "Liquid Aminos"], category: "spices" },
  "Basil": { substitutes: ["Oregano", "Thyme", "Cilantro", "Parsley", "Mint"], category: "spices" },
  "Cilantro": { substitutes: ["Parsley", "Basil", "Mint", "Celery Leaves"], category: "spices" },
  "Cumin": { substitutes: ["Caraway Seeds", "Coriander", "Chili Powder", "Curry Powder"], category: "spices" },
  "Paprika": { substitutes: ["Cayenne Pepper", "Chili Powder", "Red Pepper Flakes", "Chipotle Powder"], category: "spices" },
  
  // Vegetables
  "Tomatoes": { substitutes: ["Red Bell Peppers", "Tomato Paste", "Sun-Dried Tomatoes", "Cherry Tomatoes"], category: "vegetables" },
  "Onion": { substitutes: ["Shallots", "Leeks", "Green Onions", "Garlic", "Chives"], category: "vegetables" },
  "Garlic": { substitutes: ["Garlic Powder", "Shallots", "Onion", "Asafoetida"], category: "vegetables" },
  "Spinach": { substitutes: ["Kale", "Swiss Chard", "Arugula", "Collard Greens", "Bok Choy"], category: "vegetables" },
  
  // Grains & Carbs
  "Flour": { substitutes: ["Almond Flour", "Coconut Flour", "Rice Flour", "Oat Flour", "Chickpea Flour"], category: "grains" },
  "Rice": { substitutes: ["Quinoa", "Cauliflower Rice", "Couscous", "Bulgur", "Farro"], category: "grains" },
  "Pasta": { substitutes: ["Zucchini Noodles", "Rice Noodles", "Gluten-Free Pasta", "Spaghetti Squash"], category: "grains" },
  "Bread": { substitutes: ["Lettuce Wraps", "Rice Paper", "Tortillas", "Cloud Bread", "Naan"], category: "grains" },
  
  // Sweeteners
  "Sugar": { substitutes: ["Honey", "Maple Syrup", "Agave Nectar", "Stevia", "Coconut Sugar"], category: "sweeteners" },
  "Honey": { substitutes: ["Maple Syrup", "Agave Nectar", "Brown Rice Syrup", "Date Syrup"], category: "sweeteners" },
  
  // Oils & Fats
  "Olive Oil": { substitutes: ["Avocado Oil", "Coconut Oil", "Grapeseed Oil", "Canola Oil", "Butter"], category: "oils" },
  "Coconut Oil": { substitutes: ["Butter", "Olive Oil", "Avocado Oil", "Ghee"], category: "oils" },
};

// Placeholder for future AI-powered substitution function
export const getSmartSubstitution = async (ingredient: string): Promise<string[]> => {
  // TODO: Integrate AI API for intelligent substitution suggestions
  // This could call an AI service to get context-aware substitutions
  // based on recipe type, dietary restrictions, and regional availability
  
  console.log('AI substitution placeholder called for:', ingredient);
  return [];
};
