# Skeleton

A fullstack SvelteKit starter with a batteries-included architecture: typed RPC, Prisma over PostgreSQL, Tailwind, and an AI-assisted development workflow out of the box.

## Stack

- **[SvelteKit](https://kit.svelte.dev/)** — fullstack framework (Svelte 5)
- **[Prisma](https://www.prisma.io/)** + **PostgreSQL** — database ORM with connection pooling via `pg`
- **[@atom-forge/rpc](https://github.com/atom-forge/rpc)** — type-safe RPC between server and client
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first styling
- **@atom-forge/ui** — shared UI component library
- **Bun** — runtime and package manager

## Architecture

The project follows a strict layered architecture based on Dependency Injection and the Factory Pattern:

```
Config → Services → Modules → Api → App
```

- **Services** — infrastructure (DB client, storage, etc.)
- **Modules** — business logic
- **Api** — RPC endpoint handlers (no business logic)
- **App** — assembled in `hooks.server.ts`, injected into `event.locals.app`

See `work/contribution/rules/architecture.md` for the full spec.

## Getting Started

### 0. Create a new project from this template

```sh
bunx degit atom-forge/skeleton my-app
cd my-app
git init
```

### 1. Install dependencies

```sh
bun install
```

### 2. Configure environment

```sh
cp .env.example .env
```

Edit `.env` and set at minimum:

```
DATABASE_URL=postgresql://user:password@localhost:5432/skeleton
```

### 3. Set up the database

```sh
bun run db:create      # create the PostgreSQL database
bun run db:migrate     # apply migrations
bun run db:generate    # generate Prisma client
```

### 4. Start the dev server

```sh
bun run dev
```

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run check` | TypeScript + Svelte type checking |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:generate` | Regenerate Prisma client after schema changes |
| `bun run db:studio` | Browse the database in the browser |
| `bun run db:reset` | Reset database and re-run all migrations |

## Project Structure

```
src/
├── config.ts                   # Reads env vars, builds Config
├── hooks.server.ts             # Creates App singleton, wires RPC
└── lib/app/
    ├── index.ts                # App type + createApp()
    ├── config.ts               # Config type
    ├── services/               # Infrastructure layer
    ├── modules/                # Business logic layer
    └── api/                    # RPC endpoint handlers

work/
├── task.*.md                   # Active tasks
├── plan.*.md                   # Active plans
├── contribution/               # AI rules and SOPs
├── journal/                    # Archived tasks and plans
└── docs/                       # Guides and specifications
```

## AI Development Workflow

This project includes a structured workflow for AI-assisted development under `work/contribution/`. Read `work/contribution/overview.md` before starting any task.

Key commands:
- `create task <description>` — define a new task
- `close task` — wrap up and archive a task
- `close plan <filename>` — archive a completed plan
