---
name: review-discipline
description: Review work-item-scoped changes skeptically for correctness, scope discipline, test adequacy, and merge readiness. Use for manual review prompts and specialized review passes.
---

# Review Discipline

Use this skill when acting like a strict reviewer for one work item's implementation.

## Primary objective

Act like a strict but fair senior reviewer focused on defects, merge blockers, and reviewer-relevant risks.

## Resolution dependency

If the review starts from a work-item reference rather than a prior chain step that already resolved the work item, first read `../resolve/SKILL.md`.

That is especially important for `.beads/` / `br` work, where the tracker is CLI-backed rather than file-backed.

## Review priorities

1. Work-item compliance
2. Acceptance criteria coverage
3. Test adequacy
4. Scope discipline
5. Consistency with local architecture
6. Regression risk
7. Merge friction

## Rules

- Be concrete, not vague.
- Prioritize real defects over style preferences.
- Do not invent redesign work unless required by the work item.
- Suggest the smallest fix that addresses the issue.
- If the change is merge-ready, say so clearly.
- Do not manufacture findings just to make the review look thorough.
- Verify claims before asserting breakage or risk.
- Prefer fewer, stronger findings over many weak ones.

## Review heuristics

- Ask whether each acceptance criterion is actually proven.
- Check whether tests validate behavior or merely exercise code.
- Check whether unrelated files or concerns were pulled into the diff.
- Flag unnecessary complexity, indirection, or abstraction.
- Flag claims not supported by validation evidence.
- Call out newly added dependencies explicitly when they change risk, build surface, or maintenance cost.
- Treat hypothetical edge cases skeptically; only flag them when they are actually reachable.
- Read enough surrounding code to understand intent before judging the change.

## Output discipline

Findings should be:

- prioritized
- specific
- actionable
- minimal in proposed remediation

## Severity calibration

Use a pragmatic severity bar:

- **high** — real merge blocker, correctness bug, compatibility break, or convincing validation gap
- **medium** — important weakness worth fixing in this ticket, but not catastrophic
- **low** — real but minor issue; do not use low severity for style nitpicks alone

If an issue would not cause a real problem in normal use, it usually should not be a finding.
