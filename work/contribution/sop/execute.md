# AI Assistant Workflow (Execute Todo)

## Phase 1: Setup & Execution (Do this immediately)

0. **Order Check:**
   Before doing anything else, check if the todo being executed is part of a plan chain:
   - Read the `plan` field from its frontmatter.
   - If `plan` is set, list all other `work/todo.*.md` files that reference the same plan.
   - If any such sibling todo exists in `work/` and sorts **before** the current one
     (by filename — e.g. `REFAKT-1` before `REFAKT-2`), warn the user:
     > "This todo has an unfinished predecessor in `work/`: [filename]. Execute that one first."
   Do not proceed until the user confirms.

1. **Understand the Rules:**
   Read the frontmatter of all `work/contribution/rules/*.md` files. Load only those
   where tags intersect with the todo's tags. If the todo has no tags, load all rules — no exceptions.

2. **Assess Current State:**
   If `plan` is set in the todo's frontmatter, read the linked plan file first — prior
   todo decisions are documented there. Then review `work/docs/guides/` and any other linked
   planning documents.

### Git: Branch Setup
Before starting implementation:
- Identify the todo name from the todo file (e.g., `ATTACH-05-module-refactor`).
- Switch to `main`: `git checkout main`.
- Ensure a clean state: `git status`. If dirty, ask for instructions.
- Sync with remote: `git pull`.
- Create feature branch: `git checkout -b feature/<todo-name>`.

3. **Implement:**
   Implement the feature as described in the todo.

4. **Log Decisions (Implementation Log):**
   Append an `## Implementation Log` section to the todo file.
	- Document all technical and architectural decisions in detail.
	- Update associated planning documents to keep them in sync.
	- Review related todos to prevent logic conflicts.

5. **Stop & Review:**
   Tell the user what you did and ask them to test it.
   Iterate based on feedback.

### Testing & Validation
Before requesting approval:
- **Type Safety:** Run `bun run check` after every significant code change and before requesting approval.
- **Linting:** If the project has linting configured (e.g., `npm run lint`), run it to ensure style consistency.
- **Fixing:** Use automated fixers (e.g., `eslint --fix`, `prettier --write`) if available before committing.
- **Custom Testing:** If temporary scripts or tests are needed during implementation, create them in `var/tmp/` using the naming convention `script.<name>.ext` or `test.<name>.ts`. These are gitignored and disposable. Permanent tests go in `tests/`.
- **Log Results:** Record testing outcome (e.g., test coverage, success/failure) in the todo's Implementation Log.

   **Do NOT proceed to Phase 2 until the user says: `close todo`.**

---

## Phase 2: Wrap-up (Do this ONLY after `close todo`)

1. **Documentation Update:**
	- Update `work/docs/guides/` to reflect the final state.
	- Update `work/contribution/rules/` if architectural conventions changed.

2. **Key Decisions Handoff:**
   If `plan` is set in the todo's frontmatter, append a `## [TODO-ID] Key Decisions`
   section to the linked plan file with the architectural decisions made during this todo.
   This provides context for subsequent todos in the same chain.

3. **Archive the todo:**
   Move the todo from `work/` to `work/journal/`:
   `YYYY-MM-DD-HH-MM.done.todo-name.md`

### Git: Commit & Merge
After archiving:
- Stage all changes: `git add .`.
- Create a Conventional Commit (e.g., `feat: implement ATTACH-05 module refactor`).
- Merge to main: `git checkout main && git merge feature/<todo-name>`.
- Cleanup: `git branch -d feature/<todo-name>`.

4. **Ready for Next Todo:**
   Inform the user the todo is fully wrapped up.
