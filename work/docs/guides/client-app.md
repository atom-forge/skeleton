# Client App Architecture Guide

## Overview

`src/lib/client/` implements the client-side counterpart to the server-side `src/lib/server/` architecture. It follows the same **Config → Services → Modules → App** layering with DI and factory functions, adapted for SvelteKit's client environment.

## Structure

```
src/lib/client/
├── index.ts                    # ClientApp type, createClientApp(), setClientApp(), getClientApp()
├── config.ts                   # ClientConfig type (intersection of all service configs)
├── services/
│   ├── index.ts                # ClientServices type + createClientServices()
│   ├── rpc.ts                  # createRpcService() — typed RPC client for the server Api
│   └── i18n.svelte.ts          # createI18nService() — locale $state + dictionary t()
└── modules/
    └── index.ts                # ClientModules type + createClientModules() (empty, extendable)
```

## Initialization

`ClientApp` is **not a singleton**. It is created in `+layout.svelte` and shared via Svelte context.

Config is assembled by `createClientConfig()` (defined in `src/lib/client/config.ts`), which reads `$env/static/public` variables:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import { setClientApp } from '$lib/client';
    import { createClientConfig } from '$lib/client/config';

    setClientApp(createClientConfig());
</script>
```

Required public env vars (add to `.env` and `.env.example`):

```
PUBLIC_API_PREFIX=/api
PUBLIC_DEFAULT_LOCALE=hu
```

Consume anywhere below in the tree:

```svelte
<script lang="ts">
    import { getClientApp } from '$lib/client';
    const app = getClientApp();
    // app.services.rpc — typed RPC client
    // app.services.i18n.t('key') — translations
</script>
```

## Adding a New Service

1. Create `src/lib/client/services/myService.ts` (use `.svelte.ts` if it uses `$state`/`$derived`).
2. Export `MyServiceConfig` type and `createMyService(config, services)`.
3. Add `MyServiceConfig` to the `ClientConfig` intersection in `src/lib/client/config.ts`.
4. Add `myService: ReturnType<typeof createMyService>` to `ClientServices` in `src/lib/client/services/index.ts`.
5. Instantiate: `services.myService = createMyService(config, services)` in `createClientServices()`.

## Adding a New Module

1. Create `src/lib/client/modules/myModule.ts` (use `.svelte.ts` if it uses runes).
2. Export `createMyModule(config, services, modules)`.
3. Update `ClientModules` type in `src/lib/client/modules/index.ts`.
4. Instantiate: `modules.myModule = createMyModule(config, services, modules)` in `createClientModules()`.

## Key Differences vs. Server App

| Aspect | Server `app` | `ClientApp` |
|---|---|---|
| Init location | `hooks.server.ts` | `+layout.svelte` |
| Config source | `EnvReader` + `.env` | `$env/static/public` |
| Access | `event.locals.app` | `getClientApp()` (Svelte context) |
| Api layer | yes | none — RPC service is the bridge |
| Singleton | per-request (SSR) | forbidden — must use context |
| Rune files | `.ts` | `.svelte.ts` when using `$state`/`$derived` |

## Rules

1. `ClientApp` must never be a module-level singleton.
2. `setClientApp()` / `getClientApp()` hide the context Symbol — always use these wrappers.
3. Service factory: `createFooService(config: ClientConfig, services: ClientServices)`.
4. Module factory: `createFooModule(config: ClientConfig, services: ClientServices, modules: ClientModules)`.
5. `ClientServices` and `ClientModules` types are `ReturnType`-based — never write them by hand.
6. Use `.svelte.ts` extension for any file that contains `$state` or `$derived` runes.
7. Config values come from `$env/static/public` — the scaffold only defines types; wiring is done at the call site.
