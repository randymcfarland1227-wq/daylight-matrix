import type { InventoryItem, PrepTask, Recipe, SavedMeal, ShoppingItem } from "./types";

/** Kitchen library carried from the existing Daylight Matrix source, not from a live database. */
export const SEED_RECIPES: Recipe[] = [
  {
    id: "recipe-pizza",
    name: "Sweet-spicy chicken personal pizza",
    minutes: 25,
    noCook: false,
    uses: ["pizza dough", "chicken breast", "sweet and spicy sauce", "corn", "olive oil"],
    note: "From your existing recipe library. A frozen dough becomes dinner without tomato sauce.",
    steps: [
      "Thaw one pizza dough and heat the oven using your usual dough instructions.",
      "Cook one portion of chicken, slice it, and toss it with sweet and spicy sauce.",
      "Stretch the dough, brush the edge with olive oil, then add sauce, chicken, and corn.",
      "Bake until the crust is browned and the chicken is hot.",
    ],
  },
  {
    id: "recipe-wraps",
    name: "Crispy chicken nugget wraps",
    minutes: 15,
    noCook: false,
    uses: ["chicken nuggets", "tortillas", "sweet and spicy sauce", "corn"],
    note: "From your existing recipe library. Fast when energy is low.",
    steps: [
      "Heat one portion of chicken nuggets until crisp.",
      "Warm a tortilla and heat a little corn.",
      "Slice the nuggets, toss with sweet and spicy sauce, add the corn, and roll.",
    ],
  },
  {
    id: "recipe-curry",
    name: "Curry chicken + baby potato skillet",
    minutes: 28,
    noCook: false,
    uses: ["chicken breast", "baby potatoes", "curry powder", "olive oil", "salt", "black pepper"],
    note: "From your existing recipe library.",
    steps: [
      "Halve the baby potatoes and season with olive oil, curry powder, salt, and pepper.",
      "Roast or air-fry until browned and tender.",
      "Season and cook one portion of chicken until fully cooked.",
      "Slice the chicken and serve with the potatoes.",
    ],
  },
  {
    id: "recipe-pierogi",
    name: "Crisp pierogies + green beans",
    minutes: 18,
    noCook: false,
    uses: ["pierogies", "green beans", "olive oil", "salt", "black pepper"],
    note: "From your existing recipe library.",
    steps: [
      "Cook one serving of pierogies according to the package.",
      "Heat one portion of green beans and season lightly.",
      "Crisp the pierogies in a little olive oil.",
    ],
  },
  {
    id: "recipe-ravioli",
    name: "Toasted ravioli + seasoned green beans",
    minutes: 15,
    noCook: false,
    uses: ["toasted ravioli", "green beans", "olive oil", "salt", "black pepper"],
    note: "From your existing recipe library.",
    steps: [
      "Bake or air-fry the toasted ravioli according to the package.",
      "Warm one portion of green beans with a little olive oil.",
      "Season and plate them beside the ravioli.",
    ],
  },
  {
    id: "recipe-smoothie",
    name: "Strawberry-banana yogurt smoothie",
    minutes: 6,
    noCook: true,
    uses: ["strawberries", "bananas", "cucumbers", "yogurt"],
    note: "From your existing recipe library. No cooking.",
    steps: [
      "Add strawberries, banana, some cucumber, and yogurt.",
      "Blend with water and ice.",
      "Taste before adding anything else.",
    ],
  },
  {
    id: "recipe-pancakes",
    name: "Strawberry-banana pancakes",
    minutes: 15,
    noCook: false,
    uses: ["pancake mix", "strawberries", "bananas", "syrup"],
    note: "From your existing recipe library.",
    steps: [
      "Prepare the pancake mix according to the package.",
      "Slice a little banana and strawberries.",
      "Cook the pancakes and top with the fruit and a small pour of syrup.",
    ],
  },
];

function item(
  id: string,
  name: string,
  category: string,
  location: string,
  cadence: string,
): InventoryItem {
  return {
    id,
    name,
    quantity: "",
    category,
    cadence,
    storageLocation: location,
    status: "check_amount",
    notes: "Carried from the recipe and grocery library. Amount was not in that source, so it stays unchecked.",
  };
}

