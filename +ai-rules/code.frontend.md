# Frontend Conventions (SvelteKit & Svelte 5)

## 1. Directory Structure

The app layer lives in `src/`:

```
src/
├── app.html          # root HTML template
├── hooks.server.ts   # routes /rpc to the RPC handler
├── routes/           # file-based routing (+page.svelte), organized into zones
└── lib/              # imported as #lib/… (package.json "imports")
    ├── api.ts        # RPC client — import this everywhere
    └── stores/       # app-wide Svelte 5 state stores (.svelte.ts)
```

---

## 2. Supporting Code Placement: `src/lib` vs. `(+page)` / `(+lib)`

### 2.1. Zones
A **zone** is an independent, top-level area of the app, each rooted in its own directory under `src/routes/` — usually via a route group (`(name)/`), since route groups don't affect the URL but do give the zone a dedicated physical root to hang its own layout, auth rules, and supporting code from. A zone typically corresponds to a distinct audience or product surface (e.g. an admin dashboard, a public marketing site, an attendee-facing app) rather than to a single feature.

Zones sit directly under `src/routes/`, one level below global `src/lib` and one level above their sub-pages.

### 2.2. `src/lib` — Portable Util & Infrastructure Only
`src/lib/` (imported as `#lib/…`) holds **only truly portable, app-agnostic** code: generic helpers, RPC client wiring, and app-wide infrastructure stores.

**`src/lib` never contains Svelte components**, and never contains anything that encodes this app's specific vocabulary or branding — not even something as simple as the product logo. Anything app-specific, no matter how broadly it's reused, lives under `routes/`.

### 2.3. Why a Wrapper is Only Sometimes Needed
A plain `.svelte`/`.ts` **file** sitting next to `+page.svelte` is never ambiguous with a route — files and folders are always visually distinct, regardless of name. So a page's own support files can just sit flat, right beside `+page.svelte`, with no wrapper at all, as long as that folder has no route children to get confused with.

The ambiguity only shows up for **folders**: once a local component grows large enough to split into its own sub-parts, that split produces a folder — and a bare, unmarked folder sitting next to real route folders (`abstracts/`, `sessions/`, …) is hard to tell apart from another route at a glance.

### 2.4. `(+page)` and `(+lib)`
Use these **only at a level that has real route children** (i.e. not a leaf page — a folder whose only job is `+page.svelte` and nothing routes through it further). At a leaf, nothing wraps: `+page.svelte` and all of its own support files/folders sit flat, directly in that folder.

At a branch level (has route children *and* also has its own page, and/or shared supporting code):
- **`(+page)/`** — that level's own page and everything only it uses: `+page.svelte` plus its private components/helpers. Named after the file it wraps.
- **`(+lib)/`** — supporting code used by **two or more** things at or below this level (2+ sibling routes, or 2+ zones). Never contains route-specific content — only what's genuinely shared. If a level has shared code but no page of its own, it only needs `(+lib)/`, not `(+page)/`.

Both are conditional, not default scaffolding — don't create either until the condition is actually true.

**Placement = nearest common ancestor of consumers.** Something starts flat in the page that needs it. When a second consumer (sibling page or sibling zone) needs it too, it moves up to the `(+lib)/` of their nearest common ancestor — a zone root, or — if genuinely needed by 2+ zones — `src/routes/(+lib)/`. Don't promote speculatively.

### 2.5. Directory Layout Illustration
```
src/lib/                          ← global, portable only, no components
  utils.ts
  api.ts
  stores/auth.svelte.ts

src/routes/
  (zone-a)/                       ← has a page of its own AND route children
    (+page)/
      +page.svelte
      OwnWidget.svelte
    (+lib)/
      SharedAcrossPages.svelte    ← used by 2+ pages below
    some-page/                    ← leaf: nothing wraps
      +page.svelte
      PageOnlyThing.svelte
    other-page/
      +page.svelte

  (zone-b)/                       ← route children, no page of its own
    (+lib)/
      SharedLogo.svelte           ← used by 2+ children, no (+page) needed
    child-a/
      +page.svelte
    child-b/
      +page.svelte
```

### 2.6. Local Responsibility and Data Flow

A parent component owns data sources, screen-level state, and composition. Derived display data, UI behavior, and presentation-specific helpers belong in the closest component that consumes their result.

- Do not lift logic into a parent merely because its input data is available there.
- Keep route components as composition shells; move feature-specific behavior down into the feature component.
- Pass source entities or minimal explicit props downward; let the consuming component derive its own labels, images, and presentation state.

```svelte
<!-- ProgramTab.svelte: composition only -->
<Lanes>
	<DayLane day={selectedDay}/>
	{#each activeSections as section (section.id)}
		<SectionLane day={selectedDay} {section}/>
	{/each}
</Lanes>
```

`SectionLane` owns section-specific title, subtitle, background image, and content. `ProgramTab` does not precompute these presentation values.

---

## 3. Splitting Large Components

A component with internal `<Tabs>`/`<TabPanel>` sections that's grown large should split its tabs into sibling files instead of staying as one file:

```
BigEditModal.svelte        ← shell: Tabs wrapper, save/state coordination
BigEditModal/
  DetailsTab.svelte
  MediaTab.svelte
  ItemsTab.svelte
```

No extra wrapping is needed inside `BigEditModal/` — the folder is already unambiguously "BigEditModal's own parts". The shell file stays a sibling of the folder (`BigEditModal.svelte`, not `BigEditModal/BigEditModal.svelte`) — Vite doesn't resolve `index.svelte` as a bare directory import, so nesting the shell inside its own same-named folder would create an awkward double-named path.

---

## 4. Svelte 5 Runes & State Stores

- Use Svelte 5 Runes exclusively: `$state()`, `$derived()`, `$derived.by()`, `$props()`, `$effect()`.
- Global app state stores use `.svelte.ts` files in `src/lib/stores/`.
- Component props are destructured using `$props()` with explicit TypeScript interfaces.

---

## 5. Modal & Dialog Conventions

All modals are managed through `@atom-forge/ui`. Before implementing a modal, read `node_modules/@atom-forge/ui/docs/en/controls/overlays/modal.md`. For drawers, popups, toasts, context menus and tooltips, use the matching files in `node_modules/@atom-forge/ui/docs/en/controls/overlays/`. The library's entry point for AI agents is `node_modules/@atom-forge/ui/README-AI.md`.

Use `getModalManager().open()` to mount Svelte modal components dynamically. Do not add project-local dialog infrastructure, shadcn dialog wrappers, or inline page-owned dialog state unless there is a documented library limitation.

```svelte
<!-- src/routes/(zone)/some-page/MyModal.svelte — next to the page that opens it -->
<script lang="ts">
    import { Button, Field, Input, getModalManager } from '@atom-forge/ui';

    let {
        someProp
    }: {
        someProp: string;
    } = $props();
    // Modal content must provide its own surface: wrap it in <Card class="p-6 ...">.

    const modal = getModalManager();
    let name = $state(someProp);

    function cancel() {
        modal.close();
    }

    function save() {
        modal.close(name);
    }
</script>

<div class="space-y-4">
    <Field label="Name">
        <Input bind:value={name} />
    </Field>

    <div class="flex justify-end gap-2">
        <Button variant="outline" label="Cancel" onclick={cancel} />
        <Button label="Save" onclick={save} />
    </div>
</div>
```

- `modal.close(result?)` closes the active modal. Pass a value to return a result, or call it empty to signal cancellation.
- Use `@atom-forge/ui` controls inside modal content (`Field`, `Button`, `Input`, `Tabs`, etc.).

### Imperative Opening
Open modals imperatively through the modal manager. Do not render inline dialog trees with page-local `{#if}` blocks for standard modal flows.

```typescript
import { getModalManager } from '@atom-forge/ui';
import MyModal from './MyModal.svelte';

const modal = getModalManager();
const result = await modal.open(MyModal, { someProp: 'value' });

if (!result) {
    // user cancelled (closed without saving)
    return;
}

// proceed with result
console.log(result);
```

- Props matching: TypeScript should ensure that the props object passed to `modal.open()` matches what the component expects.

### Confirmation Flows
For simple yes/no confirmations, prefer an existing `@atom-forge/ui` confirmation or modal pattern if available. Only create an app-specific confirmation component when it carries product-specific content or behavior.

### Drawers and Help Panels
For side-sliding help panels or secondary surfaces, use `getDrawerManager().open()` from `@atom-forge/ui`.

---

## 6. RPC API Client Usage

The frontend uses the typed RPC client: `import { api } from '#lib/api.js'`.

- `await api.user.get.$query({id})`
- `await api.user.create.$command({email, name, roles: []})`

### 6.0. Forms and Validation
- Forms validate with the same zod schema as their RPC call (`shared/schemas/*`): parse before sending, and show the messages under their fields (`<Field error={…}>`). Nothing shows before the first submit; afterwards the messages follow the input live.
- After a failed call, put the schema `issues` returned by the server (`INVALID_ARGUMENT`) under their fields; anything else goes to `getRpcErrorMessage(res, …)`.
- When a second form needs the same plumbing, extract it into a shared helper in `src/lib/` (e.g. a `Form` class in `form.svelte.ts`) instead of copying it.
- Forms get `novalidate`; the browser's own bubbles are not used.

### 6.1. Server Loads
Page data that must be in the HTML is loaded in `+page.server.ts` by calling modules directly (`app.modules.*`) with the request's Actor, and passing the result through an `expose` view — never straight from the database. Put the shared kit glue (actor from the request, module error → 403/404) under `server/lib/kit/` when the first such load is written. RPC is used for client-side mutations and incremental loads.

### 6.2. Zones
List the zones here as they are created (route group, audience, access rule).

### 6.3. Menus
Use `ContextMenu` items with `resolveWith` and act on the awaited result; `onclick` items leave the popup open.
