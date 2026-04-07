---
tags: [frontend]
applies_to: Any task that builds or modifies UI — components, layouts, forms, dialogs.
---

# @atom-forge/ui — Usage Rules

## Core Rule

**Always prefer `@atom-forge/ui` components over writing new ones.** Before implementing any UI element, check if a component already exists in the library. Only create a custom component if there is no suitable match.

**Always use the library's color system.** Never introduce arbitrary colors (hardcoded hex, rgb, Tailwind color utilities like `text-red-500`) unless explicitly requested for a specific reason (e.g., colored icons, data visualization).

---

## Available Components

The full component list with descriptions is at:

```
node_modules/@atom-forge/ui/docs/guides/component-overview.md
```

Individual component docs (props, usage examples) are at:

```
node_modules/@atom-forge/ui/docs/controls/<category>/<component>.md
```

Before building anything, check if it already exists there.

---

## Color System

Always use the library's semantic color tokens. Never use arbitrary colors or raw Tailwind palette utilities unless explicitly requested. The full color system reference is at:

```
node_modules/@atom-forge/ui/docs/guides/color-system.md
```

❌ Never:
```svelte
<span class="text-red-500 bg-blue-100">...</span>
```

**Exceptions** (only when explicitly instructed):
- Colored icons or illustrations
- Data visualization (charts, heatmaps)
- Brand-specific elements

---

## Component Scoping

- Components must be kept alongside where they are used (`routes/xy/_components/`).
- Do NOT use a global `src/lib/components` folder for business-logic-heavy components.
- A component belonging to a child route must NOT be imported up the routing tree.
