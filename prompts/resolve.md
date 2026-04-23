---
description: Resolve a work item from .tickets/ or .beads/ and find the best matching ExecPlan
argument-hint: "<work-item-ref> [context...]"
model: minimax/MiniMax-M2.7
thinking: low
fresh: true
skill: resolve
restore: true
---

You are loading context for exactly one work item.

## Inputs

- Target work-item reference: `$1`
- Optional extra disambiguation/context: `${@:2}`

## Repository conventions

Work may be tracked as either:

- file-backed `.tickets/` entries, typically used with `tk`
- issues inside a `.beads/` / `br` workspace

Execution plans may live in:

- `.execflow/plans/`

## Resolution algorithm

1. If `$1` is an existing file path, use it directly and treat it as a file-backed ticket.
2. Determine tracker preference from repository state:
   - only `.beads/` exists → prefer `br`
   - only `.tickets/` exists → prefer `tk`
   - both exist → prefer the tracker declared in `.execflow/AGENTS.md`, then `.execflow/settings.yml`
3. Resolve against the preferred tracker first:
   - `tk` → search `.tickets/` for exact ID match, exact filename match, then slug/title similarity
   - `br` → try `RUST_LOG=error br show "$1" --json`, then `RUST_LOG=error br search "$1" --json` or `RUST_LOG=error br list --json`
4. If still unresolved and the other tracker exists, try the other tracker as a fallback.
5. If multiple plausible matches remain, stop and list candidates.
6. Search `.execflow/plans/` for the best matching plan using:
   - ticket ID
   - filename similarity
   - title/slug similarity
   - references in plan content
7. Assess whether available context is sufficient for safe implementation.

## Rules

- Do not invent requirements.
- If work-item resolution is ambiguous, stop and ask for clarification.
- If no ExecPlan exists, say so explicitly.
- If a plan is missing but the work item is sufficient, say implementation can still proceed.
- If context is insufficient, return no-go.

## Output format

Use exactly these sections:

# Ticket Resolution

- Input:
- Resolved work-item locator:
- Ticket system: tk / br / other
- Resolution confidence:
- Alternative candidates, if any:

# Ticket Summary

- Title:
- Plain-language summary:
- Key visible requirements:

# ExecPlan Resolution

- Matching plan path:
- Resolution confidence:
- If none found, say: `No matching ExecPlan found`

# ExecPlan Summary

- Summary:
- Additional constraints or expectations:
- If none found, say: `No ExecPlan summary available`

# Readiness Assessment

- Can proceed safely? yes/no
- Why:
- Missing information, if any:
- Recommended next step:
