# Plan Close Workflow

## Trigger
- `close plan <filename>` — explicit command
- `close @<planfile>` — file reference shorthand (e.g. `close @work/plan.foo.md`)

## Extensions & Modular Procedures
Before proceeding, you **MUST** read and apply all extension documents matching:
👉 `work/contribution/sop-ext.close.*.md`

## Steps
1. **Verification:** Are all todos belonging to this plan already in `journal/`?
   If not, notify the user — do not close the plan until then.
2. **Docs Update:** Document the implemented changes in `work/docs/guides/`
   — not the plan text, but the facts: what works and how.
3. **Close Plan:** Move the plan file to `journal/`:
   `YYYY-MM-DD-HH-MM.closed.plan-name.md`

## Note
The plan archived in `journal/` preserves the decision context: what the original intent was,
what changed along the way and why. `docs/guides/` in contrast only describes the present state.
