<!-- AUTO-GENERATED FILE: DO NOT EDIT MANUALLY.
     Source of truth: profile-data/*.json
     Generator: python scripts/generate_readme.py -->

<div align="center">
  <img src="assets/banner/hero-banner.svg?v=aa727902" alt="Salman Rahman - SQL Server & Database Engineer | T-SQL, Query Optimization & ERP Data Systems | C# (.NET) · Power BI · Python" width="100%" />
</div>

<br/>

<div align="center">

<p>
  <a href="https://www.linkedin.com/in/t-salmanrahman"><img src="assets/icons/contact-linkedin.svg?v=d849a91a" alt="LinkedIn" /></a>
  &nbsp;
  <a href="https://www.credly.com/users/salman_rahman"><img src="assets/icons/contact-credly.svg?v=3377c308" alt="Credly" /></a>
  &nbsp;
  <a href="mailto:t.salmanrahman@gmail.com"><img src="assets/icons/contact-email.svg?v=9bc3d706" alt="Email" /></a>
  &nbsp;
  <a href="https://github.com/tsalmanrahman"><img src="assets/icons/contact-github.svg?v=5901df56" alt="GitHub" /></a>
</p>

<p>
  <a href="#about-me"><img src="assets/icons/nav-about.svg?v=15ec1224" alt="About" /></a>
  &nbsp;
  <a href="#technical-skills"><img src="assets/icons/nav-skills.svg?v=0121030a" alt="Skills" /></a>
  &nbsp;
  <a href="#featured-projects"><img src="assets/icons/nav-projects.svg?v=19edd1a1" alt="Projects" /></a>
  &nbsp;
  <a href="#certifications--education"><img src="assets/icons/nav-credentials.svg?v=706eba40" alt="Credentials" /></a>
  &nbsp;
  <a href="#github-activity"><img src="assets/icons/nav-activity.svg?v=39b5deea" alt="Activity" /></a>
  &nbsp;
  <a href="#career-status"><img src="assets/icons/nav-career.svg?v=f3db6e30" alt="Career" /></a>
</p>

</div>

---

## About Me

Database and Enterprise Systems professional with a B.Sc. in Computer Science & Engineering (Varendra University) and a Post Graduate Diploma in Data Science (UIU, CGPA 3.56), specializing in Microsoft SQL Server engineering, T-SQL development, and operational reporting.

At HATIM GROUP (Executive, IT & MIS), manages and optimizes Microsoft SQL Server databases supporting the central InteAcc ERP and retail Web POS network—writing and tuning T-SQL queries, stored procedures, and indexing strategies while maintaining backups, integrity checks, and transaction reconciliation.

Previously served as Junior Software Engineer at Logic InfoTech Ltd building enterprise application modules in C# (.NET Framework) with SQL Server and MySQL backends alongside Crystal Reports, complemented by Power BI (DAX) and Python data workflows.

<br/>

<div align="center">
  <img src="assets/profile/about-terminal.svg?v=1e08da75" alt="Engineering Pillars and Experience Terminal (4+ Years (Self-Driven & Enterprise Operations))" width="100%" />
</div>

---

## Technical Skills

<div align="center">
  <img src="assets/profile/skills-matrix.svg?v=75388203" alt="Technical Skills Matrix" width="100%" />
</div>

<details>
<summary><code>$ cat skills_index.md</code> — Structured Skill Reference</summary>

| Category | Technologies | Core Focus |
| :--- | :--- | :--- |
| **Database** | `Microsoft SQL Server` · `Transact-SQL (T-SQL)` · `Query Optimization` · `SQL` · `PL/SQL` | **Microsoft SQL Server** (Schema Design, T-SQL, Migrations, Indexing) · **Transact-SQL (T-SQL)** (Stored Procedures, Execution Plans, Reconciliation) · **Query Optimization** (Execution Plan Analysis, Index Refactoring, Diagnostics) · **SQL** (CTEs, Window Functions, Joins, Optimization) · **PL/SQL** (Stored Procedures, Triggers, Transactions) |
| **Programming** | `Python` · `C#` | **Python** (FastAPI, Automation, Data Analysis, ODBC) · **C#** (.NET, ASP.NET Core, EF Core, Dapper) |
| **Reporting** | `Crystal Reports` · `Microsoft Power BI` | **Crystal Reports** (Operational Reports, Financial Layouts, Subreports) · **Microsoft Power BI** (KPI Data Modeling, DAX Measures, Executive Dashboards) |
| **IT Support** | `Hardware & Systems` · `Troubleshooting` · `Technical Support` | **Hardware & Systems** (Workstation Diagnostics, Peripherals, Setup) · **Troubleshooting** (OS, Network, ODBC & Environment Recovery) · **Technical Support** (Incident Resolution, User Assistance, Maintenance) |
| **Other** | `Data Analysis` · `ERP Systems` · `Backend Development` · `Database Design` | **Data Analysis** (Data Auditing, Cleaning, Business Metrics) · **ERP Systems** (GL, Inventory, AP/AR, HR & Payroll, Manufacturing) · **Backend Development** (REST APIs, Multi-Tenancy, Auth, Caching) · **Database Design** (Normalization, FK Governance, Audit & Soft-Delete) |

</details>

---

## Featured Projects

#### [Enterprise Multi-Company ERP](https://github.com/tsalmanrahman/ERP)
*ERP / Backend & Database Architecture* — [GitHub Repository](https://github.com/tsalmanrahman/ERP)

<div align="center">
  <a href="https://github.com/tsalmanrahman/ERP">
    <img src="assets/projects/erp-preview.svg?v=a7237e81" alt="Enterprise Multi-Company ERP Preview" width="100%" />
  </a>
</div>

> Full-featured multi-company ERP built on .NET 10 / ASP.NET Core, Entity Framework Core + Dapper, and Microsoft SQL Server with a unified static web portal and ordered SQL migration pipelines.

**Technology Stack:** `C#` · `.NET 10 / ASP.NET Core` · `Microsoft SQL Server (T-SQL)` · `EF Core + Dapper` · `QuestPDF` · `Docker`

**Key Features:**
- Covers General Ledger & Banking, Inventory, Procure-to-Pay (AP), Order-to-Cash (AR), HR & Payroll, Fixed Assets, Real Estate, Manufacturing, and Data Migration/Cutover.
- Multi-company data isolation enforced via company context middleware and global tenant query filters across domain services.
- Ordered SQL Server schema migrations (80 tables), audit columns, and dual-layer soft-delete/cascade governance.
- Clean layered architecture (Domain -> Application -> Infrastructure -> Web.Api) with xUnit tests and PowerShell E2E checks.

**My Contribution:** Architected multi-company tenant scoping, SQL Server schema standardization, dual-layer deletion governance, facility/inventory modules, and API service implementations.

---

#### [Pyrix — Multi-Company Operations & Settings Suite](https://github.com/tsalmanrahman/pyrix)
*Python Backend & SQL Operations* — [GitHub Repository](https://github.com/tsalmanrahman/pyrix)

<div align="center">
  <a href="https://github.com/tsalmanrahman/pyrix">
    <img src="assets/projects/pyrix-preview.svg?v=c01a5726" alt="Pyrix — Multi-Company Operations & Settings Suite Preview" width="100%" />
  </a>
</div>

> Enterprise operations and settings web application engineered with Python (FastAPI), Jinja2 templates, and Microsoft SQL Server via ODBC Driver 18 for multi-company administration and SQL inspection.

**Technology Stack:** `Python` · `FastAPI` · `Jinja2` · `Microsoft SQL Server` · `ODBC Driver 18` · `HTML / CSS / JS`

**Key Features:**
- Multi-Company Operations & Switcher for dynamically managing multiple companies and organizations.
- SQL Inspector & Schema Management, Dynamic Form & Table Builder, and System Diagnostics.
- Manufacturing Operations & Workflow Engine paired with Audit Logging and Session Inactivity Guard.
- Thread-safe TTL in-memory query caching and cross-platform ODBC driver detection for resilient SQL Server connectivity.

**My Contribution:** Built backend FastAPI routes, SQL Server query deduplication and TTL caching, cross-platform ODBC driver detection, and operational UI workflows.

---

## Certifications & Education

### Verified Certifications

<p>
  <a href="https://www.credly.com/badges/d145c575-283d-482e-920f-8038d431ba43"><img src="assets/certificates/ibm-databases-sql-badge.png?v=23b9e34d" alt="Databases and SQL for Data Science" height="112" /></a>
  &nbsp;&nbsp;
  <a href="https://www.credly.com/badges/0e52798c-e483-499b-ad1c-723ebf802f42"><img src="assets/certificates/google-it-support-badge.png?v=7b904d28" alt="Google IT Support Certificate" height="112" /></a>
  &nbsp;&nbsp;
  <a href="https://www.freecodecamp.org/certification/salman_rahman/foundational-c-sharp-with-microsoft"><img src="assets/certificates/microsoft-csharp-badge.svg?v=ea9c0f15" alt="Foundational C# with Microsoft" /></a>
</p>

- **Databases and SQL for Data Science** — *IBM / Coursera* (Certified · Nov 2023)  
  *Skills Covered:* SQL Queries, Relational Databases, IBM Db2, Python & Jupyter Notebooks  
  [View Credential](https://www.credly.com/badges/d145c575-283d-482e-920f-8038d431ba43)
- **Google IT Support Certificate** — *Google / Coursera* (Certified · Aug 2021)  
  *Skills Covered:* Troubleshooting & Customer Service, Computer Networking, Operating Systems & System Administration, IT Security & Hardware Fundamentals  
  [View Credential](https://www.credly.com/badges/0e52798c-e483-499b-ad1c-723ebf802f42)
- **Foundational C# with Microsoft** — *Microsoft & freeCodeCamp* (Certified · Feb 2025)  
  *Skills Covered:* C# Programming, .NET Fundamentals, Object-Oriented Logic, Debugging & Console Applications  
  [View Credential](https://www.freecodecamp.org/certification/salman_rahman/foundational-c-sharp-with-microsoft)

### Academic Qualifications

| Qualification | Institution | Year / Status | Core Focus |
| :--- | :--- | :--- | :--- |
| **Post Graduate Diploma in Data Science (PGDDS)** | United International University (UIU) & BITM | May 2023 – Jan 2024 | Data Analysis, SQL Database Design & Development, Python Analytics & Machine Learning |
| **Bachelor of Science (B.Sc.) in Computer Science & Engineering** | Varendra University (VU), Rajshahi | Sep 2013 – Aug 2017 | Relational Databases (DBMS), Software Engineering, Data Structures, Algorithms & Systems |

### Professional Courses & Continuous Learning

- **Post Graduate Diploma in Data Science (PGDDS)** — *United International University (UIU) & BITM* (Completed (2024))  
  *Focus:* Data Analysis, SQL Querying, Python for Data Science, Analytical Workflows
- **Continuous Professional Training in SQL, C#, Python & ERP Architecture** — *Self-Directed & Professional Learning Platforms* (Ongoing)  
  *Focus:* Microsoft SQL Server & T-SQL, PL/SQL, C# & .NET Architecture, Python & Data Engineering

### Key Achievements

- **[Certification] Google IT Support Certified Professional**: Earned the Google IT Support Certificate via Coursera, validating foundational operational expertise in troubleshooting, customer service, networking, operating systems, system administration, and IT security.
- **[Engineering] Enterprise Multi-Company ERP Database & Backend Architecture**: Designed and standardized an 80-table Microsoft SQL Server schema and .NET 10 modular backend across General Ledger, Inventory, AP/AR, HR & Payroll, Fixed Assets, Real Estate, and Manufacturing.
- **[Tooling] Multi-Company SQL Operations Suite (Pyrix)**: Built a Python FastAPI & SQL Server operational web portal featuring SQL schema inspection, dynamic form/table management, audit logging, and thread-safe TTL query caching.
- **[Domain Expertise] 4+ Years of Self-Driven SQL, PL/SQL & Crystal Reports Practice**: Delivered structured relational queries, data integrity controls, and Crystal Reports templates bridging operational databases with clear reporting.

---

## GitHub Activity

<div align="center">
  <img src="assets/profile/github-telemetry.svg?v=b671c5ba" alt="Verified GitHub Activity and Codebase Telemetry" width="100%" />
</div>

<br/>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/tsalmanrahman/tsalmanrahman/output/github-contribution-grid-snake-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/tsalmanrahman/tsalmanrahman/output/github-contribution-grid-snake.svg">
    <img alt="GitHub Contribution Activity Snake" src="https://raw.githubusercontent.com/tsalmanrahman/tsalmanrahman/output/github-contribution-grid-snake.svg" width="100%" />
  </picture>
</div>

---

## Career Status

<p>
  <img src="assets/icons/career-status.svg?v=dc0cbc4a" alt="Career Status: Open to Opportunities" />
</p>

- **Current Status:** Open to Opportunities (Dhaka, Bangladesh · HATIM GROUP)
- **Target Roles:** `SQL Developer` · `Data Analyst` · `Data Engineer` · `Database Developer` · `ERP / Backend Developer`

**Current Focus:**
- Enterprise Database Architecture & Query Optimization in Microsoft SQL Server (T-SQL, PL/SQL)
- Multi-Company ERP Backend Development & Operational Tooling with C# (.NET) and Python
- Business Intelligence, Operational Reporting & Data Analysis with Crystal Reports and SQL

**Recent Professional Updates:**

| Period | Area | Update |
| :--- | :--- | :--- |
| `2026-11` | **Profile Architecture** | Built a centralized, data-driven GitHub Profile Ecosystem with JSON source-of-truth, schema validation, and automated CI/CD workflows. |
| `2026-10` | **ERP Engineering** | Implemented multi-company tenant isolation, facility registries, and standardized database architecture audits for the ERP platform on SQL Server & .NET 10. |
| `2026-09` | **Operations Tooling** | Developed Pyrix multi-company operations & SQL schema inspection suite using Python (FastAPI) and Microsoft SQL Server (ODBC Driver 18). |

---

<div align="center">
  <sub>Maintained through structured JSON data in <code>profile-data/</code> and automated via GitHub Actions • <a href="ARCHITECTURE.md">Maintenance &amp; Automation Guide</a></sub>
</div>
