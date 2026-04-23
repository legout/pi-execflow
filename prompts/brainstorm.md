---
description: Interactive brainstorming session for a topic or feature idea
argument-hint: "<topic>"
model: openai-codex/gpt-5.4, zai/glm-5.1, kimi-coding/k2p6
thinking: high
skill: brainstorm
restore: true
---

If `$@` is empty, ask the user for a topic before proceeding.

Run an interactive brainstorming session for this topic: $@

<if-model is="openai-codex/*">
Drive toward 2-3 sharp approaches and a clear recommendation once the user has enough context, while keeping the session interactive.
<else>
Keep the exploration very explicit: restate trade-offs plainly, ask one focused question at a time, and avoid assuming the preferred direction is already obvious.
</if-model>

Procedure:

1. Derive the topic slug from `$@` (kebab-case, lowercase, max 40 chars).
2. Check if `.execflow/plans/<topic-slug>/brainstorm.md` already exists.
3. If it exists and status is `complete`, report that a brainstorm already exists and suggest running `/plan-chain $@` or `/plan-create $@` next. Stop.
4. If it exists and status is `in-progress`, offer to resume or restart. If the user resumes, read the existing file, summarize the captured exploration, and continue from the unresolved questions. If the user restarts, replace the prior brainstorm with a fresh session.
5. If it does not exist, start the interactive brainstorming session following the brainstorm skill.
6. **Optional external research:** if the topic appears to depend on external technology choices, APIs, frameworks, libraries, or current best practices, first check whether a `researcher` subagent is available via `subagent` discovery (`action: "list"`). If it is available, spawn it to gather the latest docs, trade-offs, and best practices relevant to the topic, then use its findings as brainstorming context. If no `researcher` agent is available, continue without it.

Follow the brainstorm skill exactly for the exploration and convergence phases.

When the session pauses before convergence, write or update `.execflow/plans/<topic-slug>/brainstorm.md` with `status: in-progress` using the skill's output format.
When the session concludes with a chosen direction, write or update the same file with `status: complete`.

Report the file path and suggest running `/plan-chain $@` or `/plan-create $@` next.
