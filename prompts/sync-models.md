---
description: Sync project prompt frontmatter models from .execflow/settings.yml
run: node scripts/sync-models.mjs
handoff: never
restore: true
---

Synchronize `.pi/prompts/*.md` model and thinking frontmatter from `.execflow/settings.yml`.
