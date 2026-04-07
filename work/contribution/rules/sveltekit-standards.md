---
tags: [frontend]
applies_to: Any task that creates or modifies SvelteKit routes, layouts, or shared state.
---

# SvelteKit Standards

---

## Shared State — Context, Not Singletons

Never create singleton state modules (exported `$state` at module level). Singleton state is shared across all users in SSR and causes subtle bugs. All shared state must be created per-component-tree and passed via Svelte context.

❌ Never:
```ts
// state/ui.ts
export const sidebarOpen = $state(false); // singleton — shared across all users
```

✅ Use the context pattern:
```ts
// state/ui.svelte.ts
import { setContext, getContext } from 'svelte';

const KEY = Symbol('UI_STATE');

export class UIState {
    sidebarOpen = $state(false);
    toggle = () => this.sidebarOpen = !this.sidebarOpen;
}

export function setUIState() {
    return setContext(KEY, new UIState());
}

export function getUIState() {
    return getContext<UIState>(KEY);
}
```

Initialize in the layout that owns the state, consume anywhere below it in the tree:
```sveltehtml
<!-- +layout.svelte -->
<script lang="ts">
    import { setUIState } from '$lib/state/ui.svelte';
    setUIState();
</script>

<!-- any child component -->
<script lang="ts">
    import { getUIState } from '$lib/state/ui.svelte';
    const ui = getUIState();
</script>

<button onclick={ui.toggle}>Toggle</button>
```
