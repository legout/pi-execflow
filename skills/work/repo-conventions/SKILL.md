---
name: repo-conventions
description: Preserve local repository patterns, architecture, naming, and testing conventions while making work-item-scoped changes. Use before editing code, prompts, or workflow files.
---

# Repo Conventions

Use this skill whenever a work item changes existing repository files.

## Primary objective

Fit changes into the existing repository naturally instead of imposing new habits unnecessarily.

## Principles

1. Inspect nearby code before editing.
2. Reuse existing patterns, helpers, file structure, and naming where possible.
3. Match local test style and validation habits.
4. Avoid introducing a new pattern for a small local change unless required.
5. Treat consistency with the codebase as more important than personal preference.

## What to inspect

Before making changes, look at:

- nearby modules
- similar features
- existing tests
- naming conventions
- error-handling patterns
- configuration and dependency patterns

When editing prompt templates or skills in this repository, also inspect:

- nearby prompt frontmatter conventions
- existing skill naming and descriptions
- relevant docs under `docs/`
- workflow guidance under `.execflow/`

## Rules

- Prefer consistency over novelty.
- If an existing pattern is imperfect but standard in the repo, usually follow it unless the work item requires otherwise.
- If deviation is necessary, explain why.