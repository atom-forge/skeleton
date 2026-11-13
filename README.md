# skeleton

SvelteKit (Svelte 5, runes) + `@atom-forge/rpc` + Prisma 8 (PostgreSQL) + Tailwind 4 + `@atom-forge/ui`, Bun alatt.

```sh
bun install
cp .env.example .env      # DATABASE_URL beállítása
bun run dev               # fejlesztői szerver
bun run check             # típusellenőrzés (0 hiba, 0 figyelmeztetés)
bun run build && bun run start
```

Adatbázis: `bunx prisma contract emit` a `prisma/contract.prisma` szerkesztése után, `bun run db:update` a fejlesztői adatbázisra.

Az AI fejlesztői szabályok: `CLAUDE.md` és `+ai-rules/`.
