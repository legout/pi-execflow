---
name: resolve
description: Resolve work items reliably from .tickets/ or .beads/ and connect them to ExecPlans when available. Use before manual implementation, planning, validation, or review.
---

# Resolution

Use this skill whenever work begins from a work-item reference rather than an already-open file.

## Primary objective

Resolve exactly one intended work item with high confidence before implementation begins.

## Repository conventions

Tickets may be tracked in one of two broad ways:

- file-backed `.tickets/` entries, typically used with `tk`
- a `.beads/` workspace managed by the `br` CLI

Execution plans may live in:

- `.execflow/plans/`

Do not assume `.tickets/` is primary when both trackers exist.
Prefer repository evidence in this order:

1. a direct file path supplied by the user
2. the only tracker workspace that exists
3. the primary tracker declared in `.execflow/AGENTS.md`
4. the `tracker.primary` value in `.execflow/settings.yml`

Remember that a `br` workspace is **not** a directory of per-issue markdown files.

## Resolution order

1. If the input is a valid file path, use it directly and treat it as a file-backed work item.
2. Determine tracker preference from repo state:
   - only `.beads/` exists → prefer `br`
   - only `.tickets/` exists → prefer `tk`
   - both exist → prefer the tracker declared in `.execflow/AGENTS.md`, then `.execflow/settings.yml`
   - if neither preference source exists, treat resolution as ambiguous unless one tracker yields a clear exact match and the other does not
3. Resolve against the preferred tracker first:
   - `tk` preference → search `.tickets/` for exact ID, exact filename, then slug/title similarity
   - `br` preference → use `RUST_LOG=error br show <input> --json` for exact ID, then `RUST_LOG=error br search "<input>" --json` or `RUST_LOG=error br list --json`
4. If the preferred tracker does not resolve the item and the other tracker exists, try the other tracker as a fallback.
5. Stop if multiple plausible candidates remain across either tracker.
6. Search `.execflow/plans/` for the best associated plan using:
   - ID match
   - slug/title match
   - references in content
   - filename similarity

## Rules

- Do not guess when resolution is ambiguous.
- Do not assume an ExecPlan exists.
- If no plan is found, explicitly state that.
- Distinguish a file-backed work-item path from a CLI-backed work-item reference.
- Do not assume `.beads/` contains one file per issue; when it is a `br` workspace, use `br` commands instead of file globbing.
- Report the resolved tracker system explicitly as `tk`, `br`, or `other`.
