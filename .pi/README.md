# pi-execflow package resources

This repository is a **Pi package** that bundles prompt templates, skills, scripts, and `.ticket-flow` artifact templates.

The files in `.pi/` are package resources for Pi itself:

- prompt templates live under `.pi/prompts/`
- local ticket/issue execution skills live under `.pi/skills/`
- they work together with the planning skills shipped under `skills/`
- they provide a workflow for:
  - brainstorming and planning
  - ExecPlan creation and improvement
  - converting plans into tracked work
  - manual single-ticket / single-issue execution

This package complements the delegated `tk` workflow rather than replacing it.

## How this fits into a target project

Use the delegated `tk` workflow when you want the repository's official delegated execution model:

- `/ticket-flow`
- `/ticket-queue`
- `/ticket-test-fix`
- `/ticket-reset`

Use the local `.pi/prompts/` commands when you want:

- planning inside the current repo without leaving the local overlay
- tracker-aware plan splitting for either `tk` or `br`
- explicit, manual prompt passes against one ticket or issue reference
- `br` issue execution, where the local overlay is the primary supported path

That distinction matters in this repository because `pi-ticket-flow` already has strong opinions about:

- `tk` ticket state
- `ticket-flow/` runtime artifacts
- delegated worker/reviewer subagents
- review/finalization gates

The local overlay therefore keeps ticket execution helpers `ticket-*`-prefixed, while reusing the packaged planning skills for generic planning commands.

## Key design choices

### Planning and execution are separate lanes

The local overlay now covers two adjacent lanes:

1. **Planning lane** — brainstorm, architecture, ExecPlan authoring, ExecPlan improvement, and plan-to-tracker conversion.
2. **Execution lane** — resolve one ticket or issue, normalize the spec, plan the smallest change, implement, validate, review, and finalize.

That split keeps planning artifacts (`.ticket-flow/plans/...`) separate from execution evidence and tracker state.

### Model config is file-driven

Prompt frontmatter models are synced from `.ticket-flow/settings.yml`.

- edit `.ticket-flow/settings.yml` to change model roles
- run `/ticket-flow-setup-models` to rewrite `.pi/prompts/*.md`
- rerun `/ticket-flow-init` only when you want broader workflow/bootstrap changes

### Single skill per normal prompt

This repository vendors `pi-prompt-template-model`, and its normal prompt execution path treats `skill` as a single string, not as a first-class list.

Because of that, normal prompts in `.pi/prompts/` use **one skill each**.
When a prompt needs multiple concerns, it either:

- uses a composite local `ticket-*` skill, or
- reuses a single packaged planning skill such as `brainstorm`, `architect`, `execplan-create`, or `execplan-improve`

### Chain prompts for orchestration

The overlay uses prompt-template `chain:` frontmatter for orchestration wrappers:

- `/plan-chain`
- `/ticket-review`
- `/ticket-execute-standard`
- `/ticket-execute-strict`

Those wrappers do not carry their own `model` or `skill` frontmatter. Each leaf step owns its own model, thinking level, and skill.

### Tracker-aware plan splitting

The local overlay supports two plan-splitting commands:

- `/create-work-items <topic>` to auto-select the right tracker
- `/create-tickets <topic>` for `tk`
- `/create-issues <topic>` for `br`

They share the same high-level goal — turn ExecPlan milestones into dependency-aware work items with an `ExecPlan Reference` block — but they target different trackers and scheduling semantics.

## Directory layout

```text
.pi/
  MODELS.md
  README.md

  prompts/
    architect.md
    brainstorm.md
    plan.md
    plan-chain.md
    plan-create.md
    plan-improve.md
    create-work-items.md
    create-tickets.md
    create-issues.md
    ticket-flow-init.md
    ticket-flow-setup-models.md
    update-architecture.md

    ticket-load.md
    ticket-spec.md
    ticket-tests.md
    ticket-plan.md
    ticket-implement.md
    ticket-validate.md
    ticket-review.md
    ticket-review-spec.md
    ticket-review-regression.md
    ticket-review-tests.md
    ticket-review-maintainability.md
    ticket-review-consolidate.md
    ticket-fix.md
    ticket-finalize.md
    ticket-merge-summary.md
    ticket-execute-standard.md
    ticket-execute-strict.md

  skills/
    issueize/
      SKILL.md
    work-itemize/
      SKILL.md
    ticket-execution/
      SKILL.md
    ticket-finalization/
      SKILL.md
    ticket-implementation/
      SKILL.md
    ticket-orchestration/
      SKILL.md
    ticket-planning/
      SKILL.md
    ticket-repo-conventions/
      SKILL.md
    ticket-resolution/
      SKILL.md
    ticket-review-discipline/
      SKILL.md
    ticket-review-maintenance/
      SKILL.md
    ticket-review-suite/
      SKILL.md
    ticket-scope-control/
      SKILL.md
    ticket-specification/
      SKILL.md
    ticket-testing/
      SKILL.md
    ticket-validation/
      SKILL.md
```

## Main entrypoints

### 1. Initialize the repo workflow

Use this first in a new repo or when you want to scaffold planning guidance and tracker setup:

```text
/ticket-flow-init --tk
/ticket-flow-init --br
```

Behavior:

- creates or refreshes generated guidance in `.ticket-flow/AGENTS.md`
- creates `.ticket-flow/PLANS.md` if missing
- creates `.ticket-flow/settings.yml` if missing
- updates the root `AGENTS.md` marker block
- initializes the selected tracker safely:
  - `--tk` → ensure `.tickets/` exists
  - `--br` → run `br init` if `.beads/` is missing
