"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  initialGreeting,
  initialState,
  type ConversationState,
  type FoodPlan,
} from "@/lib/state";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
  plan?: FoodPlan | null;
};

function formatCurrency(value: number) {
  return `Rs ${value}`;
}

function PlanCard({
  plan,
  onAction,
}: {
  plan: FoodPlan;
  onAction: (value: string) => void;
}) {
  return (
    <div className="plan-card">
      <div className="plan-card-head">
        <div>
          <div className="plan-card-label">Recommended restaurant</div>
          <h3>{plan.restaurantName}</h3>
        </div>
        <div className="plan-rating">★ {plan.restaurantRating.toFixed(1)}</div>
      </div>

      <div className="plan-items">
        {plan.items.map((item, index) => (
          <div className="plan-item-row" key={`${item.name}-${item.category}-${index}`}>
            <div>
              <strong>{item.quantity > 1 ? `${item.quantity} x ${item.name}` : item.name}</strong>
              <span>
                {item.type === "veg" ? "Veg" : "Non-veg"} · {item.category}
              </span>
            </div>
            <div className="plan-item-price">{formatCurrency(item.lineTotal)}</div>
          </div>
        ))}
      </div>

      <div className="plan-total">
        <div>
          <strong>{formatCurrency(plan.totalCost)}</strong>
          <span>{formatCurrency(plan.costPerPerson)} per person</span>
        </div>
      </div>

      <div className="plan-actions">
        <button className="plan-primary-action" onClick={() => onAction("place order")} type="button">
          Place Order
        </button>
        <button className="plan-secondary-action" onClick={() => onAction("make it cheaper")} type="button">
          Make it cheaper
        </button>
        <button className="plan-secondary-action" onClick={() => onAction("add snacks")} type="button">
          Add snacks
        </button>
        <button className="plan-secondary-action" onClick={() => onAction("make it premium")} type="button">
          Make it premium
        </button>
      </div>

      <p className="plan-footnote">Or keep chatting below to change guests, preferences, or budget.</p>
    </div>
  );
}

const quickReplyMap: Partial<Record<ConversationState["step"], string[]>> = {
  mealType: ["Breakfast", "Lunch", "Dinner", "Snacks"],
  dietarySplit: ["2 veg, rest non-veg", "All veg", "All non-veg"],
  allergies: ["No seafood", "No allergies", "No spicy food"],
  budget: ["1500", "2000", "3000"],
  complete: ["make it cheaper", "add snacks", "make it premium", "place order"],
};

export default function ChatPage() {
  const [state, setState] = useState<ConversationState>(initialState);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: initialGreeting,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading]);

  async function sendMessage(rawMessage?: string) {
    const message = (rawMessage ?? input).trim();

    if (!message || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", text: message },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, state }),
      });

      const data = (await response.json()) as {
        assistantMessage: string;
        state: ConversationState;
        plan?: FoodPlan | null;
      };

      setState(data.state);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: data.assistantMessage,
          plan: data.plan ?? null,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text: "Something went wrong while building the plan. Please try again.",
        },
      ]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  const quickReplies = quickReplyMap[state.step] ?? [];

  return (
    <main className="shell chat-shell">
      <section className="chat-card">
        <header className="chat-header">
          <div>
            <h1>Platter</h1>
            <p>Guided food planning for gatherings.</p>
          </div>
          <div className="chat-status">
            {state.step === "complete" ? "Plan ready" : `Step: ${state.step}`}
          </div>
        </header>

        <div className="messages" ref={messagesRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`bubble-row ${message.role === "user" ? "user" : "assistant"}`}
            >
              <div className={`bubble ${message.role}`}>
                {message.plan ? <div className="plan-label">Recommended Plan</div> : null}
                {message.text}
                {message.plan ? <PlanCard plan={message.plan} onAction={(value) => void sendMessage(value)} /> : null}
              </div>
            </div>
          ))}

          {isLoading ? (
            <div className="bubble-row assistant">
              <div className="bubble assistant">
                Analyzing your requirements...
                <div className="typing" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="composer-wrap">
          {quickReplies.length > 0 ? (
            <div className="quick-replies">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  className="quick-reply"
                  onClick={() => void sendMessage(reply)}
                  type="button"
                  disabled={isLoading}
                >
                  {reply}
                </button>
              ))}
            </div>
          ) : null}

          <form className="composer" onSubmit={handleSubmit}>
            <input
              aria-label="Type your message"
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                state.step === "complete"
                  ? "Try 'make it cheaper' or 'place order'"
                  : "Reply here"
              }
              value={input}
            />
            <button disabled={isLoading || !input.trim()} type="submit">
              Send
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
