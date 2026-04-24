export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
export type MenuCategory = "main" | "bread" | "snack" | "breakfast";
export type DietType = "veg" | "non-veg";

export type MenuItem = {
  name: string;
  type: DietType;
  price: number;
  category: MenuCategory;
  tags?: string[];
};

export type Restaurant = {
  id: string;
  name: string;
  rating: number;
  avgPrice: number;
  mealTypes: MealType[];
  hasSeafood: boolean;
  supportsVeg: boolean;
  supportsNonVeg: boolean;
  menuItems: MenuItem[];
};

export const restaurants: Restaurant[] = [
  {
    id: "spice-kitchen",
    name: "Spice Kitchen",
    rating: 4.5,
    avgPrice: 320,
    mealTypes: ["lunch", "dinner", "snacks"],
    hasSeafood: false,
    supportsVeg: true,
    supportsNonVeg: true,
    menuItems: [
      { name: "Paneer Butter Masala", type: "veg", price: 280, category: "main" },
      { name: "Dal Tadka", type: "veg", price: 180, category: "main" },
      { name: "Veg Pulao", type: "veg", price: 240, category: "main" },
      { name: "Chicken Biryani", type: "non-veg", price: 360, category: "main" },
      { name: "Butter Chicken", type: "non-veg", price: 340, category: "main" },
      { name: "Butter Naan", type: "veg", price: 35, category: "bread" },
      { name: "Samosa Platter", type: "veg", price: 150, category: "snack" }
    ]
  },
  {
    id: "urban-tandoor",
    name: "Urban Tandoor",
    rating: 4.3,
    avgPrice: 380,
    mealTypes: ["lunch", "dinner"],
    hasSeafood: true,
    supportsVeg: true,
    supportsNonVeg: true,
    menuItems: [
      { name: "Paneer Tikka Masala", type: "veg", price: 310, category: "main" },
      { name: "Dal Makhani", type: "veg", price: 220, category: "main" },
      { name: "Tandoori Chicken", type: "non-veg", price: 390, category: "main" },
      { name: "Mutton Rogan Josh", type: "non-veg", price: 420, category: "main" },
      { name: "Garlic Naan", type: "veg", price: 40, category: "bread" },
      { name: "Dahi Kebab", type: "veg", price: 210, category: "snack" }
    ]
  },
  {
    id: "green-bowl",
    name: "Green Bowl",
    rating: 4.4,
    avgPrice: 250,
    mealTypes: ["breakfast", "lunch", "dinner", "snacks"],
    hasSeafood: false,
    supportsVeg: true,
    supportsNonVeg: false,
    menuItems: [
      { name: "Thai Curry Bowl", type: "veg", price: 260, category: "main" },
      { name: "Paneer Rice Bowl", type: "veg", price: 240, category: "main" },
      { name: "Lentil Stew", type: "veg", price: 190, category: "main" },
      { name: "Multigrain Roll", type: "veg", price: 55, category: "bread" },
      { name: "Crispy Corn", type: "veg", price: 170, category: "snack" },
      { name: "Granola Yogurt Cup", type: "veg", price: 160, category: "breakfast" }
    ]
  },
  {
    id: "morning-masala",
    name: "Morning Masala",
    rating: 4.2,
    avgPrice: 210,
    mealTypes: ["breakfast", "snacks"],
    hasSeafood: false,
    supportsVeg: true,
    supportsNonVeg: true,
    menuItems: [
      { name: "Masala Dosa", type: "veg", price: 120, category: "breakfast" },
      { name: "Idli Platter", type: "veg", price: 110, category: "breakfast" },
      { name: "Egg Kathi Roll", type: "non-veg", price: 150, category: "snack" },
      { name: "Chicken Puff Box", type: "non-veg", price: 180, category: "snack" },
      { name: "Vada Basket", type: "veg", price: 95, category: "snack" },
      { name: "Mini Parotta", type: "veg", price: 30, category: "bread" }
    ]
  }
];
