---
description: Consolidate specialized work-item review passes into one final verdict
argument-hint: "<work-item-ref> [context...]"
model: openai-codex/gpt-5.4
thinking: high
fresh: true
skill: review-suite
restore: true
---

You are consolidating specialized review passes for one work item into a single reviewer-facing verdict.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

1. Resolve the work item, determine the tracker system (`tk`, `br`, or other), and resolve the optional ExecPlan.
2. Review the outputs of the specialized review passes that ran before this prompt.
3. De-duplicate overlapping findings.
4. Prefer concrete, evidence-backed issues over speculative concerns.
5. Produce one final verdict and the smallest sensible next step.

## Rules

- Do not invent findings that were not surfaced by evidence or direct inspection.
- If specialized review passes disagree, explain the disagreement.
- Preserve the highest severity when multiple passes identify the same material issue.
- If no material issues remain, say merge-ready plainly.
- Do not edit code.
- Do not mutate tracker state (`tk` / `br`) or repo-root `execflow/` runtime artifacts.
- Do not create follow-up work items here. Use `/review-followups <work-item-ref>` after consolidation for tracker mutations.

## Output format

Use exactly these sections:

# Review Verdict

- Ticket:
- Ticket system: tk / br / other
- Verdict: merge-ready / needs-fixes / blocked
- Summary:

# Specialized Review Summary

- Spec compliance:
- Regression / compatibility:
- Test adequacy:
- Maintainability:

# Consolidated Findings

- If there are no material issues, write exactly: `- none`
- Otherwise use repeated blocks in this exact format:

### Finding 1

- Severity: high / medium / low
- Lens: spec / regression / tests / maintainability
- File: `path/to/file:line` or `none`
- Observation:
- Remediation:

### Finding 2

- Severity: high / medium / low
- Lens: spec / regression / tests / maintainability
- File: `path/to/file:line` or `none`
- Observation:
- Remediation:

# Prioritized Summary

- High:
- Medium:
- Low:

# Acceptance Criteria Audit

- AC1:
  - Status:
  - Notes:
- AC2:
  - Status:
  - Notes:

# Final Recommendation

- Recommended next step:
