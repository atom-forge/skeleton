---
tags: []
applies_to: Always loaded — dev commands and workflow apply regardless of task type.
---

# Development Workflow and Commands

## Commands

```bash
bun run dev          # Start dev server (vite dev)
bun run build        # Production build
bun run preview      # Preview production build
bun run check        # TypeScript + Svelte type checking
# Prisma
bunx prisma migrate dev    # Apply migrations in dev
bunx prisma generate       # Re-generate Prisma client.ts after schema changes
bunx prisma studio         # Browse database in browser
```
