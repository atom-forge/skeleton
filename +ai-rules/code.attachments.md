# Attachments (@atom-forge/attachment)

The package is installed but not wired yet. When the first upload is needed, set it up along these rules.

## Setup

- A service in `server/application/services/attachment.ts` configures the entities and their categories; its config type (`AttachmentConfig`) joins `Config`, the values come from `.env` in `server/app.ts`.
- Storage: S3-compatible buckets given as URLs — originals in `S3_STORAGE`, generated image sizes in `S3_IMAGE` (a cache that can be emptied); minio in development. Without buckets the files stay on disk (`UPLOAD_DIR`, default `var/uploads`, git-ignored).
- Image variants (sizes) live in `shared/image-variants.ts`.
- Metadata lives in the entity's `attachments Json?` field.

## Rules

- Every category has a short code (e.g. `AV` for avatar). The code is part of every stored group id and URL: never change one once files exist.
- Writes mutate `entity.attachments` in place; persist the field right after (`.where({id}).update({attachments: entity.attachments as any})`). Wrap the persist in `try/catch` and call `rollback()` on failure.
- Deleting an entity: delete the row, then `attachments.<entity>(row).purge()`.
- The stored `attachments` JSON never goes to the client. Only ready URLs go out, through an `expose` view (see `code.authorization.md`).
- Files are served by dedicated `/file/...` and `/img/...` routes (the only non-RPC endpoints besides protocol callbacks). Never let a reverse proxy serve the buckets directly when a category is access-controlled.
- Private categories have an `authorize` hook and a `private/` storage prefix; the owning module registers the check. Without a registered check nobody gets the file.
- Frontend: never concatenate attachment URLs by hand; use the URLs (and `srcset` variants) the view returns.
- Large files: adapter-node's `BODY_SIZE_LIMIT` must stay above the largest allowed upload.
