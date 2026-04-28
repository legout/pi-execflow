---
description: Convert an ExecPlan into dependency-aware br issues with ExecPlan references
argument-hint: "[topic]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: issueize
restore: true
---

Convert the ExecPlan for `$@` into `br` issues.

Use `$@` as the primary topic selector. If `$@` is empty, auto-detect from existing ExecPlans.

If the repository is clearly configured for `tk` ticket tracking rather than `br` issue tracking, stop and suggest `/create-tickets $@` instead.

Procedure:

1. Determine the topic using topic resolution from the `issueize` skill.
2. If `$@` is not empty, derive `<topic-slug>` from `$@` using kebab-case, lowercase normalization.
3. Read `.execflow/plans/<topic-slug>/execplan.md` in full.
4. Parse all milestones and extract explicit dependency, parallelism, related-work, conflict-risk, enabler, migration, cleanup, and prototype cues.
5. Apply the smart issue-splitting rules from the skill:
   - Default: one issue per independently verifiable milestone
   - Prefer vertical end-to-end slices when splitting a large milestone
   - Merge tiny adjacent enabler or cleanup steps when that yields a better review unit
   - Build a dependency DAG from real prerequisites; only fall back to milestone order when needed
6. Ensure `br` is available and the repo has a `.beads/` workspace. If not, stop and suggest `/init-execflow --br`.
7. For each issue, create it using `br create` with:
   - Title from the milestone name
   - Description with milestone prose, concrete steps, acceptance criteria
   - Type / scheduling hints when useful
   - Priority based on milestone ordering
   - The ExecPlan Reference block
8. Set hard dependencies from explicit prerequisites first, inferred blocking relationships second, and milestone ordering only as a fallback.
9. Finish with `RUST_LOG=error br sync --flush-only`.
10. Report all created issues with kind, dependencies, and any important related/conflict hints.

Follow the `issueize` skill exactly for the ExecPlan Reference block format, issueization rules, and `br` command discipline.

Report the number of issues created and list each with ID, title, kind, priority, dependencies, and any important related/conflict hints.
Suggest running `/execflow <issue-ref>` for the default validation-only implementation workflow, `/exec-delegated <issue-ref>` for larger/noisier work, `/review <issue-ref>` plus `/review-followups <issue-ref>` for independent review tracking, or the focused prompts (`/resolve`, `/spec`, `/implement`, `/validation-fix`, `/validate`, `/finalize`) for a narrower pass.
