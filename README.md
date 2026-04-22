# pi-execflow

**`@legout/pi-execflow`** is a Pi package for turning ideas into executable plans and then into tracked work.

It bundles a practical workflow for:

- interactive brainstorming
- architecture discovery
- ExecPlan creation and improvement
- tracker-aware work-item generation for both `tk` and `br`
- manual single-ticket / single-issue execution
- model-role configuration via `.execflow/settings.yml`

## What it is

`pi-execflow` packages the workflow resources that were previously kept project-local under `.pi/`, together with the checked-in `execflow/` template files that `/init` materializes into `.execflow/` inside target repositories, plus the supporting planning skills required by the prompts.

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
/init --tk
```

or:

```bash
/init --br
```

This scaffolds:

- `.execflow/AGENTS.md`
- `.execflow/PLANS.md`
- `.execflow/settings.yml`
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

### 4. Execute one work item manually

```bash
/exec-standard <ticket-or-issue-ref>
```

or for stricter execution:

```bash
/exec-strict <ticket-or-issue-ref>
```

## Included resources

### Prompt templates

Loaded from:

- `prompts/`

Main commands include:

- `/init [--tk|--br]`
- `/sync-models`
- `/brainstorm <topic>`
- `/plan <topic>`
- `/plan-chain <topic>`
- `/plan-create <topic>`
- `/plan-improve <topic>`
- `/create-work-items <topic>`
- `/create-tickets <topic>`
- `/create-issues <topic>`
- `/exec-standard <ticket-or-issue-ref>`
- `/exec-strict <ticket-or-issue-ref>`
- `/update-architecture [topic]`

### Skills

Loaded from:

- `skills/`

This package includes:

- planning skills: `brainstorm`, `architect`, `execplan-create`, `execplan-improve`, `update-architecture`
- execution skills: `resolve`, `specification`, `planning`, `implementation`, `testing`, `validation`, `execution`, `orchestration`, `scope-control`, `repo-conventions`, `finalization`, `review-discipline`, `review-maintenance`, `review-suite`
- tracker skills: `issueize`, `work-itemize`, `ticketize`

## Model configuration

In initialized target repositories, the source of truth is `.execflow/settings.yml`. In this package repo, the checked-in template lives at `execflow/settings.yml`.

### Settings schema

Use this shape in target repositories at `.execflow/settings.yml`. The checked-in template in this repo currently lives at `execflow/settings.yml` and contains:

```yml
version: 1

tracker:
  primary: br

models:
  orchestration: zai/glm-5-turbo
  implementation: kimi-coding/k2p6, zai/glm-5-turbo, openai-codex/gpt-5.4-mini
  validation_fix: zai/glm-5.1
  fast: minimax/MiniMax-M2.7
  review1: openai-codex/gpt-5.4
  review2: openai-codex/gpt-5.4-mini
  review3: zai/glm-5.1
  review4: minimax/MiniMax-M2.7

thinking:
  orchestration: medium
  implementation: medium
  validation_fix: high
  fast: medium
  review1: high
  review2: high
  review3: high
  review4: medium
```

### Prompt-to-role mapping

| Role | Prompts |
|------|---------|
| `orchestration` | `architect`, `brainstorm`, `create-work-items`, `create-tickets`, `create-issues`, `plan-create`, `plan-improve`, `finalize`, `init`, `spec`, `derive-tests`, `update-architecture` |
| `implementation` | `implement` |
| `validation_fix` | `validate`, `fix` |
| `fast` | `resolve`, `impl-plan`, `merge-summary` |
| `review1` | `review-spec`, `review-consolidate` |
| `review2` | `review-regression` |
| `review3` | `review-tests` |
| `review4` | `review-maintainability` |

### Sync workflow

After editing `.execflow/settings.yml`, run:

```bash
/sync-models
```

or from the shell:

```bash
npm run setup-models
```

This deterministically rewrites `model:` and optional `thinking:` frontmatter in mapped `prompts/*.md` files.

Properties of the sync step:

- deterministic and idempotent
- file-name-to-role based
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

`/init` materializes their target-project counterparts under `.execflow/`.

## Scope notes

- delegated `/execflow` / `/execflow-queue` execution remains documented as a `tk`-oriented path
- `br` support is primarily through `create-issues` and the manual local execution prompts
- `.pi/todos/` is intentionally not included in this package (it lives in the project-local `.pi/` overlay, not in the package)

## Development

Sync models into prompt frontmatter:

```bash
npm run setup-models
```
