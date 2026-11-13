# AI Developer Guidelines

Te vagy a projekt AI fejlesztő társa. A kód, a tesztelés és a technikai dokumentáció karbantartása a feladatod, a fejlesztővel szoros együttműködésben.

## Mappaszerkezet
- `+ai-rules/` — kódolási irányelvek (szelektíven olvasd be, lásd lent).
- `.claude/skills/prisma-8/` — a telepített Prisma 8 RC saját skillje (`bunx prisma skills sync` frissíti). **Prisma munka előtt kötelező.**
- `notes/` — ötletek, tervek, elhalasztott feladatok. Ide kerül minden jegyzet.
- `server/` — a szerveralkalmazás: `app.ts` (config a `.env`-ből), `application/` (rétegek: services → modules → api-support → api, plusz `exposure/`), `lib/` (rétegfüggetlen segédek), `cli.ts` (`bun run cli`).
- `shared/` — amit a szerver és a kliens is használ: zod sémák és állandók (`schemas/`).
- `src/lib/` — csak hordozható kód (`api.ts`, `stores/`); minden alkalmazás-specifikus a `src/routes/` alatt van, a fogyasztók legközelebbi közös ősének `(+lib)/` mappájában (lásd `code.frontend.md`).
- `prisma/contract.prisma` — az adatszerződés; a `contract.json` és `contract.d.ts` generált.

## Szabályok szelektív betöltése

| Terület | Szabályfájl(ok) |
| :--- | :--- |
| Frontend / Svelte (`src/**`) | `code.frontend.md`, `code.error-handling.md` |
| Backend / modulok / RPC / Prisma (`server/**`, `prisma/**`, `shared/**`) | `code.backend.md`, `code.authorization.md`, `code.error-handling.md` + `.claude/skills/prisma-8/SKILL.md` |
| Fájlfeltöltés / csatolmányok | `code.attachments.md` |

## Alapszabályok
- Csomagkezelő és futtatókörnyezet: **Bun** (`bun`, `bunx`). Ne használj npm-et/pnpm-et/yarn-t.
- A UI szövegei magyarul íródnak; az URL-ek (route-ok, paraméterek, horgonyok) angolul. A kód, a kódkommentek és a `///` doc kommentek angolul vagy magyarul — a környező kódhoz igazodva.
- Dev szerver: `bun run dev`.
- Típusellenőrzés: `bun run check` — 0 hibával és 0 figyelmeztetéssel kell zárulnia.
- Adatbázist soha ne resetelj és ne dobj el.
- Nem deployolunk: deploy csak kifejezett kérésre.
- Commit és push csak kérésre.
- Titkok csak a `.env`-ben vannak, soha nem a `.env.example`-ben.
