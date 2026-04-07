---
tags: [backend, api, frontend]
applies_to: Any task that creates or modifies services, modules, routes, or API endpoints.
---

# System Architecture: A Comprehensive Guide for LLMs and Developers

## 1. Overview & Core Philosophy

This document outlines a modular, scalable, and testable system architecture based on **Dependency Injection (DI)** and the **Factory Pattern**. The system strictly separates low-level infrastructure concerns (**Services**) from high-level business logic (**Modules**), and exposes functionality through a dedicated **Api** layer.

The core principles are:
- **Explicit Dependencies:** No global state or hidden dependencies. All required components are passed explicitly during initialization.
- **Hierarchical Initialization:** A strict and clear initialization order: **Config → Services → Modules → Api → App**.
- **Separation of Concerns:** Services handle infrastructure; Modules handle business logic; Api handlers handle request routing. A Service must never depend on a Module or Api.
- **Type Safety:** Leveraging TypeScript's inference to create robust and maintainable types, primarily using the `ReturnType` utility type.
- **Testability:** The architecture is designed from the ground up to be easily testable by allowing dependencies to be mocked during tests.

---

## 2. Architectural Layers

The system comprises four primary layers, initialized in a strict sequence.

### 2.1. Services
- **Role**: Responsible for infrastructure interaction and low-level utility functions (e.g., database clients, logging, API clients).
- **Knowledge**: Completely unaware of business logic (Modules) and Api.
- **Dependencies**: Can only depend on `config` and other Services.

### 2.2. Modules
- **Role**: Contain the application's business logic. They are the "brains" of the operation.
- **Structure**: Not classes. Modules are **collections of functions** created by a factory. The factory returns a plain object where each field is a public business operation.
- **Encapsulation**: Internal helper functions are encapsulated within the factory's closure and are not exposed publicly.
- **Dependencies**: Can depend on `config`, Services, and other Modules.

### 2.3. Api
- **Role**: Expose module functionality over the network as RPC endpoints. No business logic lives here — Api handlers only call module methods and return results.
- **Dependencies**: Can depend on `config`, Services, and Modules.

### 2.4. App
- **Role**: The assembled application object. Created by `createApp(config)`, it holds all four layers and is the single value passed around at runtime.
- **Lifecycle**: Created once, in `hooks.server.ts`, and injected into `event.locals.app`.

---

## 3. Core Patterns & Conventions

### 3.1. Factory Functions & Dependency Injection

Every Service, Module, and Api handler is created by a dedicated **factory function**. The parameter list of these factories is **fixed** — no additional parameters are ever added.

#### 3.1.1. Service Factory

A service factory receives exactly two arguments: `config` first, then `services`.

```typescript
// src/lib/app/services/foo.ts
import type {Config} from "$lib/app/config";
import type {Services} from "$lib/app/services";

export type FooConfig = { foo: { apiKey: string } };

export function createFooService(config: Config, services: Services) {
    const client = new FooClient(config.foo.apiKey);

    return {
        async fetchData(id: string) {
            return client.get(id);
        },
    };
}
```

#### 3.1.2. Module Factory

A module factory receives exactly three arguments: `config` first, then `services`, then `modules`.

```typescript
// src/lib/app/modules/bar.ts
import type {Config} from "$lib/app/config";
import type {Services} from "$lib/app/services";
import type {Modules} from "$lib/app/modules";

export function createBarModule(config: Config, services: Services, modules: Modules) {
    // Internal, private helper functions
    function privateHelper() { /* ... */ }

    // Public API returned by the factory
    return {
        async doSomething() {
            await services.foo.fetchData("123");
            const result = await modules.baz.anotherOperation();
            return result;
        },
    };
}
```

**Rule:** Business logic should only be executed inside the returned methods, not during the factory's initial execution phase. The factory is for setup and initialization only.

#### 3.1.3. Api Factory

