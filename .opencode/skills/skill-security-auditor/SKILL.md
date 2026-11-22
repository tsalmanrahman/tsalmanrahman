---
name: skill-security-auditor
description: "Validate AI skill frontmatter, detect duplicate skill IDs, enforce honest pricing-tier classification, and scan skill manifests/scripts for supply-chain hazards or leaked secrets."
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

# AI Skill Security & Pricing Integrity Auditor

## Audit Checklist Before Adopting Any Skill
1. **Frontmatter Contract:** Verify YAML frontmatter defines non-empty `name`, `description`, `license`, and `metadata.version` / `metadata.pricing_tier`.
2. **Pricing Transparency:** Classify every skill and tool strictly into one of four tiers: `free-open-source`, `free-tier-limited`, `freemium`, or `paid`. Never label a paid or quota-capped external API as `free-open-source`.
3. **Static Supply-Chain Scan:** Reject uninspected skills or scripts containing remote shell download-and-execute pipes, obfuscated PowerShell dynamic evaluation, destructive root filesystem deletions, or unredacted API tokens.
4. **Deduplication & Compatibility:** Verify `id` uniqueness in `ai-skills/registry.json` and check that `compatible_agents` accurately matches verified local runtimes.
5. **Deterministic Verification:** Run `python scripts/skills_hub.py validate` and confirm unit tests pass after any registry change.
