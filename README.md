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
/execflow <ticket-or-issue-ref>
```

`/execflow` is the fast validation-only implementation path: it implements the work item, runs `/validation-fix` to validate tests/checks/acceptance criteria and apply minimal fixes in a bounded convergence loop, then finalizes the item without claiming review happened.

For larger/noisier work items, use the delegated variant:

```bash
/exec-delegated <ticket-or-issue-ref>
```

`/exec-delegated` keeps resolution, spec, validation planning, implementation planning, and finalization in the main session, but delegates implementation and validation/fix to worker subagents. The implementation worker uses the implementation model; the validation/fix worker uses the validation/fix model.

Run an independent fresh review separately when needed:

```bash
/review <ticket-or-issue-ref>
/review-followups <ticket-or-issue-ref>
```

`/review` is read-only and runs specialized reviewer subagents in parallel via prompt-template delegated `parallel(...)`, then consolidates their findings in the main session. `/review-followups` records the review summary on the original item and creates linked follow-up tickets/issues for material findings.

Delegated prompt-template steps require `pi-subagents` and a discoverable subagent runtime root. If `pi-subagents` was installed with `pi install npm:pi-subagents`, use `pi list` to find its package root and start Pi with `PI_SUBAGENT_RUNTIME_ROOT=<that-root>` when it is not available at `~/.pi/agent/extensions/subagent`.

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
- `/execflow <ticket-or-issue-ref>`
- `/exec-delegated <ticket-or-issue-ref>`
- `/validation-fix <ticket-or-issue-ref>`
- `/review <ticket-or-issue-ref>`
- `/review-followups <ticket-or-issue-ref>`
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
  impl-plan:
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
- **Chain prompts do not use wrapper `model` / `skill`.** When a prompt uses `chain:`, the wrapper prompt acts as orchestration only. Put model / thinking choices on the leaf prompts instead.

## Included artifact templates

The package ships these checked-in templates under `execflow/`:

- `execflow/AGENTS.md`
- `execflow/PLANS.md`
- `execflow/settings.yml`

`/init-execflow` materializes their target-project counterparts under `.execflow/` and copies prompt overlays from the resolved installed `@legout/pi-execflow` package root into `.pi/prompts/`.

## Scope notes

- `/execflow` is shipped by this package as the default local validation-only implementation workflow
- optional external delegated `/execflow-queue` execution is not shipped by this package; when available in the environment, it remains a `tk`-oriented path
- `br` support is primarily through `create-issues`, `/execflow`, `/review`, `/review-followups`, and the focused local prompts
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
