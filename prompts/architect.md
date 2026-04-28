---
description: Create or update ARCHITECTURE.md for the project
argument-hint: "[topic]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: architect
restore: true
---

Create or update the project's ARCHITECTURE.md.

<if-model is="openai-codex/*">
Favor the deepest simplification first. Keep the prose crisp, but still name exact repo-relative paths, boundaries, and leaked responsibilities.
<else>
Be extra explicit about repository boundaries, data flow handoffs, and why each module is deep or shallow. Do not assume the architectural context is obvious from filenames alone.
</if-model>

Topic context: $@

Procedure:

1. If `$@` is not empty, derive `<topic-slug>` from `$@` using kebab-case, lowercase normalization.
2. Check if `ARCHITECTURE.md` exists at the project root.
3. If `$@` is not empty, read `.execflow/plans/<topic-slug>/brainstorm.md` for context if it exists.
4. If `$@` is empty, scan `.execflow/plans/*/brainstorm.md` for optional context. Choose the most recent brainstorm by the top-level `date:` value when it is valid ISO-8601; if no valid `date:` exists, fall back to the newest file modification time.
5. Follow the architect skill exactly.

If `ARCHITECTURE.md` does not exist, create it following the skill's output format.
If it exists, update only the affected sections while preserving existing content.

Report the file path when done.
