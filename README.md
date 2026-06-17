# pi-execflow

**`pi-execflow`** is a GitHub-installed Pi package for turning ideas into approved designs, self-contained ExecPlans, tracked work items, validated implementation, and optional review follow-ups.

It bundles a practical workflow for:

- interactive Superpowers-style brainstorming with design approval gates
- ExecPlan creation and grilling
- tracker-aware work-item generation for both `tk` and `br`
- quick single-ticket / single-issue execution plus TDD-oriented execution when needed
- opt-in review follow-up creation for concrete bugs and delivery gaps
- model and thinking configuration via `.execflow/settings.yml`

## What it is

`pi-execflow` packages prompt templates, subagent templates, skills, and checked-in `execflow/` template files that `/ef-init` materializes into `.execflow/` inside target repositories.

The result is a Pi-installable extension package you can use in other repositories.

## Install

### From GitHub

```bash
pi install git:github.com/legout/pi-execflow
```

### One-off use without installing

```bash
pi -e git:github.com/legout/pi-execflow
```

## Core workflow

The simplified happy path is these commands:

```bash
/ef-init [--tk|--br]
/ef-plan <topic>
/ef-tasks <topic>
/ef-work <ticket-or-issue-ref>
/ef-work-tdd <ticket-or-issue-ref>
/ef-review <ticket-or-issue-ref>
/ef-review-with-followups <ticket-or-issue-ref>
/ef-ship [<ticket-or-issue-ref>|--next] [--max-retries N]
/ef-ship-tdd [<ticket-or-issue-ref>|--next] [--max-retries N]
/ef-autoship [--max-retries N]
/ef-autoship-tdd [--max-retries N]
/ef-update
```

These names are the supported public workflow surface. They keep the OpenAI-style ExecPlan as the canonical source of truth while hiding lower-level planning, tracker, execution, validation, and refresh steps. Legacy aliases are retired and cleaned up by `/ef-update`; new documentation and usage should use the `ef-*` public commands.

### 1. Initialize a target project

```bash
/ef-init
```

or:

```bash
/ef-init --br
```

`/ef-init` defaults to `br` when no tracker flag or existing tracker workspace determines the choice.

This scaffolds:

- `.execflow/AGENTS.md`
- `.execflow/PLANS.md`
- `.execflow/settings.yml`
- `.pi/prompts/*.md` and `.pi/agents/*.md` copied from the resolved installed `@legout/pi-execflow` package root
- tracker setup for `tk` or `br`

In `br` mode, `br` is required. If it is missing, init stops and points to <https://github.com/Dicklesworthstone/beads_rust>. If `bv` is missing, init recommends installing it but continues. Native `br` and `bv` workflow instructions are managed in the project-root `AGENTS.md` by their own commands; `.execflow/AGENTS.md` stays focused on pi-execflow policy.

### 2. Plan with an ExecPlan

Recommended public command:

```bash
/ef-plan <topic>
```

`/ef-plan` is the intended front door for turning an idea into an approved, self-contained ExecPlan. It covers brainstorming, plan creation, and plan grilling while keeping `.execflow/plans/<topic-slug>/execplan.md` as the single canonical plan document.

Internal planning leaves currently used by `/ef-plan` include brainstorm, plan creation, and plan grilling behavior. They are implementation details of the public workflow, not a legacy user surface to preserve indefinitely.

### 3. Convert the plan into tracked work

Recommended public command:

```bash
/ef-tasks <topic>
```

`/ef-tasks` is the intended tracker-neutral command for converting an ExecPlan into dependency-aware work items. It should prefer vertical, independently verifiable slices and keep every created item linked back to the ExecPlan.

Internal tracker leaves may exist to implement tracker-neutral and tracker-specific item creation. They are implementation details of `/ef-tasks`, not a compatibility surface.

### 4. Execute and review one work item

Recommended public commands:

```bash
/ef-work <ticket-or-issue-ref>
/ef-review <ticket-or-issue-ref>
/ef-review-with-followups <ticket-or-issue-ref>
/ef-ship [<ticket-or-issue-ref>|--next] [--max-retries N]
```

`/ef-work` is the quick implementation front door for one simple tracked work item. It resolves the item, makes the smallest scoped change, runs a quick targeted validation or records inspection evidence, performs a short self-review, and leaves finalization to `/finalize` or `/ef-ship`. Use `/ef-work-tdd` when the item needs explicit specification, RED/GREEN discipline, validation/fix looping, and immediate finalization. `/ef-review` is the independent review front door and remains read-only unless `--create-followups` is provided.

