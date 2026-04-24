import { restaurants, type MealType, type MenuItem, type Restaurant } from "@/lib/data";
import type { ConversationState, FoodPlan, PlanAdjustment, PlanItem } from "@/lib/state";

function includesSeafoodRestriction(allergies: string[]) {
  return allergies.some((entry) => entry.toLowerCase().includes("seafood"));
}

function chooseRestaurant(state: ConversationState, adjustment: PlanAdjustment) {
  const guests = state.guests ?? 0;
  const budget = state.budget ?? 0;
  const perPersonBudget = budget / Math.max(guests, 1);
  const requiresVeg = (state.vegCount ?? 0) > 0;
  const requiresNonVeg = (state.nonVegCount ?? 0) > 0;
  const seafoodRestricted = includesSeafoodRestriction(state.allergies);

  const mealCompatible = restaurants.filter((restaurant) => {
    if (!state.mealType || !restaurant.mealTypes.includes(state.mealType as MealType)) {
      return false;
    }

    return true;
  });

  const matching = mealCompatible.filter((restaurant) => {
    if (seafoodRestricted && restaurant.hasSeafood) {
      return false;
    }

    if (requiresVeg && !restaurant.supportsVeg) {
      return false;
    }

    if (requiresNonVeg && !restaurant.supportsNonVeg) {
      return false;
    }

    if (adjustment === "cheaper") {
      return restaurant.avgPrice <= perPersonBudget + 80;
    }

    if (adjustment === "premium") {
      return restaurant.avgPrice <= perPersonBudget + 160;
    }

    return restaurant.avgPrice <= perPersonBudget + 120;
  });

  const sorted = matching.sort((left, right) => {
    if (adjustment === "premium") {
      return right.avgPrice - left.avgPrice;
    }

    return left.avgPrice - right.avgPrice;
  });

  return sorted[0] ?? mealCompatible[0] ?? restaurants[0];
}

function pickItems(items: MenuItem[], category: MenuItem["category"], type?: MenuItem["type"]) {
  return items.filter((item) => item.category === category && (!type || item.type === type));
}

function buildItems(state: ConversationState, restaurant: Restaurant, adjustment: PlanAdjustment) {
  const guests = state.guests ?? 0;
  const vegCount = state.vegCount ?? 0;
  const nonVegCount = state.nonVegCount ?? 0;
  const mainsNeeded = Math.max(2, Math.ceil(guests / 2));
  const breadsNeeded = guests;

  const vegMains = pickItems(restaurant.menuItems, state.mealType === "breakfast" ? "breakfast" : "main", "veg");
  const nonVegMains = pickItems(restaurant.menuItems, state.mealType === "breakfast" ? "breakfast" : "main", "non-veg");
  const breads = pickItems(restaurant.menuItems, "bread", "veg");
  const snacks = pickItems(restaurant.menuItems, "snack");

  const items: PlanItem[] = [];
  const vegMainCount = vegCount > 0 ? Math.max(1, Math.ceil(vegCount / 2)) : 0;
  const nonVegMainCount = nonVegCount > 0 ? Math.max(1, Math.ceil(nonVegCount / 2)) : 0;

  const cheaperMode = adjustment === "cheaper";
  const premiumMode = adjustment === "premium";
  const withSnacks = adjustment === "snacks" || premiumMode;

  const orderedVeg = [...vegMains].sort((left, right) => cheaperMode ? left.price - right.price : right.price - left.price);
  const orderedNonVeg = [...nonVegMains].sort((left, right) => cheaperMode ? left.price - right.price : right.price - left.price);

  orderedVeg.slice(0, vegMainCount || 1).forEach((item) => {
    items.push({
      name: item.name,
      quantity: 1,
      unitPrice: item.price,
      lineTotal: item.price,
      type: item.type,
      category: item.category,
    });
  });

  orderedNonVeg.slice(0, nonVegMainCount || 1).forEach((item) => {
    items.push({
      name: item.name,
      quantity: 1,
      unitPrice: item.price,
      lineTotal: item.price,
      type: item.type,
      category: item.category,
    });
  });

  while (items.filter((item) => item.category === "main" || item.category === "breakfast").length < mainsNeeded) {
    const fallback = orderedVeg[0] ?? orderedNonVeg[0];

    if (!fallback) {
      break;
    }

    items.push({
      name: fallback.name,
      quantity: 1,
      unitPrice: fallback.price,
      lineTotal: fallback.price,
      type: fallback.type,
      category: fallback.category,
    });
  }

  const breadChoice = [...breads].sort((left, right) => left.price - right.price)[0];

  if (breadChoice) {
    items.push({
      name: breadChoice.name,
      quantity: breadsNeeded,
      unitPrice: breadChoice.price,
      lineTotal: breadsNeeded * breadChoice.price,
      type: breadChoice.type,
      category: breadChoice.category,
    });
  }

  if (withSnacks && snacks.length > 0) {
    const snackChoice = [...snacks].sort((left, right) => premiumMode ? right.price - left.price : left.price - right.price)[0];

    items.push({
      name: snackChoice.name,
      quantity: Math.max(1, Math.ceil(guests / 4)),
      unitPrice: snackChoice.price,
      lineTotal: snackChoice.price * Math.max(1, Math.ceil(guests / 4)),
      type: snackChoice.type,
      category: snackChoice.category,
    });
  }

  return items;
}

