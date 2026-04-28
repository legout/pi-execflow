---
name: orchestration
description: Execute multi-phase manual work-item workflows with explicit phase boundaries, scope control, validation, and optional separate review. Use for local end-to-end prompts outside the package chain.
---

# Orchestration

Use this skill when a local prompt coordinates multiple work-item phases in one pass.

## Primary objective

Run work-item execution through a disciplined sequence of phases so the outcome is correct, reviewable, and traceable.

## Repository fit

This skill is for the local `.pi/prompts/` overlay.
It is not a replacement for the package `/execflow` chain; use focused prompts when a narrower manual pass is needed.
Unless the user asks for that official workflow, avoid mutating `tk` state or repo-root `execflow/` runtime artifacts as side effects.

## Required phase model

Use these phases unless the prompt specifies a narrower flow. Review is intentionally separate from the default validation-only execution path.

1. Resolve context
2. Normalize the spec
3. Derive validation
4. Plan minimal changes
5. Implement
6. Validate
7. Run `/validation-fix` or otherwise fix and re-check validation if needed
8. Summarize / finalize from validation evidence
9. Run `/review` and `/review-followups` as a separate fresh review workflow when requested

## Phase discipline

- Do not jump into implementation before the work item is understood.
- Do not claim completion before validation is considered.
- Do not claim independent review happened during validation-only execution.
- If ambiguity blocks a phase, stop and surface the blocker.

## Scope discipline

- Keep work tied to the current work item only.
- Explicitly identify non-goals and out-of-scope areas.
- Reject opportunistic expansion unless the prompt or user asks for it.

## Review-loop discipline

Use loops only where they add value:

- `/validation-fix` bounded convergence loops, with review handled separately through `/review` and `/review-followups`

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
- review status is explicit: clean, follow-ups created, or not run
- next step is clear