`/ef-work`, `/implement`, `/validation-fix`, `/ef-review`, `/ef-review-with-followups`, and `/finalize` are configured to use pi-execflow-owned project subagents scaffolded into `.pi/agents/` by `/ef-init` and refreshed by `/ef-update`. The orchestration wrappers (`/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, `/ef-autoship-tdd`) stay inline while their implementation, validation-fix, review, and finalization leaves run in fresh subagent context.

`/ef-review` is the public review entrypoint. It can review a work item, ExecPlan delivery, branch, diff, or path scope depending on the target and context. It is read-only by default; add `--create-followups` to create tracker work items for material findings. `/ef-review-with-followups` is the focused work-item review wrapper that always enables follow-up creation. Reviews emit a `# Finalization Handoff` block so `/finalize` can rely on explicit closure support instead of inferring from prose. `/ef-ship` runs quick work, review with follow-ups, and conservative finalization; with no explicit work item or with `--next`, it selects ready work and loops until no eligible ready work remains. `/ef-ship-tdd` preserves the TDD-oriented ship path with specification, validation/fix looping, review with follow-ups, and finalization, with the same no-arg/`--next` ready-work selection behavior.

### Autoship (sequential ready-work queue)

To drain multiple ready `br` issues or `tk` tickets one at a time, use the autoship commands:

```bash
/ef-autoship
/ef-autoship --max-retries 0
/ef-autoship-tdd --max-retries 2
```

Requirements and behavior:

- Autoship is a chain-loop wrapper, not a nested prompt dispatch. It does not require `/prompt-tool on`.
- `--max-retries N` defaults to `2`, meaning one initial attempt plus two retries, or three total attempts per issue in one autoship run.
- Autoship auto-detects the active tracker from `.execflow/settings.yml` when possible. It reads `br ready --json` for `br` repositories and `tk ready` for `tk` repositories, preserving the tracker ready order.
- `/ef-autoship` runs the quick ship chain for each selected issue or ticket; `/ef-autoship-tdd` runs the TDD ship chain.
- Autoship writes a local `.pi/execflow-autoship-loop-marker.json` marker on productive ready-work dispatches so prompt-template convergence continues to the next item; no marker is written on no-ready stop iterations, so the loop converges cleanly.
- Ship/autoship chain wrappers keep prompt-template `fresh` collapse disabled to avoid branch-navigation failures between iterations; implementation, validation, review, and finalization leaves still run in fresh subagent contexts.
- Autoship stops when no ready issues remain or when all ready issues are exhausted for the current run.
- The MVP is intentionally sequential; parallel autoship is not supported.

### Finalization and review handoff

`/finalize` is a delegated leaf that runs in the `ef-finalizer` subagent with fresh context. Ship chains (`/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, `/ef-autoship-tdd`) end on finalization output instead of replaying review output after closure.

Finalization is conservative and evidence-driven:

- It requires an exact `Gate: PASS` validation line and acceptance-criteria evidence.
- When review is part of the chain, it honors a machine-readable `# Finalization Handoff` block emitted by the reviewer and treats `Original item may close: yes` as the preferred closure signal.
- It classifies every dirty-tree path as `related`, `unrelated`, or `ambiguous`, stages only `related` files, and returns `REVISE` instead of closing when the dirty tree cannot be separated safely.
- It never edits source files, fixes review findings, creates follow-ups, or pushes commits.

Reviews always emit a `# Finalization Handoff` section so downstream finalization can distinguish clean closure, delegated follow-ups, and unresolved review findings.

### 5. Update package resources

Recommended public command:

```bash
/ef-update
```

`/ef-update` is the intended maintenance front door for refreshing prompt and subagent overlays, removing retired prompt overlays, refreshing marker-managed execflow instruction blocks, preserving user-customized settings/plans, synchronizing prompt model frontmatter from `.execflow/settings.yml`, and updating native `br`/`bv` root `AGENTS.md` instructions in `br` projects.

Internal deterministic update/sync leaves may exist to implement refresh, model synchronization, and scaffolding updates. They are implementation details of `/ef-update`, not a compatibility surface.

## Included resources

### Prompt templates

Loaded from:

- `prompts/`

Supported public commands are:

- `/ef-init [--tk|--br]`
- `/ef-plan <topic>`
- `/ef-tasks <topic>`
- `/ef-work <ticket-or-issue-ref>`
- `/ef-work-tdd <ticket-or-issue-ref>`
- `/ef-review <target> [--create-followups] [context...]`
- `/ef-review-with-followups <ticket-or-issue-ref> [context...]`
- `/ef-ship [<ticket-or-issue-ref>|--next] [--max-retries N] [context...]`
- `/ef-ship-tdd [<ticket-or-issue-ref>|--next] [--max-retries N] [context...]`
- `/ef-autoship [--max-retries N] [context...]`
- `/ef-autoship-tdd [--max-retries N] [context...]`
- `/ef-update`

Other prompt files may exist as internal leaves for chains, model-owning implementation steps, or deterministic maintenance. They are not a legacy public command surface and may be removed when no supported wrapper uses them.

### Skills

Loaded from:

- `skills/`

This package includes:

- planning skills: `brainstorm`, `create-plan`, `grill-plan`
- execution skills: `resolve`, `specification`, `validation`, `execution`, `finalize`, `review-suite`, `autoship`
- tracker skills: `work-itemize`

### Subagent templates

Copied into initialized projects under `.pi/agents/` by `/ef-init` and refreshed by `/ef-update`:

- `ef-worker` — scoped implementation for `/ef-work` and `/implement`
- `ef-validation-fix` — fresh-context validation/repair loop for `/validation-fix`
- `ef-reviewer` — fresh-context review and optional tracker follow-up creation for `/ef-review*`
- `ef-finalizer` — fresh-context evidence checks, dirty-tree classification, final notes, commits, and safe tracker closure for `/finalize`

## Model configuration

In initialized target repositories, the source of truth is `.execflow/settings.yml`. In this package repo, the checked-in template lives at `execflow/settings.yml`.

### Settings schema

Use this shape in target repositories at `.execflow/settings.yml`. The top-level `models` and `thinking` keys are reusable YAML anchor buckets, and the `prompts:` section is the per-prompt source of truth.

```yml
version: 1

tracker:
  primary: <tk-or-br>

models:
  plan: &plan_model <plan model string>
  orchestration: &orchestration_model <orchestration model string>
  implementation: &implementation_model <implementation model string>
  validation_fix: &validation_fix_model <validation model string>
  fast: &fast_model <fast model string>
  review: &review_model <review model string>

thinking:
  plan: &plan_thinking <plan thinking>
  orchestration: &orchestration_thinking <orchestration thinking>
  implementation: &implementation_thinking <implementation thinking>
  validation_fix: &validation_fix_thinking <validation thinking>
  fast: &fast_thinking <fast thinking>
  review: &review_thinking <review thinking>

prompts:
  brainstorm:
    model: *plan_model
    thinking: *plan_thinking
  create-plan:
    model: *plan_model
    thinking: *plan_thinking
  grill-plan:
    model: *plan_model
    thinking: *plan_thinking
  improve-plan:
    model: *plan_model
    thinking: *plan_thinking
  implement:
    model: *implementation_model
    thinking: *implementation_thinking
  validation-fix:
    model: *validation_fix_model
    thinking: *validation_fix_thinking
  ef-review:
    model: *review_model
    thinking: *review_thinking
  ef-autoship:
    model: *orchestration_model
    thinking: *orchestration_thinking
  ef-autoship-tdd:
    model: *orchestration_model
    thinking: *orchestration_thinking
```

Keep `prompts:` entries aligned with project prompt files in `.pi/prompts/`. When developing this package itself, the same names correspond to the checked-in source prompts under `prompts/`.

Wrapper prompts that only orchestrate other prompts or run deterministic shell steps may be intentionally omitted from `prompts:` because they do not own model selection themselves.

### Sync workflow

After editing `.execflow/settings.yml`, or after updating the installed `@legout/pi-execflow` package, run:

```bash
/ef-update
```

or from the shell:

```bash
npm run setup-models
```

This refreshes prompt overlays, removes retired prompt overlays, refreshes marker-managed execflow instruction blocks, and deterministically rewrites `model:` and `thinking:` frontmatter in `.pi/prompts/*.md` for initialized projects using the per-prompt entries in `prompts:`. When run inside the package repo, it falls back to rewriting the checked-in source prompts under `prompts/`.

Properties of the sync step:

- deterministic and idempotent
- prompt-name based
- does not rely on placeholder text remaining in frontmatter

### Important frontmatter notes

- **`model` is a string.** For fallback chains, use a single comma-separated string such as `kimi-coding/kimi-for-coding, zai/glm-5-turbo, openai-codex/gpt-5.4-mini`.
- **Prompt model fallback caveat:** `pi-prompt-template-model` keeps the current model if it matches any candidate in the prompt's model list, even when that candidate is listed as a fallback. Do not broadly share the fast selector models with immediately following chain steps. The default config intentionally keeps fast-selector fallbacks out of plan/implementation while allowing `gpt-5.4-mini` as a closure-critical fallback for validation/finalization.
- **Subagent fallback models use `fallbackModels`.** Agent templates such as `ef-validation-fix` and `ef-finalizer` keep `model:` as the primary model and use `fallbackModels:` for retryable provider/model failures.
- **`thinking` is optional and also string-based.** Typical values are `low`, `medium`, and `high`.
- **Chain prompts do not use wrapper `model` / `thinking` / `skill`.** When a prompt uses `chain:`, the wrapper prompt acts as orchestration only. Put model / thinking choices on the leaf prompts instead.
- **Chain prompts cannot be nested.** A `chain:` step cannot reference another `chain:` prompt.
- **`settings.prompts` is for model-owning leaf prompts, not wrappers.** Wrapper/orchestration prompts are intentionally omitted and `sync-models` will strip stale `model:` / `thinking:` frontmatter from them.

Prompts intentionally omitted from `execflow/settings.yml` `prompts:`:

- chain wrappers: `/ef-plan`, `/ef-work-tdd`, `/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, `/ef-autoship-tdd`
- deterministic utility wrappers: `/ef-update`
- internal maintenance leaves when present, such as prompt refresh or model sync helpers

### Prompt taxonomy

| Class | Model owner? | Prompts | Notes |
|---|---|---|---|
| Public workflow prompt | Mixed | `/ef-init`, `/ef-plan`, `/ef-tasks`, `/ef-work`, `/ef-work-tdd`, `/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, `/ef-autoship-tdd`, `/ef-update` | Preferred user-facing names; configure only model-owning prompts in `settings.prompts` |
| Chain wrapper | No | `/ef-plan`, `/ef-work-tdd`, `/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, `/ef-autoship-tdd` | `chain:` only; keep fail-closed body; leaf prompts own model/thinking |
| Autoship selector leaf | Yes | `/ship-resolve`, `/ship-tdd-resolve` | Selects ready work with `autoship-state.mjs next` and records retry progress |
| Deterministic utility wrapper | No | `/ef-update` | Shell-first maintenance commands; intentionally omitted from `settings.prompts` |
| Deterministic + LLM orchestration leaf | Yes | `/ef-init` | Uses `run:` plus `handoff: always` |
| Local model-owning prompt | Yes | `/brainstorm`, `/create-plan`, `/ef-review`, `/ef-review-with-followups`, `/ef-tasks`, `/ef-work`, `/finalize`, `/grill-plan`, `/implement`, `/resolve`, `/ship-resolve`, `/ship-tdd-resolve`, `/spec`, `/validation-fix` | Configure these in `.execflow/settings.yml` |

## Included artifact templates

The package ships these checked-in templates under `execflow/`:

- `execflow/AGENTS.md`
- `execflow/PLANS.md`
- `execflow/settings.yml`

`/ef-init` materializes their target-project counterparts under `.execflow/` and copies prompt and subagent overlays from the resolved installed `@legout/pi-execflow` package root into `.pi/prompts/` and `.pi/agents/`.

## Scope notes

- The supported public workflow is `/ef-init`, `/ef-plan`, `/ef-tasks`, `/ef-work`, `/ef-work-tdd`, `/ef-review`, `/ef-review-with-followups`, `/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, `/ef-autoship-tdd`, `/finalize`, and `/ef-update`.
- In `br` mode, root `AGENTS.md` may contain native blocks managed by `br agents --add|--update` and `bv --agents-add|--agents-update`; do not duplicate those generated tool instructions in `.execflow/AGENTS.md`.
- Supported documentation and usage should prefer the `ef-*` public workflow. Prompt files that are neither public commands nor active internal leaves should be removed and added to `scripts/retired-prompts.mjs` so target overlays are cleaned up.
- Dedicated review-followup prompts are not shipped; review prompts list findings by default and create follow-ups only with `--create-followups`.
- Optional external delegated `/execflow-queue` execution is not shipped by this package.
- `.pi/todos/` is intentionally not included in this package.

## Development

Sync models into package prompt frontmatter during package development:

```bash
npm run setup-models
```

Validate prompt/settings/template consistency during package development with:

```bash
npm run validate-package
```
