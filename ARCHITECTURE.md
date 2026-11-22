# Unified Personal Branding Platform & AI Skills Hub — Architecture Guide

This repository (`tsalmanrahman/tsalmanrahman`) unifies Salman Rahman's **data-driven GitHub Profile Ecosystem**, **SHA-256 Identity Lock**, **Centralized AI Skills Hub (`ai-skills/`)**, and **Interactive Web Platform (`platform/`)** around one verified source of truth.

---

## 1. Unified System Architecture & Data Flow

```text
profile-data/*.json + assets/identity/IDENTITY_LOCK.json + ai-skills/*.json
        │
        ├──▶ scripts/sync_profile.py      (GitHub REST API telemetry + approval-gated LinkedIn sync)
        │
        ├──▶ scripts/validate_data.py     (Profile schema rules, no fake %, SVG & external URL checks)
        │
        ├──▶ scripts/generate_readme.py   (Atomic README.md + 21 SVG generation with rollback)
        │
        └──▶ scripts/skills_hub.py        (Hub validator, security scanner, agent sync, platform export)
                    │
                    ├──▶ .opencode/skills/*/SKILL.md           (Synced skills for OpenCode & compatible agents)
                    ├──▶ platform/src/data/ecosystem.generated.json
                    ├──▶ platform/public/assets/{identity,certificates,projects}/
                    └──▶ platform/dist/                        (Vite + React + Three.js + GSAP + Lenis)
```

---

## 2. Repository Structure

```text
tsalmanrahman/
├── AGENTS.md                                  # Multi-agent operating contract & Identity Lock rules
├── ARCHITECTURE.md                            # This unified architecture & maintenance guide
├── README.md                                  # Auto-generated GitHub profile README
├── banner.svg / tech-matrix.svg / telemetry.svg # Root SVG copies synchronized by generator
├── ai-skills/
│   ├── README.md                              # Skills Hub governance, pricing tiers & CLI guide
│   ├── agents.json                            # Verified workstation AI agents roster
│   ├── registry.json                          # 32 free & open-source audited skills catalog
│   └── library/<skill-id>/SKILL.md            # 8 repo-authored flagship Agent Skills
├── .opencode/skills/<skill-id>/SKILL.md       # Synced OpenCode runtime copies (via sync-agents)
├── assets/
│   ├── identity/
│   │   ├── IDENTITY_LOCK.json                 # Immutable SHA-256 portrait manifest
│   │   ├── original/salman-rahman-original.jpg
│   │   └── web/salman-rahman-portrait.jpg
│   ├── banner/hero-banner.svg
│   ├── certificates/                          # Credly PNGs & Microsoft C# SVG badge
│   ├── icons/*.svg
│   ├── profile/{about-terminal,skills-matrix,github-telemetry}.svg
│   └── projects/*-preview.svg
├── docs/
│   ├── AI_SKILLS_HUB.md                       # Hub architecture & pricing transparency guide
│   └── AGENT_ORCHESTRATION_LOG.md             # Multi-agent delegation, audit & correction log
├── platform/                                  # Unified Vite + React + TS + Tailwind + Three.js web app
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── types/ecosystem.ts
│       ├── data/ecosystem.generated.json      # Exported bundle (never edit manually)
│       └── components/                        # Preloader, WebGL canvas, Showcase, Telemetry, Timeline, Skills Hub
├── profile-data/                              # Single source of truth JSON files + verification_status.json
├── scripts/
│   ├── validate_data.py
│   ├── sync_profile.py
│   ├── generate_readme.py
│   ├── skills_hub.py                          # AI Skills Hub CLI (validate, discover, sync-agents, export-platform)
│   └── Update-Profile.ps1
├── tests/
│   ├── test_profile_system.py                 # Profile schema, SVG, rollback & sync tests
│   └── test_skills_hub.py                     # Registry, pricing, security scan, Identity Lock & export tests
└── .github/workflows/
    ├── validate-profile.yml                   # CI validation across profile-data, skills hub & unit tests
    ├── update-profile.yml                     # Daily GitHub metrics sync & atomic README update
    ├── deploy-platform.yml                    # Exports bundle, builds platform/ & deploys GitHub Pages
    └── snake.yml                              # Contribution snake SVG generation to `output` branch
```

---

## 3. Identity Lock & LinkedIn Truthfulness Rules

1. **Identity Lock (`assets/identity/IDENTITY_LOCK.json`):** `salman-rahman-original.jpg` is preserved bit-for-bit (`SHA-256` verified by `scripts/skills_hub.py validate`). Generating synthetic portraits, swapping faces, or altering facial structure/age is prohibited.
2. **Verified LinkedIn Sourcing (`profile-data/verification_status.json`):** Only verified LinkedIn audit facts, Credly/freeCodeCamp credentials, and live GitHub REST API telemetry are published as verified. Unconfirmed scale/benchmark details are explicitly documented as `unavailable` or `pending_confirmation`.
3. **Privacy Hygiene:** Physical street addresses, private phone numbers, birthdates, and API tokens are strictly excluded from git.
4. **Authorized Sync Only:** LinkedIn's standard Consumer API (`/v2/userinfo`) exposes basic identity only; full career updates are imported only via authorized OAuth or official LinkedIn Data Export CSVs through `profile-data/linkedin_sync.json` (`approved: true` gate).

---

## 4. Running Locally

### Profile, Skills Hub & Tests (Python 3.12+)
```powershell
python scripts/sync_profile.py
python scripts/generate_readme.py
python scripts/validate_data.py --check-assets
python scripts/skills_hub.py validate
python scripts/skills_hub.py sync-agents
python scripts/skills_hub.py export-platform
python -m unittest discover -s tests -p "test_*.py" -v
```

### Unified Web Platform (`platform/`, Node.js 22+)
```powershell
cd platform
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
npm.cmd run preview -- --port 4173 --host 127.0.0.1
```

### Windows PowerShell Profile Sync Shortcut
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Update-Profile.ps1
```
