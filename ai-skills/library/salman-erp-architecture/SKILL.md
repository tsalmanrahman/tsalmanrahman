---
name: salman-erp-architecture
description: "Architect multi-company ERP modules with tenant isolation middleware, ordered SQL Server migrations, EF Core + Dapper hybrid queries, and dual-layer audit governance."
license: MIT
compatibility: "opencode, antigravity, claude-code, codex, copilot, agent-skills"
metadata:
  version: "1.0.0"
  domain: "ERP & Backend"
  pricing_tier: "free-open-source"
  owner: "Salman Rahman (tsalmanrahman)"
  source: "repo-authored"
  verified: "2026-11-22"
---

# Salman Multi-Company ERP Architecture

## Purpose
Captures production patterns established across `.NET / ASP.NET Core`, `Python / FastAPI`, and `Microsoft SQL Server` multi-company ERP systems (`ERP` and `Pyrix`).

## Architectural Pillars
1. **Strict Tenant Scoping:** Enforce `CompanyId` isolation via request middleware, scoped tenant context providers, and mandatory global query filters or parameterized `WHERE CompanyId = @CompanyId` guards across every table and view.
2. **Ordered Migration Governance:** Maintain deterministic numbered SQL migration scripts with explicit foreign-key dependency order, check constraints, and audit columns (`CreatedBy`, `CreatedAtUtc`, `ModifiedBy`, `ModifiedAtUtc`, `IsDeleted`).
3. **Dual-Layer Write/Read Separation:** Use EF Core or transactional unit-of-work services for domain commands and invariant validation; use Dapper or `pyodbc` parameterized queries with TTL-bounded read caching for heavy operational grids and schema inspection.
4. **Dual-Layer Deletion Policy:** Enforce soft-delete flags on business entities combined with FK restrict/cascade checks so financial ledgers and historical invoices remain auditable.
5. **Verification:** Pair every domain workflow with deterministic xUnit / pytest integration checks and API schema checks.
