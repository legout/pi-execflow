# pi-execflow

**`@legout/pi-execflow`** is a Pi package for turning ideas into executable plans and then into tracked work.

It bundles a practical workflow for:

- interactive brainstorming
- architecture discovery
- ExecPlan creation and improvement
- tracker-aware work-item generation for both `tk` and `br`
- manual single-ticket / single-issue execution
- model and thinking configuration via `.execflow/settings.yml`

## What it is

`pi-execflow` packages the workflow resources that were previously kept project-local under `.pi/`, together with the checked-in `execflow/` template files that `/init-execflow` materializes into `.execflow/` inside target repositories, plus the supporting planning skills required by the prompts.

The result is a Pi-installable extension package you can use in other repositories.

## Install

### From npm

```bash
pi install npm:@legout/pi-execflow
```

### From a local path

```bash
pi install /absolute/path/to/pi-execflow
```

### One-off use without installing

```bash
pi -e /absolute/path/to/pi-execflow
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

### 2. Create the plan

```bash
/brainstorm <topic>
/plan <topic>
```

Other planning entrypoints:

- `/architect [topic]`
- `/plan-chain <topic>`
- `/plan-create <topic>`
- `/plan-improve <topic>`
- `/update-architecture [topic]`

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

`/ef-implement` is the fast validation-only implementation path: it implements the work item, runs `/validation-fix` to validate tests/checks/acceptance criteria and apply minimal fixes in a bounded convergence loop, then finalizes the item without claiming review happened.

For larger/noisier work items, use the delegated variant:

```bash
/exec-delegated <ticket-or-issue-ref>
```

`/exec-delegated` keeps resolution, spec, validation planning, implementation planning, and finalization in the main session, but delegates implementation and validation/fix to worker subagents. The implementation worker uses the implementation model; the validation/fix worker uses the validation/fix model.

Run an independent fresh review separately when needed:

```bash
/ef-review <ticket-or-issue-ref>
/ef-review-followups <ticket-or-issue-ref>
```

`/ef-review` is read-only by default and reviews exactly one work-item implementation with specialized reviewer subagents via prompt-template delegated `parallel(...)`, then consolidates their findings in the main session. Add `--create-followups` to create tracker follow-ups in the same run, or run `/ef-review-followups` afterward for an explicit mutation step.

For broader review scopes, use:

```bash
/execplan-review <plan-slug-or-path> [--create-followups]
/change-review [--base main] [--create-followups] [paths/context...]
```

`/execplan-review` audits an entire ExecPlan delivery across derived issues/tickets. `/change-review` reviews an arbitrary branch, diff, or path-scoped code change. Both are read-only by default and only create follow-ups when `--create-followups` is explicit. Use `/execplan-review-followups <plan>` or `/change-review-followups` as explicit post-review mutation steps.

Delegated prompt-template steps require `pi-subagents` and a discoverable subagent runtime root. `/init-execflow` and `/refresh-prompts` create a compatibility shim at `~/.pi/agent/extensions/subagent` when they can find a globally installed `pi-subagents`; if discovery still fails, use `pi list` to find the `pi-subagents` package root and start Pi with `PI_SUBAGENT_RUNTIME_ROOT=<that-root>`.

## Included resources

### Prompt templates

Loaded from:

- `prompts/`

Main commands include:

- `/init-execflow [--tk|--br]`
- `/sync-models`
- `/brainstorm <topic>`
- `/plan <topic>`
- `/plan-chain <topic>`
- `/plan-create <topic>`
- `/plan-improve <topic>`
- `/create-work-items <topic>`
- `/create-tickets <topic>`
- `/create-issues <topic>`
- `/ef-implement <ticket-or-issue-ref>`
- `/exec-delegated <ticket-or-issue-ref>`
- `/validation-fix <ticket-or-issue-ref>`
- `/ef-review <ticket-or-issue-ref> [--create-followups]`
- `/ef-review-followups <ticket-or-issue-ref>`
- `/execplan-review <plan-slug-or-path> [--create-followups]`
- `/execplan-review-followups <plan-slug-or-path>`
- `/change-review [--base <ref>] [--create-followups] [paths/context...]`
- `/change-review-followups [review-target/context...]`
- `/update-architecture [topic]`

### Skills

Loaded from:

- `skills/`

This package includes:

- planning skills: `brainstorm`, `architect`, `execplan-create`, `execplan-improve`, `update-architecture`
- execution skills: `resolve`, `specification`, `planning`, `implement`, `testing`, `validation`, `execution`, `orchestration`, `scope`, `repo-conventions`, `finalize`, `review-discipline`, `review-maintenance`, `review-suite`
- tracker skills: `issueize`, `work-itemize`, `ticketize`

## Model configuration

In initialized target repositories, the source of truth is `.execflow/settings.yml`. In this package repo, the checked-in template lives at `execflow/settings.yml`.

### Settings schema

Use this shape in target repositories at `.execflow/settings.yml`. The checked-in template in this repo lives at `execflow/settings.yml`. The top-level `models` and `thinking` keys are reusable YAML anchor buckets, and the `prompts:` section is the per-prompt source of truth.

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
  review1: &review1_model <review1 model string>
  review2: &review2_model <review2 model string>
  review3: &review3_model <review3 model string>
  review4: &review4_model <review4 model string>

thinking:
  plan: &plan_thinking <plan thinking>
  orchestration: &orchestration_thinking <orchestration thinking>
  implementation: &implementation_thinking <implementation thinking>
  validation_fix: &validation_fix_thinking <validation thinking>
  fast: &fast_thinking <fast thinking>
  review1: &review1_thinking <review1 thinking>
  review2: &review2_thinking <review2 thinking>
  review3: &review3_thinking <review3 thinking>
  review4: &review4_thinking <review4 thinking>

prompts:
  architect:
    model: *plan_model
    thinking: *plan_thinking
  brainstorm:
    model: *plan_model
    thinking: *plan_thinking
  create-issues:
    model: *plan_model
    thinking: *plan_thinking
  create-tickets:
    model: *plan_model
    thinking: *plan_thinking
  create-work-items:
    model: *plan_model
    thinking: *plan_thinking
  implementation-plan:
    model: *implementation_model
    thinking: *implementation_thinking
  plan-create:
    model: *plan_model
    thinking: *plan_thinking
  plan-improve:
    model: *plan_model
    thinking: *plan_thinking
  spec:
    model: *implementation_model
    thinking: *review1_thinking
```

