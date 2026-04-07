---
tags: [api, backend]
applies_to: Any task that defines or modifies RPC endpoints, queries, commands, or API middleware.
---

# API: @atom-forge/rpc

For API calls, we use the `@atom-forge/rpc` package (formerly `tango-rpc`). There are NO traditional SvelteKit `+server.ts` REST endpoints for business logic!

👉 **AI Warning / Manual:**
If you need to write a new API endpoint, validation logic, or middleware, or if you have syntax questions, you **MUST** read the installed package's official documentation before generating code:
[Atom-Forge RPC Documentation](../../node_modules/@atom-forge/rpc/README.md)

## Server Side (`src/lib/server/api/`)
- Endpoints are defined on the `apiDefinition` object.
- `.query()`: GET request, no side-effects (e.g., fetching data).
- `.command()`: POST request, causes side-effects (e.g., create, update, delete).
- Always use validation before every endpoint (refer to the README above for exact syntax).
- Use middlewares (e.g., `requireUser`) for authorization.

### Request data belongs in middleware

If a request carries data that handlers need — auth tokens, session cookies, user identity — a dedicated middleware must read it from `ctx.request` (standard Web API `Request`) and store it in `ctx.env`. Handlers never read cookies or headers themselves.

**Never use `ctx.adapterContext`** — not in handlers, not in middleware. Everything needed is available on `ctx.request`.

```typescript
// ✅ Correct — middleware reads the cookie from ctx.request, stores the user
export const loadUser = makeServerMiddleware(async (ctx, next) => {
    const cookieHeader = ctx.request.headers.get('cookie') ?? '';
    const token = parseCookie(cookieHeader)['session'] ?? null;
    if (token) {
        const user = await verifySessionToken(token);
        if (user) ctx.env.set(USER, user);
    }
    return next();
});

export function getUser(ctx: any): SessionPayload | null {
    return ctx.env.get(USER) ?? null;
}

// In handler: const user = getUser(ctx);

// ❌ Wrong — touching adapterContext anywhere
export const loadUserWrong = makeServerMiddleware(async (ctx, next) => {
    const event = ctx.adapterContext as RequestEvent; // never do this
});
```

## Client Side (`src/lib/api.ts`)
- The frontend uses the strictly typed `$lib/api` client.
- Invocation examples:
  - `await api.courses.list()`
  - `await api.courses.create({ name: "Calculus" })`

## Error Handling

**Server side** — use `rpc.error.*` helpers (or `rpc.error.make`) to return application-level errors. These always produce a `200 OK` HTTP response; the error is encoded in the body with the `atomforge.rpc.error` key. Never rely on HTTP status codes for business logic errors — that would be a transport-channel error, not an application error.

```typescript
return rpc.error.invalidArgument({ message: 'Title too short' })          // code: "INVALID_ARGUMENT"
return rpc.error.permissionDenied({ message: 'Admins only' })             // code: "PERMISSION_DENIED"
return rpc.error.internalError()                                          // code: "INTERNAL_ERROR"
return rpc.error.make('COURSE_NOT_FOUND', 'Course not found', { id })    // custom code
```

**Client side** — use `res.isOK()` / `res.isError()` / `res.isError('ERROR_CODE')` to branch on the result:

```typescript
const res = await api.courses.create({ name: 'Calculus' });
if (res.isOK()) {
  const data = res.result; // typed success
} else if (res.isError('COURSE_NOT_FOUND')) {
  // handle specific error
} else if (res.isError()) {
  // generic error — res.status has the error code, res.result has details
}
```