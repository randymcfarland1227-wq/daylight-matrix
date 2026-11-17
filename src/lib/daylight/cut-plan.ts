/** Cut targets and EXAMPLE days (2026-11-17). Examples only: swap any meal for another that fits the targets. */
export const CUT_TARGETS = { kcal: 2450, protein: 205, carbs: 250, fat: 70 } as const;

export const CUT_GOAL = "Cut from 106.8 kg toward 95–97 kg (about 10–12% body fat), losing 0.5–0.9 kg a week.";

export const FOOD_RULES: string[] = [
  "Protein comes from chicken, eggs and egg whites, Greek yogurt and cheese. No protein powder.",
  "Portion raw ingredients ahead, then cook fresh. No meal prep and no reheating.",
  "Keep one chocolate chip cookie a day. It's part of the plan.",
  "Veg he likes: green beans, spinach (in smoothies), Caesar salad, corn, potatoes, cucumber.",
  "Eat by energy. Meal times don't matter as long as the day hits its targets.",
  "Groceries should stay at about $60 a week.",
];

export const CHECK_INS: { what: string; when: string }[] = [
  { what: "Weigh-in, morning, after the bathroom, before food", when: "Mon · Wed · Fri" },
  { what: "Waist measured at the navel; compare weekly weigh-in averages", when: "Mon" },
  { what: "Progress photos in daylight, same spot and poses", when: "Every 2nd Sun" },
  { what: "No change for 2 weeks: cut 150 kcal or add 2,000 steps", when: "As needed" },
];

export type ExampleMeal = { slot: "Breakfast" | "Lunch" | "Snack" | "Dinner" | "Treat"; name: string; detail: string; protein: number };
export type ExampleDay = { id: string; label: string; vibe: string; meals: ExampleMeal[]; totals: { kcal: number; protein: number; carbs: number; fat: number } };

export const EXAMPLE_DAYS: ExampleDay[] = [
  {
    id: "sweet",
    label: "Example 1",
    vibe: "Sweet morning",
    meals: [
      { slot: "Breakfast", name: "Kodiak pancakes", detail: "¾ cup Kodiak mix + ½ cup egg whites, a little butter, strawberries, ¼ cup Greek yogurt", protein: 43 },
      { slot: "Lunch", name: "Chicken quesadilla", detail: "150 g raw chicken, 2 medium tortillas, 1.5 oz cheddar", protein: 53 },
      { slot: "Snack", name: "Smoothie", detail: "2 cups nonfat Greek yogurt, banana, strawberries, raspberries, spinach, cucumber", protein: 38 },
      { slot: "Dinner", name: "Sweet chili chicken fried rice", detail: "200 g chicken, 1 cup cooked rice, 2 eggs, 3 tsp oil, green beans", protein: 66 },
      { slot: "Treat", name: "Chocolate chip cookie", detail: "1 cookie", protein: 2 },
    ],
    totals: { kcal: 2456, protein: 202, carbs: 252, fat: 71 },
  },
  {
    id: "savory",
    label: "Example 2",
    vibe: "Savory",
    meals: [
      { slot: "Breakfast", name: "Bacon, egg & cheese bagel", detail: "1 egg + ¾ cup egg whites, 2 bacon slices, ½ oz cheddar", protein: 45 },
      { slot: "Lunch", name: "Chicken Caesar wrap", detail: "200 g chicken, tortilla, romaine, light Caesar, parmesan", protein: 54 },
      { slot: "Snack", name: "Yogurt bowl", detail: "2 cups Greek yogurt, banana, berries, 2 tsp honey", protein: 36 },
      { slot: "Dinner", name: "Carbonara-style chicken", detail: "100 g dry pasta, 175 g chicken, 1 egg, parmesan, 1 bacon slice, 2 tsp oil", protein: 70 },
      { slot: "Treat", name: "Chocolate chip cookie", detail: "1 cookie", protein: 2 },
    ],
    totals: { kcal: 2475, protein: 207, carbs: 254, fat: 70 },
  },
  {
    id: "alfredo",
    label: "Example 3",
    vibe: "Alfredo night",
    meals: [
      { slot: "Breakfast", name: "2 egg & cheese English muffins", detail: "2 eggs + ¾ cup egg whites, cheese", protein: 46 },
      { slot: "Lunch", name: "Chicken quesadilla (mozzarella)", detail: "Chicken, tortillas, part-skim mozzarella", protein: 50 },
      { slot: "Snack", name: "Smoothie", detail: "2 cups nonfat Greek yogurt, banana, berries, spinach, cucumber", protein: 38 },
      { slot: "Dinner", name: "Chicken spinach Alfredo + potato", detail: "200 g chicken, 50 g pasta, milk, light cream cheese, parmesan, spinach; 150 g potato", protein: 72 },
      { slot: "Treat", name: "Chocolate chip cookie", detail: "1 cookie", protein: 1 },
    ],
    totals: { kcal: 2467, protein: 207, carbs: 255, fat: 69 },
  },
];
