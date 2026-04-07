---
tags: [db, backend]
applies_to: Any task that modifies the Prisma schema, runs migrations, or relies on database-level constraints.
---

# Database: Prisma Rules and Conventions

The single source of truth for the database schema is `prisma/schema.prisma`.

## Workflow for Schema Changes
1. Modify `schema.prisma`.
2. Run migration: `bunx prisma migrate dev`
3. Regenerate client: `bunx prisma generate`

## General Rules
- **Primary keys:** Prefer `String` UUIDs (`@default(uuid())`) or `Int` auto-increments. Document your choice here.
- **Soft delete:** If records must be recoverable, use a `deletedAt DateTime?` field instead of hard deletes.
- **Unique constraints:** Declare composite unique constraints explicitly with `@@unique`.
- **Relations:** Always define both sides of a relation. Use explicit `onDelete` behaviour.

> **Skeleton placeholder.** Add project-specific schema rules, naming conventions, and deletion/archival policies here.