- if `.pi/prompts/` exists, applies `.ticket-flow/settings.yml` to prompt frontmatter models and optional thinking fields

If no flag is passed, the prompt tries to infer the tracker from existing `.tickets/` or `.beads/` state and asks when ambiguous.

### 1b. Sync model config into prompts

Use this after editing `.ticket-flow/settings.yml`:

```text
/ticket-flow-setup-models
```

This deterministically rewrites `model:` and optional `thinking:` frontmatter in mapped `.pi/prompts/*.md` files.

### 2. Brainstorm and plan

Use for idea → plan flow:

```text
/brainstorm <topic>
/plan <topic>
/plan-chain <topic>
/plan-create <topic>
/plan-improve <topic>
/architect [topic]
/update-architecture [topic]
```

Recommended flow for most non-trivial work:

```text
/ticket-flow-init --tk|--br
/plan <topic>
```

Use `/plan-chain` only when brainstorming is already complete.

### 3. Convert the plan into tracked work

For `tk` repositories:

```text
/create-work-items <topic>
/create-tickets <topic>
```

For `br` repositories:

```text
/create-work-items <topic>
/create-issues <topic>
```

Both commands:

- read `.ticket-flow/plans/<topic-slug>/execplan.md`
- split milestones into reviewable work units
- preserve hard dependencies conservatively
- embed an `ExecPlan Reference` block in every created work item

`/create-work-items` is the default convenience entrypoint. Use `/create-tickets` or `/create-issues` when you want to force the tracker explicitly.

### 4. Execute one work item manually

For most manual ticket or issue work:

```text
/ticket-execute-standard <ticket-or-issue-ref>
```

For riskier work:

```text
/ticket-execute-strict <ticket-or-issue-ref>
```

For a standalone review suite:

```text
/ticket-review <ticket-or-issue-ref>
```

### 5. Focused execution passes

Use when you want only one phase of the execution lane:

```text
/ticket-load <ticket-ref>
/ticket-spec <ticket-ref>
/ticket-tests <ticket-ref>
/ticket-plan <ticket-ref>
/ticket-implement <ticket-ref>
/ticket-validate <ticket-ref>
/ticket-review-spec <ticket-ref>
/ticket-review-regression <ticket-ref>
/ticket-review-tests <ticket-ref>
/ticket-review-maintainability <ticket-ref>
/ticket-fix <ticket-ref>
/ticket-finalize <ticket-ref>
```

## Tracker behavior

### `tk`

The local overlay supports `tk` for both planning conversion and manual execution.

- `/create-tickets` creates `.tickets/` work items from an ExecPlan
- `/ticket-execute-*` can work against `tk` tickets
- the packaged delegated `/ticket-flow` and `/ticket-queue` workflow is also `tk`-oriented

### `br`

The local overlay supports `br` for planning conversion and manual execution.

- `/create-issues` creates dependency-aware `br` issues from an ExecPlan
- `/ticket-execute-*` and focused `/ticket-*` prompts can work against `br` issues
- `/ticket-finalize` uses `br comments add` and `br close` when evidence supports closure
- the packaged delegated `/ticket-flow` / `/ticket-queue` path remains `tk`-oriented, so the local overlay is the primary `br` execution path here

## Finalization behavior

`/ticket-finalize` is the tracker-update step for manual `.pi` workflows.

For `.tickets/` / `tk` tickets it will:

- add a concise `tk add-note` comment
- close the ticket with `tk close <ticket>` only when validation passed and review is clean

For `.beads/` / `br` issues it will use the installed `br` equivalents:

- `br comments add --actor "$ACTOR" <ticket> --message "..." --json` for the final note
- `br close --actor "$ACTOR" <ticket> --reason "..." --json` only on a true pass

Note: the installed `br` CLI does not provide `br notes`; the note/comment equivalent is `br comments add`.

## Important behavior rules

These prompts and skills are designed to enforce:

- support for both file-backed `.tickets/` / `tk` workflows and `.beads/` / `br` workflows
- deterministic ticket / issue resolution
- explicit handling of missing or ambiguous ExecPlans
- no invented requirements
- minimal diffs
- no unrelated cleanup or refactors
- validation tied to acceptance criteria
- explicit reporting of ambiguity and evidence gaps
- no accidental interference with the repository's delegated `ticket-flow/` runtime unless explicitly requested

## Model settings

Prompt frontmatter is generated from `.ticket-flow/settings.yml`.

See [`MODELS.md`](MODELS.md) for:

- the settings schema
- prompt-to-role mapping
- the deterministic sync workflow

## Notes

- `.pi/prompts/` discovery is flat, so all prompt templates live directly in that directory.
- `.pi/skills/` follows the Agent Skills directory convention with one `SKILL.md` per skill directory.
- `.ticket-flow/settings.yml` is the source of truth for prompt-model assignments.
- The planning prompts reuse packaged planning skills; the execution prompts use local ticket-focused skills.
- Review leaf prompts are delegated reviewer prompts; chain wrappers orchestrate them.
- Chain templates ignore their own `model` / `skill` settings by design, so those concerns live on leaf prompts.
- This repository currently uses `.tickets/` and `.ticket-flow/plans/`; `.beads/` / `br` support is present in the local overlay for mixed-repo portability and future use.
- In a `br` workspace, `.beads/` is a tracker workspace, not a directory of one markdown file per issue.