export const SEED_INVENTORY: InventoryItem[] = [
  item("inv-dough", "Pizza dough", "Frozen", "Freezer", "weekly"),
  item("inv-chicken", "Chicken breast", "Protein", "Fridge", "weekly"),
  item("inv-nuggets", "Chicken nuggets", "Frozen", "Freezer", "weekly"),
  item("inv-sauce", "Sweet and spicy sauce", "Pantry", "Cabinet", "staple"),
  item("inv-corn", "Corn", "Frozen", "Freezer", "weekly"),
  item("inv-oil", "Olive oil", "Pantry", "Cabinet", "staple"),
  item("inv-tortilla", "Tortillas", "Pantry", "Cabinet", "weekly"),
  item("inv-potato", "Baby potatoes", "Produce", "Cabinet", "weekly"),
  item("inv-curry", "Curry powder", "Pantry", "Cabinet", "staple"),
  item("inv-salt", "Salt", "Pantry", "Cabinet", "staple"),
  item("inv-pepper", "Black pepper", "Pantry", "Cabinet", "staple"),
  item("inv-pierogi", "Pierogies", "Frozen", "Freezer", "weekly"),
  item("inv-beans", "Green beans", "Frozen", "Freezer", "weekly"),
  item("inv-ravioli", "Toasted ravioli", "Frozen", "Freezer", "weekly"),
  item("inv-strawberry", "Strawberries", "Produce", "Fridge", "weekly"),
  item("inv-banana", "Bananas", "Produce", "Cabinet", "weekly"),
  item("inv-cucumber", "Cucumbers", "Produce", "Fridge", "weekly"),
  item("inv-yogurt", "Yogurt", "Dairy", "Fridge", "weekly"),
  item("inv-pancake", "Pancake mix", "Pantry", "Cabinet", "staple"),
  item("inv-syrup", "Syrup", "Pantry", "Cabinet", "staple"),
];

/** Added by the overhaul. Starter ideas with no nutrition claims; edit or delete freely. Amounts stay unchecked. */
export const SEED_STARTER_INVENTORY: InventoryItem[] = [
  item("inv-eggs", "Eggs", "Protein", "Fridge", "weekly"),
  item("inv-rice", "Rice", "Pantry", "Cabinet", "weekly"),
  item("inv-greek-yogurt", "Greek yogurt", "Dairy", "Fridge", "weekly"),
  item("inv-protein-powder", "Protein powder", "Pantry", "Cabinet", "staple"),
  item("inv-milk", "Milk", "Dairy", "Fridge", "weekly"),
  item("inv-oats", "Oats", "Pantry", "Cabinet", "staple"),
  item("inv-cheese", "Block cheese", "Dairy", "Fridge", "weekly"),
  item("inv-tuna", "Tuna pouches", "Protein", "Cabinet", "weekly"),
];

export const SEED_STARTER_MEALS: SavedMeal[] = [
  {
    id: "meal-starter-yogurt-bowl",
    name: "Greek yogurt + strawberry bowl",
    recipeId: null,
    minutes: 3,
    noCook: true,
    ingredientNames: ["Greek yogurt", "Strawberries"],
    pinned: false,
    proteinGrams: null,
  },
  {
    id: "meal-starter-egg-scramble",
    name: "Egg scramble + cheese",
    recipeId: null,
    minutes: 8,
    noCook: false,
    ingredientNames: ["Eggs", "Block cheese", "Olive oil"],
    pinned: false,
    proteinGrams: null,
  },
  {
    id: "meal-starter-shake",
    name: "Protein shake + banana",
    recipeId: null,
    minutes: 3,
    noCook: true,
    ingredientNames: ["Protein powder", "Milk", "Bananas"],
    pinned: false,
    proteinGrams: null,
  },
  {
    id: "meal-starter-chicken-rice",
    name: "Chicken + rice + green beans",
    recipeId: null,
    minutes: 5,
    noCook: false,
    ingredientNames: ["Chicken breast", "Rice", "Green beans"],
    pinned: false,
    proteinGrams: null,
  },
  {
    id: "meal-starter-tuna-wrap",
    name: "Tuna wrap",
    recipeId: null,
    minutes: 5,
    noCook: true,
    ingredientNames: ["Tuna pouches", "Tortillas", "Cucumbers"],
    pinned: false,
    proteinGrams: null,
  },
];

