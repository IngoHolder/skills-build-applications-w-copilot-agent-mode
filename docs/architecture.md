# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep page-specific UI in React components and use React Router for navigation, Bootstrap for layout, and the shared API client for typed requests to relative `/api` paths. Components own form state and present loading, empty, and error states; business rules and persistence stay out of the browser.
- Logic tier decision: Keep Express routes thin and delegate validation and capability behavior to services. Return the documented JSON response shapes, reject invalid input with deliberate 4xx responses, and let centralized error middleware handle unexpected failures.
- Data tier decision: Use Mongoose schemas with required fields, defaults, references, and model-level validation. Keep user/team references consistent, and seed stable demo records with idempotent upserts that preserve unrelated application data.
- Activity tracking approach: Validate the request shape, positive minutes, and well-formed IDs before querying; require the referenced user and team to exist. Ignore client-supplied calculated fields, assign `occurredAt` on the server, and award one point per minute.
- Team management approach: Trim and require the team name, preserve the submitted mascot, default members to an empty array, and validate/deduplicate member IDs against existing users before storing references.
- Leaderboard approach: Aggregate activity points by team, include teams with no activity at zero points, and sort by total points descending with team name as a deterministic tie-breaker. Assign sequential 1-based ranks after sorting.
- Workout suggestions approach: Match the URL email to a seeded user without regard to case and return 404 when none exists. Prefer workouts matching the user's goal, then use activities from the last 30 days to identify a relevant focus; return a deterministic, data-backed reason with each suggestion.

## Test plan

Observed results for the current starter implementation:

- Data tier: `npm run test:data --prefix octofit-tracker/backend` — 1 of 5 tests passed; the four failures show that the user, team, activity, and workout schemas do not yet enforce their required fields. The seed-data test passes.
- API: `npm run test:api --prefix octofit-tracker/backend` — all 4 tests failed. Activity and team creation are still unimplemented (they return `501` instead of validating input); the leaderboard returns no entries; workout suggestions omit the required explanation. These failures indicate unfinished service behavior.
- Frontend: `npm test --prefix octofit-tracker/frontend` — all 15 tests failed. The pages do not yet render the expected API data or user-specific suggestions, and they lack the required accessible loading, empty, and error states.
- Backend build: `npm run build --prefix octofit-tracker/backend` — passed; TypeScript reports no build errors.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` — passed; TypeScript compilation and the Vite production build succeed.
