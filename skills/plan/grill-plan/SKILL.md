---
name: grill-plan
description: >
  Stress-test an existing ExecPlan through a relentless, interactive grilling
  session. Challenges plan assumptions against the codebase, sharpens terms,
  resolves decision branches one at a time, and updates the ExecPlan as
  decisions crystallize.
---

# Grill Plan

Use this skill when an ExecPlan exists but the design needs pressure-testing before it is split into work items or implemented.

This skill is inspired by grill-style planning sessions: interview the user relentlessly, ask one question at a time, provide a recommended answer, and inspect the codebase whenever the repository can answer the question better than the user can.

## Required inputs

- An ExecPlan must exist at `.execflow/plans/<topic-slug>/execplan.md`.
- `.execflow/PLANS.md` must exist and be read in full before modifying the plan.
- If no ExecPlan exists, tell the user to run `/create-plan` first and stop.

## Topic resolution

1. If the user provides a topic argument, convert it to `<topic-slug>` (kebab-case, lowercase) before resolving plan paths.
2. If no argument is provided, scan `.execflow/plans/` for directories containing `execplan.md`. If exactly one match exists, use it.
3. If multiple plans exist, list them and ask which one to grill.
4. If no plan exists, tell the user to create one first.

## Core behavior

### Explore before asking

Before asking the user any question:

1. Read `.execflow/PLANS.md` in full.
2. Read the entire ExecPlan.
3. Read the associated brainstorm, if present.
4. Inspect files, commands, modules, tests, or docs referenced by the ExecPlan.
5. Search nearby code when the plan makes claims about current behavior, domain terms, architecture, validation, or dependencies.

If a question can be answered by reading the codebase, answer it from code evidence instead of asking the user.

### Grill the plan interactively

Walk down the design tree one branch at a time. Ask exactly one focused question per turn. For each question, include:

- the unresolved decision or ambiguity
- why it matters for implementation, validation, or work-item splitting
- your recommended answer based on the plan and codebase
- the specific choice you need from the user

Do not ask multipart question bundles. If a topic has several branches, ask the highest-leverage one first and save the rest for later turns.

### What to challenge

Pressure-test at least these areas when relevant:

- fuzzy or overloaded terminology
- contradictions between brainstorm, ExecPlan, code, and docs
- acceptance criteria that are not observable
- milestones that are not independently verifiable
- hidden sequencing dependencies
- unsafe assumptions about existing APIs, tests, or commands
- irreversible decisions that lack rationale
- edge cases and failure modes
- tracker splitting ambiguity: vertical slice vs enabler vs migration vs cleanup
- concurrency or merge-conflict risks between milestones
- scope creep disguised as cleanup or architecture polish

### Sharpen terminology

When the plan uses vague language, propose a precise canonical term. If the repository already uses a different term, call out the mismatch immediately and ask which term should win.

### Discuss concrete scenarios

Use concrete examples to probe domain boundaries and edge cases. Prefer scenarios that would force different implementation choices or validation expectations.

### Update the ExecPlan inline

When a decision crystallizes, update `.execflow/plans/<topic-slug>/execplan.md` immediately. Do not batch all updates until the end.

Update the smallest necessary sections, usually one or more of:

- `Decision Log`
- `Surprises & Discoveries`
- `Context and Orientation`
- `Plan of Work`
- `Concrete Steps`
- `Validation and Acceptance`
- `Interfaces and Dependencies`
- milestone prose
- `Idempotence and Recovery`

Every update must keep the ExecPlan self-contained and compliant with `.execflow/PLANS.md`.

### ADRs and glossary docs

This package's primary planning artifact is the ExecPlan. Do not create `CONTEXT.md` or ADR files by default.

If the repository already has glossary or ADR conventions and a decision is both hard to reverse and surprising without context, mention that an ADR or glossary update may be warranted, but keep the ExecPlan update as the required action.

## Stop conditions

Stop the grilling session when one of these is true:

- all material ambiguities that affect implementation, validation, or work-item splitting are resolved
- the user explicitly asks to stop or save progress
- a blocking contradiction requires code or product research outside the current session

Before stopping, ensure the ExecPlan reflects every resolved decision.

## Output discipline

During the session, ask one question at a time and wait for the user's answer.

When stopping, report:

- ExecPlan path
- decisions resolved
- sections updated
- unresolved questions, if any
- recommended next command, usually `/improve-plan <topic>`

## Hard rules

1. Do not implement code.
2. Do not create tracker work items.
3. Do not ask questions the codebase can answer.
4. Ask exactly one focused question at a time.
5. Always provide a recommended answer with each question.
6. Update the ExecPlan as decisions crystallize.
7. Preserve the plan's intent; clarify and harden it rather than changing scope silently.