export const SEED_MEALS: SavedMeal[] = SEED_RECIPES.map((recipe) => ({
  id: `meal-${recipe.id}`,
  name: recipe.name,
  recipeId: recipe.id,
  minutes: recipe.minutes,
  noCook: recipe.noCook,
  ingredientNames: recipe.uses,
  pinned: false,
  proteinGrams: null,
}));

export const GROCERY_SHEET =
  "https://docs.google.com/spreadsheets/d/1OzhiJ--yovtv28cvJP7D5wTgExaJP8Ce2iEs7QOwnqY/edit";

export const SEED_SHOPPING: ShoppingItem[] = [
  ["Green beans", "3–4 servings", "Dinner vegetable"],
  ["Block cheese", "1 block", "Eggs + breakfasts"],
  ["Chicken", "4–5 lb", "Main protein"],
  ["Breaded chicken", "5 servings", "Home lunches"],
  ["Applesauce", "6 pack", "Work/home snack"],
  ["Strawberries", "1 pack", "Breakfast + work lunch"],
  ["Bananas", "4–5", "Home protein shakes"],
  ["Rice", "1 bag", "Dinner carb"],
  ["Baby potatoes", "1 bag", "Dinner carb"],
  ["Tortillas", "1 pack", "Wraps + quesadillas"],
  ["Cucumbers", "2–3", "Snacks + smoothies"],
  ["Olive oil", "", "Anything cooked in a pan"],
  ["Salt", "", "Seasoning"],
  ["Pepper", "", "Seasoning"],
  ["Garlic powder", "", "Seasoning"],
  ["Marinara", "", "Pizza + pasta"],
  ["Jarred garlic", "", "Pasta + protein recipes"],
  ["Teriyaki sauce", "", "Chicken"],
  ["Vanilla extract", "", "Baking + protein snacks"],
].map(([name, quantity, source], index) => ({
  id: `shop-seed-${index}`,
  name: name!,
  quantity: quantity!,
  checked: false,
  source: source!,
}));

export const SEED_PREP: PrepTask[] = [
  ["Chicken prep · 4 servings", "Dinner portions from Grocery Planning."],
  ["Breaded chicken prep · 5 servings", "Home-lunch portions from Grocery Planning."],
  ["Yogurt portioning · 3–4 servings", "Breakfast portions from Grocery Planning."],
  ["Green bean portioning · 3–4 servings", "Dinner vegetable portions from Grocery Planning."],
  ["Soup prep · 2 servings", "Panera potato soup for lunch."],
  ["Protein snack prep · 4–5 servings", "DIY extra-protein option."],
  ["Protein pudding · 3 servings", "Sugar-free pudding, protein, and milk."],
].map(([title, detail], index) => ({
  id: `prep-seed-${index}`,
  title: title!,
  detail: detail!,
  status: "planned" as const,
}));


/** Ingredient batches are optional templates, never an automatically scheduled meal plan. */
export const INGREDIENT_PREP_IDEAS: PrepTask[] = [
  { id: "prep-rice", title: "Cook rice", detail: "A separate base for different combinations.", ingredientNames: ["Rice"], quantity: "", status: "planned" },
  { id: "prep-potatoes", title: "Prepare potatoes", detail: "Keep a base ready to pair with different proteins.", ingredientNames: ["Baby potatoes"], quantity: "", status: "planned" },
  { id: "prep-cucumbers", title: "Prepare cucumbers", detail: "For snacks, wraps or a side.", ingredientNames: ["Cucumbers"], quantity: "", status: "planned" },
  { id: "prep-strawberries", title: "Prepare strawberries", detail: "For bowls, pancakes or a snack.", ingredientNames: ["Strawberries"], quantity: "", status: "planned" },
];
const PREP_LINKS = [["Chicken breast"], ["Chicken nuggets"], ["Yogurt"], ["Green beans"], ["Panera potato soup"], [], ["Sugar-free pudding mix", "Protein powder", "Milk"]];
SEED_PREP.forEach((task, index) => { task.ingredientNames = PREP_LINKS[index] ?? []; task.selected = false; });