An Api factory receives exactly three arguments: `config` first, then `services`, then `modules`. It uses the `rpc` helper from `@atom-forge/rpc` to define endpoints.

```typescript
// src/lib/app/api/bar.ts
import {rpc} from '@atom-forge/rpc';
import {z} from 'zod';
import type {Config} from "$lib/app/config";
import type {Services} from "$lib/app/services";
import type {Modules} from "$lib/app/modules";

export function createBarApi(config: Config, services: Services, modules: Modules) {
    return {
        all: rpc.get(async (_args: void, _ctx) => {
            return modules.bar.getAll();
        }),
        get: rpc
            .zod({id: z.string()})
            .get(async ({id}, _ctx) => {
                return modules.bar.getById(id);
            }),
    };
}
```

#### 3.1.4. Submodules

A module does not have to be flat. If a module grows large, it can be decomposed into submodule factories. The submodule's return value becomes part of the parent's public API.

```typescript
// src/lib/app/modules/courses/sessions.ts
export function createSessionsSubmodule(config: Config, services: Services, modules: Modules) {
    return {
        async create(courseId: string, data: SessionData) { /* ... */ },
        async delete(sessionId: string) { /* ... */ },
    };
}

// src/lib/app/modules/courses/index.ts
export function createCoursesModule(config: Config, services: Services, modules: Modules) {
    const sessions = createSessionsSubmodule(config, services, modules);

    return {
        sessions,                              // accessible as: modules.courses.sessions
        async getById(id: string) { /* ... */ },
    };
}
```

**Rule:** If a submodule appears in the returned object, it is part of the public API and other modules may call it.

**File layout for a decomposed module:**
```
src/lib/app/modules/courses/
├── index.ts       # parent factory — the only file registered in Modules
├── sessions.ts    # submodule
└── groups.ts      # submodule
```

---

### 3.2. Composite `Config` Type

Each component that requires configuration defines and exports its own `...Config` type. The central `Config` for the application is an **intersection** of all these individual types. This ensures each component's configuration is self-contained and prevents naming collisions.

```typescript
// src/lib/app/services/prisma.ts
export type PrismaConfig = { database: PoolConfig };

// src/lib/app/config.ts
import type {PrismaConfig} from "$lib/app/services/prisma";
import type {AuthConfig} from "$lib/app/modules/auth";

export type Config =
    & PrismaConfig
    & AuthConfig;
```

---

### 3.3. Type Inference with `ReturnType`

To ensure maximum type safety and reduce boilerplate, the `Services`, `Modules`, and `Api` container types are generated automatically from the factory functions' return types.

- **DO NOT** write interfaces for services, modules, or api handlers by hand.
- **DO NOT** add an explicit return type annotation to a factory function. Let TypeScript infer it.

```typescript
// src/lib/app/services/index.ts
import type {Config} from "$lib/app/config";
import {createPrismaService} from './prisma';

export type Services = {
    prisma: ReturnType<typeof createPrismaService>;
};

export function createServices(config: Config): Services {
    const services = {} as Services;
    services.prisma = createPrismaService(config, services);
    return services;
}
```

```typescript
// src/lib/app/modules/index.ts
import type {Config} from "$lib/app/config";
import type {Services} from "$lib/app/services";
import {createUserModule} from './user';

export type Modules = {
    user: ReturnType<typeof createUserModule>;
};

export function createModules(config: Config, services: Services): Modules {
    const modules = {} as Modules;
    modules.user = createUserModule(config, services, modules);
    return modules;
}
```

```typescript
// src/lib/app/api/index.ts
import type {Config} from "$lib/app/config";
import type {Services} from "$lib/app/services";
import type {Modules} from "$lib/app/modules";
import {createUserApi} from './user';

export type Api = {
    user: ReturnType<typeof createUserApi>;
};

export function createApi(config: Config, services: Services, modules: Modules): Api {
    const api = {} as Api;
    api.user = createUserApi(config, services, modules);
    return api;
}
```

