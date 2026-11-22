---
name: salman-sql-server-tuning
description: "Diagnose and tune Microsoft SQL Server T-SQL queries, execution plans, indexes, stored procedures, and POS-to-ERP reconciliation workloads safely."
license: MIT
compatibility: "opencode, antigravity, claude-code, codex, copilot, agent-skills"
metadata:
  version: "1.0.0"
  domain: "Database & SQL"
  pricing_tier: "free-open-source"
  owner: "Salman Rahman (tsalmanrahman)"
  source: "repo-authored"
  verified: "2026-11-22"
---

# Salman SQL Server & T-SQL Tuning Protocol

## Purpose
Standardizes how AI agents and database engineers diagnose slow T-SQL workloads, refactor non-sargable queries, design covering indexes, and verify POS-to-ERP data reconciliation in Microsoft SQL Server without introducing lock contention or regressions.

## Workflow
1. **Capture Baseline Evidence:** Record `SET STATISTICS IO, TIME ON` and inspect the actual execution plan XML before proposing edits. Never fabricate runtime percentages.
2. **Identify Root Bottlenecks:** Check for key lookups, implicit conversions, scalar UDFs in `WHERE`/`SELECT`, non-sargable predicates (`YEAR(col)`, leading wildcards), and missing composite index keys (`equality -> inequality -> INCLUDE`).
3. **Parameter Sniffing & Plan Stability:** Evaluate `OPTION (RECOMPILE)` vs. local variable decoupling or Query Store plan forcing only after measuring parameter sensitivity.
4. **POS-to-ERP Reconciliation Audits:** Run set-based `EXCEPT`, `HASHBYTES`, or keyed `LEFT JOIN` reconciliation checks across staging POS tables and general ledger / inventory postings inside `READ COMMITTED SNAPSHOT` or explicit read-only transactions.
5. **Safe Rollout:** Script idempotent `CREATE INDEX ... WITH (ONLINE = ON)` checks (edition-gated), keep rollback DDL ready, and verify row-count parity post-change.
