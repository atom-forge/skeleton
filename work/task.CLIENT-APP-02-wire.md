---
status: active
plan: plan.client-app.md
tags: [frontend]
---

# Task: ClientApp — Wire

## Source / Context
`work/plan.client-app.md`

## Description
A scaffold task által létrehozott `ClientApp`-ot bekötni a SvelteKit layoutba,
és eltávolítani a `src/routes/client.ts` fájlt.

## Acceptance Criteria
- [ ] `src/routes/+layout.svelte` — `createClientApp(config)` hívás + `setClientApp()` az inicializáláshoz
- [ ] `src/routes/client.ts` eltávolítva
- [ ] Minden érintett route, ahol `client` volt importálva, frissítve — `getClientApp().services.rpc` használatára
- [ ] `src/lib/client/config.ts`-ben a `ClientConfig` értékei `$env/public` változókból összerakva
- [ ] No type errors (`bun run check` vagy `tsc`).
- [ ] Documentation updated (including updating the linked plan file to reflect actual implementation).
- [ ] Relevant documents in `work/docs/guides/` and `work/contribution/rules/` updated as needed.

## Technical Notes
- Függ: `task.CLIENT-APP-01-scaffold.md`
- A `+layout.svelte` inicializálás csak kliens oldalon fut — SSR alatt a context üres, ez várható viselkedés
- Az RPC kliens típusa `ApiClientDefinition<Api>` — az `Api` típus `$lib/server/api`-ból importálható (type-only)

## Implementation Log