---

### 3.4. The `App` Type and `createApp()`

The `App` type bundles all layers. It is assembled by `createApp(config)` in `src/lib/app/index.ts`.

```typescript
// src/lib/app/index.ts
import type {Config} from "$lib/app/config";
import type {DeepReadonly} from "@atom-forge/env-reader";
import {createServices} from "./services";
import {createModules} from "./modules";
import {createApi} from "./api";

export type App = {
    config: DeepReadonly<Config>;
    services: ReturnType<typeof createServices>;
    modules: ReturnType<typeof createModules>;
    api: ReturnType<typeof createApi>;
};

export function createApp(config: Config): App {
    const services = createServices(config);
    const modules = createModules(config, services);
    const api = createApi(config, services, modules);
    return {config, services, modules, api};
}
```

---

### 3.5. Lazy Cross-Module References

The `modules` object is built incrementally. To prevent circular dependency issues during initialization, one module can only reference another module's methods **lazily** — that is, *inside an exported function call*, not at the top level of the factory function.

- **Correct (Lazy):** `modules.bar.doWork()` is called inside a method. By the time it runs, `modules.bar` is guaranteed to exist.
- **Incorrect (Eager):** `const barWork = modules.bar.doWork;` at the top level of `createFooModule` will fail, because `modules.bar` is `undefined` when `createFooModule` is executing.

---

## 4. Initialization Flow

### 4.1. Config (`src/config.ts`)

Environment variables are read here using `EnvReader` from `@atom-forge/env-reader`. The resulting `config` object is exported and used to create the app.

```typescript
// src/config.ts
import {configDotenv} from "dotenv";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {EnvReader} from "@atom-forge/env-reader";
import type {Config} from "$lib/app/config";

configDotenv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = new EnvReader(path.resolve(__dirname, ".."));

export const config: Config = {
    database: {
        connectionString: env.string("DATABASE_URL"),
    },
} as const;
```

### 4.2. Entry Point (`src/hooks.server.ts`)

`createApp(config)` is called once here. The `app` object is attached to `event.locals` so all server-side code (load functions, actions, RPC handlers) can access it.

```typescript
// src/hooks.server.ts
import type {Handle} from '@sveltejs/kit';
import {createHandler} from '@atom-forge/rpc';
import {createApp} from '$lib/app';
import {config} from './config';

const app = createApp(config);
const rpcHandler = createHandler(app.api, '/api');

export const handle: Handle = async ({event, resolve}) => {
    event.locals.app = app;
    if (rpcHandler.match(event.request)) return rpcHandler.handle(event.request);
    return resolve(event);
};
```

---

## 5. File Structure

```
src/
├── config.ts                             # Reads env vars, builds and exports the Config object
├── hooks.server.ts                       # Calls createApp(), wires RPC handler, injects app into locals
│
└── lib/
    └── app/
        ├── index.ts                      # App type + createApp()
        ├── config.ts                     # Config type (intersection of all component configs)
        │
        ├── services/
        │   ├── index.ts                  # Services type + createServices()
        │   └── prisma.ts                 # createPrismaService() + PrismaConfig
        │
        ├── modules/
        │   ├── index.ts                  # Modules type + createModules()
        │   └── user.ts                   # createUserModule()
        │
        └── api/
            ├── index.ts                  # Api type + createApi()
            └── user.ts                   # createUserApi()
```

**Key files:**

| File | Role |
|---|---|
| `src/config.ts` | Reads env vars using `EnvReader`, exports the `config` object. |
| `src/hooks.server.ts` | Creates the app singleton, wires RPC, injects `app` into `event.locals`. |
| `src/lib/app/index.ts` | `App` type and `createApp()`. |
| `src/lib/app/config.ts` | `Config` type — intersection of all `...Config` types. |
| `src/lib/app/services/index.ts` | `Services` type and `createServices()`. |
| `src/lib/app/modules/index.ts` | `Modules` type and `createModules()`. |
| `src/lib/app/api/index.ts` | `Api` type and `createApi()`. |
| `src/lib/app/services/<name>.ts` | One service per file. Exports factory + `...Config` type. |
| `src/lib/app/modules/<name>.ts` | One module per file (or directory). Exports factory. |
| `src/lib/app/api/<name>.ts` | One Api handler group per file. Exports factory. No business logic. |

