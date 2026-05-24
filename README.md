# pi-execflow

**`pi-execflow`** is a GitHub-installed Pi package for turning ideas into approved designs, self-contained ExecPlans, tracked work items, validated implementation, and optional review follow-ups.

It bundles a practical workflow for:

- interactive Superpowers-style brainstorming with design approval gates
- ExecPlan creation, grilling, and improvement
- tracker-aware work-item generation for both `tk` and `br`
- validation-only single-ticket / single-issue execution
- opt-in review follow-up creation for concrete bugs and delivery gaps
- model and thinking configuration via `.execflow/settings.yml`

## What it is

`pi-execflow` packages prompt templates, skills, and checked-in `execflow/` template files that `/init-execflow` materializes into `.execflow/` inside target repositories.

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

### 1. Initialize a target project

```bash
/init-execflow
```

or:

```bash
/init-execflow --br
```

`/init-execflow` defaults to `br` when no tracker flag or existing tracker workspace determines the choice.

This scaffolds:

- `.execflow/AGENTS.md`
- `.execflow/PLANS.md`
- `.execflow/settings.yml`
- `.pi/prompts/*.md` copied from the resolved installed `@legout/pi-execflow` package root
- tracker setup for `tk` or `br`

### 2. Brainstorm and create the plan

```bash
/brainstorm <topic>
/create-plan <topic>
/grill-plan <topic>
/improve-plan <topic>
```

`/brainstorm` now follows a stricter design-gated flow: inspect project context, ask one focused question at a time, compare 2-3 approaches, obtain user approval, write `.execflow/plans/<topic-slug>/brainstorm.md`, and self-review the artifact before moving to planning.

`/create-plan` writes `.execflow/plans/<topic-slug>/execplan.md` following `.execflow/PLANS.md`.

`/grill-plan` pressure-tests an existing ExecPlan interactively, asks one question at a time with a recommended answer, checks code before asking questions the repository can answer, and updates the ExecPlan as decisions crystallize.

`/improve-plan` runs a code-grounded ExecPlan audit loop and rewrites only when substantive improvements remain.

Optional post-implementation architecture sync:

```bash
/update-architecture [topic]
```

### 3. Convert the plan into tracked work

Tracker-neutral default:

```bash
/create-work-items <topic>
```

Tracker-specific alternatives:

```bash
/create-tickets <topic>
/create-issues <topic>
```

### 4. Execute and review one work item

```bash
/ef-implement <ticket-or-issue-ref>
```

`/ef-implement` is the validation-only implementation path: `/spec` normalizes requirements and validation expectations, `/implement` edits code/tests without executing validation commands, `/validation-fix` owns test/check execution and bounded fixes, and `/finalize` closes/commits only after a strict `Gate: PASS`.

Run an independent review when needed:

```bash
/ef-review <ticket-or-issue-ref>
```

`/ef-review` is read-only by default. Add `--create-followups` when you want linked tracker follow-up work items for concrete `critical`, `major`, and `minor` bug findings.

For broader review scopes, use:

```bash
/execplan-review <plan-slug-or-path>
/change-review [--base main] [paths/context...]
```

`/execplan-review` audits an entire ExecPlan delivery across derived issues/tickets. `/change-review` reviews an arbitrary branch, diff, or path-scoped code change. Both are read-only by default; add `--create-followups` to create tracker work items for material findings.

## Included resources

### Prompt templates

Loaded from:

- `prompts/`

Main commands include:

- `/init-execflow [--tk|--br]`
- `/sync-models`
- `/refresh-prompts`
- `/brainstorm <topic>`
- `/create-plan <topic>`
- `/grill-plan <topic>`
- `/improve-plan <topic>`
- `/create-work-items <topic>`
- `/create-tickets <topic>`
- `/create-issues <topic>`
- `/ef-implement <ticket-or-issue-ref>`
- `/validation-fix <ticket-or-issue-ref>`
- `/ef-review <ticket-or-issue-ref> [--create-followups]`
- `/execplan-review <plan-slug-or-path> [--create-followups]`
- `/change-review [--base <ref>] [--create-followups] [paths/context...]`
- `/update-architecture [topic]`

