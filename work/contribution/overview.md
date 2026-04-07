# Work Directory Overview

The `work/` directory contains all non-code project artifacts — documentation, planning, task tracking, and AI guidelines.

## Folder Structure

| Path | Audience | Purpose |
|---|---|---|
| `contribution/` | AI + humans | Architectural rules, SOPs, and AI behavioral guidelines. The source of truth for how to work in this repo. |
| `contribution/rules/` | AI + humans | Architectural and technical rules. Load the relevant ones before any implementation task. |
| `contribution/sop/` | AI | Step-by-step procedures for common workflows (create task, execute task, close, log). |
| `journal/` | AI + humans | Immutable archive of completed tasks, closed plans, and ad-hoc change logs. Timestamped files. |
| `docs/guides/` | AI + humans | Living documentation of the current system state — what exists and how it works. |
| `docs/specs/` | Humans | Human-facing feature specifications, requirements, and design decisions. Not directly consumed by AI. |

## Active Work (directly under `work/`)

Active plans and tasks live directly in `work/` — no subdirectory. Use filename prefixes to identify type:

| Prefix | Example | Purpose |
|---|---|---|
| `plan.*` | `plan.auth-overhaul.md` | Broader initiative. Tasks are derived from these. |
| `task.*` | `task.add-user-module.md` | Discrete unit of work with acceptance criteria, executed by AI. |

---

## AI Commands & SOPs

Recognize the following commands and follow the linked SOP immediately:

- `create task <description|plan file>`
  👉 `work/contribution/sop/create-task.md`

- A task reference from `work/` (without other instruction = execute it)
  👉 `work/contribution/sop/execute-task.md`

- `close task [filename]`
  👉 `work/contribution/sop/close-task.md`

- `close plan <filename>`
  👉 `work/contribution/sop/close-plan.md`

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
