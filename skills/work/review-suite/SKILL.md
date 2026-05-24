---
name: review-suite
description: Review work items, ExecPlan delivery, or arbitrary code changes with evidence-backed findings. Reviews are read-only by default and create tracker follow-ups only when explicitly requested with --create-followups.
---

# Review Suite

Use this skill for `/ef-review`, `/execplan-review`, and `/change-review`.

## Default mutation policy

Reviews are read-only by default. Do not add tracker comments, close/reopen items, create issues/tickets, edit code, or mutate repo-root workflow artifacts unless the prompt input includes `--create-followups`.

When `--create-followups` is absent, list candidate follow-ups only. When it is present, create follow-ups only for concrete, actionable findings after checking for obvious duplicates. For `br`, prefer `ACTOR="${BR_ACTOR:-assistant}"` and `RUST_LOG=error br ... --json`, then run `RUST_LOG=error br sync --flush-only` after mutation.

## Review modes

### Work-item review

Review exactly one implemented work item. Resolve the work item and optional ExecPlan first. Check work-item compliance, ExecPlan compliance, acceptance criteria, validation evidence, accidental scope expansion, missing required behavior, regression risk, and merge readiness.

### ExecPlan delivery review

Review whether a whole ExecPlan was delivered coherently across derived issues/tickets. Resolve the plan, find derived work items, inspect status/descriptions/dependencies/comments/validation notes, and sample high-risk changed code only as needed. Focus on milestone coverage, dependency sequencing, plan drift, required docs/architecture updates, and material evidence gaps.

### Change review

Review an arbitrary branch, diff, or path scope. Determine the target from `--base <ref>`, explicit paths/context, or current uncommitted/current-branch changes. Focus on correctness, regressions, security/data-loss risks, compatibility, validation evidence, maintainability issues that create concrete bugs, and merge readiness.

## Finding standards

Prefer fewer strong findings over many weak ones. A finding must be concrete, evidence-backed, actionable, and tied to a real risk or acceptance gap. Do not create findings for style nits, vague maintainability preferences, speculative edge cases, or redesign ideas unless they are required for correctness.

Severity:

- `critical` — unsafe to merge/rely on, acceptance criteria are falsely complete, or there is a data-loss/security/compatibility blocker.
- `major` — real bug, missing required behavior, material plan drift, dependency error, or validation gap that should be fixed before relying on the work.
- `minor` — concrete correctness, evidence, or required-doc gap worth tracking, but not a blocker by itself.

## Follow-up body format

Use one concise body format for created tracker work items:

```md
Review Follow-up

Review target: <work-item id, ExecPlan path, branch/diff/path>
Severity: <critical|major|minor>
Category: <correctness|regression|tests|maintainability|architecture|security|delivery|other>
Source finding: <short quote or paraphrase>
Required remediation: <specific action>
Acceptance criteria:
- The finding is addressed with the smallest safe change.
- Relevant validation or evidence is documented.
```

## Output format

Use exactly these sections for all review prompts:

# Review Verdict

- Review mode: work-item / execplan / change
- Review target:
- Tracker system: tk / br / other
- Verdict: merge-ready / needs-fixes / partial / failed / blocked / informational
- Confidence: high / medium / low
- Summary:

# Findings

- If there are no material findings, write exactly: `- none`
- Otherwise use repeated blocks:

### Finding 1

- Severity: critical / major / minor
- Category: correctness / regression / tests / maintainability / architecture / security / delivery / other
- File: `path/to/file:line` or `none`
- Evidence:
- Observation:
- Remediation:

# Coverage and Evidence

- Acceptance or milestone coverage:
- Validation evidence reviewed:
- Missing or weak evidence:
- Scope/plan drift:

# Follow-up Actions

- Follow-up creation enabled: yes / no
- Candidate follow-ups listed:
- Follow-up items created:
- Duplicates skipped:
- Notes/comments added:
- Sync run:

# Recommended Next Actions

- Action 1:
- Action 2:
