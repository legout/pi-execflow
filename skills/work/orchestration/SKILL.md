---
name: orchestration
description: Execute multi-phase manual work-item workflows with explicit phase boundaries, scope control, validation, and review. Use for local end-to-end prompts outside the delegated package workflow.
---

# Orchestration

Use this skill when a local prompt coordinates multiple work-item phases in one pass.

## Primary objective

Run work-item execution through a disciplined sequence of phases so the outcome is correct, reviewable, and traceable.

## Repository fit

This skill is for the local `.pi/prompts/` overlay.
It is not a replacement for an optional external delegated `/execflow` state machine when that workflow is available.
Unless the user asks for that official workflow, avoid mutating `tk` state or repo-root `execflow/` runtime artifacts as side effects.

## Required phase model

Use these phases unless the prompt specifies a narrower flow:

1. Resolve context
2. Normalize the spec
3. Derive validation
4. Plan minimal changes
5. Implement
6. Validate
7. Review
8. Fix and re-check if needed
9. Summarize

## Phase discipline

- Do not jump into implementation before the work item is understood.
- Do not claim completion before validation is considered.
- Do not collapse review into implementation.
- If ambiguity blocks a phase, stop and surface the blocker.

## Scope discipline

- Keep work tied to the current work item only.
- Explicitly identify non-goals and out-of-scope areas.
- Reject opportunistic expansion unless the prompt or user asks for it.

## Review-loop discipline

Use loops only where they add value:

- review -> fix -> validate -> re-review

Do not loop endlessly on:

- initial understanding
- speculative refinement
- cosmetic improvement

## Output discipline

Prefer structured outputs that clearly show:

- what was resolved
- what is required
- what changed
- how it was validated
- what risks or gaps remain

## Escalation discipline

If any of the following happen, stop and report:

- work item cannot be resolved confidently
- acceptance criteria are too ambiguous
- required behavior conflicts with existing code expectations
- requested fix would require unapproved scope expansion

## Completion checklist

Before finishing, verify:

- context was resolved
- requirements were identified
- implementation stayed in scope
- validation was performed or explicitly deferred
- review concerns were addressed or documented
- next step is clear