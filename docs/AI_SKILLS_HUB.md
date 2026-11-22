# Centralized AI Skills Hub Guide

This document details the architecture, validation rules, multi-agent synchronization, and security controls of Salman Rahman's **Centralized AI Skills Hub** (`ai-skills/`).

---

## 1. Purpose & Design Goals

Modern AI coding workflows span multiple assistants (`Antigravity`, `OpenCode CLI`, `Ollama`, `GitHub Copilot`, and `.agents/skills` / `.opencode/skills` compatible runtimes). Rather than scattering duplicate prompts or trusting unvetted remote scripts, this hub provides:

1. **Single Versioned Catalog (`ai-skills/registry.json`):** 32 audited, genuinely free and open-source skills (8 repo-authored flagship skills + 24 verified local shared skills) organized across 8 engineering domains.
2. **Honest 4-Tier Pricing Classification:**
   - `free-open-source`: Completely free and open-source; zero API fees.
   - `free-tier-limited`: Free usage bounded by provider rate/quota limits.
   - `freemium`: Free core with optional paid plans or premium tiers.
   - `paid`: Requires paid license, commercial subscription, or metered billing.
3. **Cross-Agent Synchronization (`.opencode/skills/`):** `scripts/skills_hub.py sync-agents` mirrors every repo-authored skill from `ai-skills/library/<id>/SKILL.md` into `.opencode/skills/<id>/SKILL.md`.
4. **Web Platform Integration (`platform/`):** `scripts/skills_hub.py export-platform` packages `registry.json`, `agents.json`, `IDENTITY_LOCK.json`, and `profile-data/*.json` into `platform/src/data/ecosystem.generated.json` for interactive exploration.

---

## 2. Repository-Authored Flagship Skills (`ai-skills/library/`)

| Skill ID | Domain | Focus |
| :--- | :--- | :--- |
| `salman-sql-server-tuning` | Database & SQL | Execution plans, sargable T-SQL, covering indexes, POS-to-ERP reconciliation |
| `salman-erp-architecture` | ERP & Backend | Multi-company tenant isolation, ordered migrations, EF Core + Dapper |
| `multi-agent-orchestrator` | Docs & Orchestration | Senior AI delegation, free-model routing, collision avoidance, independent audit |
| `cinematic-web-ui` | UI/UX & Motion | Three.js WebGL spatial canvas, Lenis smooth scroll, GSAP, reduced motion |
| `linkedin-identity-governance` | Security & Governance | SHA-256 portrait Identity Lock, authorized LinkedIn truth, PII redaction |
| `skill-security-auditor` | Security & Governance | Frontmatter checks, duplicate rejection, pricing integrity, supply-chain scan |
| `profile-ci-automation` | DevOps & Automation | Atomic README/SVG generation, rollback protection, GitHub Pages deploys |
| `powerbi-dax-modeling` | BI & Analytics | Star schema SQL views, explicit DAX measures, query folding, ledger parity |

---

## 3. CLI Usage & Verification Workflow

```powershell
# Validate schemas, SHA-256 Identity Lock, dependencies, pricing tiers, and static security rules
python scripts/skills_hub.py validate

# Inspect local ~/.agents/skills and .opencode/skills vs. registry.json
python scripts/skills_hub.py discover

# Synchronize repo-authored skills into .opencode/skills/
python scripts/skills_hub.py sync-agents

# Generate web platform JSON bundle and copy verified portrait/certificate/project assets
python scripts/skills_hub.py export-platform

# Execute automated hub + identity tests
python -m unittest tests/test_skills_hub.py -v
```