### Skills

Loaded from:

- `skills/`

This package includes:

- planning skills: `brainstorm`, `create-plan`, `grill-plan`, `improve-plan`, `update-architecture`
- execution skills: `resolve`, `specification`, `validation`, `execution`, `finalize`, `review-suite`
- tracker skills: `work-itemize`

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
```

Keep `prompts:` entries aligned with project prompt files in `.pi/prompts/`. When developing this package itself, the same names correspond to the checked-in source prompts under `prompts/`.

Wrapper prompts that only orchestrate other prompts or run deterministic shell steps may be intentionally omitted from `prompts:` because they do not own model selection themselves.

### Sync workflow

After editing `.execflow/settings.yml`, run:

```bash
/sync-models
```

or from the shell:

```bash
npm run setup-models
```

This deterministically rewrites `model:` and `thinking:` frontmatter in `.pi/prompts/*.md` for initialized projects using the per-prompt entries in `prompts:`. When run inside the package repo, it falls back to rewriting the checked-in source prompts under `prompts/`.

Properties of the sync step:

- deterministic and idempotent
- prompt-name based
- does not rely on placeholder text remaining in frontmatter

### Important frontmatter notes

- **`model` is a string.** For fallback chains, use a single comma-separated string such as `kimi-coding/kimi-for-coding, zai/glm-5-turbo, openai-codex/gpt-5.4-mini`.
- **`thinking` is optional and also string-based.** Typical values are `low`, `medium`, and `high`.
- **Chain prompts do not use wrapper `model` / `thinking` / `skill`.** When a prompt uses `chain:`, the wrapper prompt acts as orchestration only. Put model / thinking choices on the leaf prompts instead.
- **Chain prompts cannot be nested.** A `chain:` step cannot reference another `chain:` prompt.
- **`settings.prompts` is for model-owning leaf prompts, not wrappers.** Wrapper/orchestration prompts are intentionally omitted and `sync-models` will strip stale `model:` / `thinking:` frontmatter from them.

Prompts intentionally omitted from `execflow/settings.yml` `prompts:`:

- chain wrappers: `/ef-implement`
- deterministic utility wrappers: `/refresh-prompts`, `/sync-models`

### Prompt taxonomy

| Class | Model owner? | Prompts | Notes |
|---|---|---|---|
| Chain wrapper | No | `/ef-implement` | `chain:` only; keep fail-closed body; leaf prompts own model/thinking |
| Deterministic utility wrapper | No | `/refresh-prompts`, `/sync-models` | Shell-first maintenance commands; intentionally omitted from `settings.prompts` |
| Deterministic + LLM orchestration leaf | Yes | `/init-execflow` | Uses `run:` plus `handoff: always` |
| Local model-owning leaf | Yes | `/brainstorm`, `/change-review`, `/create-issues`, `/create-plan`, `/create-tickets`, `/create-work-items`, `/ef-review`, `/execplan-review`, `/finalize`, `/fix`, `/grill-plan`, `/implement`, `/improve-plan`, `/merge-summary`, `/resolve`, `/spec`, `/update-architecture`, `/validate`, `/validation-fix` | Configure these in `.execflow/settings.yml` |

## Included artifact templates

The package ships these checked-in templates under `execflow/`:

- `execflow/AGENTS.md`
- `execflow/PLANS.md`
- `execflow/settings.yml`

`/init-execflow` materializes their target-project counterparts under `.execflow/` and copies prompt overlays from the resolved installed `@legout/pi-execflow` package root into `.pi/prompts/`.

## Scope notes

- `/ef-implement` is shipped by this package as the default validation-only implementation workflow.
- Delegated `/ef-implement-delegated` and worker prompts are no longer shipped.
- Dedicated review-followup prompts are no longer shipped; review prompts list findings by default and create follow-ups only with `--create-followups`.
- Optional external delegated `/execflow-queue` execution is not shipped by this package; when available in the environment, it remains a `tk`-oriented path.
- `br` support is primarily through `create-work-items` / `create-issues`, `/ef-implement`, read-only reviews with optional `--create-followups`, and the focused local prompts.
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
