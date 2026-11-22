---
name: multi-agent-orchestrator
description: "Coordinate Senior AI Lead planning, OpenCode CLI free-model task delegation, local model fallback, independent code auditing, and conflict-free git integration."
license: MIT
compatibility: "opencode, antigravity, claude-code, codex, copilot, agent-skills"
metadata:
  version: "1.0.0"
  domain: "Docs & Orchestration"
  pricing_tier: "free-open-source"
  owner: "Salman Rahman (tsalmanrahman)"
  source: "repo-authored"
  verified: "2026-11-22"
---

# Multi-Agent Orchestration & Quality Audit Protocol

## Purpose
Enables a Senior AI Lead (Antigravity) to distribute well-scoped coding tasks to local CLI agents (OpenCode CLI, Ollama) while enforcing zero simultaneous file conflicts and independent post-delivery auditing.

## Operating Loop
1. **Discover Real Capabilities:** Verify installed CLIs (`opencode-cli.exe`, `ollama`), running services, and active free models before delegating. Never assume availability.
2. **Scoped Task Contracts:** Give each worker an explicit target file path, interface contract, prohibited patterns (no secrets, no fabricated data), and verification criteria.
3. **Prefer Free-Tier & Local Models:** Route mechanical or well-bounded module drafting to `opencode/deepseek-v4.1-flash-free`, `opencode/big-pickle`, or local `ollama/qwen2.5-coder:3b` to conserve premium limits.
4. **Prevent File Collisions:** Never assign two agents to edit the same file concurrently.
5. **Independent Audit Gate:** Read every generated line, compile/lint (`tsc --noEmit`, `unittest`, security scanner), reject incomplete stubs, fix or re-delegate defects, and document the audit trail in `docs/AGENT_ORCHESTRATION_LOG.md`.
