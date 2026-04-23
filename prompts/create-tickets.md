---
description: Convert an ExecPlan into dependency-aware tk tickets with ExecPlan references
argument-hint: "[topic]"
model: openai-codex/gpt-5.4, zai/glm-5.1, kimi-coding/k2p6
thinking: high
skill: ticketize
restore: true
---

Convert the ExecPlan for `$@` into tk tickets.

Use `$@` as the primary topic selector. If `$@` is empty, auto-detect from existing ExecPlans.

If the repository is clearly configured for `br` issue tracking rather than `tk` ticket files, stop and suggest `/create-issues $@` instead.

Procedure:

1. Determine the topic using topic resolution from the ticketize skill.
2. If `$@` is not empty, derive `<topic-slug>` from `$@` using kebab-case, lowercase normalization.
3. Read `.execflow/plans/<topic-slug>/execplan.md` in full.
4. Parse all milestones and extract explicit dependency, parallelism, related-work, conflict-risk, enabler, migration, cleanup, and prototype cues.
5. Apply the smart ticketization rules:
   - Default: one ticket per independently verifiable milestone
   - Prefer vertical end-to-end slices when splitting a large milestone
   - Merge tiny adjacent enabler or cleanup steps when that yields a better review unit
   - Build a dependency DAG from real prerequisites; only fall back to milestone order when needed
6. For each ticket, create it using `tk create` with:
   - Title from milestone name
   - Description with milestone prose, concrete steps, acceptance criteria
   - Kind / scheduling hints when useful, including related/conflict hints
   - Priority based on milestone ordering
   - The ExecPlan Reference block
7. Set dependencies from explicit prerequisites first, inferred blocking relationships second, and milestone ordering only as a fallback.
8. Report all created tickets with kind, dependencies, and any important related/conflict hints.

Follow the ticketize skill exactly for the ExecPlan Reference block format and ticketization rules.

Report the number of tickets created and list each with ID, title, kind, priority, dependencies, and any important related/conflict hints.
Suggest running `/execflow` or `/execflow-queue` for the delegated `tk` workflow, or `/exec-standard <ticket-ref>` for the local manual flow.
