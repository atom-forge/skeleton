---
status: active
tags: [frontend]
---

# Plan: ClientApp — Kliens oldali service/modul architektúra

## Motiváció

A szerver oldali `app` (Config → Services → Modules → Api → App) jól bevált mintát nyújt,
de a kliens oldalon jelenleg csak egy nyers `createClient<Api>` hívás létezik
(`src/routes/client.ts`). Ahogy a kliens oldali logika növekszik (auth állapot, WebSocket,
feature flags, optimistic updates stb.), szükség van egy strukturált, tesztelhető
és DI-alapú kliens rétegre.

---

## Cél

Létrehozni a `src/lib/client/` könyvtárat, amely a szerver oldali `app` mintáját követi,
de a kliens oldali sajátosságokhoz igazítva:

- **Config → ClientServices → ClientModules → ClientApp**
- Nincs `Api` réteg (az RPC kliens maga a híd a szerver felé)
- Svelte context alapú inicializálás (nem singleton — a sveltekit-standards rule értelmében)
- Modulok `.svelte.ts` fájlokban írhatók, hogy Svelte 5 rune-okat (`$state`, `$derived`) használhassanak

---

## Tervezett struktúra

```
src/lib/client/
├── index.ts                    # ClientApp type, createClientApp(), setClientApp(), getClientApp()
├── config.ts                   # ClientConfig type (intersection of service configs)
├── services/
│   ├── index.ts                # ClientServices type + createClientServices()
│   ├── rpc.ts                  # createRpcService() — a jelenlegi src/routes/client.ts átköltöztetve
│   └── i18n.svelte.ts          # createI18nService() — fordítások + locale állapot
└── modules/
    ├── index.ts                # ClientModules type + createClientModules()
    └── (üres, bővítésre kész)
```

**Belépési pont:** `+layout.svelte`-ben `setClientApp()` hívás, minden child komponensből
`getClientApp()` segítségével elérhető.

---

## Architekturális különbségek a szerver `app`-hoz képest

| Szempont           | Server `app`                  | `clientApp`                              |
|--------------------|-------------------------------|------------------------------------------|
| Init hely          | `hooks.server.ts`             | `+layout.svelte`                         |
| Config forrás      | `EnvReader` + `.env`          | `$env/public` (build-time)               |
| Elérés             | `event.locals.app`            | `getClientApp()` (Svelte context)        |
| Api réteg          | van                           | **nincs** — az RPC service tölti be      |
| Modul fájlok       | `.ts`                         | `.svelte.ts` ha rune-okat használ        |
| Singleton tiltás   | nem releváns (SSR, per-req)   | kötelező — sveltekit-standards rule      |

---

## Szabályok (a meglévő architecture.md kiegészítéseként)

1. `ClientService` factory szignatúrája: `createFooService(config: ClientConfig, services: ClientServices)`
2. `ClientModule` factory szignatúrája: `createFooModule(config: ClientConfig, services: ClientServices, modules: ClientModules)`
3. A `ClientApp` **nem singleton** — Svelte context-en keresztül érhető el.
4. A `ClientConfig` az intersection pattern-t követi (`FooClientConfig & BarClientConfig`); értékeit `$env/public` változókból kell összerakni.
5. `ClientServices` és `ClientModules` típusok `ReturnType`-alapúak — kézzel nem írandók.
6. Service vagy modul fájl `.svelte.ts` legyen, ha belsőleg `$state` / `$derived` rune-t használ.
7. A `src/routes/client.ts` megszűnik — az RPC kliens a `ClientServices` része lesz.

---

## i18n Service tervezet

Egyszerű példaként szerepel — célja az architektúra demonstrálása, nem egy teljes i18n megoldás.

Statikus JSON dictionary-k, egy reaktív `locale` `$state`, és egy `t()` függvény kulcs+paraméter interpolációval. Könyvtár nélkül.

```ts
// src/lib/client/services/i18n.svelte.ts
export type I18nConfig = { i18n: { defaultLocale: string } };

export function createI18nService(config: ClientConfig, _services: ClientServices) {
    const dictionaries: Record<string, Record<string, string>> = {};
    let locale = $state(config.i18n.defaultLocale);

    return {
        get locale() { return locale; },
        load(l: string, dict: Record<string, string>) { dictionaries[l] = dict; },
        setLocale(l: string) { locale = l; },
        t(key: string, params?: Record<string, string>): string {
            let str = dictionaries[locale]?.[key] ?? key;
            if (params) str = str.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
            return str;
        },
    };
}
```

---

## Feladatok

- [x] `task.CLIENT-APP-01-scaffold.md` — `src/lib/client/` alap struktúra (config, services/rpc + i18n, modules, index)
- [ ] `task.CLIENT-APP-02-wire.md` — `+layout.svelte` bekötés, `src/routes/client.ts` eltávolítása, érintett route-ok frissítése
- [ ] `task.CLIENT-APP-03-rules.md` — `work/contribution/rules/architecture.md` kiegészítése a clientApp szabályokkal, guide írása

---

## CLIENT-APP-01 Key Decisions

- `RpcConfig` uses `config.rpc.apiPrefix` (not a hardcoded `'/api'`) — keeps the prefix configurable at wire-time via `$env/static/public`.
- `ClientModules` is typed as `Record<string, never>` for an empty-but-sound shape. `createClientModules` still accepts all three canonical args to maintain factory signature consistency.
- `i18n.svelte.ts` uses `.svelte.ts` extension because `$state` rune lives inside the factory closure.
- `src/routes/client.ts` left untouched — removal is scoped to CLIENT-APP-02-wire.
- Guide created at `work/docs/guides/client-app.md`.
