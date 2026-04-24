# Platter

Platter is a simple full-stack Next.js prototype for guided food ordering. It helps a host plan meals for a group through a conversational flow: gathering guest count, meal type, dietary split, restrictions, and budget before generating an order recommendation.

The product experience is chat-first, but the decision making is fully deterministic. There are no external AI APIs, no vector database, and no real restaurant integrations. The assistant behavior is simulated with backend state management and rule-based planning logic.

## What It Does

- Guides the user step-by-step through a food planning conversation
- Stores conversation state across each chat turn
- Generates a restaurant recommendation from mock restaurant and menu data
- Builds an order plan based on budget, dietary split, and allergy constraints
- Lets the user continue chatting to adjust the recommendation
- Shows the final recommendation as a structured order card with pricing and actions

## Guided Chat Flow

The assistant walks the user through these stages:

1. Number of guests
2. Meal type
3. Vegetarian and non-vegetarian split
4. Allergies or food restrictions
5. Total budget
6. Final confirmation and recommendation

After the initial plan is generated, the user can continue with follow-up commands like:

- `make it cheaper`
- `add snacks`
- `make it premium`
- `place order`

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Route Handler API (`/api/chat`)
- CSS via a single global stylesheet

## How It Works

### Frontend

The frontend lives in the App Router and includes:

- A landing page with product positioning
- A dedicated chat page for the guided conversation
- Scrollable chat UI with assistant and user messages
- Quick replies for structured steps
- A result card for the recommended order

### Backend

The backend logic is handled through `app/api/chat/route.ts`.

Each request sends:

- The user message
- The current conversation state

The API returns:

- The assistant reply
- The updated state
- An optional food plan

### Decision Engine

The planner uses mock restaurant data and deterministic rules to:

- Compute budget per person
- Filter restaurants by meal type, budget, dietary support, and restrictions
- Build a balanced cart of veg and non-veg items
- Add breads based on guest count
- Adjust the plan for premium, cheaper, or snack-oriented variants

## Project Structure

```text
app/
  api/chat/route.ts     Chat API and guided flow logic
  chat/page.tsx         Conversational UI
  layout.tsx            App metadata and shell
  page.tsx              Landing page
  globals.css           Styling

lib/
  data.ts               Mock restaurants and menus
  logic.ts              Planning and recommendation engine
  state.ts              Shared conversation and plan types
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Production Build

To verify the app builds successfully:

```bash
npm run build
```

To start the production server locally:

```bash
npm run start
```

## Deploying To Vercel

You can deploy this project with the Vercel CLI:

```bash
npx vercel deploy
```

Or connect the GitHub repository to Vercel and deploy through the Vercel dashboard.

## Notes

- All restaurant and menu data is mocked
- The assistant is intentionally deterministic
- The app is designed to feel like a real product while staying lightweight and easy to understand
