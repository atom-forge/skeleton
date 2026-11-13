# Authorization: Actor Policy

Server-side authorization decisions must go through the request-scoped `Actor` object. Do not add new ad-hoc authorization based on raw `userId`, `actorUserId`, `ownerUserId`, or `null` admin-bypass parameters.

---

## 1. Actor Identity Oracle

`Actor` is a pure identity oracle. Its only methods are:

- `actor.is(userId: string): boolean` — is this actor the given user?
- `actor.isAuthenticated(): boolean` — is there a logged-in user?
- `actor.isAdmin(): boolean` — does the user have the admin role?
- `actor.hasRole(role): boolean` — does the user hold the role (roles: `RoleName` in `server/application/modules/user/types.ts`)? Admins pass every role check.
- `actor.isInternal(): boolean` — is this a trusted internal call?

`Actor` has no public data fields, no DB access, and no knowledge of domain entities. Do not treat `Actor` as a data source — modules cannot ask "who are you?", only "are you this person?"

---

## 2. Actor Source

- The session middleware (`server/application/api-support/session.ts`) creates the `Actor` for every RPC call and puts it into `ctx.env`.
- API handlers get it with `apiSupport.guards.getActor(ctx)`. Behind `authRequiredMiddleware` use `apiSupport.guards.getRequiredActor(ctx)` (actor and user guaranteed); in a handler that must check sign-in itself use `apiSupport.guards.requireActor(ctx)`.
- Outside RPC (CLI commands, jobs) use `modules.actor.internal()`.
- API handlers stay thin: they pass the `Actor` into modules and translate known module failures to readable RPC permission errors.

---

## 3. Module Boundary — Private Auth Closures

Each module that needs authorization implements its own **private** auth closure functions. These closures fetch the relevant userIds from the DB (owner, organizers, authors, etc.) and use `actor.is(userId)` to check identity.

Standard pattern for owner-or-admin access:

```typescript
async function loadEditable(actor: Actor, postId: string) {
    const post = await db.orm.public.Post.where({id: postId}).first();
    if (!post) return moduleError.notFound();
    if (!actor.is(post.authorId) && !actor.isAdmin()) return moduleError.permissionDenied();
    return post;
}
```

- Each module defines its own closures independently — no cross-module auth calls.
- Module methods are the single source of truth for their authorization.
- API-layer pre-checks for operations that the module already guards are redundant and must not exist.

---

## 4. Internal Bypass & Explicit Unchecked Operations

- `Actor.internal()` produces an actor that passes all `is*()` and `is(id)` checks. Use it in trusted internal flows.
- If an internal operation intentionally bypasses the actor pattern entirely, its name must make the contract explicit, for example `sendFillReminderUnchecked`. Call sites must be limited to trusted internal flows.

---

## 5. Forbidden Patterns

Do not introduce:

- `can*` or relationship methods on `Actor` — authorization logic lives in module private closures, not on the identity oracle;
- API-layer auth helpers (`requirePostAuthor`, etc.) that duplicate module auth logic;
- `null` actor or `null` user parameters as an admin bypass;
- cross-module auth calls — each module checks access directly via DB;
- direct entity-bound mutating module methods that trust the caller to have already checked access.

---

## 6. What Goes to the Client: `expose`

Rows do not leave the server as they are. Modules decide *who* may get the data (section 3); `expose` (`@atom-forge/expose`) with `views` (`server/application/exposure`) says *what* goes out:

```typescript
return rows.map(u => expose(u, views.user.card));
return expose(user, views.user.card, views.user.roles); // after the permission check
```

- A view is `(source, output) => ownPart`. It names every field it returns (allow-list); never spread `source` in a view, and leave objects out of `fieldsOf` types.
- A later view overwrites earlier keys. A view that adds to a key reads it from `output` and marks it `Stacked`.
- Views live in `server/application/exposure/`, one file per entity, gathered into the `views` object (`exposure/index.ts`). A one-off, non-sensitive view may stay in the module.
- Stored internals (password hashes, tokens, raw `attachments` JSON) never go out; attachments only as ready URLs through a dedicated view (see `code.attachments.md`).
