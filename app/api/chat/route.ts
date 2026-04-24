import { NextResponse } from "next/server";
import { generateFoodPlan, renderPlanResponse } from "@/lib/logic";
import {
  initialState,
  summarizeState,
  type ConversationState,
  type ConversationStep,
} from "@/lib/state";
import type { MealType } from "@/lib/data";

type ChatRequest = {
  message?: string;
  state?: ConversationState;
};

function parseGuestCount(message: string) {
  const match = message.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function parseMealType(message: string): MealType | null {
  const normalized = message.toLowerCase();

  if (normalized.includes("breakfast")) return "breakfast";
  if (normalized.includes("lunch")) return "lunch";
  if (normalized.includes("dinner")) return "dinner";
  if (normalized.includes("snack")) return "snacks";

  return null;
}

function parseDietarySplit(message: string, guests: number | null) {
  const normalized = message.toLowerCase();
  const numbers = normalized.match(/\d+/g)?.map(Number) ?? [];
  const totalGuests = guests ?? 0;

  if (normalized.includes("all veg")) {
    return { vegCount: totalGuests, nonVegCount: 0 };
  }

  if (normalized.includes("all non")) {
    return { vegCount: 0, nonVegCount: totalGuests };
  }

  const vegMention = normalized.includes("veg");
  const nonVegMention = normalized.includes("non");

  if (numbers.length >= 2 && vegMention && nonVegMention) {
    return { vegCount: numbers[0], nonVegCount: numbers[1] };
  }

  if (numbers.length >= 1 && vegMention && normalized.includes("rest")) {
    const vegCount = numbers[0];
    return { vegCount, nonVegCount: Math.max(totalGuests - vegCount, 0) };
  }

  if (numbers.length >= 1 && nonVegMention && normalized.includes("rest")) {
    const nonVegCount = numbers[0];
    return { vegCount: Math.max(totalGuests - nonVegCount, 0), nonVegCount };
  }

  return null;
}

function parseAllergies(message: string) {
  const normalized = message.trim().toLowerCase();

  if (!normalized || normalized === "none" || normalized === "no" || normalized === "no allergies") {
    return [];
  }

  if (normalized.startsWith("no ")) {
    return [normalized];
  }

  return normalized
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBudget(message: string) {
  const match = message.replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function nextStep(current: ConversationStep): ConversationStep {
  switch (current) {
    case "guests":
      return "mealType";
    case "mealType":
      return "dietarySplit";
    case "dietarySplit":
      return "allergies";
    case "allergies":
      return "budget";
    case "budget":
      return "confirmed";
    default:
      return "complete";
  }
}

function promptForStep(step: ConversationStep) {
  switch (step) {
    case "mealType":
      return "Great. Is this for breakfast, lunch, dinner, or snacks?";
    case "dietarySplit":
      return "Got it. Do you have a mix of vegetarian and non-vegetarian guests?";
    case "allergies":
      return "Any allergies or food restrictions I should be aware of? (e.g. no seafood)";
    case "budget":
      return "What's your total budget for this order?";
    default:
      return "Tell me a bit more so I can tighten the plan.";
  }
}

function detectCommand(message: string) {
  const normalized = message.trim().toLowerCase();

  if (normalized.includes("cheaper")) return "cheaper";
  if (normalized.includes("premium")) return "premium";
  if (normalized.includes("snack")) return "snacks";
  if (normalized.includes("place order")) return "place-order";

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequest;
  const message = (body.message ?? "").trim();
  const currentState = body.state ?? initialState;

  await new Promise((resolve) => setTimeout(resolve, 700));

  if (!message) {
    return NextResponse.json({
      assistantMessage: "I didn't catch that. Please send a reply so I can continue the plan.",
      state: currentState,
      plan: currentState.lastPlan,
    });
  }

  if (currentState.step === "complete" && currentState.lastPlan) {
    const command = detectCommand(message);

        if (command === "place-order") {
          return NextResponse.json({
            assistantMessage:
          "Done. I've marked this order as ready to place. Next step: confirm delivery details and checkout.",
            state: currentState,
            plan: currentState.lastPlan,
          });
        }

    if (command === "cheaper" || command === "premium" || command === "snacks") {
      const plan = generateFoodPlan(currentState, command);
      const updatedState: ConversationState = {
        ...currentState,
        lastPlan: plan,
      };

      return NextResponse.json({
        assistantMessage: renderPlanResponse(updatedState, plan),
        state: updatedState,
        plan,
      });
    }

    return NextResponse.json({
      assistantMessage:
        "I can adjust the current plan. Try: make it cheaper, add snacks, make it premium, or place order.",
      state: currentState,
      plan: currentState.lastPlan,
    });
  }

  const updatedState: ConversationState = {
    ...currentState,
    allergies: [...currentState.allergies],
  };

  if (currentState.step === "guests") {
    const guests = parseGuestCount(message);

    if (!guests || guests <= 0) {
      return NextResponse.json({
        assistantMessage: "Please share the number of guests as a number, like 6 or 12.",
        state: currentState,
      });
    }

    updatedState.guests = guests;
  }

  if (currentState.step === "mealType") {
    const mealType = parseMealType(message);

    if (!mealType) {
      return NextResponse.json({
        assistantMessage: "Please choose one of these: breakfast, lunch, dinner, or snacks.",
        state: currentState,
      });
    }

    updatedState.mealType = mealType;
  }

  if (currentState.step === "dietarySplit") {
    const split = parseDietarySplit(message, currentState.guests);

    if (!split) {
      return NextResponse.json({
        assistantMessage:
          "Please tell me the split like '2 veg, rest non-veg' or 'all veg'.",
        state: currentState,
      });
    }

    updatedState.vegCount = split.vegCount;
    updatedState.nonVegCount = split.nonVegCount;
  }

  if (currentState.step === "allergies") {
    updatedState.allergies = parseAllergies(message);
  }

  if (currentState.step === "budget") {
    const budget = parseBudget(message);

    if (!budget || budget <= 0) {
      return NextResponse.json({
        assistantMessage: "Please share the total budget as a number, like 2000.",
        state: currentState,
      });
    }

    updatedState.budget = budget;
  }

  const upcomingStep = nextStep(currentState.step);
  updatedState.step = upcomingStep;

  if (upcomingStep === "confirmed") {
    const confirmation = summarizeState(updatedState);
    const plan = generateFoodPlan(updatedState);
    const completedState: ConversationState = {
      ...updatedState,
      step: "complete",
      lastPlan: plan,
    };

    return NextResponse.json({
      assistantMessage: `${confirmation}\n\n${renderPlanResponse(completedState, plan)}`,
      state: completedState,
      plan,
    });
  }

  return NextResponse.json({
    assistantMessage: promptForStep(upcomingStep),
    state: updatedState,
  });
}
