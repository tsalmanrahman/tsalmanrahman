# GitHub Profile Ecosystem — Architecture & Maintenance Guide

This repository (`tsalmanrahman/tsalmanrahman`) operates as a **data-driven GitHub Profile & Portfolio Headquarters**. Rather than manually editing `README.md` or hardcoded SVGs, all professional identity, skills, projects, certifications, education, achievements, and career status are maintained in structured JSON files under `profile-data/` and rendered automatically via pure-Python scripts and GitHub Actions.

---

## 1. System Architecture & Data Flow

```text
profile-data/*.json  (Single Source of Truth)
        │
        ├──▶ scripts/sync_profile.py      (GitHub REST API telemetry + approval-gated LinkedIn sync)
        │
        ├──▶ scripts/validate_data.py     (Schema rules, no fake percentages, asset XML & URL checks)
        │
        └──▶ scripts/generate_readme.py   (Atomic generation with rollback on failure)
                    │
                    ├──▶ assets/banner/hero-banner.svg  (+ banner.svg)
                    ├──▶ assets/profile/skills-matrix.svg (+ tech-matrix.svg)
                    ├──▶ assets/profile/github-telemetry.svg (+ telemetry.svg)
                    ├──▶ assets/projects/*-preview.svg
                    ├──▶ assets/certificates/google-it-support-badge.png
                    └──▶ README.md
```

---

## 2. Repository Structure

```text
tsalmanrahman/
├── README.md                                  # Auto-generated GitHub profile README
├── ARCHITECTURE.md                            # This maintenance & automation guide
├── banner.svg / tech-matrix.svg / telemetry.svg # Root SVG copies synchronized by generator
├── profile-data/
│   ├── profile.json                           # Identity, headline, summary, contact links, banner copy
│   ├── career.json                            # Availability status, target roles, focus & recent updates
│   ├── experience.json                        # Verified practical experience areas & tools
│   ├── skills.json                            # Categorized skills (Database, Programming, Reporting, IT Support, Other)
│   ├── projects.json                          # Repository portfolio items (only featured+verified render)
│   ├── certifications.json                    # Google IT Support Certificate & verified courses
│   ├── education.json                         # Academic qualifications
│   ├── achievements.json                      # Factual, verified engineering & credential milestones
│   ├── github_metrics.json                    # Cached/synced GitHub API profile & codebase language bytes
│   └── linkedin_sync.json                     # LinkedIn sync configuration & approval-gated staging queue
├── assets/
│   ├── banner/hero-banner.svg
│   ├── certificates/google-it-support-badge.png
│   ├── icons/*.svg                            # Vector icons (SQL Server, Python, C#, Crystal Reports, Contact/Nav)
│   ├── profile/
│   │   ├── skills-matrix.svg
│   │   └── github-telemetry.svg
│   └── projects/*-preview.svg
├── scripts/
│   ├── validate_data.py                       # Pure-stdlib validator (--check-assets, --check-links)
│   ├── sync_profile.py                        # GitHub API sync + authorized LinkedIn OAuth / CSV staging
│   ├── generate_readme.py                     # Deterministic SVG & README generator (--check)
│   └── Update-Profile.ps1                     # Local Windows PowerShell runner
├── tests/
│   └── test_profile_system.py                 # Automated unit & rollback tests
└── .github/workflows/
    ├── validate-profile.yml                   # PR/push CI validation, unit tests, drift & link checks
    ├── update-profile.yml                     # Daily scheduled sync & atomic auto-commit workflow
    └── snake.yml                              # Contribution snake SVG generation to `output` branch
```

---

## 3. How to Update Every Section

Edit the appropriate JSON file under `profile-data/`. When pushed to `main` (or when running locally), `generate_readme.py` updates both `README.md` and the corresponding SVG assets.

### A. Updating Personal Introduction & Contact Info (`profile-data/profile.json`)
- Update `headline`, `short_bio`, `location`, `organization`, or `summary` paragraphs.
- Control email visibility via `"show_email": true | false`.
- Add a portfolio website to `"portfolio"` only once a live `https://` URL exists; leaving it `""` omits the badge cleanly without creating broken `#` links.

### B. Updating Career Status (`profile-data/career.json`)
- Change `"status"` (e.g., `"Open to Opportunities"` or `"Focused on Current Role"`) and `"available_for_hire"` (`true` / `false`).
- Update `"current_focus"`, `"career_interests"`, or append entries to `"recent_updates"`.

### C. Updating Technical Skills (`profile-data/skills.json`)
- Add objects under `Database`, `Programming`, `Reporting`, `IT Support`, or `Other` with `name`, `role`, `focus`, `color`, `short_code`, and `badge_url`.
- **Policy:** Never add numeric proficiency percentages (`percentage`, `score`, etc.); `validate_data.py` explicitly rejects them.

