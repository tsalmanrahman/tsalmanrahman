# AGENTS.md — Shared Multi-Agent Operating Contract

This repository (`tsalmanrahman/tsalmanrahman`) unifies Salman Rahman's **data-driven GitHub Profile Ecosystem**, **Centralized AI Skills Hub (`ai-skills/`)**, and **Interactive Web Platform (`platform/`)**.

All AI coding agents (`Antigravity`, `OpenCode CLI`, `Ollama`, `GitHub Copilot`, and compatible `.agents/skills` runtimes) must follow these rules when reading or modifying this repository:

---

## 1. Identity Lock (Non-Negotiable)
- **Primary Portrait:** `assets/identity/original/salman-rahman-original.jpg` (web copy: `assets/identity/web/salman-rahman-portrait.jpg`).
- **Verification Manifest:** `assets/identity/IDENTITY_LOCK.json` (SHA-256 verified by `scripts/skills_hub.py validate`).
- **Strictly Prohibited:** Generating synthetic portraits, swapping faces, changing facial structure/age/appearance, or replacing the locked portrait with AI-generated imagery.
- **Permitted:** Lossless framing, CSS halo borders, aspect-ratio responsive presentation, and resolution-preserving website optimization.

---

## 2. LinkedIn Source of Truth & Privacy Hygiene
- **Primary Data Directory:** `profile-data/*.json` (including `verification_status.json`).
- **Truthfulness Rule:** Never invent employment history, dates, degrees, GPAs, certifications, or unverified metrics (`"zero-latency"`, `"zero downtime"`, `"100% accuracy"`). Mark unconfirmed fields explicitly in `profile-data/verification_status.json`.
- **Privacy Rule:** Never commit physical street addresses, personal phone numbers, birthdates, private LinkedIn exports, API keys, or access tokens.
- **Backward Compatibility:** Do not break `scripts/validate_data.py`, `scripts/generate_readme.py`, or `tests/test_profile_system.py`. Keep `profile-data/skills.json` free of percentage metrics and keep `contact.portfolio` valid (empty `""` or live `https://`).

---

## 3. Centralized AI Skills Hub
- **Catalog:** `ai-skills/registry.json` (pricing tiers strictly classified: `free-open-source`, `free-tier-limited`, `freemium`, `paid`).
- **Agent Roster:** `ai-skills/agents.json`.
- **Repo-Authored Skills:** `ai-skills/library/<skill-id>/SKILL.md`, synchronized to `.opencode/skills/<skill-id>/SKILL.md` via `scripts/skills_hub.py sync-agents`.
- **Validation Gate:** Run `scripts/skills_hub.py validate` before accepting or merging any skill change.

---

## 4. Multi-Agent Coordination Rules
- Avoid concurrent edits to the same file across different agents.
- Prefer free local/cloud OpenCode models (`opencode/deepseek-v4.1-flash-free`, `opencode/big-pickle`, `ollama/qwen2.5-coder:3b`) for bounded implementation tasks.
- Always independently audit, compile, and test deliverables produced by delegated agents before committing.
