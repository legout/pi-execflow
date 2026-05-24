---
description: Review arbitrary branch, diff, or path-scoped code changes; create follow-ups only with --create-followups
argument-hint: "[--base <ref>] [--create-followups] [paths/context...]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: review-suite
restore: true
---

Review target type: arbitrary branch, diff, or path-scoped code change.

Inputs:

- Optional base ref flag: `--base <ref>`
- Optional mutation flag: `--create-followups`
- Optional paths or freeform review focus: `$@`

Scope:

- if `--base <ref>` is present, inspect the diff against that ref
- if paths are present, review those paths and relevant diffs
- otherwise review current uncommitted changes and/or current branch diff using repository evidence
- check correctness, regression risk, compatibility, security/data-loss hazards, validation evidence, concrete maintainability bugs, and merge readiness

Follow the `review-suite` skill exactly.
Default to read-only. Create tracker follow-ups only when the input includes `--create-followups`.
