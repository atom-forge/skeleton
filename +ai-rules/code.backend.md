# System Architecture, Modules, RPC & Prisma ORM

## 1. Overview & Core Philosophy (@atom-forge/laminar)

This system is built using a modular, type-safe architecture based on **Dependency Injection (DI)** and **Laminar Layers**. We strictly separate infrastructure concerns (**Services**) from business logic (**Modules**), and expose functionality through a dedicated **RPC** layer.

Core principles:
- **Explicit Dependencies:** No global state or hidden dependencies. All required components are passed explicitly during initialization.
- **Hierarchical Initialization:** A strict initialization order: **Config → Services → Modules → ApiSupport → Api**. A layer only sees the layers below it.
- **Separation of Concerns:** Services handle infrastructure; Modules handle business logic; Api handlers handle request routing. A Service must never depend on a Module or the Api.
- **Boundary Naming:** Services are organized by technology/capability; Modules and Api groups are organized by business capability.
- **Type Safety:** Layer types are inferred from the factories with laminar's `Unit<typeof factory>`.
- **Testability:** Easily mock dependencies during tests by passing mock containers to factories.

---

## 2. Architectural Layers & Declarations

### 2.1. Services (`server/application/services/`)
- Infrastructure interaction and low-level utilities (`prisma`, `email`, later e.g. `attachment`).
- Grouped by technology or capability. Can only depend on `config` and other Services. Can declare methods as `internal` to hide them from Modules.

### 2.2. Modules (`server/application/modules/`)
- Application business logic. Collections of functions created by a factory (not classes).
- Can depend on `config`, `PublicLayer<Services>`, and other Modules.

### 2.3. ApiSupport (`server/application/api-support/`)
- Request plumbing shared by the Api: `ctx.env` keys (`constants`), the session middleware (`session`), access middlewares (`middlewares`) and actor accessors (`guards`).
- Can depend on `config` and `PublicLayer<Modules>`. No business logic.

### 2.4. Api (`server/application/api/`)
- Exposes module functionality over the network as RPC endpoints (`@atom-forge/rpc`). No business logic lives here.

### 2.5. Server Container
- `server/application/index.ts` (`createApp`) wires the layers; `server/app.ts` reads the config from `.env` (`@atom-forge/env-reader`) and exports the assembled `app`. `server/rpc-handler.ts` serves `app.api` on `/rpc`, `src/hooks.server.ts` routes the requests to it.

### 2.6. Laminar Layer Definition
The layer types and the `define*` / `*CreatorFactory` pairs live in `server/application/layers.ts`. Do not change the layer order; a new kind of layer needs an explicit decision.

---

## 3. Layer Assembly & Factory Patterns

### 3.1. Services Assembly
```typescript
// server/application/services/email.ts
import { defineService } from '../layers';

export type EmailConfig = { email: { smtpUrl: string; from: string } };

export const emailService = defineService((config) => {
	return {
		async send(message: MailMessage) { /* ... */ },
	};
});

// server/application/services/index.ts
import type { Unit } from '@atom-forge/laminar';
import { serviceCreatorFactory } from '../layers';
import { prismaService } from './prisma';
import { emailService } from './email';

export type Services = {
	prisma: Unit<typeof prismaService>;
	email: Unit<typeof emailService>;
};

export const createServices = serviceCreatorFactory({
	prisma: prismaService,
	email: emailService,
});
```

A service's config type (`EmailConfig`) is declared next to it and joined into `Config` in `server/application/index.ts`.

### 3.2. Modules Assembly
```typescript
// server/application/modules/user/index.ts
import { defineModule } from '#server/application/layers';

export const userModule = defineModule((_config, services, _modules) => {
	const db = services.prisma.db();
	return {
		async get(actor: Actor, id: string) {
			if (!actor.isAuthenticated()) return moduleError.permissionDenied();
			return db.orm.public.User.where({ id }).include('roles').first();
		},
	};
});

// server/application/modules/index.ts
export type Modules = {
	user: Unit<typeof userModule>;
};

export const createModules = moduleCreatorFactory({
	user: userModule,
});
```

### 3.3. Api Assembly
```typescript
// server/application/api/user.ts
export const userApi = defineApi((_config, modules, apiSupport) => {
	return {
		get: withSchema(IdSchema).query(async ({ id }, ctx) => {
			const user = await modules.user.get(apiSupport.guards.getActor(ctx), id);
			if (isModuleError(user)) return moduleErrorToRpc(user, messages);
			return expose(user, views.user.card);
		}),
	};
});

// server/application/api/index.ts
export type Api = {
	user: Unit<typeof userApi>;
};

export const createApi = apiCreatorFactory(
	{ user: userApi },
	{
		assemble: (api, _config, _modules, apiSupport) => {
			rpc.middleware(apiSupport.middlewares.authRequiredMiddleware).on(api.user);
			rpc.middleware(apiSupport.session.sessionMiddleware).on(api);
		}
	}
);
```

Middlewares are attached per group in `assemble`, not inside the endpoints. The session middleware is attached last, so it runs first.

### 3.4. Cross-Module Lazy References
To prevent circular dependency issues during initialization, one module must only reference another module's methods **lazily** — inside a returned method body, not at top level of factory function.
- **Correct (Lazy):** `modules.bar.doWork()` inside a method.
- **Incorrect (Eager):** `const barWork = modules.bar.doWork;` at factory top level will fail because `modules.bar` is `undefined` when factory executes.

---

## 4. Module Writing Conventions

### 4.1. Public API = Module Method
The object returned by a module factory contains public methods only. **There are no "internal" module methods** — if a function makes no sense as an outside call, it does not go into the returned object.

Helpers used only inside a module live in the factory closure. A module file exports nothing but its `define*` factory and its types; exporting helper functions or classes from module files is forbidden.

Interfaces and types tightly bound to a module (e.g. `IActor`, `ActorUser`) are declared and exported in the module itself (its file, or a `types.ts` next to it in the module's folder), not in a central types file. Other modules and layers import them **only with `import type`**, to avoid runtime circular dependencies. Implementation classes (e.g. the `Actor` class) are never exported.

A general helper needed by several modules (not tied to one module's business logic) goes to a neutral shared file under `server/lib/`.

### 4.2. Actor Parameter
Every module function that needs an access check takes an `Actor` as its first parameter. The caller (Api handler, CLI command) always passes it — a module never fetches an actor from the session layer on its own.

```typescript
// ✅ Correct
async update(actor: Actor, postId: string, data: UpdateData) { /* ... */ }

// ❌ Wrong — no Actor, the module looks up permissions itself
async update(userId: string, postId: string, data: UpdateData) { /* ... */ }
```

Internal helpers and utilities that need no authorization take no Actor. An intentional bypass says so in its name: `sendReminderUnchecked`.

### 4.3. Error Handling: `moduleError`
Import: `import { moduleError, isModuleError } from '#server/lib/module/module-error'`

A module function signals failure by `return moduleError(...)` — not by `throw` and not with an `{ok: false, error: ...}` structure.

```typescript
// Permission denied
if (!actor.is(post.authorId) && !actor.isAdmin()) return moduleError.permissionDenied();

// Domain / business error
if (!item) return moduleError('ITEM_NOT_FOUND');
if (!rule) return moduleError('INVALID_TRANSITION');

// Standard named helpers
moduleError.permissionDenied()    // → 'PERMISSION_DENIED'
moduleError.userNotFound()        // → 'USER_NOT_FOUND'
moduleError.notFound()            // → 'NOT_FOUND'
```

The `{ok: false, error: 'CODE'}` return pattern is forbidden. Do not catch infrastructure / unexpected errors — let them propagate (they become `INTERNAL_ERROR`). A known database failure (e.g. a unique violation, `uniqueViolation()` in `#server/lib/db-errors`) is translated to a `moduleError`.

### 4.4. Void Return Policy
A mutating function that has no data to return returns `void`. `{ok: true}`, `{success: true}` or any wrapper object is **forbidden** — if it returned and it is not a `moduleError`, it succeeded.

```typescript
// ✅ Correct
async deleteNote(actor: Actor, noteId: string) {
	const note = await db.orm.public.Note.where({ id: noteId }).first();
	if (!note) return moduleError.notFound();
	if (!actor.is(note.authorId) && !actor.isAdmin()) return moduleError.permissionDenied();
	await db.orm.public.Note.where({ id: noteId }).delete();
	// void — no return
}

// ❌ Wrong
async deleteNote(actor: Actor, noteId: string) {
	return {ok: true as const};
}
```

When the caller needs a result, return it directly, without a wrapper: `return {id: user.id};`.

### 4.5. Index Files and Module Structure
- Every subdirectory representing a module/submodule group has its own `index.ts` with one unified `defineModule` factory. Parent index files only import and call the child index factory rather than importing individual submodules directly.
- Configuration types (e.g. `AuthConfig`) are defined and exported in the module index or file that consumes them. Parent indexes only re-export them.

---

## 5. RPC API Conventions (@atom-forge/rpc)

All API calls use `@atom-forge/rpc`. **There are no REST endpoints for business logic.**

- Server side (`server/application/api/`): endpoints with `defineApi`. `.query()` for reads, `.command()` for writes. Every endpoint validates its input with zod.
- **All client–server traffic is RPC.** No new `+server.ts` or form action for business logic. Exceptions (binary file serving for `<img>`/download links, protocol endpoints such as OAuth callbacks) must be justified and documented in `CLAUDE.md`.
- **Schemas live in `shared/schemas/`**: every RPC argument and every form uses the same zod schema. Schemas import `z` from `shared/schemas/zod.ts`, which sets the Hungarian error messages (short sentences, shown under the field); where needed, a check gets its own message (`requiredText(120, 'Add meg a nevet.')`). Shared constants (enum value lists, limits) live there too, and the server imports them from there.
- Endpoint: `withSchema(Schema).query/command(...)` (`#server/lib/api/schema-rpc`) — validates the whole schema (refine/transform too), unlike `rpc.zod(shape)`. A rejected call answers `INVALID_ARGUMENT` + `issues`.
- **Middleware request extraction**: if a request carries a session cookie or user identity, a dedicated middleware reads it from `ctx.request` (standard Web API `Request`) and stores it in `ctx.env`. Endpoint handlers never read cookies or headers directly. See `api-support/session.ts`.

- **Translating `moduleError` in the Api layer**:
Import: `import { moduleErrorToRpc } from '#server/lib/api/rpc-error'`

```typescript
const messages: Record<string, string> = {
	ITEM_NOT_FOUND: 'Az elem nem található.',
	INVALID_TRANSITION: 'Ez az állapotváltás nem megengedett.',
};

update: withSchema(UpdateSchema).command(async (data, ctx) => {
	const result = await modules.foo.update(apiSupport.guards.getActor(ctx), data.id, data);
	if (isModuleError(result)) return moduleErrorToRpc(result, messages, 'A műveletet nem sikerült végrehajtani.');
	// void return: no return statement
}),
```

- **RPC error handling (server)**: use the `rpc.error.*` helpers for application-level errors (`200 OK` HTTP response with an `atomforge.rpc.error` object). Do not use HTTP status codes for business errors.
```typescript
return rpc.error.invalidArgument({message: 'Túl rövid cím.'})        // code: "INVALID_ARGUMENT"
return rpc.error.permissionDenied({message: 'Adminisztrátori jogosultság szükséges.'}) // code: "PERMISSION_DENIED"
return rpc.error.internalError()                                       // code: "INTERNAL_ERROR"
return rpc.error.make('ITEM_NOT_FOUND', 'Az elem nem található.', {id}) // custom code
```

- **RPC error handling (client)**: use `res.isOK()` / `res.isError()` / `res.isError('ERROR_CODE')`.

---

## 6. Prisma 8 (RC) Conventions

> Prisma 8 is **not** Prisma 7: there is no `schema.prisma` / `PrismaClient`. Before any contract, migration or query work load the project skill in `.claude/skills/prisma-8/` (start with `SKILL.md`, then the matching reference). It describes the exact installed version.

### 6.1. Layout & Client
- Contract source: `prisma/contract.prisma` (PSL, first line `// use prisma-8`). Emitted artefacts `prisma/contract.json` and `prisma/contract.d.ts` are generated — never edit them.
- Config: `prisma.config.ts` (`definePrismaConfig({orm: ormConfig({...})})`).
- The only client lives in `server/application/services/prisma.ts`. Modules get it with `const db = services.prisma.db();` — `db` is a **getter function** on purpose: laminar's `PublicLayer` maps object members recursively and would erase the Prisma 8 generic method types.
- Queries: `db.orm.public.<Model>` (ORM lane, default) or `db.sql.public.<table>` (SQL builder). `await ....all()` gives an array; `.first()` a row or null.
- Multi-step writes go into `db.transaction(async (tx) => { ... })`.
- Back-relations are **not** derived: add the list field (`comments Comment[]`) on the parent model when you need `include` or relation filters (`some`/`none`/`every`).
- To-one relations cannot be filtered in `where` (only ordered); filter by the foreign key (`a.userId.in(ids)`).
- To-one `include` results are typed nullable — handle `null`.
- Date columns: `Date` → `'YYYY-MM-DD'` string, `Time` → `'HH:MM:SS'` string, `DateTime` → JS `Date`.
- Every write needs a filter: `.where({id}).update(...)`, `.where({id}).delete()`.

### 6.2. Workflow
- After every contract edit: `bunx prisma contract emit` (the `prebuild` script also runs it).
- Development DB: `bunx prisma db update` (add `--rename Model.old:Model.new` for renames; never reset or drop a database).
- Production: plan a migration with `bunx prisma migration plan --name <slug>`, review `migrations/app/<dir>`, deploy with `bun run db:migrate`.

### 6.3. Schema Conventions
- Primary key: `id Uuid @id @onCreate(uuid(7))`.
- Timestamps: `createdAt temporal.CreatedAt`, `updatedAt temporal.UpdatedAt`.
- Every model and field has a `///` doc comment (English, one sentence).
- Every foreign key column gets an `@@index`. Tables are mapped to snake_case names with `@@map`.
- Enums are text-backed (`@@type("pg/text@1")`); values are the stored strings (e.g. `'admin'`).
- File metadata lives in an `attachments Json?` field managed by `@atom-forge/attachment` (see `code.attachments.md`).

### 6.4. Vite
- Prisma 8, `pg`, `sharp`, `nodemailer` and `lru-cache` are listed in `ssr.external` in `vite.config.ts`. Vite's SSR pre-bundling breaks the Prisma 8 pg driver otherwise. Add new native or driver packages there too.
