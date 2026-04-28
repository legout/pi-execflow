---
description: Create tracker follow-ups from a broad change review
argument-hint: "[review-target/context...]"
model: zai/glm-5-turbo
thinking: medium
restore: true
---

You are converting the most recent `/change-review` verdict into tracker follow-up work.

## Inputs

- Optional review target/context: `$@`

## Policy

- `/change-review` is read-only by default and reviews arbitrary branch, diff, or path-scoped code changes.
- `/change-review --create-followups ...` may combine review and follow-up creation in one explicit mutation run.
- `/change-review-followups` is the explicit post-review mutation step.
- Broad reviews can generate noisy findings. Be conservative: create follow-ups only for high/medium actionable findings that are concrete and not duplicates.
- Low-severity findings should remain notes unless the user explicitly asks to track them.

## Your tasks

1. Determine tracker system (`tk`, `br`, or other) from repository evidence.
2. Read the most recent `# Change Review Verdict` / `# Findings` from the current conversation. If none is available, stop and tell the user to run `/change-review` first.
3. Extract high/medium actionable findings.
4. De-duplicate against existing open tracker items.
5. If more than five follow-ups would be created, stop and list candidates for confirmation instead of creating tracker noise.
6. Create follow-up issues/tickets for the selected findings.
7. Run tracker sync if required (`RUST_LOG=error br sync --flush-only` for `br`).

## Follow-up body format

```md
Change Review Follow-up

Review target: <base/ref/path/context>
Severity: <high|medium>
Category: <correctness|regression|tests|maintainability|architecture|security|other>
Source finding: <short quote or paraphrase>
Required remediation: <specific action>
Acceptance criteria:
- The finding is addressed with the smallest safe change.
- Relevant validation is run and documented.
```

## Rules

- Do not create follow-ups when `# Findings` is exactly `- none`.
- Do not create follow-ups for speculative concerns or style nits.
- Do not create duplicate follow-ups for equivalent open issues/tickets.
- Do not create more than five follow-ups without explicit confirmation.
- Do not claim tracker changes succeeded until commands actually succeeded.

## Output format

Use exactly these sections:

# Change Review Follow-up Decision

- Tracker system: tk / br / other
- Review target:
- Material actionable findings:
- Candidate follow-ups over limit: yes / no
- Why:

# Tracker Actions

- Follow-up items created:
- Dependencies / references added:
- Sync run:

# Follow-up Details

- Follow-up 1:
  - ID:
  - Severity:
  - Title:
  - Source finding:
- Follow-up 2:
  - ID:
  - Severity:
  - Title:
  - Source finding:

# Skipped Findings

- Finding:
  - Reason:

# Manual Follow-up

- Item:
