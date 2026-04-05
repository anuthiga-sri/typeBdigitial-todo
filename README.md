# typebdigital-todo

Monorepo: React (Vite) client, Express API, shared TypeScript package.

---

## Run the application

### Prerequisites (system-level)

- **Node.js** (LTS recommended) and **npm** (v7+ for workspaces)
- **MongoDB** reachable at the URI you put in `server/.env` (e.g. local `mongod` on the default port)

### Environment

- Backend only: copy `server/.env.example` to `server/.env` and adjust values if needed (`MONGODB_URI`, `PORT`).

### Install dependencies

- From the **repository root**:

  ```bash
  npm ci
  ```

  (`npm install` also works; `npm ci` is for clean installs from the lockfile.)

### Start

- **Terminal 1 — API**

  ```bash
  npm run dev:server
  ```

- **Terminal 2 — client**

  ```bash
  npm run dev:client
  ```

### Access

- **UI:** open the URL Vite prints (usually **http://localhost:5173**). It proxies **`/api`** to the server (**http://localhost:3000** by default).

---

## Contribute / extend the codebase

### Client (`client/src/`)

- **`features/<name>/`** — feature-specific UI, API calls, hooks, and small domain helpers (e.g. `features/todos/`).
- **`shared/`** — reusable UI primitives (`components/ui`) and utilities (`lib`) used across features.
- **`app/`** — app shell, providers, routing entry wiring.

Add a new product area by adding a **`features/<new-feature>/`** folder and keeping feature code inside it; lift only truly shared pieces to **`shared/`**.

### Server (`server/src/`)

- **`modules/<name>/`** — one folder per domain (e.g. `modules/todos/`): routes, DTOs, model, serializer, and **`services/`** (one file per operation or small group).
- **`common/`** — shared middleware, errors, cross-cutting pieces.
- **`database/`** — DB connection.

Add a new API area with a new **`modules/<feature>/`** and register routes in the app bootstrap.

### Shared types

- **`packages/shared/`** — types and exports imported as **`@typebdigital/shared`** from client and server. Extend here when both sides need the same contract.
