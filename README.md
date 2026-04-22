# pi-execflow

**`@legout/pi-execflow`** is a Pi package for turning ideas into executable plans and then into tracked work.

It bundles a practical workflow for:

- interactive brainstorming
- architecture discovery
- ExecPlan creation and improvement
- tracker-aware work-item generation for both `tk` and `br`
- manual single-ticket / single-issue execution
- model-role configuration via `.ticket-flow/settings.yml`

## What it is

`pi-execflow` packages the workflow resources that were previously kept project-local under `.pi/`, together with the `.ticket-flow` artifact templates and the supporting planning skills required by the prompts.

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
/ticket-flow-init --tk
```

or:

```bash
/ticket-flow-init --br
```

This scaffolds:

- `.ticket-flow/AGENTS.md`
- `.ticket-flow/PLANS.md`
- `.ticket-flow/settings.yml`
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
/ticket-execute-standard <ticket-or-issue-ref>
```

or for stricter execution:

```bash
/ticket-execute-strict <ticket-or-issue-ref>
```

## Included resources

### Prompt templates

Loaded from:

- `.pi/prompts/`

Main commands include:

- `/ticket-flow-init [--tk|--br]`
- `/ticket-flow-setup-models`
- `/brainstorm <topic>`
- `/plan <topic>`
- `/plan-chain <topic>`
- `/plan-create <topic>`
- `/plan-improve <topic>`
- `/create-work-items <topic>`
- `/create-tickets <topic>`
- `/create-issues <topic>`
- `/ticket-execute-standard <ticket-or-issue-ref>`
- `/ticket-execute-strict <ticket-or-issue-ref>`
- `/update-architecture [topic]`

### Skills

Loaded from:

- `.pi/skills/`
- `skills/`

This package includes:

- planning skills: `brainstorm`, `architect`, `execplan-create`, `execplan-improve`, `ticketize`, `update-architecture`
- local execution skills: the `ticket-*` skill suite
- local tracker skills: `issueize`, `work-itemize`

## Model configuration

The source of truth is:

- `.ticket-flow/settings.yml`

After editing it, run:

```bash
/ticket-flow-setup-models
```

or from the shell:

```bash
npm run setup-models
```

This rewrites mapped `.pi/prompts/*.md` frontmatter deterministically.

## Included artifact templates

The package ships these `.ticket-flow` templates:

- `AGENTS.md`
- `PLANS.md`
- `settings.yml`

`/ticket-flow-init` uses those conventions when bootstrapping a target project.

## Scope notes

- delegated `/ticket-flow` / `/ticket-queue` execution remains documented as a `tk`-oriented path
- `br` support is primarily through `create-issues` and the manual local execution prompts
- `.pi/todos/` is intentionally not included in this package

## Development

Sync models into prompt frontmatter:

```bash
npm run setup-models
```

## More detail

For package-internal reference material, see:

- `.pi/README.md`
- `.pi/MODELS.md`
