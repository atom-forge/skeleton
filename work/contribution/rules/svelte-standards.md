---
tags: [frontend]
applies_to: Any task that creates or modifies Svelte components.
---

# Svelte Coding Standards

Helper utilities, types, and components come from `@atom-forge/svelte-helpers`. **Always read its documentation before writing components.**

---

## @atom-forge/svelte-helpers

### Types

#### ClassProp
For components that accept external CSS classes.
```ts
let { class: classes }: ClassProp = $props();
const cls = $derived(twMerge('base-styles', classes));
```

#### AnyProp
For extra HTML attributes spread onto elements. Always place at the end of the intersection.
```ts
let { class: classes, ...props }: ClassProp & AnyProp = $props();
// ...
<input {...props} class={cls} />
```

#### ChildrenProp / ChildrenPropOptional
Consistent naming for snippet props.
```ts
let { children }: ChildrenProp = $props();           // required
let { children }: ChildrenPropOptional = $props();   // optional
let { children }: ChildrenProp<[Item]> = $props();   // parameterized
```

#### XOR
Enforces mutually exclusive props.
```ts
type Props = XOR<{ small: true }, { compact: true }, {}>;
type ButtonProps = XOR<{ primary: true }, { secondary: true }, { ghost: true }, {}>;
```

#### AtLeastOne
Ensures at least one of the properties is provided.
```ts
type LabelOrIcon = AtLeastOne<{ label: string; icon: IconDefinition }>;
```

### Utilities

#### variantMap
Converts boolean props to a string variant. Works best with `XOR` or `AtLeastOne` prop types.
```ts
const { small, compact, ...props } = $props();
const size = untrack(() => variantMap({ small, compact }, 'normal'));
// returns 'small' | 'compact' | 'normal'
```

#### debounce / debounceAsync
```ts
const handleInput = debounce((val) => console.log(val), 300);
const search = debounceAsync(async (query) => await api.fetch(query), 500);
```

#### as
Type cast helper for Svelte templates. The TypeScript `as` keyword is not allowed inside template expressions — use this instead.

**Primitive shorthands** — inline in templates:
```svelte
{@const on = as.boolean(td[k])}
{@const label = as.string(item.value)}
{@render list(as.array<string>(items))}
```
Available: `as.string`, `as.number`, `as.boolean`, `as.array`, `as.object`, `as.function`, `as.any`, `as.unknown`.

**Script-side casters** — for complex or frequently reused types:
```ts
import { as } from '@atom-forge/svelte-helpers';
const toTask = as<{ title: string; done: boolean }>;
const toKey  = as<keyof TableData>;
```
```svelte
{@const task = toTask(_task)}
{@const on   = as.boolean(td[toKey(k)])}
```

**Snippet parameter typing** — use a script-side caster instead of inline annotations:
```svelte
<script lang="ts">
    import { as } from '@atom-forge/svelte-helpers';
    const itemArgType = as<{ title: string }>;
</script>

{#snippet item(_task)}
    {@const task = itemArgType(_task)}
    {task.title}
{/snippet}
```

### Components

#### RenderSnippet
Renders snippets dynamically. Useful when an API expects a Component.
```svelte
<RenderSnippet {snippet} args={{ item, index }} />
```

---

## Svelte 5 Reactivity

Use only Svelte 5 runes: `$state`, `$derived`, `$derived.by`, `$props`, `$bindable`, `$effect`, `untrack`. Never use Svelte 4 stores (`writable`, `readable`, `derived`) or legacy reactivity patterns.

### State Declaration

Plain `let` is not reactive.

❌ Never:
```ts
let x = false;
```
✅ Use:
```ts
let x = $state(false);
```

### Mutating Derived Values

❌ Never:
```ts
$derived = newValue;
```
✅ Use:
```ts
let x = $state(initialValue);
x = newValue;
```

### Complex Logic in Derived

❌ Never:
```ts
$derived((() => { return someLogic(); })());
```
✅ Use:
```ts
$derived.by(() => {
    return someLogic();
});
```

### Props Typing

❌ Never:
```ts
let {foo} = $props<{ foo: string }>();
```
✅ Use:
```ts
let {foo}: { foo: string } = $props();
```

---

## Snippets

### Children Snippet

❌ Never:
```ts
let {children}: {children: Snippet} = $props();
```
✅ Use:
```ts
let {children}: ChildrenProp = $props();
```

### Slots

❌ Never:
```svelte
<slot/>
```
✅ Use:
```svelte
{@render children()}
```

### Scoped Data (let:item)

❌ Never:
```svelte
<Component let:item={data}>
    {data.name}
</Component>
```
✅ Use:
```svelte
{#snippet row(data)}
    {data.name}
{/snippet}

<Component {row}/>
```

---

## Component Rendering & Events

### Dynamic Components

❌ Never:
```svelte
<svelte:component this={x}/>
```
✅ Use:
```svelte
{@const MyComponent = x}
<MyComponent/>
```

### Event Directives

❌ Never:
```svelte
<button on:click={handler}>
```
✅ Use:
```svelte
<button onclick={handler}>
```

### Global Listeners

❌ Never:
```ts
window.addEventListener('keydown', handler);
```
✅ Use:
```svelte
<svelte:window onkeydown={handler}/>
```
