---
tags: [frontend]
applies_to: Any task that creates or modifies client-side services, modules, or the ClientApp layer.
---

# Client-Side Architecture (ClientApp)

The client-side counterpart to the server `App` lives in `src/lib/client/`. It follows the same **Config → Services → Modules** layering with DI and factory functions, adapted for the browser and SvelteKit's reactivity model.

For the server-side architecture, see `work/contribution/rules/architecture.md`.

---

## 1. Layers

| Layer | Role |
|---|---|
| `ClientConfig` | Intersection of all service `...Config` types. Values come from `$env/static/public`. |
| `ClientServices` | Infrastructure / low-level utilities (RPC client, i18n, etc.). No business logic. |
| `ClientModules` | Business logic. Can depend on `config`, `services`, and other modules. |
| `ClientApp` | Assembled object: `{ config, services, modules }`. Created and stored in Svelte context. |

---

## 2. File Structure

```
src/lib/client/
├── index.ts                    # ClientApp type, setClientApp(), getClientApp()
├── config.ts                   # ClientConfig type + createClientConfig()
├── services/
│   ├── index.ts                # ClientServices type + createClientServices()
│   ├── rpc.ts                  # createRpcService() — typed RPC client
│   └── i18n.svelte.ts          # createI18nService() — locale $state + t()
└── modules/
    └── index.ts                # ClientModules type + createClientModules()
```

---

## 3. Core Patterns & Conventions

### 3.1. Service Factory

A client service factory receives exactly two arguments: `config` first, then `services`.

```typescript
// src/lib/client/services/foo.ts
import type { ClientConfig } from '$lib/client/config';
import type { ClientServices } from '$lib/client/services';

export type FooClientConfig = { foo: { endpoint: string } };

export function createFooService(config: ClientConfig, services: ClientServices) {
    return {
        async fetchData(id: string) { /* ... */ },
    };
}
```

Use `.svelte.ts` extension if the factory internally uses `$state` or `$derived`.

### 3.2. Module Factory

A client module factory receives exactly three arguments: `config`, `services`, `modules`.

```typescript
// src/lib/client/modules/bar.ts
import type { ClientConfig } from '$lib/client/config';
import type { ClientServices } from '$lib/client/services';
import type { ClientModules } from '$lib/client/modules';

export function createBarModule(config: ClientConfig, services: ClientServices, modules: ClientModules) {
    return {
        async doSomething() { /* ... */ },
    };
}
```

### 3.3. Composite `ClientConfig` Type

Each service defines and exports its own `...Config` type. `ClientConfig` is their intersection.

```typescript
// src/lib/client/config.ts
import { PUBLIC_API_PREFIX, PUBLIC_DEFAULT_LOCALE } from '$env/static/public';
import type { RpcConfig } from '$lib/client/services/rpc';
import type { I18nConfig } from '$lib/client/services/i18n.svelte';

export type ClientConfig =
    & RpcConfig
    & I18nConfig;

export function createClientConfig(): ClientConfig {
    return {
        rpc: { apiPrefix: PUBLIC_API_PREFIX },
        i18n: { defaultLocale: PUBLIC_DEFAULT_LOCALE },
    };
}
```

### 3.4. Type Inference with `ReturnType`

`ClientServices` and `ClientModules` types are inferred — never written by hand.

```typescript
// src/lib/client/services/index.ts
import type { ClientConfig } from '$lib/client/config';
import { createRpcService } from './rpc';
import { createI18nService } from './i18n.svelte';

export type ClientServices = {
    rpc: ReturnType<typeof createRpcService>;
    i18n: ReturnType<typeof createI18nService>;
};

export function createClientServices(config: ClientConfig): ClientServices {
    const services = {} as ClientServices;
    services.rpc = createRpcService(config, services);
    services.i18n = createI18nService(config, services);
    return services;
}
```

---

## 4. Initialization

`setClientApp(config)` is called unconditionally in `+layout.svelte`. It assembles services and modules internally and stores the result in Svelte context. There is no separate `createClientApp()` call — `setClientApp` is the assembly point.

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import { setClientApp } from '$lib/client';
    import { createClientConfig } from '$lib/client/config';

    setClientApp(createClientConfig());
</script>
```

Consume anywhere below in the component tree:

```svelte
<script lang="ts">
    import { getClientApp } from '$lib/client';
    const app = getClientApp();
    // app.services.rpc — typed RPC client
    // app.services.i18n.t('key') — translations
</script>
```

> `setClientApp()` is called unconditionally (no `browser` guard). SSR context is empty — callers of `getClientApp()` must be in client-only code paths (event handlers, `onMount`).

---

## 5. How-To Guides

### Adding a New Service

1. Create `src/lib/client/services/myService.ts` (use `.svelte.ts` if it uses `$state`/`$derived`).
2. Export `MyServiceConfig` type and `createMyService(config, services)`.
3. Add `MyServiceConfig` to the `ClientConfig` intersection in `src/lib/client/config.ts`.
4. Add `myService: ReturnType<typeof createMyService>` to `ClientServices` in `src/lib/client/services/index.ts`.
5. Instantiate: `services.myService = createMyService(config, services)` in `createClientServices()`.

### Adding a New Module

1. Create `src/lib/client/modules/myModule.ts` (use `.svelte.ts` if it uses runes).
2. Export `createMyModule(config, services, modules)`.
3. Add `myModule: ReturnType<typeof createMyModule>` to `ClientModules` in `src/lib/client/modules/index.ts`.
4. Instantiate: `modules.myModule = createMyModule(config, services, modules)` in `createClientModules()`.

---

## 6. Key Differences vs. Server App

| Aspect | Server `app` | `ClientApp` |
|---|---|---|
| Init location | `hooks.server.ts` | `+layout.svelte` |
| Config source | `EnvReader` + `.env` | `$env/static/public` (build-time) |
| Access | `event.locals.app` | `getClientApp()` (Svelte context) |
| Api layer | yes | none — RPC service is the bridge |
| Singleton | per-request (SSR) | forbidden — must use Svelte context |
| Rune files | `.ts` | `.svelte.ts` when using `$state`/`$derived` |

---

## 7. Summary of Rules

| # | Rule |
|---|---|
| 1 | `ClientService` factory signature is fixed: `createFooService(config: ClientConfig, services: ClientServices)`. |
| 2 | `ClientModule` factory signature is fixed: `createFooModule(config: ClientConfig, services: ClientServices, modules: ClientModules)`. |
| 3 | `ClientApp` must **never** be a module-level singleton. Use `setClientApp()` / `getClientApp()` (Svelte context) exclusively. |
| 4 | `ClientConfig` follows the intersection pattern (`FooConfig & BarConfig`). All values come from `$env/static/public`. |
| 5 | `ClientServices` and `ClientModules` types are `ReturnType`-based — never write them by hand. |
| 6 | Use `.svelte.ts` extension for any service or module file that internally uses `$state` or `$derived` runes. |
| 7 | The RPC client lives in `ClientServices` (as `services.rpc`). There is no standalone `src/routes/client.ts`. |