function fitToBudget(items: PlanItem[], budget: number) {
  const trimmed = [...items];

  while (sumPlan(trimmed) > budget && trimmed.length > 2) {
    const removableIndex = trimmed.findIndex((item) => item.category === "snack");

    if (removableIndex >= 0) {
      trimmed.splice(removableIndex, 1);
      continue;
    }

    const breadIndex = trimmed.findIndex((item) => item.category === "bread" && item.quantity > 2);

    if (breadIndex >= 0) {
      const bread = trimmed[breadIndex];
      bread.quantity -= 1;
      bread.lineTotal = bread.quantity * bread.unitPrice;
      continue;
    }

    trimmed.pop();
  }

  return trimmed;
}

function sumPlan(items: PlanItem[]) {
  return items.reduce((total, item) => total + item.lineTotal, 0);
}

export function generateFoodPlan(state: ConversationState, adjustment: PlanAdjustment = "default"): FoodPlan {
  const restaurant = chooseRestaurant(state, adjustment);
  const budget = state.budget ?? 0;
  const guests = state.guests ?? 1;
  const rawItems = buildItems(state, restaurant, adjustment);
  const items = fitToBudget(rawItems, adjustment === "premium" ? budget + 250 : budget);
  const totalCost = sumPlan(items);
  const costPerPerson = Math.round(totalCost / Math.max(guests, 1));

  const reasonParts = [
    `it fits your ${state.mealType} budget`,
    state.vegCount && state.nonVegCount
      ? "it supports both veg and non-veg guests"
      : state.vegCount
        ? "it has strong vegetarian options"
        : "it works well for non-veg preferences",
  ];

  if (includesSeafoodRestriction(state.allergies)) {
    reasonParts.push("it avoids seafood");
  }

  if (adjustment === "cheaper") {
    reasonParts.push("this is the more value-focused option");
  } else if (adjustment === "premium") {
    reasonParts.push("this gives you a more premium spread");
  } else if (adjustment === "snacks") {
    reasonParts.push("I added a light snack to round things out");
  }

  return {
    restaurantName: restaurant.name,
    restaurantRating: restaurant.rating,
    reason: `I've selected this because ${reasonParts.join(", ")}.`,
    items,
    totalCost,
    costPerPerson,
    adjustment,
  };
}

export function renderPlanResponse(state: ConversationState, plan: FoodPlan) {
  return [
    `Great! Here's a plan for your ${state.mealType}:`,
    "",
    plan.reason,
    "",
    "You can place this order now or keep chatting to tweak the choices.",
  ].join("\n");
}
