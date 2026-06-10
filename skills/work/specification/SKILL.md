---
name: specification
description: Build an implementation-ready work-item spec by combining resolution, scope control, and validation framing. Use for prompts that normalize a work item into explicit acceptance criteria, constraints, non-goals, and required proof.
---

# Specification

Use this skill when turning a work item plus optional ExecPlan into an implementation-ready spec.

## Purpose

This is a composite skill for prompts that need more than one concern but can only preload one skill via prompt frontmatter.
It stands on its own, but it is designed to build on the lower-level work-item skills.

## Primary references

If you need deeper detail on a sub-concern, read these sibling skills:

- `../resolve/SKILL.md`
- `../validation/SKILL.md`

## Core responsibilities

1. Resolve exactly one work item and the best matching ExecPlan, if any.
2. Separate explicit requirements from assumptions.
3. Turn the ticket into concrete acceptance criteria.
4. Surface constraints, invariants, ambiguities, and explicit non-goals.
5. Define what evidence would be needed to claim the work item is done.
6. Classify the work item's RED/GREEN requirement before implementation begins.

## Rules

- Do not invent requirements.
- Prefer explicit ticket or plan language over reinterpretation.
- If the work item is ambiguous, preserve that ambiguity instead of silently resolving it.
- Keep the spec implementation-oriented and reviewable.
- Mark any inferred assumptions clearly.

## Spec discipline

When writing a spec, always distinguish:

- what is explicitly required
- what must stay unchanged
- what is likely but not guaranteed
- what must be validated before closure
- whether testable behavior requires RED proof before production changes
- whether GREEN means the smallest implementation that satisfies the RED proof
- which later checks are regression validation rather than RED proof
- any RED exemption and the reason it is legitimate

## RED/GREEN planning

For testable behavior changes, the spec must identify a RED proof before implementation:

- the exact test, command, assertion, or manual check that should fail before the production change
- the expected failure signal that proves the test is failing for the intended reason
- the acceptance criterion that the RED proof covers

For docs-only changes, planning-only changes, exploratory spikes, or work that cannot be tested in the current repository, record an explicit RED exemption instead of silently skipping RED. The exemption must include the reason and the alternate evidence that will be used for closure.

Do not accept vague statements such as "tests should be added" or "run validation" as RED/GREEN planning. If the work item lacks enough information to choose RED proof safely, mark `RED/GREEN: unknown - clarify before implementation`.

## Completion checklist

Before finishing, verify:

- the work item and plan were resolved clearly
- acceptance criteria are explicit
- constraints and invariants are called out
- ambiguities are surfaced, not hidden
- required validation is mapped at a concrete level
- RED proof, GREEN expectation, regression validation, or RED exemption is explicit
