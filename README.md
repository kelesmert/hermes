# Hermes(Will be updated)

Hermes is a lightweight Manufacturing Execution System (MES) MVP developed as part of a graduation project. It aims to provide a modular solution with a Node.js/Express backend, a React frontend, and a MongoDB database, covering user authentication, role/permission management, machine monitoring, reporting, and AI-supported insights.

## Status

- Backend: Auth + RBAC, Users, Access Control, Machines, Parts, OEE/Telemetry, Board (dashboard metrics API), and Production (JobOrder + ProductionEvent) domains are ready. The `data-gen` and `job-sim` scripts generate simulation data.
- Frontend: Login, Users/Roles/Permissions, Machines, Parts, Dashboard, Monitoring, and Production/Job Orders screens are connected to real APIs.
- Reports + export, Audit log UI, AI insights module, cookie-based token management, and test/lint setup are planned on the roadmap.
- All required rules are under `docs/standart/`; decision logs and requirements are kept up to date.

## Tech Stack

| Layer    | Technologies                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Backend  | Node.js (LTS), Express 5, MongoDB + Mongoose, JWT, bcryptjs                                                                            |
| Frontend | Vite + React (JS), MUI, React Router v6, TanStack Query, axios, React Hook Form + Zod, TanStack Table + MUI, Recharts, react-hot-toast |
| Shared   | dotenv, nodemon, `@/` import alias, ESLint (frontend), Prettier (planned)                                                              |

## Repository Structure

```text
hermes/
├── backend/        # Node.js + Express API
├── frontend/       # React application (Vite + React)
└── docs/           # Full project documentation
```

### Documentation Folders

- `docs/project-guidelines.md` – Main guide; communication rules, architecture summaries, documentation map.
- `docs/meta/context-initialization-prompt.md` – Context loading guide for new sessions, including which files should be read.
- `docs/standart/` – Required standards for backend, frontend, technical decisions, and naming.
- `docs/logs/` – Decision logs, technical logs, and context window records.
- `docs/specs/` – Requirements, thesis report, and phase plan.
- `docs/tasks/` – Checklist where completed items remain marked.
- `docs/meta/` – File overview, learning guide, and maintenance guide.

Before starting any work, follow the instructions in `docs/project-guidelines.md`. If a rule needs to change, update the related file under `docs/standart/`.

## Running the Backend

1. Requirements: Node.js LTS and MongoDB.

2. Environment file:

   ```bash
   cd backend
   cp .env.example .env
   # Fill in the Mongo/seed/JWT values in .env
   ```

3. Install dependencies and seed the database:

   ```bash
   npm install
   npm run seed
   ```

   > The seed script creates the default roles and two users:
   >
   > - Master account: `admin / ChangeMe123!`
   > - Sys test account: `sys / syssys`

4. Start the development server:

   ```bash
   npm run dev
   ```

   - Health check: `GET http://localhost:5000/api/health`
   - Auth test: `POST http://localhost:5000/api/auth/login`

5. Optional simulation:

   ```bash
   npm run data:gen
   npm run job:sim
   ```

## Running the Frontend

1. Requirement: Node.js LTS.

2. Environment file:

   ```bash
   cd frontend
   cp .env.example .env
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   - Default URL: `http://localhost:5173/`
   - Log in with a username and password on the login screen, for example `admin / ChangeMe123!`. Dashboard, Monitoring, and Production screens use real API data.

> Note: For UI decisions and required rules, check `docs/standart/frontend-decisions.md`. Update the related documentation before adding a new dependency.

## Contribution and Workflow

1. Read `docs/project-guidelines.md` and the current rules under `docs/standart/*.md`.
2. If a decision needs to change, update the relevant standard document first, then implement the change.
3. For every new technology or architectural decision, add an entry to `docs/logs/decision-log.md` or `docs/logs/tech-decision-logs.md`.
4. Track tasks in `docs/tasks/project-checklist.md`; remember to mark completed items.

## License

No license has been specified for this project. Usage terms are subject to the project owner’s direction.
