import overnightOatsImg from '@/assets/overnight-oats.jpg';
import chickenNoodleSoupImg from '@/assets/chicken-noodle-soup.jpg';
import prawnStirFryImg from '@/assets/prawn-stir-fry.jpg';
import mushroomRisottoImg from '@/assets/mushroom-risotto.jpg';
import eggCurryImg from '@/assets/egg-curry.jpg';
import fishCurryImg from '@/assets/fish-curry.jpg';
import dalTadkaImg from '@/assets/dal-tadka.jpg';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  authorAvatar: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  category: string;
  rating: number;
  reviewCount: number;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  type: 'veg' | 'non-veg';
}

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Classic Margherita Pizza',
    description: 'A traditional Italian pizza with fresh mozzarella, basil, and tomato sauce on a perfectly crispy crust.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    author: 'Chef Marco',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
    cookTime: '25 mins',
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Italian',
    category: 'Dinner',
    rating: 4.8,
    reviewCount: 234,
    ingredients: [
      '2 cups all-purpose flour',
      '1 cup warm water',
      '2 tsp active dry yeast',
      '1 tsp sugar',
      '2 tbsp olive oil',
      '1 tsp salt',
      '1 cup tomato sauce',
      '8 oz fresh mozzarella',
      'Fresh basil leaves'
    ],
    instructions: [
      'Mix warm water, yeast, and sugar. Let it sit for 5 minutes.',
      'Add flour, olive oil, and salt. Knead until smooth.',
      'Let the dough rise for 1 hour.',
      'Roll out the dough and add tomato sauce.',
      'Top with mozzarella and bake at 475°F for 12-15 minutes.',
      'Garnish with fresh basil and serve hot.'
    ],
    nutrition: {
      calories: 285,
      protein: '12g',
      carbs: '38g',
      fat: '9g'
    },
    tags: ['Italian', 'Pizza', 'Vegetarian'],
    isFavorite: false,
    createdAt: '2024-01-15',
    type: 'veg'
  },
  {
    id: '2',
    title: 'Thai Green Curry',
    description: 'Aromatic and spicy Thai green curry with vegetables and coconut milk.',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
    author: 'Chef Anya',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya',
    cookTime: '35 mins',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Thai',
    category: 'Dinner',
    rating: 4.9,
    reviewCount: 189,
    ingredients: [
      '2 tbsp green curry paste',
      '400ml coconut milk',
      '200g chicken or tofu',
      '1 cup mixed vegetables',
      '2 tbsp fish sauce',
      '1 tbsp palm sugar',
      'Thai basil leaves',
      'Lime juice'
    ],
    instructions: [
      'Heat oil and fry curry paste until fragrant.',
      'Add coconut milk and bring to simmer.',
      'Add protein and vegetables, cook for 15 minutes.',
      'Season with fish sauce and palm sugar.',
      'Garnish with basil and serve with rice.'
    ],
    nutrition: {
      calories: 320,
      protein: '18g',
      carbs: '22g',
      fat: '18g'
    },
    tags: ['Thai', 'Curry', 'Spicy'],
    isFavorite: true,
    createdAt: '2024-01-20',
    type: 'non-veg'
  },
  {
    id: '3',
    title: 'Avocado Toast Supreme',
    description: 'Elevated avocado toast with poached egg, cherry tomatoes, and microgreens.',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80',
    author: 'Chef Emma',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    cookTime: '15 mins',
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'American',
    category: 'Breakfast',
    rating: 4.6,
    reviewCount: 156,
    ingredients: [
      '2 slices sourdough bread',
      '1 ripe avocado',
      '2 eggs',
      'Cherry tomatoes',
      'Microgreens',
      'Olive oil',
      'Salt and pepper',
      'Red pepper flakes'
    ],
    instructions: [
      'Toast the sourdough bread until golden.',
      'Mash avocado with salt, pepper, and lemon juice.',
      'Poach eggs in simmering water for 3-4 minutes.',
      'Spread avocado on toast.',
      'Top with poached egg, tomatoes, and microgreens.',
      'Drizzle with olive oil and sprinkle red pepper flakes.'
    ],
    nutrition: {
      calories: 280,
      protein: '12g',
      carbs: '24g',
      fat: '16g'
    },
    tags: ['Breakfast', 'Healthy', 'Vegetarian'],
    isFavorite: false,
    createdAt: '2024-02-01',
    type: 'veg'
  },
  {
    id: '4',
    title: 'Beef Tacos al Pastor',
    description: 'Mexican-style tacos with marinated beef, pineapple, and fresh cilantro.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    author: 'Chef Carlos',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    cookTime: '40 mins',
    servings: 6,
    difficulty: 'Medium',
    cuisine: 'Mexican',
    category: 'Dinner',
    rating: 4.9,
    reviewCount: 312,
    ingredients: [
      '500g beef',
      '3 dried chiles',
      'Pineapple chunks',
      'Corn tortillas',
      'Onion',
      'Cilantro',
      'Lime',
      'Mexican spices'
    ],
    instructions: [
      'Marinate beef with chiles and spices for 2 hours.',
      'Grill beef until charred and cooked through.',
      'Warm tortillas on griddle.',
      'Slice beef thinly.',
      'Assemble tacos with beef, pineapple, onion, and cilantro.',
      'Serve with lime wedges.'
    ],
    nutrition: {
      calories: 340,
      protein: '28g',
      carbs: '32g',
      fat: '12g'
    },
    tags: ['Mexican', 'Tacos', 'Spicy'],
    isFavorite: true,
    createdAt: '2024-02-05',
    type: 'non-veg'
  },
  {
    id: '5',
    title: 'Mediterranean Buddha Bowl',
    description: 'Healthy grain bowl with hummus, falafel, and roasted vegetables.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    author: 'Chef Sophia',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    cookTime: '30 mins',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Mediterranean',
    category: 'Lunch',
    rating: 4.7,
    reviewCount: 203,
    ingredients: [
      'Quinoa',
      'Chickpeas',
      'Hummus',
      'Cherry tomatoes',
      'Cucumber',
      'Red onion',
      'Feta cheese',
      'Olive oil',
      'Lemon',
      'Fresh herbs'
    ],
    instructions: [
      'Cook quinoa according to package directions.',
      'Roast chickpeas with spices at 400°F for 25 minutes.',
      'Chop all vegetables.',
      'Assemble bowl with quinoa base.',
      'Top with chickpeas, vegetables, hummus, and feta.',
      'Drizzle with olive oil and lemon juice.'
    ],
    nutrition: {
      calories: 385,
      protein: '14g',
      carbs: '48g',
      fat: '16g'
    },
    tags: ['Healthy', 'Vegetarian', 'Mediterranean'],
    isFavorite: false,
    createdAt: '2024-02-10',
    type: 'veg'
  },
  {
    id: '6',
    title: 'Japanese Ramen Bowl',
    description: 'Rich and flavorful ramen with pork belly, soft-boiled egg, and noodles.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    author: 'Chef Kenji',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji',
    cookTime: '45 mins',
    servings: 4,
    difficulty: 'Hard',
    cuisine: 'Japanese',
    category: 'Dinner',
    rating: 4.9,
    reviewCount: 267,
    ingredients: [
      'Ramen noodles',
      'Pork belly',
      'Chicken broth',
      'Miso paste',
      'Soft-boiled eggs',
      'Green onions',
      'Nori seaweed',
      'Sesame oil'
    ],
    instructions: [
      'Prepare rich broth with chicken stock and miso.',
      'Marinate and roast pork belly.',
      'Cook ramen noodles according to package.',
      'Soft-boil eggs for 6 minutes.',
      'Assemble bowls with noodles and broth.',
      'Top with pork, egg, green onions, and nori.'
    ],
    nutrition: {
      calories: 520,
      protein: '32g',
      carbs: '54g',
      fat: '20g'
    },
    tags: ['Japanese', 'Ramen', 'Comfort Food'],
    isFavorite: true,
    createdAt: '2024-02-12',
    type: 'non-veg'
  },
  {
    id: '7',
    title: 'Paneer Butter Masala',
    description: 'Creamy and rich Indian curry with soft paneer cubes in tomato gravy.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
    author: 'Chef Priya',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    cookTime: '30 mins',
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Indian',
    category: 'Dinner',
    rating: 4.7,
    reviewCount: 198,
    ingredients: [
      '400g paneer',
      '3 tomatoes',
      '1 onion',
      'Cream',
      'Butter',
      'Ginger-garlic paste',
      'Kasuri methi',
      'Indian spices'
    ],
    instructions: [
      'Blend tomatoes and make a puree.',
      'Sauté onions and ginger-garlic paste in butter.',
      'Add tomato puree and spices, cook until oil separates.',
      'Add cream and kasuri methi.',
      'Add paneer cubes and simmer for 5 minutes.',
      'Serve hot with naan or rice.'
    ],
    nutrition: {
      calories: 380,
      protein: '18g',
      carbs: '22g',
      fat: '24g'
    },
    tags: ['Indian', 'Curry', 'Vegetarian'],
    isFavorite: false,
    createdAt: '2024-02-15',
    type: 'veg'
  },
  {
    id: '8',
    title: 'Butter Chicken',
    description: 'Classic Indian butter chicken with tender pieces in a creamy tomato sauce.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    author: 'Chef Rajesh',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    cookTime: '50 mins',
    servings: 6,
    difficulty: 'Medium',
    cuisine: 'Indian',
    category: 'Dinner',
    rating: 4.9,
    reviewCount: 421,
    ingredients: [
      '800g chicken',
      'Yogurt',
      'Tomato puree',
      'Cream',
      'Butter',
      'Garam masala',
      'Kasuri methi',
      'Ginger-garlic paste'
    ],
    instructions: [
      'Marinate chicken in yogurt and spices for 2 hours.',
      'Grill or pan-fry chicken until cooked.',
      'Make gravy with tomatoes, butter, and spices.',
      'Add cream and kasuri methi.',
      'Add chicken to gravy and simmer.',
      'Garnish with cream and serve with naan.'
    ],
    nutrition: {
      calories: 420,
      protein: '35g',
      carbs: '18g',
      fat: '24g'
    },
    tags: ['Indian', 'Curry', 'Popular'],
    isFavorite: true,
    createdAt: '2024-02-16',
    type: 'non-veg'
  },
  {
    id: '9',
    title: 'Greek Salad',
    description: 'Fresh and healthy Mediterranean salad with feta cheese and olives.',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
    author: 'Chef Sophia',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    cookTime: '10 mins',
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Mediterranean',
    category: 'Lunch',
    rating: 4.5,
    reviewCount: 132,
    ingredients: [
      'Cucumber',
      'Tomatoes',
      'Red onion',
      'Feta cheese',
      'Kalamata olives',
      'Olive oil',
      'Lemon juice',
      'Oregano'
    ],
    instructions: [
      'Chop all vegetables into bite-size pieces.',
      'Add feta cheese and olives.',
      'Drizzle with olive oil and lemon juice.',
      'Sprinkle oregano and toss gently.',
      'Serve immediately.'
    ],
    nutrition: {
      calories: 220,
      protein: '8g',
      carbs: '12g',
      fat: '16g'
    },
    tags: ['Healthy', 'Salad', 'Quick'],
    isFavorite: false,
    createdAt: '2024-02-18',
    type: 'veg'
  },
  {
    id: '10',
    title: 'Fish Curry',
    description: 'Spicy and tangy fish curry with coconut milk and aromatic spices.',
    image: fishCurryImg,
    author: 'Chef Ananya',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    cookTime: '35 mins',
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Indian',
    category: 'Dinner',
    rating: 4.8,
    reviewCount: 176,
    ingredients: [
      '500g fish fillets',
      'Coconut milk',
      'Tamarind paste',
      'Curry leaves',
      'Mustard seeds',
      'Red chili powder',
      'Turmeric',
      'Onion and tomatoes'
    ],
    instructions: [
      'Marinate fish with turmeric and salt.',
      'Prepare curry base with onions, tomatoes, and spices.',
      'Add coconut milk and tamarind.',
      'Gently add fish pieces and cook for 10 minutes.',
      'Temper with mustard seeds and curry leaves.',
      'Serve with rice.'
    ],
    nutrition: {
      calories: 295,
      protein: '28g',
      carbs: '14g',
      fat: '14g'
    },
    tags: ['Indian', 'Seafood', 'Spicy'],
    isFavorite: false,
    createdAt: '2024-02-19',
    type: 'non-veg'
  },
  {
    id: '11',
    title: 'Veggie Wrap',
    description: 'Quick and healthy wrap loaded with fresh vegetables and hummus.',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
    author: 'Chef Emma',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    cookTime: '15 mins',
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'American',
    category: 'Lunch',
    rating: 4.4,
    reviewCount: 89,
    ingredients: [
      'Whole wheat tortillas',
      'Hummus',
      'Lettuce',
      'Tomatoes',
      'Cucumber',
      'Bell peppers',
      'Red onion',
      'Feta cheese'
    ],
    instructions: [
      'Spread hummus on tortilla.',
      'Layer with fresh vegetables.',
      'Add crumbled feta cheese.',
      'Roll tightly and cut in half.',
      'Serve immediately or wrap for later.'
    ],
    nutrition: {
      calories: 280,
      protein: '11g',
      carbs: '38g',
      fat: '10g'
    },
    tags: ['Quick', 'Healthy', 'Lunch'],
    isFavorite: false,
    createdAt: '2024-02-20',
    type: 'veg'
  },
  {
    id: '12',
    title: 'Chicken Tikka Masala',
    description: 'Grilled chicken tikka in a creamy spiced tomato sauce.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
    author: 'Chef Vikram',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    cookTime: '55 mins',
    servings: 6,
    difficulty: 'Medium',
    cuisine: 'Indian',
    category: 'Dinner',
    rating: 4.9,
    reviewCount: 389,
    ingredients: [
      '800g chicken breast',
      'Yogurt',
      'Tikka masala spice',
      'Tomato puree',
      'Cream',
      'Ginger-garlic paste',
      'Onions',
      'Butter'
    ],
    instructions: [
      'Marinate chicken in yogurt and tikka spices.',
      'Grill chicken until charred.',
      'Make sauce with onions, tomatoes, and spices.',
      'Add cream and grilled chicken.',
      'Simmer for 15 minutes.',
      'Serve with basmati rice or naan.'
    ],
    nutrition: {
      calories: 395,
      protein: '38g',
      carbs: '16g',
      fat: '20g'
    },
    tags: ['Indian', 'Popular', 'Spicy'],
    isFavorite: true,
    createdAt: '2024-02-21',
    type: 'non-veg'
  },
  {
    id: '13',
    title: 'Dal Tadka',
    description: 'Comforting Indian lentil curry tempered with aromatic spices.',
    image: dalTadkaImg,
    author: 'Chef Meera',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera',
    cookTime: '40 mins',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Indian',
    category: 'Dinner',
    rating: 4.6,
    reviewCount: 214,
    ingredients: [
      '1 cup yellow lentils',
      'Turmeric',
      'Cumin seeds',
      'Onions',
      'Tomatoes',
      'Green chilies',
      'Ghee',
      'Coriander leaves'
    ],
    instructions: [
      'Pressure cook lentils with turmeric and salt.',
      'Prepare tadka with cumin, onions, and tomatoes.',
      'Pour tadka over cooked dal.',
      'Simmer for 5 minutes.',
      'Garnish with coriander leaves.',
      'Serve hot with rice or roti.'
    ],
    nutrition: {
      calories: 240,
      protein: '14g',
      carbs: '36g',
      fat: '6g'
    },
    tags: ['Indian', 'Comfort Food', 'Vegetarian'],
    isFavorite: false,
    createdAt: '2024-02-22',
    type: 'veg'
  },
  {
    id: '14',
    title: 'Quinoa Power Bowl',
    description: 'Nutrient-packed bowl with quinoa, roasted vegetables, and tahini.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    author: 'Chef Sophia',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    cookTime: '25 mins',
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Mediterranean',
    category: 'Lunch',
    rating: 4.7,
    reviewCount: 167,
    ingredients: [
      '1 cup quinoa',
      'Sweet potato',
      'Chickpeas',
      'Kale',
      'Avocado',
      'Tahini',
      'Lemon juice',
      'Pumpkin seeds'
    ],
    instructions: [
      'Cook quinoa according to package directions.',
      'Roast sweet potato and chickpeas.',
      'Massage kale with lemon juice.',
      'Assemble bowl with quinoa base.',
      'Top with vegetables and avocado.',
      'Drizzle with tahini dressing.'
    ],
    nutrition: {
      calories: 420,
      protein: '16g',
      carbs: '58g',
      fat: '15g'
    },
    tags: ['Healthy', 'Vegan', 'Power Bowl'],
    isFavorite: false,
    createdAt: '2024-02-23',
    type: 'veg'
  },
  {
    id: '15',
    title: 'Egg Curry',
    description: 'Hearty Indian curry with boiled eggs in spiced tomato gravy.',
    image: eggCurryImg,
    author: 'Chef Ravi',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi',
    cookTime: '30 mins',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Indian',
    category: 'Dinner',
    rating: 4.5,
    reviewCount: 142,
    ingredients: [
      '6 boiled eggs',
      'Onions',
      'Tomatoes',
      'Ginger-garlic paste',
      'Curry leaves',
      'Coconut milk',
      'Indian spices',
      'Coriander leaves'
    ],
    instructions: [
      'Boil and peel eggs.',
      'Make curry base with onions, tomatoes, and spices.',
      'Add coconut milk and simmer.',
      'Halve eggs and add to curry.',
      'Cook for 5 minutes.',
      'Garnish with coriander and serve with rice.'
    ],
    nutrition: {
      calories: 245,
      protein: '14g',
      carbs: '12g',
      fat: '16g'
    },
    tags: ['Indian', 'Eggs', 'Comfort Food'],
    isFavorite: false,
    createdAt: '2024-02-24',
    type: 'non-veg'
  },
  {
    id: '16',
    title: 'Mushroom Risotto',
    description: 'Creamy Italian rice dish with wild mushrooms and parmesan.',
    image: mushroomRisottoImg,
    author: 'Chef Marco',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
    cookTime: '45 mins',
    servings: 4,
    difficulty: 'Hard',
    cuisine: 'Italian',
    category: 'Dinner',
    rating: 4.8,
    reviewCount: 201,
    ingredients: [
      'Arborio rice',
      'Mixed mushrooms',
      'Vegetable broth',
      'White wine',
      'Parmesan cheese',
      'Butter',
      'Onion',
      'Garlic'
    ],
    instructions: [
      'Sauté mushrooms until golden.',
      'Toast rice with onions and garlic.',
      'Add wine and let it absorb.',
      'Add broth gradually, stirring constantly.',
      'Stir in mushrooms, butter, and parmesan.',
      'Serve immediately with extra parmesan.'
    ],
    nutrition: {
      calories: 380,
      protein: '12g',
      carbs: '54g',
      fat: '14g'
    },
    tags: ['Italian', 'Comfort Food', 'Vegetarian'],
    isFavorite: true,
    createdAt: '2024-02-25',
    type: 'veg'
  },
  {
    id: '17',
    title: 'Grilled Salmon',
    description: 'Perfectly grilled salmon with lemon butter and herbs.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
    author: 'Chef Oliver',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    cookTime: '20 mins',
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'American',
    category: 'Dinner',
    rating: 4.7,
    reviewCount: 198,
    ingredients: [
      '2 salmon fillets',
      'Lemon',
      'Butter',
      'Garlic',
      'Fresh dill',
      'Olive oil',
      'Salt and pepper',
      'Asparagus'
    ],
    instructions: [
      'Season salmon with salt and pepper.',
      'Grill salmon for 4-5 minutes per side.',
      'Make lemon butter sauce with garlic and dill.',
      'Grill asparagus alongside salmon.',
      'Plate salmon and drizzle with sauce.',
      'Serve with lemon wedges.'
    ],
    nutrition: {
      calories: 385,
      protein: '34g',
      carbs: '8g',
      fat: '24g'
    },
    tags: ['Healthy', 'Seafood', 'Quick'],
    isFavorite: false,
    createdAt: '2024-02-26',
    type: 'non-veg'
  },
  {
    id: '18',
    title: 'Tomato Soup',
    description: 'Creamy homemade tomato soup with fresh basil.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
    author: 'Chef Emma',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    cookTime: '25 mins',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'American',
    category: 'Lunch',
    rating: 4.5,
    reviewCount: 178,
    ingredients: [
      '8 ripe tomatoes',
      'Onion',
      'Garlic',
      'Vegetable broth',
      'Cream',
      'Fresh basil',
      'Olive oil',
      'Salt and pepper'
    ],
    instructions: [
      'Roast tomatoes until charred.',
      'Sauté onions and garlic.',
      'Blend tomatoes with broth.',
      'Simmer soup for 15 minutes.',
      'Stir in cream and fresh basil.',
      'Serve with crusty bread.'
    ],
    nutrition: {
      calories: 180,
      protein: '4g',
      carbs: '18g',
      fat: '10g'
    },
    tags: ['Soup', 'Comfort Food', 'Vegetarian'],
    isFavorite: false,
    createdAt: '2024-02-27',
    type: 'veg'
  },
  {
    id: '19',
    title: 'Mutton Biryani',
    description: 'Aromatic layered rice dish with tender mutton and fragrant spices.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    author: 'Chef Imran',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Imran',
    cookTime: '90 mins',
    servings: 6,
    difficulty: 'Hard',
    cuisine: 'Indian',
    category: 'Dinner',
    rating: 4.9,
    reviewCount: 456,
    ingredients: [
      '800g mutton',
      'Basmati rice',
      'Yogurt',
      'Fried onions',
      'Saffron',
      'Biryani masala',
      'Mint and coriander',
      'Ghee'
    ],
    instructions: [
      'Marinate mutton in yogurt and spices.',
      'Cook mutton until tender.',
      'Parboil rice with whole spices.',
      'Layer rice and mutton in pot.',
      'Add saffron milk and fried onions.',
      'Cook on dum for 30 minutes.'
    ],
    nutrition: {
      calories: 580,
      protein: '38g',
      carbs: '62g',
      fat: '20g'
    },
    tags: ['Indian', 'Biryani', 'Special'],
    isFavorite: true,
    createdAt: '2024-02-28',
    type: 'non-veg'
  },
  {
    id: '20',
    title: 'Veg Biryani',
    description: 'Fragrant vegetable biryani with aromatic basmati rice.',
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800&q=80',
    author: 'Chef Priya',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    cookTime: '60 mins',
    servings: 6,
    difficulty: 'Medium',
    cuisine: 'Indian',
    category: 'Dinner',
    rating: 4.7,
    reviewCount: 289,
    ingredients: [
      'Basmati rice',
      'Mixed vegetables',
      'Yogurt',
      'Fried onions',
      'Saffron',
      'Biryani masala',
      'Mint and coriander',
      'Ghee'
    ],
    instructions: [
      'Sauté vegetables with spices.',
      'Parboil rice with whole spices.',
      'Layer rice and vegetables.',
      'Add saffron milk and fried onions.',
      'Cook on dum for 25 minutes.',
      'Serve with raita.'
    ],
    nutrition: {
      calories: 420,
      protein: '12g',
      carbs: '68g',
      fat: '12g'
    },
    tags: ['Indian', 'Biryani', 'Vegetarian'],
    isFavorite: false,
    createdAt: '2024-03-01',
    type: 'veg'
  },
  {
    id: '21',
    title: 'Berry Smoothie Bowl',
    description: 'Refreshing smoothie bowl topped with fresh fruits and granola.',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80',
    author: 'Chef Emma',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    cookTime: '10 mins',
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'American',
    category: 'Breakfast',
    rating: 4.6,
    reviewCount: 156,
    ingredients: [
      'Frozen berries',
      'Banana',
      'Greek yogurt',
      'Honey',
      'Granola',
      'Fresh fruits',
      'Chia seeds',
      'Coconut flakes'
    ],
    instructions: [
      'Blend frozen berries, banana, and yogurt.',
      'Pour into bowl.',
      'Top with granola, fruits, and seeds.',
      'Drizzle with honey.',
      'Serve immediately.'
    ],
    nutrition: {
      calories: 320,
      protein: '12g',
      carbs: '52g',
      fat: '8g'
    },
    tags: ['Healthy', 'Breakfast', 'Quick'],
    isFavorite: false,
    createdAt: '2024-03-02',
    type: 'veg'
  },
  {
    id: '22',
    title: 'Prawn Stir Fry',
    description: 'Quick Asian-style stir fry with prawns and crisp vegetables.',
    image: prawnStirFryImg,
    author: 'Chef Wei',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wei',
    cookTime: '20 mins',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Chinese',
    category: 'Dinner',
    rating: 4.7,
    reviewCount: 187,
    ingredients: [
      '400g prawns',
      'Bell peppers',
      'Broccoli',
      'Garlic',
      'Ginger',
      'Soy sauce',
      'Oyster sauce',
      'Sesame oil'
    ],
    instructions: [
      'Marinate prawns with soy sauce.',
      'Stir fry vegetables until crisp.',
      'Add prawns and cook until pink.',
      'Add sauce mixture.',
      'Toss everything together.',
      'Serve hot with rice.'
    ],
    nutrition: {
      calories: 240,
      protein: '26g',
      carbs: '14g',
      fat: '8g'
    },
    tags: ['Quick', 'Seafood', 'Asian'],
    isFavorite: false,
    createdAt: '2024-03-03',
    type: 'non-veg'
  },
  {
    id: '23',
    title: 'Caprese Sandwich',
    description: 'Fresh Italian sandwich with mozzarella, tomato, and basil.',
    image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&q=80',
    author: 'Chef Marco',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
    cookTime: '10 mins',
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'Italian',
    category: 'Lunch',
    rating: 4.5,
    reviewCount: 134,
    ingredients: [
      'Ciabatta bread',
      'Fresh mozzarella',
      'Tomatoes',
      'Fresh basil',
      'Balsamic glaze',
      'Olive oil',
      'Salt and pepper',
      'Pesto'
    ],
    instructions: [
      'Slice bread and toast lightly.',
      'Spread pesto on both sides.',
      'Layer mozzarella and tomatoes.',
      'Add fresh basil leaves.',
      'Drizzle with balsamic glaze.',
      'Serve immediately.'
    ],
    nutrition: {
      calories: 380,
      protein: '18g',
      carbs: '42g',
      fat: '16g'
    },
    tags: ['Quick', 'Italian', 'Vegetarian'],
    isFavorite: false,
    createdAt: '2024-03-04',
    type: 'veg'
  },
  {
    id: '24',
    title: 'Chicken Noodle Soup',
    description: 'Comforting soup with tender chicken, vegetables, and noodles.',
    image: chickenNoodleSoupImg,
    author: 'Chef Oliver',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    cookTime: '40 mins',
    servings: 6,
    difficulty: 'Easy',
    cuisine: 'American',
    category: 'Lunch',
    rating: 4.6,
    reviewCount: 223,
    ingredients: [
      'Chicken breast',
      'Egg noodles',
      'Carrots',
      'Celery',
      'Onion',
      'Chicken broth',
      'Garlic',
      'Herbs'
    ],
    instructions: [
      'Simmer chicken in broth until cooked.',
      'Remove and shred chicken.',
      'Sauté vegetables in pot.',
      'Add broth back with chicken.',
      'Cook noodles in soup.',
      'Season and serve hot.'
    ],
    nutrition: {
      calories: 280,
      protein: '24g',
      carbs: '32g',
      fat: '6g'
    },
    tags: ['Comfort Food', 'Soup', 'Healthy'],
    isFavorite: false,
    createdAt: '2024-03-05',
    type: 'non-veg'
  },
  {
    id: '25',
    title: 'Falafel Bowl',
    description: 'Middle Eastern bowl with crispy falafel, hummus, and tahini.',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
    author: 'Chef Layla',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Layla',
    cookTime: '35 mins',
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Mediterranean',
    category: 'Lunch',
    rating: 4.7,
    reviewCount: 195,
    ingredients: [
      'Chickpeas',
      'Fresh herbs',
      'Tahini',
      'Hummus',
      'Cucumber',
      'Tomatoes',
      'Lettuce',
      'Pita bread'
    ],
    instructions: [
      'Blend chickpeas with herbs and spices.',
      'Form into balls and fry until golden.',
      'Prepare tahini sauce.',
      'Assemble bowl with vegetables.',
      'Top with falafel and sauces.',
      'Serve with warm pita.'
    ],
    nutrition: {
      calories: 420,
      protein: '16g',
      carbs: '54g',
      fat: '16g'
    },
    tags: ['Vegan', 'Mediterranean', 'Healthy'],
    isFavorite: true,
    createdAt: '2024-03-06',
    type: 'veg'
  },
  {
    id: '26',
    title: 'Beef Stir Fry',
    description: 'Tender beef strips with vegetables in savory Asian sauce.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    author: 'Chef Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen',
    cookTime: '25 mins',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Chinese',
    category: 'Dinner',
    rating: 4.8,
    reviewCount: 267,
    ingredients: [
      '500g beef strips',
      'Broccoli',
      'Bell peppers',
      'Soy sauce',
      'Oyster sauce',
      'Garlic',
      'Ginger',
      'Cornstarch'
    ],
    instructions: [
      'Marinate beef with soy sauce and cornstarch.',
      'Stir fry beef until browned.',
      'Remove beef and cook vegetables.',
      'Add beef back with sauce.',
      'Toss until coated.',
      'Serve over rice.'
    ],
    nutrition: {
      calories: 340,
      protein: '32g',
      carbs: '18g',
      fat: '16g'
    },
    tags: ['Quick', 'Asian', 'High Protein'],
    isFavorite: false,
    createdAt: '2024-03-07',
    type: 'non-veg'
  },
  {
    id: '27',
    title: 'Overnight Oats',
    description: 'Easy no-cook breakfast with oats, fruits, and nuts.',
    image: overnightOatsImg,
    author: 'Chef Emma',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    cookTime: '5 mins',
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'American',
    category: 'Breakfast',
    rating: 4.5,
    reviewCount: 178,
    ingredients: [
      'Rolled oats',
      'Milk or almond milk',
      'Greek yogurt',
      'Honey',
      'Berries',
      'Nuts',
      'Chia seeds',
      'Vanilla extract'
    ],
    instructions: [
      'Mix oats, milk, yogurt, and honey.',
      'Add chia seeds and vanilla.',
      'Refrigerate overnight.',
      'Top with fruits and nuts.',
      'Serve cold.'
    ],
    nutrition: {
      calories: 290,
      protein: '12g',
      carbs: '46g',
      fat: '8g'
    },
    tags: ['Healthy', 'Quick', 'Make-Ahead'],
    isFavorite: false,
    createdAt: '2024-03-08',
    type: 'veg'
  },
  {
    id: '28',
    title: 'Shrimp Tacos',
    description: 'Light and flavorful tacos with grilled shrimp and fresh slaw.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
    author: 'Chef Maria',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    cookTime: '20 mins',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Mexican',
    category: 'Dinner',
    rating: 4.8,
    reviewCount: 234,
    ingredients: [
      '500g shrimp',
      'Corn tortillas',
      'Cabbage slaw',
      'Lime',
      'Cilantro',
      'Avocado',
      'Mexican spices',
      'Sour cream'
    ],
    instructions: [
      'Season and grill shrimp.',
      'Warm tortillas.',
      'Make quick cabbage slaw.',
      'Assemble tacos with shrimp.',
      'Top with avocado and sour cream.',
      'Serve with lime wedges.'
    ],
    nutrition: {
      calories: 320,
      protein: '28g',
      carbs: '28g',
      fat: '12g'
    },
    tags: ['Quick', 'Seafood', 'Mexican'],
    isFavorite: true,
    createdAt: '2024-03-09',
    type: 'non-veg'
  },
  {
    id: '29',
    title: 'Spinach Pasta',
    description: 'Creamy pasta with fresh spinach and garlic.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    author: 'Chef Marco',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco',
    cookTime: '25 mins',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Italian',
    category: 'Dinner',
    rating: 4.6,
    reviewCount: 189,
    ingredients: [
      'Pasta',
      'Fresh spinach',
      'Garlic',
      'Cream',
      'Parmesan cheese',
      'Olive oil',
      'Nutmeg',
      'Cherry tomatoes'
    ],
    instructions: [
      'Cook pasta according to package.',
      'Sauté garlic in olive oil.',
      'Add spinach and wilt.',
      'Add cream and parmesan.',
      'Toss with pasta.',
      'Serve with cherry tomatoes.'
    ],
    nutrition: {
      calories: 420,
      protein: '16g',
      carbs: '56g',
      fat: '16g'
    },
    tags: ['Italian', 'Quick', 'Vegetarian'],
    isFavorite: false,
    createdAt: '2024-03-10',
    type: 'veg'
  },
  {
    id: '30',
    title: 'Korean Fried Chicken',
    description: 'Crispy double-fried chicken with sweet and spicy Korean glaze.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80',
    author: 'Chef Min',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Min',
    cookTime: '50 mins',
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Korean',
    category: 'Dinner',
    rating: 4.9,
    reviewCount: 342,
    ingredients: [
      '800g chicken wings',
      'Cornstarch',
      'Gochujang sauce',
      'Honey',
      'Soy sauce',
      'Garlic',
      'Sesame seeds',
      'Green onions'
    ],
    instructions: [
      'Coat chicken in cornstarch mixture.',
      'Double fry chicken until crispy.',
      'Make sauce with gochujang and honey.',
      'Toss chicken in sauce.',
      'Garnish with sesame seeds and green onions.',
      'Serve hot with pickled radish.'
    ],
    nutrition: {
      calories: 480,
      protein: '36g',
      carbs: '38g',
      fat: '20g'
    },
    tags: ['Korean', 'Spicy', 'Popular'],
    isFavorite: true,
    createdAt: '2024-03-11',
    type: 'non-veg'
  }
];
