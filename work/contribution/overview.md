# Work Directory Overview

The `work/` directory contains all non-code project artifacts — documentation, planning, task tracking, and AI guidelines.

## Folder Structure

| Path | Audience | Purpose |
|---|---|---|
| `contribution/` | AI + humans | Architectural rules, SOPs, and AI behavioral guidelines. The source of truth for how to work in this repo. |
| `contribution/rules/` | AI + humans | Architectural and technical rules. Load the relevant ones before any implementation task. |
| `contribution/sop/` | AI | Step-by-step procedures for common workflows (create, execute, close, log). |
| `journal/` | AI + humans | Immutable archive of completed todos, closed plans, and ad-hoc change logs. Timestamped files. |
| `docs/guides/` | AI + humans | Living documentation of the current system state — what exists and how it works. |
| `docs/specs/` | Humans | Human-facing feature specifications, requirements, and design decisions. Not directly consumed by AI. |

## Active Work (directly under `work/`)

Active plans and todos live directly in `work/` — no subdirectory. Use filename prefixes to identify type:

| Prefix | Example | Purpose |
|---|---|---|
| `plan.*` | `plan.auth-overhaul.md` | Broader initiative. Todos are derived from these. |
| `todo.*` | `todo.add-user-module.md` | Discrete unit of work with acceptance criteria, executed by AI. |

### Journal Archive Prefixes

| Prefix | Example | Purpose |
|---|---|---|
| `done.*` | `2026-04-07-18-45.done.add-user-module.md` | Archived (completed) todo. |
| `closed.*` | `2026-04-07-18-45.closed.auth-overhaul.md` | Archived (closed) plan. |
| `adhoc.*` | `2026-04-07-18-45.adhoc.change-name.md` | Ad-hoc change log. |

---

## AI Commands & SOPs

Recognize the following commands and follow the linked SOP immediately:

- `create todo <description|plan file>`
  👉 `work/contribution/sop/create.md`

- A todo reference from `work/` (without other instruction = execute it)
  👉 `work/contribution/sop/execute.md`

- `close todo [filename]`
  👉 `work/contribution/sop/execute.md` (Phase 2)

- `close plan <filename>` or `close @<planfile>`
  👉 `work/contribution/sop/close.md`

- Anything else that doesn't fit the above = ad-hoc work. Execute it, then judge:
  does it have architectural significance? If yes, log it.
  👉 `work/contribution/sop/log-adhoc.md`

---

## Temporary Files (`var/tmp/`)

During implementation, temporary scripts and tests belong in `var/tmp/`. This directory is gitignored. Use filename prefixes:

| Prefix | Example | Purpose |
|---|---|---|
| `script.*` | `script.migrate-users.py` | One-off utility scripts needed during implementation. |
| `test.*` | `test.user-module.ts` | Temporary tests for verifying in-progress work. Part of the implementation iteration — not permanent tests. |

Permanent, long-lived tests go in `tests/` instead.

---

## Key Reminders

- **Always read the relevant documentation before using any internal API or framework.**
- **Follow the architectural rules defined in `work/contribution/rules/` — no exceptions.**
- **When in doubt, ask. Don't assume.**
- **Valid tags:** `frontend`, `backend`, `api`, `db`, `auth`, `attachments`, `websocket`
