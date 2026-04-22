---
name: resolution
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

In this repository, `.tickets/` is the primary source of truth.
Support `.beads/` as a portability path, but remember that a `br` workspace is **not** a directory of per-issue markdown files.

## Resolution order

1. If the input is a valid file path, use it directly and treat it as a file-backed work item.
2. Otherwise search `.tickets/` for:
   - exact ID
   - exact filename
   - slug/title similarity
3. If still unresolved and a `.beads/` workspace is present, switch to `br`-style resolution:
   - try `RUST_LOG=error br show <input> --json` for an exact ID match
   - if that fails, use `RUST_LOG=error br search "<input>" --json` or `RUST_LOG=error br list --json` to identify title / similarity matches
   - stop if multiple plausible candidates remain
4. Search `.execflow/plans/` for the best associated plan using:
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
