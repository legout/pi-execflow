<!-- execflow-generated -->
# pi-execflow Workflow

Use this repository's execflow workflow for planning and ticket execution.

Primary tracker selected during ef-init: `br`

## ExecPlans

When writing complex features or significant refactors, use an ExecPlan (as described in `.execflow/PLANS.md`) from design to implementation.

## Public workflow

Use the simplified public command path for normal work:

- `/ef-plan <topic>` creates the canonical ExecPlan. It is the public front door for brainstorming, plan creation, and plan grilling.
- `/ef-tasks <topic>` converts the ExecPlan into dependency-aware tracked work items. It is the public front door for tracker item creation.
- `/ef-work <ticket-or-issue-ref>` quickly executes one simple tracked work item with scoped implementation, quick validation or inspection evidence, and self-review; it does not finalize.
- `/ef-work-tdd <ticket-or-issue-ref>` executes one tracked work item through resolution, specification, scoped implementation, validation/fix looping, and finalization.
- `/ef-review <target>` reviews a work item, ExecPlan delivery, branch, diff, or path scope. Reviews are read-only by default and create follow-ups only with `--create-followups`.
- `/ef-review-with-followups <ticket-or-issue-ref>` reviews one implemented work item and always creates tracker follow-ups for concrete findings.
- `/ef-ship [<ticket-or-issue-ref>|--next] [--max-retries N]` runs quick work, review with follow-up creation enabled, and conservative finalization. With no explicit target or with `--next`, it drains ready work until none is eligible.
- `/ef-ship-tdd [<ticket-or-issue-ref>|--next] [--max-retries N]` runs the TDD-oriented work-item execution chain, review with follow-up creation enabled, and conservative finalization. With no explicit target or with `--next`, it drains ready work until none is eligible.
- `/ef-autoship [--max-retries N]` drains ready `br` issues or `tk` tickets one at a time through the quick ship chain. It does not require `/prompt-tool on`. Defaults to `--max-retries 2` (three total attempts per work item).
- `/ef-autoship-tdd [--max-retries N]` drains ready `br` issues or `tk` tickets one at a time through the TDD ship chain. It does not require `/prompt-tool on`. Defaults to `--max-retries 2`.
- `/ef-update` refreshes package prompt and subagent overlays, removes retired prompt overlays, refreshes marker-managed execflow instructions, synchronizes prompt model frontmatter from `.execflow/settings.yml`, and refreshes native `br`/`bv` root `AGENTS.md` blocks in `br` projects.

The lower-level prompts are internal implementation leaves, not a legacy public surface. Remove prompt files that are neither public commands nor active internal leaves and retire their overlays through `scripts/retired-prompts.mjs`.

## Planning workflow

- Use `/ef-init [--tk|--br]` to scaffold planning files and initialize the chosen tracker.
- Use `/ef-update` after editing `.execflow/settings.yml` or updating the installed package to refresh prompt and subagent overlays, marker-managed execflow instructions, native `br`/`bv` root `AGENTS.md` blocks in `br` projects, and `.pi/prompts/` frontmatter.
- Treat `.execflow/settings.yml` `prompts:` as the source of truth for model-owning prompts only. Wrapper prompts such as `/ef-plan`, `/ef-work-tdd`, `/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, `/ef-autoship-tdd`, `/ef-update` are intentionally omitted. `/ef-work` and `/ef-tasks` are configured because they directly own LLM passes.
- Prompt taxonomy:
  - public workflow prompts: `/ef-init`, `/ef-plan`, `/ef-tasks`, `/ef-work`, `/ef-work-tdd`, `/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, `/ef-autoship-tdd`, `/ef-update`
  - wrappers without model ownership: `/ef-plan`, `/ef-work-tdd`, `/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, `/ef-autoship-tdd`, `/ef-update`
  - autoship selector leaves: `/ship-resolve`, `/ship-tdd-resolve`
  - local model-owning prompts: `/brainstorm`, `/create-plan`, `/grill-plan`, `/ef-tasks`, `/ef-work`, `/resolve`, `/ship-resolve`, `/ship-tdd-resolve`, `/spec`, `/implement`, `/validation-fix`, `/finalize`, `/ef-review`, `/ef-review-with-followups`
  - deterministic + LLM setup leaf: `/ef-init`
- Brainstorming, plan creation, and plan grilling are internal phases behind `/ef-plan`; keep only the prompt leaves still needed by that wrapper.
- Update architecture documentation after implementation when architecture docs need to reflect what was built.
- ExecPlans live at `.execflow/plans/<topic-slug>/execplan.md`.
- Brainstorms live at `.execflow/plans/<topic-slug>/brainstorm.md`.


## Subagent roles

`/ef-init` scaffolds and `/ef-update` refreshes pi-execflow-owned agents under `.pi/agents/`:

- `ef-worker` handles fresh-context implementation for `/ef-work` and `/implement`.
- `ef-validation-fix` handles fresh-context validation and minimal scoped repair for `/validation-fix`.
- `ef-reviewer` handles fresh-context review and may create tracker follow-ups only when `/ef-review --create-followups` or `/ef-review-with-followups` enables that explicitly.
- `ef-finalizer` handles fresh-context evidence checks, dirty-tree classification, final notes, commits, and safe tracker closure for `/finalize`.

Keep `/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, and `/ef-autoship-tdd` as inline orchestration wrappers; put subagent boundaries on their leaf steps, not on the wrappers. These chain-loop wrappers intentionally use `fresh: false` so prompt-template does not navigate branches between ready-work iterations; the side-effecting leaves still run in fresh subagent contexts.

## Tracker workflow

### br mode

- Use `br` for issue tracking.
- `br` is mandatory in this mode. Native `br` agent instructions belong in the project-root `AGENTS.md` and are managed with `br agents --add` / `br agents --update`, not copied into this file.
- If `bv` is installed, its native agent instructions also belong in the project-root `AGENTS.md` and are managed with `bv --agents-add` / `bv --agents-update`.
- Use `/ef-tasks <topic>` as the public tracker-neutral command.
- Keep tracker-specific prompt leaves only when `/ef-tasks` still needs them internally.
- Use `/ef-work <issue-ref>` as the quick public implementation path for simple work.
- Use `/ef-work-tdd <issue-ref>` when you want specification, RED/GREEN discipline, validation/fix looping, and finalization.
- Use `/ef-ship [<issue-ref>|--next] [--max-retries N]` when you want quick implementation, a follow-up-creating review, and finalization in one chain; no target or `--next` drains ready `br` issues.
- Use `/ef-ship-tdd [<issue-ref>|--next] [--max-retries N]` when you want the TDD-oriented ship path; no target or `--next` drains ready `br` issues.
- Use `/ef-autoship [--max-retries N]` to drain ready `br` issues sequentially through the quick ship chain; defaults to `--max-retries 2`.
- Use `/ef-autoship-tdd [--max-retries N]` to drain ready `br` issues sequentially through the TDD ship chain; defaults to `--max-retries 2`.
- Autoship selector prompts write `.pi/execflow-autoship-loop-marker.json` only on next-ready dispatch so chain-loop convergence continues across selected items and stops on no-ready iterations.
- Use `/ef-review <issue-ref>` for a fresh focused work-item review. It is read-only by default; add `--create-followups` to create linked follow-up issues for concrete bug findings.
- Use `/ef-review-with-followups <issue-ref>` when follow-up issue creation should always be enabled.
- Use `/ef-review <target>` for work-item, ExecPlan delivery, branch, diff, or path reviews. It is read-only by default; add `--create-followups` to create tracker follow-ups for material findings.
- Keep focused local prompt leaves (`/resolve`, `/spec`, `/implement`, `/validation-fix`, `/finalize`) only when `/ef-work-tdd` or `/ef-ship-tdd` still needs them internally.
- Optional external delegated `/execflow-queue` commands, when available in the environment, are `tk`-oriented and should not be treated as the primary `br` execution path.

### tk mode

- Use `tk` for ticket tracking when the repository explicitly chooses it.
- This project uses a CLI ticket system for task management. Run `tk help` when you need to use it.
- Use `/ef-tasks <topic>` as the public tracker-neutral command.
- Keep tracker-specific prompt leaves only when `/ef-tasks` still needs them internally.
- Use `/ef-work <ticket-ref>` as the quick public implementation path for simple work.
- Use `/ef-work-tdd <ticket-ref>` when you want specification, RED/GREEN discipline, validation/fix looping, and finalization.
- Use `/ef-ship [<ticket-ref>|--next] [--max-retries N]` when you want quick implementation, a follow-up-creating review, and finalization in one chain; no target or `--next` drains ready `tk` tickets.
- Use `/ef-ship-tdd [<ticket-ref>|--next] [--max-retries N]` when you want the TDD-oriented ship path; no target or `--next` drains ready `tk` tickets.
- Use `/ef-autoship [--max-retries N]` to drain ready `tk` tickets sequentially through the quick ship chain; defaults to `--max-retries 2`.
- Use `/ef-autoship-tdd [--max-retries N]` to drain ready `tk` tickets sequentially through the TDD ship chain; defaults to `--max-retries 2`.
- Autoship selector prompts write `.pi/execflow-autoship-loop-marker.json` only on next-ready dispatch so chain-loop convergence continues across selected items and stops on no-ready iterations.
- Use `/ef-review <ticket-ref>` for a fresh focused work-item review. It is read-only by default; add `--create-followups` to create linked follow-up tickets for concrete bug findings.
- Use `/ef-review-with-followups <ticket-ref>` when follow-up ticket creation should always be enabled.
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
- `/ef-work` emits quick `Gate: PASS` / `Gate: REVISE` / `Gate: BLOCKED` evidence but does not close by itself.
- `/ef-work-tdd` closure requires strict `Gate: PASS` validation evidence and means acceptance criteria were met; it does not imply independent review.
- Reviews are read-only by default. They create linked follow-up work items only when invoked with `--create-followups`, and emit a `# Finalization Handoff` block for downstream closure decisions.
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
