---
name: profile-ci-automation
description: "Maintain deterministic JSON-to-SVG/README generation, atomic rollback safety, schema checks, skill validation, and GitHub Pages build/deploy workflows."
license: MIT
compatibility: "opencode, antigravity, claude-code, codex, copilot, agent-skills"
metadata:
  version: "1.0.0"
  domain: "DevOps & Automation"
  pricing_tier: "free-open-source"
  owner: "Salman Rahman (tsalmanrahman)"
  source: "repo-authored"
  verified: "2026-11-22"
---

# Profile & Platform CI/CD Automation

## Pipeline Responsibilities
1. **Single Source of Truth:** Keep `profile-data/*.json` and `ai-skills/*.json` clean and schema-valid. Never edit `README.md` or `platform/src/data/ecosystem.generated.json` manually.
2. **Atomic Generation:** Run `generate_readme.py` (with asset verification & rollback) and `skills_hub.py export-platform` so GitHub README SVGs and the web dashboard always share synchronized verified data.
3. **Validation Gate:** Execute `validate_data.py --check-assets`, `skills_hub.py validate`, Python `unittest` suites, TypeScript check (`tsc --noEmit`), and Vite production build (`npm run build`) before merging or pushing.
4. **Secret Hygiene:** Keep `GITHUB_TOKEN` and optional `LINKEDIN_ACCESS_TOKEN` exclusively inside GitHub Actions Secrets; never commit `.env` or tokens to git.
