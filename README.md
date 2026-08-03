# Step Length Project — NestJS Server

SE-DSSW 26 final project. A NestJS server that:

- handles **operator authentication** (JWT-based login, guards on every protected route)
- manages **candidates and recording sessions** for the step-length experiment, with
  **file-based persistence** behind a swappable storage interface (see "Architecture" below)
- **proxies requests to the Experiment API** (provided by David) so the frontend only ever
  needs to talk to this server
- serves **OpenAPI docs** as both a web UI (`/api`) and raw YAML/JSON files

## Project structure

```
src/
  auth/          operator login, JWT guard, current-operator decorator
  data/          file-based storage layer (the only place that touches the filesystem)
  candidates/    candidate CRUD + pseudonymization
  sessions/      recording sessions (one per candidate visit, holds a list of measurements)
  measurements/  individual condition measurements within a session (steps, lip aperture, volume)
  experiment/    guarded proxy to David's Experiment API
  main.ts        bootstrap, CORS, Swagger setup
test/
  app.e2e-spec.ts  end-to-end test: login -> guarded routes -> candidate creation
```

### Why it's split this way

The kickoff brief asked for a clear concept of a recording **session** containing multiple
**conditions**, file-based persistence that can later be swapped for a real backend without
touching the rest of the app, and pseudonymized candidate data. That maps onto:

- `data/` — a `StorageProvider` interface with one implementation, `FileStorageProvider`,
  that reads/writes a single JSON file. Every other module talks to `DataService`, never to
  the filesystem directly. Swapping to a real database later means writing one new class.
- `candidates/` — the operator provides some real-world identifier (e.g. patient number),
  which is hashed into a pseudonym (`getPseudoName()`) and **never stored**. Only the
  pseudonym, date of birth, gender, height, and status are persisted.
- `sessions/` + `measurements/` — creating a session takes a candidate and a list of
  conditions (`small` / `middle` / `big`) and seeds one pending measurement per condition, so
  the operator has a clear, ordered worklist. Measurements can be started, have samples
  appended (steps / lip aperture / speaking volume), completed, aborted, or deleted.
- `experiment/` — David's API (`experiment-api` repo) has no auth of its own and stores
  everything in memory. This proxy mirrors his routes exactly (`/experiments`,
  `/exercises`, `/exercises/:id/recording/start`, etc.) behind our `JwtAuthGuard`, so the
  CPA frontend can be pointed at this server instead of his and keep working unmodified.

**Known gap / next step:** our own sessions and David's experiments/exercises aren't wired
together yet (e.g. creating a session doesn't automatically create an experiment on his
API). Right now they're two parallel concerns — our bookkeeping and his raw recording
proxy — which was enough to satisfy both requirements sets in the time available. Linking
them (e.g. an operator starting a measurement also calls `POST /exercises/:id/recording/start`
on the proxy) is a natural follow-up.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` if needed — in particular `EXPERIMENT_API_BASE_URL` should point at wherever
David's `experiment-api` server is running.

## Running

```bash
# development (auto-reload)
npm run start:dev

# production
npm run build
npm run start:prod
```

The server listens on `http://localhost:3000` by default (`PORT` env var to change it).

- Swagger UI: `http://localhost:3000/api`
- Raw OpenAPI spec: written to `openapi/openapi.json` and `openapi/openapi.yaml` on every
  boot (also servable directly from Swagger UI's "download" link)

## Login credentials

A default operator account is seeded automatically the first time the server runs (i.e.
the first time `data/store.json` is created):

```
username: operator
password: operator123
```

Use this to log in via `POST /auth/login`, then send the returned `access_token` as
`Authorization: Bearer <token>` on every other request.

## Running the Experiment API alongside this server

David's API (https://github.com/davidlinner/experiment-api) needs to be running for the
proxy routes (`/experiments`, `/exercises`, ...) to work:

```bash
git clone https://github.com/davidlinner/experiment-api.git
cd experiment-api
npm install
PORT=3001 npm start
```

Then set `EXPERIMENT_API_BASE_URL=http://localhost:3001` in this project's `.env`.

## Tests

```bash
npm run test        # unit tests
npm run test:e2e     # end-to-end tests (spins up the real Nest app in-memory)
```

## Data model

See `src/data/data.types.ts` for the full shapes. Summary:

- **Candidate**: pseudonymized identity + demographics (`pseudoName`, `dateOfBirth`,
  `gender`, `height`, `status: 'H' | 'PD'`)
- **Session**: belongs to one candidate + operator, holds an ordered list of measurements
- **Measurement**: one condition (`small` / `middle` / `big`) within a session, with its
  recorded steps, lip apertures, and speaking volumes

## Known limitations

- File-based storage is not safe for concurrent writes (fine for a single-operator dev
  setup; would need a real database or file locking for production use)
- The Experiment API proxy assumes David's server has no auth of its own (true as of this
  submission) — if that changes, the API key header just needs to be added in
  `experiment.service.ts`
- No input validation pipes (e.g. `class-validator`) yet — a bad request body currently
  fails with a generic error rather than a helpful 400
