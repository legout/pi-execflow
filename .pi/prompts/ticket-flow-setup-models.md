---
description: Sync .pi prompt frontmatter models from .ticket-flow/settings.yml
run: node scripts/ticket-flow-setup-models.mjs
handoff: never
restore: true
---

Synchronize `.pi/prompts/*.md` model and thinking frontmatter from `.ticket-flow/settings.yml`.
