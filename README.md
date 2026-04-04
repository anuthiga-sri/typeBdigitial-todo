# typebdigital-todo

Monorepo for the todo application: a **React** front end (Vite), a **Node** API (Express), and **shared TypeScript** types used by both.

## Folder structure

```text
.
├── client/                 # React app (Vite + TypeScript)
│   ├── src/                # Components, entry (`main.tsx`), styles
│   ├── index.html
│   └── vite.config.ts
├── server/                 # Express API (TypeScript)
│   ├── src/
│   │   ├── index.ts        # Bootstrap (DB, listen)
│   │   ├── app.ts          # Express app composition
│   │   ├── database/       # MongoDB connection
│   │   ├── common/         # Cross-cutting (middleware, HTTP errors)
│   │   ├── modules/        # Feature modules (e.g. `todos/`)
│   │   └── types/          # Ambient types (Express augmentation)
│   └── dist/               # Compiled output (`npm run build` in server)
├── packages/
│   └── shared/             # `@typebdigital/shared` — shared types & exports
│       └── src/
│           └── index.ts
├── package.json            # npm workspaces + root scripts
└── package-lock.json
```

- **`client/`** — Browser UI. Run the Vite dev server for local development with hot reload.
- **`server/`** — HTTP API. Listens on port **3000** by default (override with `PORT`).
- **`packages/shared/`** — Types (and optional shared runtime code) imported by `client` and `server` via the workspace package `@typebdigital/shared`.

Dependencies are installed **once** at the repository root; npm workspaces link `client`, `server`, and `packages/shared`.

## Prerequisites

- **Node.js** (LTS recommended). Vite 5 and the current toolchain expect a recent Node release; if `npm run build` fails with engine or native binding errors, upgrade Node and reinstall.
- **npm** (comes with Node), version 7 or newer for workspaces.

## How to run the app

From the **repository root**:

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Development**

   - **Front end only** (Vite, default URL shown in the terminal, often `http://localhost:5173`):

     ```bash
     npm run dev
     ```

     Same as `npm run dev:client`.

   - **API only** (Express on `http://localhost:3000`):

     ```bash
     npm run dev:server
     ```

   For full-stack work, run **two terminals**: one for `npm run dev:client` and one for `npm run dev:server`.

3. **Production build**

   ```bash
   npm run build
   ```

   Builds the client (TypeScript check + Vite bundle) and compiles the server to `server/dist/`.

4. **Run the compiled API**

   After a successful `npm run build`:

   ```bash
   npm start
   ```

   This runs `node` on the server’s `dist/` output. Set `PORT` if you need a different port:

   ```bash
   PORT=4000 npm start
   ```
