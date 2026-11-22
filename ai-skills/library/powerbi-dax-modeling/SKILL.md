---
name: powerbi-dax-modeling
description: "Design star-schema Power BI semantic models, deterministic DAX measures, SQL Server DirectQuery/Import views, and executive retail/ERP KPI dashboards."
license: MIT
compatibility: "opencode, antigravity, claude-code, codex, copilot, agent-skills"
metadata:
  version: "1.0.0"
  domain: "BI & Analytics"
  pricing_tier: "free-open-source"
  owner: "Salman Rahman (tsalmanrahman)"
  source: "repo-authored"
  verified: "2026-11-22"
---

# Power BI Star Schema & DAX Engineering

## Core Standards
1. **Star Schema First:** Model SQL Server ERP/POS reporting datasets into conformed dimension tables (`DimDate`, `DimOutlet`, `DimProduct`, `DimCustomer`) and atomic fact tables (`FactSales`, `FactInventoryMovement`) via indexed SQL views.
2. **Explicit DAX Measures:** Avoid implicit column aggregations and bidirectional many-to-many filters by default. Write explicit `DIVIDE()`, `CALCULATE()`, and time-intelligence measures (`SAMEPERIODLASTYEAR`, `DATESYTD`).
3. **Query Folding & Refresh Hygiene:** Push filtering, joins, and projections down to Microsoft SQL Server views so Power Query maintains full query folding.
4. **Reconciliation Parity:** Cross-check Power BI KPI totals against source T-SQL ledger queries before publishing executive reports.
