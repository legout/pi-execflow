<!-- execflow-generated -->
# pi-execflow Workflow

Use this repository's execflow workflow for planning and ticket execution.

Primary tracker selected during init-execflow: `br`

## ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `.execflow/PLANS.md`) from design to implementation.

## Public workflow

Use the simplified five-command path for normal work:

- `/ef-plan <topic>` creates the canonical ExecPlan. It is the public front door for brainstorming, plan creation, and plan grilling.
- `/ef-tasks <topic>` converts the ExecPlan into dependency-aware tracked work items. It is the public front door for tracker item creation.
- `/ef-work <ticket-or-issue-ref>` executes one tracked work item through resolution, specification, scoped implementation, validation/fix looping, and finalization.
- `/ef-review <target>` reviews a work item, ExecPlan delivery, branch, diff, or path scope. Reviews are read-only by default and create follow-ups only with `--create-followups`.
- `/ef-sync` refreshes package prompt overlays and synchronizes prompt model frontmatter from `.execflow/settings.yml`.

The lower-level prompts are internal implementation leaves, not a legacy public surface. Do not keep old command names solely for backward compatibility; remove prompt files that are no longer used by the supported workflow and retire their overlays through `scripts/retired-prompts.mjs`.

## Planning workflow

- Use `/init-execflow [--tk|--br]` to scaffold planning files and initialize the chosen tracker.
- Use `/ef-sync` after editing `.execflow/settings.yml` to refresh prompt overlays and sync `.pi/prompts/` frontmatter.
- Treat `.execflow/settings.yml` `prompts:` as the source of truth for model-owning leaf prompts only. Wrapper prompts such as `/ef-plan`, `/ef-work`, and `/ef-sync` are intentionally omitted. `/ef-tasks` is configured because it directly owns the work-itemization LLM pass.
- Prompt taxonomy:
  - public workflow wrappers: `/ef-plan`, `/ef-tasks`, `/ef-work`, `/ef-sync`
  - wrappers without model ownership: `/ef-plan`, `/ef-work`, `/ef-sync`
  - local model-owning leaves: `/brainstorm`, `/create-plan`, `/grill-plan`, `/ef-tasks`, `/resolve`, `/spec`, `/implement`, `/validation-fix`, `/finalize`, `/ef-review`
  - deterministic + LLM setup leaf: `/init-execflow`
- Brainstorming, plan creation, and plan grilling are internal phases behind `/ef-plan`; keep only the prompt leaves still needed by that wrapper.
- Update architecture documentation after implementation when architecture docs need to reflect what was built.
- ExecPlans live at `.execflow/plans/<topic-slug>/execplan.md`.
- Brainstorms live at `.execflow/plans/<topic-slug>/brainstorm.md`.

## Tracker workflow

### br mode

- Use `br` for issue tracking.
- Use `/ef-tasks <topic>` as the public tracker-neutral command.
- Keep tracker-specific prompt leaves only when `/ef-tasks` still needs them internally.
- Use `/ef-work <issue-ref>` as the public implementation path.
- Use `/ef-review <issue-ref>` for a fresh focused work-item review. It is read-only by default; add `--create-followups` to create linked follow-up issues for concrete bug findings.
- Use `/ef-review <target>` for work-item, ExecPlan delivery, branch, diff, or path reviews. It is read-only by default; add `--create-followups` to create tracker follow-ups for material findings.
- Keep focused local prompt leaves (`/resolve`, `/spec`, `/implement`, `/validation-fix`, `/finalize`) only when `/ef-work` still needs them internally.
- Optional external delegated `/execflow-queue` commands, when available in the environment, are `tk`-oriented and should not be treated as the primary `br` execution path.

### tk mode

- Use `tk` for ticket tracking when the repository explicitly chooses it.
- Use `/ef-tasks <topic>` as the public tracker-neutral command.
- Keep tracker-specific prompt leaves only when `/ef-tasks` still needs them internally.
- Use `/ef-work <ticket-ref>` as the public implementation path.
- Use `/ef-review <ticket-ref>` for a fresh focused work-item review. It is read-only by default; add `--create-followups` to create linked follow-up tickets for concrete bug findings.
- Use `/ef-review <target>` for work-item, ExecPlan delivery, branch, diff, or path reviews. It is read-only by default; add `--create-followups` to create tracker follow-ups for material findings.
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
- `/ef-work` closure requires strict `Gate: PASS` validation evidence and means acceptance criteria were met; it does not imply independent review.
- Reviews are read-only by default. They create linked follow-up work items only when invoked with `--create-followups`.
- Keep ExecPlans and architecture documentation aligned with reality as work progresses.

## Coding behavior guidelines

These target-project guidelines adapt Andrej Karpathy's concise `CLAUDE.md` rules. They bias toward caution over speed; use judgment for trivial tasks.

### Think before coding

Do not assume, hide confusion, or pick silently between materially different interpretations.

- State assumptions when they affect the work.
- If multiple interpretations exist, present them and ask or choose only when the repo makes the answer clear.
- If a simpler approach exists, say so and push back when warranted.
- If something is unclear, stop, name the confusion, and ask.

### Simplicity first

Write the minimum code that solves the requested problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions, configurability, or extension points for single-use needs.
- No error handling for impossible scenarios.
- If a solution is much larger than necessary, simplify it before presenting it.

### Surgical changes

Touch only what you must. Clean up only your own mess.

- Do not improve adjacent code, comments, or formatting as a drive-by edit.
- Do not refactor things that are not broken unless the work item requires it.
- Match existing style, even if you would choose differently in a new project.
- If you notice unrelated dead code, mention it instead of deleting it.
- Remove imports, variables, functions, or tests that your changes made unused.
- Every changed line should trace directly to the requested outcome.

### Goal-driven execution

Define success criteria, then loop until they are verified or a blocker is explicit.

- Turn tasks into verifiable goals before editing.
- For bugs, prefer reproducing the failure first, then making the reproduction pass.
- For validation work, map each acceptance criterion to tests, checks, or manual evidence.
- For multi-step tasks, keep a brief plan where each step has an explicit verification check.
- Do not claim completion until the evidence has been run and inspected.
<!-- /execflow-generated -->
