---
name: linkedin-identity-governance
description: "Enforce Identity Lock (SHA-256 verified portrait immutability), authorized-only LinkedIn truth sourcing, privacy redaction, and approval-gated sync."
license: MIT
compatibility: "opencode, antigravity, claude-code, codex, copilot, agent-skills"
metadata:
  version: "1.0.0"
  domain: "Security & Governance"
  pricing_tier: "free-open-source"
  owner: "Salman Rahman (tsalmanrahman)"
  source: "repo-authored"
  verified: "2026-11-22"
---

# LinkedIn Identity Lock & Data Governance

## Non-Negotiable Rules
1. **Portrait Identity Lock:** Preserve `assets/identity/original/salman-rahman-original.jpg` bit-for-bit and verify its SHA-256 hash against `assets/identity/IDENTITY_LOCK.json`. Never generate synthetic faces, swap faces, or alter facial structure/age.
2. **Authorized Sources Only:** Consume profile facts exclusively from official LinkedIn OAuth (`/v2/userinfo`), user-exported LinkedIn Data Archive CSVs, or verified human-reviewed audit notes (`profile-data/verification_status.json`). Scraping or cookie extraction is prohibited.
3. **Zero Fabrication:** Never invent job titles, dates, GPA, certifications, or unverified absolute metrics (`"zero-latency"`, `"zero downtime"`, `"100% accuracy"`). Mark unconfirmed items explicitly as `unavailable` or `pending_confirmation`.
4. **PII Privacy Redaction:** Exclude street addresses, private phone numbers, and birthdates from public JSON files, generated SVGs, and web bundles.
5. **Approval Gate:** Stage automated profile updates in `profile-data/linkedin_sync.json -> pending_changes` with `"approved": false` until explicitly reviewed.
