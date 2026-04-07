---
status: active
plan: plan.client-app.md
tags: [frontend]
---

# Task: ClientApp — Rules & Guide

## Source / Context
`work/plan.client-app.md`

## Description
`work/contribution/rules/architecture.md` kiegészítése a ClientApp szabályokkal,
és guide írása a `work/docs/guides/` könyvtárba.

## Acceptance Criteria
- [ ] `work/contribution/rules/architecture.md` frissítve a plan "Szabályok" szekciójának 7 pontjával
- [ ] `work/docs/guides/client-app.md` létrehozva — leírja a `src/lib/client/` struktúrát, inicializálást, és hogyan adunk hozzá új service-t / modult
- [ ] No type errors (`bun run check` vagy `tsc`).
- [ ] Documentation updated (including updating the linked plan file to reflect actual implementation).

## Technical Notes
- Függ: `task.CLIENT-APP-02-wire.md`
- A guide a tényleges implementációt dokumentálja, nem a tervet — ezért utolsó lépés

## Implementation Log
