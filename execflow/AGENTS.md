<!-- execflow-generated -->
# pi-execflow Workflow

Use this repository's execflow workflow for planning and ticket execution.

Primary tracker selected during init-execflow: `tk`

## ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `.execflow/PLANS.md`) from design to implementation.

## Planning workflow

- Use `/init-execflow [--tk|--br]` to scaffold planning files and initialize the chosen tracker.
- Use `/sync-models` after editing `.execflow/settings.yml` to sync `prompts/` frontmatter.
- Use `/brainstorm <topic>` to explore the problem before locking a design.
- Use `/plan <topic>` to go from brainstorming through ExecPlan creation.
- Use `/plan-chain <topic>` only when brainstorming is already complete and the remaining planning steps are non-interactive.
- Use `/architect [topic]` to create or refresh `ARCHITECTURE.md` when the codebase context matters.
- ExecPlans live at `.execflow/plans/<topic-slug>/execplan.md`.
- Brainstorms live at `.execflow/plans/<topic-slug>/brainstorm.md`.

## Tracker workflow

### tk mode

- Use `tk` for ticket tracking.
- Use `/create-work-items <topic>` to auto-select the primary tracker.
- Use `/create-tickets <topic>` to convert an ExecPlan into dependency-aware `tk` tickets.
- Use `/execflow` for one-ticket delegated execution.
- Use `/execflow-queue` for sequential batch execution.
- Use `/execflow-reset` to clear stale orchestrator state.

### br mode

- Use `br` for issue tracking.
- Use `/create-work-items <topic>` to auto-select the primary tracker.
- Use `/create-issues <topic>` to convert an ExecPlan into dependency-aware `br` issues.
- Use `/exec-standard <issue-ref>` or the focused local prompts (`/resolve`, `/spec`, `/implement`, `/validate`, `/review`, `/finalize`) for manual implementation, validation, review, and finalization.
- The packaged delegated `/execflow` and `/execflow-queue` workflow is `tk`-oriented and should not be treated as the primary `br` execution path.

## Artifact locations

### Planning artifacts

- `.execflow/plans/<topic-slug>/brainstorm.md`
- `.execflow/plans/<topic-slug>/execplan.md`
- `.execflow/settings.yml`
- `ARCHITECTURE.md`

### Delegated runtime artifacts (`tk` delegated flow only)

- `execflow/state.json`
- `execflow/<ticket-id>/implementation-<run-token>.md`
- `execflow/<ticket-id>/validation-<run-token>.md`
- `execflow/<ticket-id>/review-<run-token>.md`
- `execflow/progress.md`
- `execflow/lessons-learned.md`

## Work-item guidance

- If a ticket or issue contains an `ExecPlan Reference` block, read the referenced ExecPlan before implementing or reviewing.
- Keep ExecPlans and architecture documentation aligned with reality as work progresses.
<!-- /execflow-generated -->
