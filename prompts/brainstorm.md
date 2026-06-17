---
description: Interactive brainstorming session for a topic or feature idea
argument-hint: "<topic>"
model: openai-codex/gpt-5.5, zai/glm-5.2
thinking: high
skill: brainstorm
restore: true
---

If `$@` is empty, ask the user for a topic before proceeding.

Run an interactive brainstorming session for this topic: $@

<if-model is="openai-codex/*">
Drive toward 2-3 sharp approaches and a clear recommendation, but keep the session gated: one question at a time, design approval before completion, no implementation.
<else>
Be extra explicit about project context, trade-offs, approval gates, and what remains unresolved before `/create-plan`.
</if-model>

Procedure:

1. Derive the topic slug from `$@` (kebab-case, lowercase, max 40 chars).
2. Check if `.execflow/plans/<topic-slug>/brainstorm.md` already exists.
3. If it exists and status is `complete`, report that an approved brainstorm already exists and suggest running `/create-plan $@` next. Stop.
4. If it exists and status is `in-progress`, offer to resume or restart. If the user resumes, read the existing file, summarize captured context, and continue from unresolved questions. If the user restarts, replace the prior brainstorm with a fresh session.
5. If it does not exist, start the interactive brainstorming session following the brainstorm skill.
6. Explore project context before asking detailed questions.
7. Ask exactly one focused question at a time.
8. Propose 2-3 approaches with a recommendation once enough context is known.
9. Present design sections for user approval before marking the artifact complete.
10. Self-review the written artifact for placeholders, contradictions, scope drift, and ambiguity.

Follow the brainstorm skill exactly.

When the session pauses before approval, write or update `.execflow/plans/<topic-slug>/brainstorm.md` with `status: in-progress`.
When the user approves the written design artifact, write or update the same file with `status: complete`.

Report the file path and suggest running `/create-plan $@` next.