---

## 6. How-To Guides

### Adding a New Service
1. **Create Factory:** Create `src/lib/app/services/newService.ts`. Implement `createNewService(config: Config, services: Services)` and export a `NewServiceConfig` type.
2. **Update `src/lib/app/config.ts`:** Import `NewServiceConfig` and add it to the `Config` intersection.
3. **Update `src/lib/app/services/index.ts` — Type:** Add `newService: ReturnType<typeof createNewService>` to the `Services` type.
4. **Update `src/lib/app/services/index.ts` — Instantiation:** Call `services.newService = createNewService(config, services)` inside `createServices()`.
5. **Update `src/config.ts`:** Add the necessary env variables to the `config` object using `EnvReader`.

### Adding a New Module
1. **Create Factory:** Create `src/lib/app/modules/newModule.ts`. Implement `createNewModule(config: Config, services: Services, modules: Modules)`.
2. **Update `src/lib/app/modules/index.ts` — Type:** Add `newModule: ReturnType<typeof createNewModule>` to the `Modules` type.
3. **Update `src/lib/app/modules/index.ts` — Instantiation:** Call `modules.newModule = createNewModule(config, services, modules)` inside `createModules()`.

### Adding a New Api Handler Group
1. **Create Factory:** Create `src/lib/app/api/newGroup.ts`. Implement `createNewGroupApi(config: Config, services: Services, modules: Modules)` using `rpc` helpers.
2. **Update `src/lib/app/api/index.ts` — Type:** Add `newGroup: ReturnType<typeof createNewGroupApi>` to the `Api` type.
3. **Update `src/lib/app/api/index.ts` — Instantiation:** Call `api.newGroup = createNewGroupApi(config, services, modules)` inside `createApi()`.

---

## 7. Path Aliases

| Alias | Resolves to |
|---|---|
| `$lib` | `src/lib` |

---

## 8. Summary of Core Rules

| # | Rule |
|---|---|
| 1 | A Service must never import or depend on a Module or Api. |
| 2 | All dependencies must be injected; no global state or direct imports of other modules/services. |
| 3 | Service factory signature is fixed: `createFooService(config: Config, services: Services)`. |
| 4 | Module factory signature is fixed: `createFooModule(config: Config, services: Services, modules: Modules)`. |
| 5 | Api factory signature is fixed: `createFooApi(config: Config, services: Services, modules: Modules)`. No business logic in Api handlers — only module calls. |
| 6 | Define container types (`Services`, `Modules`, `Api`, `App`) using `ReturnType`. |
| 7 | Do not add explicit return type annotations to factory functions. |
| 8 | Cross-module access must be "lazy" (inside a method call), not "eager" (at the factory's top level). |
| 9 | Factory functions should only contain initialization logic, not perform business operations. |
| 10 | Always register a new component's type and factory in its respective `index.ts`. |
| 11 | Each Service component defines and exports its own `...Config` type. |
| 12 | The main `Config` type in `src/lib/app/config.ts` is purely an intersection of component configs. |
| 13 | Read all environment variables through the `EnvReader` class from `@atom-forge/env-reader`, never `process.env` directly. |
| 14 | Do NOT use `try-catch` to swallow business errors. Throw custom errors (e.g., `BadRequestError` from `src/lib/errors.ts`). |
| 15 | The `app` object is created once in `hooks.server.ts` and accessed via `event.locals.app`. Never instantiate services, modules, or api elsewhere. |
