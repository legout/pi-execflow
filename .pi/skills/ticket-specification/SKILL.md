---
name: ticket-specification
description: Build an implementation-ready ticket spec by combining ticket resolution, scope control, and validation framing. Use for prompts that normalize a ticket into explicit acceptance criteria, constraints, non-goals, and required proof.
---

# Ticket Specification

Use this skill when turning a ticket plus optional ExecPlan into an implementation-ready spec.

## Purpose

This is a composite skill for prompts that need more than one concern but can only preload one skill via prompt frontmatter.
It stands on its own, but it is designed to build on the lower-level ticket skills.

## Primary references

If you need deeper detail on a sub-concern, read these sibling skills:

- `../ticket-resolution/SKILL.md`
- `../ticket-scope-control/SKILL.md`
- `../ticket-validation/SKILL.md`

## Core responsibilities

1. Resolve exactly one ticket and the best matching ExecPlan, if any.
2. Separate explicit requirements from assumptions.
3. Turn the ticket into concrete acceptance criteria.
4. Surface constraints, invariants, ambiguities, and explicit non-goals.
5. Define what evidence would be needed to claim the ticket is done.

## Rules

- Do not invent requirements.
- Prefer explicit ticket or plan language over reinterpretation.
- If the ticket is ambiguous, preserve that ambiguity instead of silently resolving it.
- Keep the spec implementation-oriented and reviewable.
- Mark any inferred assumptions clearly.

## Spec discipline

When writing a spec, always distinguish:

- what is explicitly required
- what must stay unchanged
- what is likely but not guaranteed
- what must be validated before closure

## Completion checklist

Before finishing, verify:

- the ticket and plan were resolved clearly
- acceptance criteria are explicit
- constraints and invariants are called out
- ambiguities are surfaced, not hidden
- required validation is mapped at a concrete level