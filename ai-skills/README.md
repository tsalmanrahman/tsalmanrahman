# Centralized AI Skills Hub & Multi-Agent Intelligence Layer

The `ai-skills/` subsystem unifies reusable, audited, genuinely free AI engineering skills into a single catalog shared across compatible local and cloud coding agents (`Antigravity`, `OpenCode CLI`, `Ollama`, `GitHub Copilot`, and standard `.agents/skills` / `.opencode/skills` runtimes).

---

## 1. Directory Layout

```text
ai-skills/
├── README.md                              # Governance, pricing honesty, and sync guide
├── agents.json                            # Verified local AI agent roster & responsibilities
├── registry.json                          # Master 32-skill catalog (8 repo-authored + 24 local audited)
└── library/                               # Flagship repo-authored skills (Agent Skills Markdown standard)
    ├── salman-sql-server-tuning/SKILL.md
    ├── salman-erp-architecture/SKILL.md
    ├── multi-agent-orchestrator/SKILL.md
    ├── cinematic-web-ui/SKILL.md
    ├── linkedin-identity-governance/SKILL.md
    ├── skill-security-auditor/SKILL.md
    ├── profile-ci-automation/SKILL.md
    └── powerbi-dax-modeling/SKILL.md
```

Synchronized OpenCode runtime copies live in `.opencode/skills/<skill-id>/SKILL.md`, generated deterministically via `scripts/skills_hub.py sync-agents`.

---

## 2. Pricing Honesty Policy

Every skill and agent runtime in `ai-skills/` must classify itself strictly under one of four tiers:

| Tier | Meaning |
| :--- | :--- |
| `free-open-source` | Completely free and open-source; locally runnable or open Markdown specification without API fees. |
| `free-tier-limited` | Free access governed by provider quotas or rate limits (e.g., Antigravity sessions, OpenCode free cloud models). |
| `freemium` | Core functionality free with optional paid plans or higher-tier models (e.g., GitHub Copilot). |
| `paid` | Commercial license, paid subscription, or metered billing required. |

All 32 skills registered in `ai-skills/registry.json` are verified `free-open-source`. Paid services are never labeled free.

---

## 3. Validation, Discovery & Multi-Agent Sync Commands

Run using Python 3.12+:

```powershell
# 1. Validate registry schemas, pricing tiers, frontmatter, Identity Lock SHA-256, and security scan
python scripts/skills_hub.py validate

# 2. Discover local skills in ~/.agents/skills and .opencode/skills vs. registry.json
python scripts/skills_hub.py discover

# 3. Sync repo-authored skills to .opencode/skills/ for OpenCode & compatible agents
python scripts/skills_hub.py sync-agents

# 4. Export unified ecosystem bundle + verified portrait/badge assets for the web platform
python scripts/skills_hub.py export-platform
```

---

## 4. Security Validation Gate

Before any skill is adopted into `ai-skills/registry.json`:
1. Inspect the full `SKILL.md` and any referenced helper scripts manually.
2. Confirm YAML frontmatter defines `name`, `description`, `license`, and `metadata` (for repo-authored skills).
3. Run `scripts/skills_hub.py validate` to verify zero unsafe patterns (`curl | bash`, `wget | sh`, `Invoke-Expression`, destructive root deletions, or unredacted secrets/tokens).
4. Verify SHA-256 Integrity of `assets/identity/original/salman-rahman-original.jpg` against `assets/identity/IDENTITY_LOCK.json`.
