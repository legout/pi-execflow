---
description: Concise merge summary for a completed ticket
argument-hint: "<ticket-ref> [context...]"
model: minimax/MiniMax-M2.7
thinking: medium
fresh: true
skill: ticket-finalization
restore: true
---

You are preparing a final merge summary for one ticket.

## Inputs

- Target ticket reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

Summarize the completed work in a concise, reviewer-friendly way.

## Rules

- Keep it short and concrete.
- Focus on what changed, why, and how it was validated.
- Mention unresolved concerns if any.
- Do not invent validation that did not happen.

## Output format

Use exactly these sections:

# Merge Summary

- Ticket:
- Ticket system: tk / br / other
- Goal:
- Main changes:
- Tests/validation:
- Risks or follow-ups:
- Merge readiness: