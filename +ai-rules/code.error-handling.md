# Error Handling & User Feedback

## 1. Core Principle

Every user-triggered operation must either succeed visibly or fail with a user-facing Hungarian message. Errors must not disappear silently, and UI code must not expose raw domain codes such as `ITEM_NOT_FOUND` when a readable message is known.

---

## 2. Server-side RPC Errors

- Use `rpc.error.*` helpers or `rpc.error.make(code, message, details?)` for application-level failures.
- Do not introduce a separate `AppError` abstraction unless the task explicitly requires a broader backend error model.
- Business/domain modules return `moduleError('CODE')` results; API handlers translate them with `moduleErrorToRpc(result, messages, fallback)` (`#server/lib/api/rpc-error`) into readable Hungarian messages.
- Permission and authentication failures use readable messages: „Bejelentkezés szükséges.”, „Nincs jogosultságod ehhez a művelethez.”, „Adminisztrátori jogosultság szükséges.”, or a more specific equivalent.
- Validation and domain failures preserve the machine code but pair it with a clear message, for example: `NAME_TAKEN` → „Ez a név már foglalt.”
- Never rely on HTTP status codes for business logic errors. RPC business errors are application-level results returning `200 OK`; transport failures are a separate fallback path on the client.

---

## 3. Frontend Error Normalization (SvelteKit)

- All business API calls use the typed RPC client: `import { api } from '#lib/api.js'`.
- Use `getRpcErrorMessage(res, fallback?)` for failed RPC results.
- Use `getCaughtErrorMessage(error, fallback?)` for caught exceptions or transport/network failures.
- Show feedback through the `@atom-forge/ui` toast manager (`getToastManager().show(message, { type: 'success' | 'error' })`) or inline, see section 4. When the same feedback pattern repeats across many call sites, add a shared helper to `src/lib/` instead of copying it.
- Do not read `res.error?.message` directly in components unless the shared helpers cannot represent the case.
- Do not build user-facing strings by appending raw `res.status` or domain codes. Add a fallback message to `src/lib/api.ts` or return a better backend message.

---

## 4. Toast vs Inline Error Guidelines

- Use success toasts for short-lived operation results that would otherwise be invisible after reload, navigation, or modal close.
- Use error toasts for non-blocking command failures and destructive workflow failures.
- Keep errors inline when the user needs context to fix the problem: form validation, submission correction, list/load failure, modal save failure, and page-level data loading failure.
- It is valid to show both an inline error and a toast when the inline error belongs to a modal/form but the operation also needs global feedback.
- Loading failures must not leave a silent empty state. Use a loading state, spinner, skeleton, inline error, or route error depending on the page.

---

## 5. Global Overlay Host

- The `@atom-forge/ui` `<Root>` in `src/routes/+layout.svelte` provides the theme and the modal, drawer and toast managers for the whole app.
- Do not mount duplicate page-local `<Root>` or toast hosts to solve missing feedback.

---

## 6. UI Text

- User-facing feedback text must be **Hungarian**.
- Avoid generic „Ismeretlen hiba”; use „A kérést nem sikerült teljesíteni.” or a domain-specific fallback.
- Known domain codes must have readable fallback messages in either the backend RPC handler or `src/lib/api.ts`.

---

## 7. Audit Checklist

When auditing error handling changes, check:
- backend RPC handlers translate known domain errors into readable messages;
- frontend call sites use `getRpcErrorMessage()` / `getCaughtErrorMessage()` instead of ad-hoc `res.error?.message` handling;
- success and failure feedback exists for create/update/delete/status/upload/reorder flows;
- load/query flows expose loading and failure states;
- no user-facing English error text or raw domain code remains in the touched surfaces;
- `bun run check` passes.