Keep `prompts:` entries aligned with the project prompt files in `.pi/prompts/`. When developing this package itself, the same names also correspond to the checked-in source prompts under `prompts/`. The sync step uses those per-prompt entries directly; the anchor buckets above are only there to avoid repeating long model strings.

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

- **`model` is a string.** For fallback chains, use a single comma-separated string such as `kimi-coding/k2p6, zai/glm-5-turbo, openai-codex/gpt-5.4-mini`. Do not convert model values to YAML arrays unless the runtime is updated to support them.
- **`thinking` is optional and also string-based.** Typical values are `low`, `medium`, and `high`.
- **Chain prompts do not use wrapper `model` / `thinking` / `skill`.** When a prompt uses `chain:`, the wrapper prompt acts as orchestration only. Put model / thinking choices on the leaf prompts instead.
- **Chain prompts cannot be nested.** A `chain:` step cannot reference another `chain:` prompt, so reusable subflows like `validation-fix` must stay leaf prompts unless the upstream runtime adds chain nesting.
- **`settings.prompts` is for model-owning leaf prompts, not wrappers.** Wrapper/orchestration prompts are intentionally omitted and `sync-models` will strip stale `model:` / `thinking:` frontmatter from them.

Prompts intentionally omitted from `execflow/settings.yml` `prompts:`:

- chain wrappers: `/ef-implement`, `/exec-delegated`, `/plan-chain`, `/ef-review`
- manual orchestration wrapper: `/plan`
- deterministic utility wrappers: `/refresh-prompts`, `/sync-models`

### Prompt taxonomy

| Class | Model owner? | Prompts | Notes |
|---|---|---|---|
| Chain wrapper | No | `/ef-implement`, `/exec-delegated`, `/plan-chain`, `/ef-review` | `chain:` only; keep fail-closed body; leaf prompts own model/thinking |
| Manual orchestration wrapper | No | `/plan` | Human-facing wrapper that checks brainstorm state and then dispatches to `/plan-chain` |
| Deterministic utility wrapper | No | `/refresh-prompts`, `/sync-models` | Shell-first maintenance commands; intentionally omitted from `settings.prompts` |
| Deterministic + LLM orchestration leaf | Yes | `/init-execflow` | Uses `run:` plus `handoff: always`, so wrapper logic and post-run guidance share one prompt |
| Local model-owning leaf | Yes | `/architect`, `/brainstorm`, `/change-review`, `/change-review-followups`, `/create-issues`, `/create-tickets`, `/create-work-items`, `/ef-review-followups`, `/execplan-review`, `/execplan-review-followups`, `/finalize`, `/fix`, `/implement`, `/implementation-plan`, `/merge-summary`, `/plan-create`, `/plan-improve`, `/resolve`, `/review-verdict`, `/spec`, `/update-architecture`, `/validate`, `/validation-fix`, `/validation-plan` | Configure these in `.execflow/settings.yml` |
| Delegated worker/reviewer leaf | Yes | `/worker-implement`, `/worker-validation-fix`, `/review-spec`, `/review-regression`, `/review-tests`, `/review-maintainability` | Own `subagent`, isolation, and model config; referenced by chain wrappers |

## Included artifact templates

The package ships these checked-in templates under `execflow/`:

- `execflow/AGENTS.md`
- `execflow/PLANS.md`
- `execflow/settings.yml`

`/init-execflow` materializes their target-project counterparts under `.execflow/` and copies prompt overlays from the resolved installed `@legout/pi-execflow` package root into `.pi/prompts/`.

## Scope notes

- `/ef-implement` is shipped by this package as the default local validation-only implementation workflow
- optional external delegated `/execflow-queue` execution is not shipped by this package; when available in the environment, it remains a `tk`-oriented path
- `br` support is primarily through `create-issues`, `/ef-implement`, `/ef-review`, `/ef-review-followups`, `/execplan-review`, `/change-review`, and the focused local prompts
- `.pi/todos/` is intentionally not included in this package (it lives in the project-local `.pi/` overlay, not in the package)

## Development

Sync models into package prompt frontmatter during package development:

```bash
npm run setup-models
```

Validate prompt/settings/template consistency during package development with:

```bash
npm run validate-package
```
