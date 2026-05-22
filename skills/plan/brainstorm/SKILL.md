---
name: brainstorm
description: >
  Interactive design brainstorming for a topic or feature idea. Explores
  project context before implementation, asks one focused question at a time,
  compares 2-3 approaches, obtains user approval, writes a reviewed
  brainstorm/design artifact under .execflow/plans/, and gates transition to
  ExecPlan creation.
---

# Brainstorm: Ideas Into Approved Designs

Help turn ideas into fully formed design direction through natural collaborative dialogue.

This skill is deliberately interactive. Do not treat it as a one-shot prompt. Explore the repository, ask questions one at a time, compare approaches, present the design for approval, then write a structured brainstorm/design document.

<HARD-GATE>
Do not implement code, scaffold a project, create tracker work items, or take any implementation action during brainstorming. The terminal state of this skill is an approved brainstorm/design artifact and a recommendation to run `/create-plan`.
</HARD-GATE>

## Supported document states

The brainstorm file may be saved in one of two states:

- `status: in-progress` — exploration has been captured, but the design direction is not approved yet.
- `status: complete` — exploration is finished, a direction has been chosen, and the user has approved the written artifact.

When resuming an `in-progress` brainstorm, read the existing file first, summarize the captured context, and continue from unresolved questions instead of restarting by default.

## Topic resolution

1. If the user provides a topic argument, use it.
2. The `<topic-slug>` is derived from the topic (kebab-case, lowercase, max 40 chars).
3. Write to `.execflow/plans/<topic-slug>/brainstorm.md`.

## Required process

Complete these steps in order.

### 1. Explore project context

Before asking detailed design questions, inspect the repository:

- file structure and package metadata
- existing docs such as README, ARCHITECTURE.md, `.execflow/` artifacts, or domain docs
- relevant code paths when the topic names an existing feature or module
- recent conventions visible in nearby files

Use this context to avoid asking questions that the repository already answers.

### 2. Assess scope and decompose when necessary

If the topic describes multiple independent subsystems or is too large for one coherent design, stop and help the user decompose it. Identify the sub-projects, relationships, and suggested order, then brainstorm the first sub-project through the normal flow.

### 3. Ask clarifying questions one at a time

Ask exactly one focused question per turn. Prefer multiple-choice questions when helpful, but open-ended questions are fine.

Focus on:

- purpose and user-visible outcome
- stakeholders
- hard constraints and soft preferences
- success criteria
- important edge cases and failure modes
- compatibility with existing project patterns

Do not dump a questionnaire.

### 4. Propose 2-3 approaches

Once enough context is known, present 2-3 plausible approaches with pros, cons, risks, and your recommendation. Lead with the recommended option and explain why it best fits the repository and user goal.

Apply these design principles:

- YAGNI ruthlessly: remove unnecessary features and knobs
- prefer simpler boundaries and fewer concepts
- prefer deep modules that hide sequencing and policy
- stay focused on improvements that serve the current goal
- avoid unrelated refactoring

### 5. Present the design for approval

Present the design in sections scaled to the complexity of the topic. Cover, when relevant:

- user-visible behavior
- architecture or module boundaries
- data flow
- error handling
- validation/testing strategy
- scope exclusions

Ask the user whether each section looks right before moving on. Revise until the user approves the design direction.

### 6. Write the brainstorm/design artifact

Write `.execflow/plans/<topic-slug>/brainstorm.md` using the output format below.

If the user pauses before approval, write `status: in-progress`. If the user approves the design and written artifact, write `status: complete`.

### 7. Self-review the written artifact

After writing the artifact, review it with fresh eyes and fix issues inline:

1. Placeholder scan: no `TBD`, `TODO`, or empty sections.
2. Internal consistency: no contradictions between problem, chosen direction, constraints, and success criteria.
3. Scope check: focused enough for one ExecPlan or explicitly decomposed.
4. Ambiguity check: requirements that could be read two ways are resolved or listed under Open Questions.

### 8. User review gate

Ask the user to review the written brainstorm/design artifact. If they request changes, update the file and rerun the self-review. Only mark `status: complete` after the user approves.

## Output format

Write the brainstorm document using this exact structure:

```md
# Brainstorm: <topic>

date: <ISO-8601>
status: in-progress | complete

## Project Context

<What repository context was inspected and what matters for this topic.>

## Problem Statement

<What is the core problem or opportunity? User-facing perspective.>

## Stakeholders

- <who cares about this and why>

## Constraints

### Hard constraints

- <constraints that cannot be changed>

### Soft constraints

- <preferences that could be relaxed>

## Ideas Explored

### Recommended Approach: <name>

- Description: <what this approach entails>
- Why recommended: <why this is the best fit>
- Pros: <benefits>
- Cons: <drawbacks>
- Risks: <what could go wrong>

### Alternative Approach: <name>

- Description: <what this approach entails>
- Pros: <benefits>
- Cons: <drawbacks>
- Risks: <what could go wrong>

### Alternative Approach: <name>

- Description: <what this approach entails>
- Pros: <benefits>
- Cons: <drawbacks>
- Risks: <what could go wrong>

## Trade-offs Identified

- <trade-off 1: what is being exchanged for what>
- <trade-off 2>

## Design Direction

<Approved design direction. If still in progress, write `Not approved yet.`>

## Design Sections Reviewed

- Section: <section name>
  Status: approved | needs revision | not reviewed
  Notes: <summary>

## Risks and Unknowns

- <risk 1>
- <unknown 1>

## Open Questions

- <question that needs resolution before or during planning>

## Decisions Made

- Decision: <what was decided>
  Rationale: <why>

## Key Assumptions

- <assumption that the plan will rely on>

## Success Criteria

- <observable outcome that means "done">

## Self-Review

- Placeholder scan: pass | needs work
- Internal consistency: pass | needs work
- Scope check: pass | needs work
- Ambiguity check: pass | needs work

## Next Resume Point

- <what remains unresolved before the brainstorm can be completed, or `Ready for /create-plan`.>
```

## Hard rules

1. Never implement code.
2. Never create tickets or issues.
3. Explore project context before detailed questions.
4. Ask exactly one question at a time.
5. Always explore 2-3 approaches before settling.
6. Lead with a recommendation once enough context is known.
7. Obtain user approval before marking the artifact complete.
8. Self-review the written artifact before asking the user to proceed.
9. Do not turn the brainstorm into a transcript; capture decisions and design state.

## Ending the session

The brainstorm ends when the user approves the design artifact, asks to pause, or asks to proceed to planning. Report the file path and recommend `/create-plan <topic>` next when the artifact is complete.
