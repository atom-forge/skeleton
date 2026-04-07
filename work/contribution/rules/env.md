---
tags: [backend]
applies_to: Any task that reads environment variables or builds configuration objects.
---

# LLM Guide: Environment Configuration Utility

The `EnvReader` class comes from `@atom-forge/env-reader`. Import it from `$lib/env`.

**Key Principle:** Fail at startup, not at runtime.

---

## 1. Instantiation

`EnvReader` must be instantiated with an **absolute path** to the project root. Do not use `process.cwd()` — use an explicit, reliable path.

```typescript
import { EnvReader } from "$lib/env";
import path from "path";

const env = new EnvReader(path.resolve(__dirname, "../"));
```

---

## 2. Usage Pattern

Use the `env` instance to build a structured `config` object grouped by domain. Wrap it with `asReadonly` to prevent mutation.

```typescript
import { EnvReader, asReadonly } from "$lib/env";

const env = new EnvReader(path.resolve(__dirname, "../"));

const config = asReadonly({
    database: {
        connectionString: env.string("DATABASE_URL"),
        maxPoolSize:      env.int("DB_POOL_MAX", 20),
    },
    auth: {
        secret:    env.string("JWT_SECRET"),
        expiresIn: env.int("JWT_EXPIRATION", 60 * 60 * 8), // 8 hours
    },
    env: env.oneOf("APP_ENV", ["dev", "prod", "test"], "prod"),
});
```

---

## 3. Available Methods

### Primitive Types
| Method | Description |
|---|---|
| `env.string(key, default?, trim?)` | Reads a string. `trim` is `true` by default. |
| `env.int(key, default?, radix?)` | Parses an integer. `radix` is `10` by default. |
| `env.float(key, default?)` | Parses a floating-point number. |
| `env.boolean(key, default?)` | Parses `1/0`, `yes/no`, or `true/false` into a boolean. |
| `env.oneOf(key, values, default?)` | Validates the value is one of the allowed strings. Returns a typed literal. |

### Complex Types
| Method | Description |
|---|---|
| `env.url(key, default?)` | Validates and returns a `URL` object. |
| `env.regex(key, default?)` | Validates and returns a `RegExp` object. |
| `env.list(key, parser, default?, separator?)` | Splits by `,` and applies a `parser` to each item. |

**`list` example:**
```typescript
// ALLOWED_PORTS=80,443,3000
const ports = env.list("ALLOWED_PORTS", v => parseInt(v, 10)); // [80, 443, 3000]
```

### Filesystem Types
Return **absolute paths**.
| Method | Description |
|---|---|
| `env.file(key, default?, onMissing?, stayInProject?)` | Resolves a file path. |
| `env.dir(key, default?, onMissing?, stayInProject?)` | Resolves a directory path. |

**`onMissing` parameter:**
- `true` (default): Throws an error.
- `false`: Returns the path silently.
- `(path) => {}`: Executes a callback.

**`stayInProject`** (default `true`): Prevents path traversal outside the project root.

---

## 4. Core Rules for LLMs

1. **NEVER** access `process.env` directly. Always use the `env` instance.
2. All env vars must be read when building the single top-level `config` object at startup (`context.ts`).
3. Group config variables by domain (`database`, `auth`, `storage`, etc.).
4. Wrap the config object with `asReadonly()` to get a `DeepReadonly<Config>` type.
5. Modules **do not** receive config directly — they access it via `services.config`.
6. Perform calculations within the config object, not in env var values.
   - **Good:** `expiresIn: env.int("JWT_EXP_SECONDS", 60 * 60 * 8)`
   - **Bad:** `JWT_EXP_SECONDS=28800`
7. If a variable is missing and has no default, the app **must** throw immediately.
