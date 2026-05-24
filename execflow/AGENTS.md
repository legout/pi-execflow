<!-- execflow-generated -->
# pi-execflow Workflow

Use this repository's execflow workflow for planning and ticket execution.

Primary tracker selected during init-execflow: `br`

## ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `.execflow/PLANS.md`) from design to implementation.

## Planning workflow

- Use `/init-execflow [--tk|--br]` to scaffold planning files and initialize the chosen tracker.
- Use `/sync-models` after editing `.execflow/settings.yml` to sync `.pi/prompts/` frontmatter.
- Treat `.execflow/settings.yml` `prompts:` as the source of truth for model-owning leaf prompts only; wrapper prompts like `/ef-implement`, `/refresh-prompts`, and `/sync-models` are intentionally omitted.
- Prompt taxonomy:
  - wrappers without model ownership: `/ef-implement`, `/refresh-prompts`, `/sync-models`
  - local model-owning leaves: planning/execution/review prompts such as `/brainstorm`, `/create-plan`, `/grill-plan`, `/improve-plan`, `/implement`, `/validation-fix`, `/ef-review`, `/execplan-review`, `/change-review`
  - deterministic + LLM setup leaf: `/init-execflow`
- Use `/brainstorm <topic>` to explore the problem, inspect project context, compare approaches, and get design approval before planning.
- Use `/create-plan <topic>` to create a self-contained ExecPlan.
- Use `/grill-plan <topic>` to pressure-test the ExecPlan interactively before work-item creation.
- Use `/improve-plan <topic>` to deep-audit and improve the ExecPlan with code-grounded corrections.
- Use `/update-architecture [topic]` after implementation when architecture documentation needs to reflect what was built.
- ExecPlans live at `.execflow/plans/<topic-slug>/execplan.md`.
- Brainstorms live at `.execflow/plans/<topic-slug>/brainstorm.md`.

## Tracker workflow

### br mode

- Use `br` for issue tracking.
- Use `/create-work-items <topic>` to auto-select the primary tracker.
- Use `/create-issues <topic>` to convert an ExecPlan into dependency-aware `br` issues.
- Use `/ef-implement <issue-ref>` for validation-only implementation: `/spec` normalizes requirements and validation expectations, `/implement` edits code/tests without running validation commands, `/validation-fix` owns bounded validation/fix looping, and `/finalize` closes/commits only after strict `Gate: PASS` evidence.
- Use `/ef-review <issue-ref>` for a fresh focused work-item review. It is read-only by default; add `--create-followups` to create linked follow-up issues for concrete bug findings.
- Use `/execplan-review <plan>` for whole-plan delivery audits across derived issues/tickets. It is read-only by default; add `--create-followups` to create tracker follow-ups for material gaps.
- Use `/change-review [--base <ref>] [paths/context...]` for broad arbitrary branch/diff/path reviews. It is read-only by default; add `--create-followups` to create tracker follow-ups for concrete bug findings.
- Use focused local prompts (`/resolve`, `/spec`, `/implement`, `/validation-fix`, `/validate`, `/fix`, `/finalize`) for narrower manual passes.
- Optional external delegated `/execflow-queue` commands, when available in the environment, are `tk`-oriented and should not be treated as the primary `br` execution path.

### tk mode

- Use `tk` for ticket tracking when the repository explicitly chooses it.
- Use `/create-work-items <topic>` to auto-select the primary tracker.
- Use `/create-tickets <topic>` to convert an ExecPlan into dependency-aware `tk` tickets.
- Use `/ef-implement <ticket-ref>` for validation-only implementation: `/spec` normalizes requirements and validation expectations, `/implement` edits code/tests without running validation commands, `/validation-fix` owns bounded validation/fix looping, and `/finalize` closes/commits only after strict `Gate: PASS` evidence.
- Use `/ef-review <ticket-ref>` for a fresh focused work-item review. It is read-only by default; add `--create-followups` to create linked follow-up tickets for concrete bug findings.
- Use `/execplan-review <plan>` for whole-plan delivery audits across derived issues/tickets. It is read-only by default; add `--create-followups` to create tracker follow-ups for material gaps.
- Use `/change-review [--base <ref>] [paths/context...]` for broad arbitrary branch/diff/path reviews. It is read-only by default; add `--create-followups` to create tracker follow-ups for concrete bug findings.
- If your environment provides the optional external delegated `tk` workflow, use `/execflow-queue` for sequential batch execution.
- If your environment provides the optional external delegated `tk` workflow, use `/execflow-reset` to clear stale orchestrator state.

## Artifact locations

### Planning artifacts

- `.execflow/plans/<topic-slug>/brainstorm.md`
- `.execflow/plans/<topic-slug>/execplan.md`
- `.execflow/settings.yml`
- `.pi/prompts/*.md`
- `ARCHITECTURE.md`

### Optional delegated runtime artifacts (`tk` delegated flow only)

- `execflow/state.json`
- `execflow/<ticket-id>/implementation-<run-token>.md`
- `execflow/<ticket-id>/validation-<run-token>.md`
- `execflow/<ticket-id>/review-<run-token>.md`
- `execflow/progress.md`
- `execflow/lessons-learned.md`

## Work-item guidance

- If a ticket or issue contains an `ExecPlan Reference` block, read the referenced ExecPlan before implementing or reviewing.
- `/ef-implement` closure requires strict `Gate: PASS` validation evidence and means acceptance criteria were met; it does not imply independent review.
- Reviews are read-only by default. They create linked follow-up work items only when invoked with `--create-followups`.
- Keep ExecPlans and architecture documentation aligned with reality as work progresses.

## Coding behavior guidelines

These guidelines are adapted from Andrej Karpathy-inspired Claude Code rules. They bias toward caution over speed; use judgment for trivial one-line changes.

### Think before coding

- Do not assume silently. State assumptions explicitly when they affect the work.
- If multiple interpretations exist, present them instead of picking one invisibly.
- If a simpler approach exists, say so and push back when warranted.
- If something is unclear, stop, name the confusion, and ask for clarification.

### Simplicity first

- Write the minimum code that solves the requested problem.
- Do not add features beyond what was asked.
- Do not introduce abstractions for single-use code.
- Do not add configurability, extension points, or speculative flexibility unless requested.
- Do not add error handling for impossible scenarios.
- If a 200-line solution could be 50 lines, simplify it before presenting it.

### Surgical changes

- Touch only what the work item or explicit user request requires.
- Do not improve adjacent code, comments, formatting, or naming as a drive-by edit.
- Do not refactor things that are not broken unless the work item requires it.
- Match existing style and patterns, even when you would personally choose differently.
- If you notice unrelated dead code, mention it instead of deleting it.
- Remove imports, variables, functions, or tests that your own changes made obsolete.
- Do not remove pre-existing dead code unless asked.
- Every changed line should trace directly to the requested outcome.

### Goal-driven execution

- Convert imperative tasks into verifiable goals with concrete success criteria.
- For bugs, prefer reproducing the failure first, then making the reproduction pass.
- For validation work, map each acceptance criterion to tests, checks, or manual evidence.
- For multi-step tasks, keep a brief plan where each step has an explicit verification check.
- Loop until the stated success criteria are met or a blocker is clearly reported.
<!-- /execflow-generated -->
