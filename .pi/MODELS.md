# Pi model settings

Prompt frontmatter models for this repository are generated from `.ticket-flow/settings.yml`.

Edit that file, then run:

```text
/ticket-flow-setup-models
```

to rewrite `.pi/prompts/*.md` deterministically.

## Important frontmatter notes

### `model` is a string

This repository's vendored prompt-template runtime expects `model` to be a **string**.
For fallback chains, use a single comma-separated string such as:

```md
model: kimi-coding/k2.6, zai/glm-5-turbo, openai-codex/gpt-5.4-mini
```

Do **not** convert model values to YAML arrays unless the runtime is updated to support them.

### `thinking` is optional and also string-based

`thinking:` is synchronized from `.ticket-flow/settings.yml` when present for a model role.
Typical values are `low`, `medium`, and `high`.

### Chain prompts do not use wrapper `model` / `skill`

When a prompt uses `chain:`, the wrapper prompt acts as orchestration only.
Put model / thinking choices on the leaf prompts instead.

## Settings schema

Use this structure in `.ticket-flow/settings.yml`:

```yml
version: 1

tracker:
  primary: tk

models:
  orchestration: zai/glm-5-turbo
  implementation: kimi-coding/k2.6, zai/glm-5-turbo, openai-codex/gpt-5.4-mini
  validation_fix: zai/glm-5.1
  fast: minimax/MiniMax-M2.7
  review1: openai-codex/gpt-5.4
  review2: openai-codex/gpt-5.4-mini
  review3: minimax/MiniMax-M2.7
  review4: minimax/MiniMax-M2.7

thinking:
  orchestration: high
  implementation: high
  validation_fix: high
  fast: medium
  review1: high
  review2: high
  review3: high
  review4: medium
```

## Prompt-to-role mapping

### `orchestration`

Used for:

- `architect`
- `brainstorm`
- `create-work-items`
- `create-tickets`
- `create-issues`
- `plan-create`
- `plan-improve`
- `ticket-finalize`
- `ticket-flow-init`
- `ticket-spec`
- `ticket-tests`
- `update-architecture`

### `implementation`

Used for:

- `ticket-implement`

### `validation_fix`

Used for:

- `ticket-validate`
- `ticket-fix`

### `fast`

Used for:

- `ticket-load`
- `ticket-plan`
- `ticket-merge-summary`

### `review1`

Used for:

- `ticket-review-spec`
- `ticket-review-consolidate`

### `review2`

Used for:

- `ticket-review-regression`

### `review3`

Used for:

- `ticket-review-tests`

### `review4`

Used for:

- `ticket-review-maintainability`

## Current recommended config in this repo

The checked-in `.ticket-flow/settings.yml` currently uses:

- `orchestration` → `zai/glm-5-turbo`
- `implementation` → `kimi-coding/k2.6, zai/glm-5-turbo, openai-codex/gpt-5.4-mini`
- `validation_fix` → `zai/glm-5.1`
- `fast` → `minimax/MiniMax-M2.7`
- `review1` → `openai-codex/gpt-5.4`
- `review2` → `openai-codex/gpt-5.4-mini`
- `review3` → `minimax/MiniMax-M2.7`
- `review4` → `minimax/MiniMax-M2.7`

## Sync behavior

`/ticket-flow-setup-models` reads `.ticket-flow/settings.yml` and rewrites mapped `.pi/prompts/*.md` files.

Properties of the sync step:

- deterministic
- idempotent
- file-name-to-role based
- does not rely on placeholder text remaining in frontmatter

If you change model assignments, rerun `/ticket-flow-setup-models`.