### D. Adding a Featured Project (`profile-data/projects.json`)
Append a new JSON object to `profile-data/projects.json`:
```json
{
  "id": "my-sql-project",
  "name": "Project Display Name",
  "tagline": "One-line architectural summary",
  "description": "Concise explanation of the system and purpose.",
  "category": "Database & Backend Engineering",
  "tech_stack": ["Microsoft SQL Server", "C#", "Python"],
  "repo_url": "https://github.com/tsalmanrahman/repo-name",
  "live_url": "",
  "image_path": "assets/projects/my-sql-project-preview.svg",
  "key_features": [
    "Feature one.",
    "Feature two."
  ],
  "my_contribution": "Specific components and queries you authored.",
  "featured": true,
  "verified": true
}
```
- Setting `"image_path": "assets/projects/<slug>-preview.svg"` causes `generate_readme.py` to generate a matching architectural SVG card automatically.
- Projects are published only when **both** `"featured": true` and `"verified": true`.

### E. Adding a Certification or Course (`profile-data/certifications.json`)
Append an entry with `"category": "certification"` (or `"course"`). Leave `"verified": false` while studying or awaiting credential verification; flip to `"verified": true` only after earning the credential.

---

## 4. LinkedIn Integration, Limitations & Approval Workflow

### Technical & Legal Constraints
- LinkedIn's standard Consumer / OpenID Connect API (`GET https://api.linkedin.com/v2/userinfo`) only exposes basic identity fields (`name`, `email`, `picture`) with an OAuth 2.0 `LINKEDIN_ACCESS_TOKEN`.
- Full LinkedIn profile fields (headlines, work history, certifications, skills) require LinkedIn Partner Program approval and are **not** available via standard unprivileged REST APIs.
- HTML scraping, browser automation against authenticated LinkedIn sessions, and storing LinkedIn passwords/cookies are **strictly excluded**.

### Supported Authorized Synchronization Paths
1. **Official LinkedIn OAuth 2.0 (`LINKEDIN_ACCESS_TOKEN` GitHub Secret)**:
   - When configured as a repository secret, `.github/workflows/update-profile.yml` passes `LINKEDIN_ACCESS_TOKEN` to `scripts/sync_profile.py` (never logged).
2. **Official LinkedIn Data Archive Import (Recommended for Headline & Certifications)**:
   - Request your official archive from LinkedIn (`Settings & Privacy -> Data Privacy -> Get a copy of your data`).
   - Extract it locally and run:
     ```bash
     python scripts/sync_profile.py --linkedin-export-dir /path/to/linkedin-export
     ```
3. **Mandatory Approval Gate (`profile-data/linkedin_sync.json`)**:
   - Detected differences are staged into `profile-data/linkedin_sync.json -> pending_changes` with `"approved": false`.
   - Review the staged change, set `"approved": true`, and apply it explicitly:
     ```bash
     python scripts/sync_profile.py --apply-approved
     python scripts/generate_readme.py
     ```

---

## 5. GitHub Actions Workflows, Permissions & Secrets

| Workflow | Trigger | Permissions | Purpose |
| :--- | :--- | :--- | :--- |
| `.github/workflows/validate-profile.yml` | `push`, `pull_request`, `workflow_dispatch` | `contents: read` | Runs schema checks, unit tests (`tests/`), SVG checks, `--check` drift verification, and external link verification. |
| `.github/workflows/update-profile.yml` | Daily cron (`06:00 UTC`), `push` to `profile-data/**` or `scripts/**`, `workflow_dispatch` | `contents: write` | Syncs GitHub metrics (with offline fallback), validates schemas, regenerates `README.md` + SVGs, restores backup on failure, and commits only if diff is non-empty. |
| `.github/workflows/snake.yml` | Daily cron (`00:00 UTC`), `push` to `main`, `workflow_dispatch` | `contents: write` | Renders dark/light contribution snake SVGs to the `output` branch. |

### Secrets & Environment Variables
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions; requires no manual creation. Used to authenticate GitHub REST API requests with higher rate limits and commit generated updates.
- `LINKEDIN_ACCESS_TOKEN` *(Optional)*: Repository secret (`Settings -> Secrets and variables -> Actions`) holding an authorized LinkedIn OAuth 2.0 bearer token (`openid profile` scope). Never stored in git.

---

## 6. Running Locally

### Linux / macOS / CI
```bash
python3 scripts/sync_profile.py
python3 scripts/generate_readme.py
python3 scripts/validate_data.py --check-assets --check-links
python3 -m unittest discover -s tests -p "test_*.py" -v
```

### Windows (PowerShell)
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Update-Profile.ps1
```
