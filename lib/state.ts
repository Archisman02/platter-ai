import type { MealType } from "@/lib/data";

export type PlanAdjustment = "default" | "cheaper" | "premium" | "snacks";

export type PlanItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  type: "veg" | "non-veg";
  category: "main" | "bread" | "snack" | "breakfast";
};

export type FoodPlan = {
  restaurantName: string;
  restaurantRating: number;
  reason: string;
  items: PlanItem[];
  totalCost: number;
  costPerPerson: number;
  adjustment: PlanAdjustment;
};

export type ConversationStep =
  | "guests"
  | "mealType"
  | "dietarySplit"
  | "allergies"
  | "budget"
  | "confirmed"
  | "complete";

export type ConversationState = {
  guests: number | null;
  mealType: MealType | null;
  vegCount: number | null;
  nonVegCount: number | null;
  allergies: string[];
  budget: number | null;
  step: ConversationStep;
  lastPlan: FoodPlan | null;
};

export const initialState: ConversationState = {
  guests: null,
  mealType: null,
  vegCount: null,
  nonVegCount: null,
  allergies: [],
  budget: null,
  step: "guests",
  lastPlan: null,
};

export const initialGreeting =
  "Hi! I can help you plan food for your guests. How many people are you hosting?";

export function summarizeState(state: ConversationState) {
  const vegCount = state.vegCount ?? 0;
  const nonVegCount = state.nonVegCount ?? 0;
  const dietaryLine =
    vegCount > 0 && nonVegCount > 0
      ? `${vegCount} vegetarian guests and ${nonVegCount} non-vegetarian guests`
      : vegCount > 0
        ? `${vegCount} vegetarian guests`
        : `${nonVegCount} non-vegetarian guests`;

  const allergiesText =
    state.allergies.length > 0 ? state.allergies.join(", ") : "no major restrictions";

  return `Perfect! Planning for ${state.guests} guests, ${state.mealType}, a budget of Rs ${state.budget}, with ${dietaryLine} and ${allergiesText}.`;
}
