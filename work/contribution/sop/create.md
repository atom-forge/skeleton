# New Todo Definition Workflow

## Trigger
`create todo <description|plan file>`

## Workflow Steps
1. **Input Analysis:** For descriptions, clarify the goal and AC (Acceptance Criteria). For plan files, read them and derive todo(s) from them.
2. **Context Analysis (AI):** Analyze existing planning, docs, and contribution rules.
3. **Draft Todo:** Draft the todo using the template below. Always include the mandatory ACs listed in the template.
4. **Approval & Creation:** Upon user approval, create the `.md` file in `work/` following the naming conventions below.

### Naming Conventions
- Filename format: `todo.<name>.md` (e.g., `todo.fix-login-bug.md`). Extension MUST be `.md`.
- **Project Grouping:** If a todo belongs to a broader plan or project, use a clear prefix (e.g., `todo.AUTH-01-login-ui.md`).
- **Sequential Order:** If creating multiple related todos, prefix filenames with numbers to define execution order (e.g., `todo.01-setup.md`, `todo.02-implement.md`).

## Todo Template

---
status: active
plan:
tags: []
---

# Todo: <TODO_NAME>

## Source / Context
<!-- Link plan docs or specification here -->

## Description
<!-- What is the core goal? -->

## Acceptance Criteria
- [ ] <!-- Specific requirement 1 -->
- [ ] No type errors (`bun run check` or `tsc`).
- [ ] Documentation updated (including updating the linked plan file to reflect actual implementation).
- [ ] Relevant documents in `work/docs/guides/` and `work/contribution/rules/` updated as needed.

## Technical Notes
<!-- Affected files, API endpoints, rules. -->

## Implementation Log
<!-- Progress records here -->
