#!/usr/bin/env python3
"""Generate README.md and dynamic SVG portfolio assets from profile-data/*.json."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape as xml_escape

REPO_ROOT = Path(__file__).resolve().parent.parent

# Ensure sibling import works whether executed directly or as a module.
SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import validate_data  # noqa: E402


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_utf8_lf(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    normalized = content.replace("\r\n", "\n")
    path.write_bytes(normalized.encode("utf-8"))


def _read_utf8_lf(path: Path) -> str | None:
    if not path.exists():
        return None
    return path.read_bytes().decode("utf-8").replace("\r\n", "\n")


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[: max(0, limit - 3)].rstrip() + "..."


def render_hero_banner_svg(profile: dict[str, Any], career: dict[str, Any]) -> str:
    """Render the restrained dark-slate hero banner SVG from profile.json and career.json."""
    name = xml_escape(profile["name"])
    headline = xml_escape(profile["headline"])
    banner = profile["banner"]
    status_label = xml_escape(banner["badge_text"] if career.get("available_for_hire") else career.get("status", "PORTFOLIO"))
    tagline = xml_escape(_truncate(banner["tagline"], 112))
    pills: list[str] = list(banner["pills"])[:4]

    pills_svg_parts: list[str] = []
    cursor_x = 0
    for pill in pills:
        pill_width = max(125, int(len(pill) * 6.9) + 28)
        if cursor_x + pill_width > 776:
            break
        escaped_pill = xml_escape(pill)
        pills_svg_parts.append(
            f'    <g transform="translate({cursor_x}, 0)">\n'
            f'      <rect width="{pill_width}" height="28" rx="6" fill="#111827" stroke="#1e293b" stroke-width="1" />\n'
            f'      <text x="{pill_width / 2:.1f}" y="18" text-anchor="middle" class="pill-text">{escaped_pill}</text>\n'
            f'    </g>'
        )
        cursor_x += pill_width + 12

    pills_block = "\n".join(pills_svg_parts)
    status_color = "#10b981" if career.get("available_for_hire") else "#38bdf8"

    return f"""<svg width="860" height="232" viewBox="0 0 860 232" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="55%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="heroBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="50%" stop-color="#334155" />
      <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.45" />
    </linearGradient>
    <radialGradient id="heroGlow" cx="88%" cy="18%" r="55%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
    </radialGradient>
  </defs>

  <style>
    .status-text {{ font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10.5px; font-weight: 700; fill: {status_color}; letter-spacing: 0.9px; }}
    .hero-name {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 30px; font-weight: 800; fill: #f8fafc; letter-spacing: -0.5px; }}
    .hero-role {{ font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; font-weight: 600; fill: #38bdf8; }}
    .hero-desc {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; font-weight: 400; fill: #94a3b8; }}
    .pill-text {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; font-weight: 500; fill: #cbd5e1; }}
  </style>

  <rect width="860" height="232" rx="12" fill="url(#heroBg)" />
  <rect width="860" height="232" rx="12" fill="url(#heroGlow)" />
  <rect x="0.5" y="0.5" width="859" height="231" rx="11.5" stroke="url(#heroBorder)" stroke-width="1" />

  <g transform="translate(42, 32)">
    <circle cx="5" cy="5" r="4" fill="{status_color}" />
    <text x="16" y="8.5" class="status-text">{status_label}</text>
  </g>

  <text x="42" y="80" class="hero-name">{name}</text>
  <text x="42" y="108" class="hero-role">{headline}</text>
  <text x="42" y="136" class="hero-desc">{tagline}</text>

  <line x1="42" y1="158" x2="818" y2="158" stroke="#1e293b" stroke-width="1" />

  <g transform="translate(42, 174)">
{pills_block}
  </g>
</svg>
"""


def render_skills_matrix_svg(skills: dict[str, list[dict[str, Any]]]) -> str:
    """Render the dynamic categorized technical skills matrix SVG without fake percentages."""
    category_order = ["Database", "Programming", "Reporting", "IT Support", "Other"]
    total_inner_w = 804
    card_h = 58
    col_gap = 18
    row_gap = 12
    section_gap = 22
    pad_x = 28

    blocks_svg: list[str] = []
    cur_y = 26

    for cat in category_order:
        items = skills.get(cat, [])
        if not items:
            continue
        blocks_svg.append(
            f'  <text x="{pad_x}" y="{cur_y}" class="cat-title">{xml_escape(cat.upper())}</text>'
        )
        cur_y += 14

        count = len(items)
        cols = 1 if count == 1 else (2 if count in (2, 4) else 3)
        card_w = (total_inner_w - col_gap * (cols - 1)) // cols

        for idx, skill in enumerate(items):
            col = idx % cols
            row = idx // cols
            x = pad_x + col * (card_w + col_gap)
            y = cur_y + row * (card_h + row_gap)
            color = xml_escape(skill.get("color", "#0ea5e9"))
            code = xml_escape(_truncate(skill.get("short_code", skill["name"][:4].upper()), 6))
            s_name = xml_escape(_truncate(skill["name"], 32 if cols < 3 else 22))
            subtitle_raw = f"{skill['role']} · {skill['focus']}" if cols == 1 else (skill["focus"] if cols == 2 else skill["role"])
            s_role = xml_escape(_truncate(subtitle_raw, 88 if cols == 1 else (56 if cols == 2 else 28)))
            badge_font = 9.5 if len(code) <= 4 else 8

            blocks_svg.append(
                f'  <g transform="translate({x}, {y})">\n'
                f'    <rect width="{card_w}" height="{card_h}" rx="8" fill="#111827" stroke="#1e293b" stroke-width="1" />\n'
                f'    <rect x="12" y="13" width="38" height="32" rx="6" fill="{color}" />\n'
                f'    <text x="31" y="33" text-anchor="middle" font-family="monospace" font-size="{badge_font}" font-weight="800" fill="#ffffff">{code}</text>\n'
                f'    <text x="62" y="26" class="skill-name">{s_name}</text>\n'
                f'    <text x="62" y="42" class="skill-role">{s_role}</text>\n'
                f'  </g>'
            )

        rows_used = (count + cols - 1) // cols
        cur_y += rows_used * card_h + (rows_used - 1) * row_gap + section_gap

    total_height = cur_y + 6
    body = "\n".join(blocks_svg)

    return f"""<svg width="860" height="{total_height}" viewBox="0 0 860 {total_height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="matrixBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <style>
    .cat-title {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; fill: #38bdf8; }}
    .skill-name {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12.5px; font-weight: 700; fill: #f8fafc; }}
    .skill-role {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10.5px; font-weight: 400; fill: #94a3b8; }}
  </style>

  <rect width="860" height="{total_height}" rx="12" fill="url(#matrixBg)" stroke="#1e293b" stroke-width="1" />
{body}
</svg>
"""


def render_github_telemetry_svg(metrics: dict[str, Any], projects: list[dict[str, Any]]) -> str:
    """Render verified GitHub activity & repository language mix SVG (zero fake metrics)."""
    username = xml_escape(metrics.get("username", "tsalmanrahman"))
    gh_profile = metrics.get("profile", {})
    public_repos = int(gh_profile.get("public_repos", 0))
    followers = int(gh_profile.get("followers", 0))
    created_year = int(gh_profile.get("created_year", 2023))
    company = xml_escape(gh_profile.get("company") or "Independent")
    sync_status = xml_escape(metrics.get("sync_status", "cached_baseline"))
    featured_count = sum(1 for p in projects if p.get("featured") and p.get("verified"))

    repos = list(metrics.get("repositories", []))[:3]
    repo_lines: list[str] = [
        '    <text x="24" y="154" class="sub-label">ACTIVE PUBLIC REPOSITORIES</text>'
    ]
    for idx, repo in enumerate(repos):
        box_y = 164 + idx * 27
        text_y = box_y + 15
        r_name = xml_escape(_truncate(str(repo.get("name", "")), 24))
        r_lang = xml_escape(str(repo.get("primary_language", "Code")))
        repo_lines.append(
            f'    <rect x="24" y="{box_y}" width="370" height="22" rx="5" fill="#0f172a" stroke="#1e293b" />\n'
            f'    <text x="34" y="{text_y}" class="repo-name">{r_name}</text>\n'
            f'    <text x="384" y="{text_y}" text-anchor="end" class="repo-lang">{r_lang}</text>'
        )
    repos_svg = "\n".join(repo_lines)

    lang_bytes: dict[str, int] = metrics.get("language_bytes", {})
    total_bytes = sum(v for v in lang_bytes.values() if isinstance(v, int) and v > 0)
    lang_colors = {
        "C#": "#512BD4",
        "Python": "#3776AB",
        "TSQL": "#CC2927",
        "HTML": "#E34F26",
        "JavaScript": "#F7DF1E",
        "CSS": "#38BDF8",
        "PowerShell": "#012456",
        "Dockerfile": "#2496ED",
    }

    lang_bars: list[str] = []
    if total_bytes > 0:
        sorted_langs = sorted(lang_bytes.items(), key=lambda kv: (-kv[1], kv[0]))
        top_langs = sorted_langs[:5]
        other_bytes = sum(v for _, v in sorted_langs[5:])
        if other_bytes > 0:
            top_langs.append(("Other", other_bytes))

        for idx, (lang_name, byte_val) in enumerate(top_langs):
            pct = (byte_val / total_bytes) * 100.0
            bar_w = max(6, int((pct / 100.0) * 370))
            y_label = 64 + idx * 34
            y_bar = y_label + 7
            kb = max(1, byte_val // 1024)
            color = lang_colors.get(lang_name, "#64748b")
            lang_bars.append(
                f'    <text x="24" y="{y_label}" class="metric-label">{xml_escape(lang_name)}</text>\n'
                f'    <text x="394" y="{y_label}" text-anchor="end" class="metric-val">{pct:.1f}% ({kb:,} KB)</text>\n'
                f'    <rect x="24" y="{y_bar}" width="370" height="6" rx="3" fill="#1e293b" />\n'
                f'    <rect x="24" y="{y_bar}" width="{bar_w}" height="6" rx="3" fill="{color}" />'
            )
    else:
        lang_bars.append(
            '    <text x="24" y="110" class="metric-label">Language bytes unavailable (fallback active).</text>'
        )

    langs_svg = "\n".join(lang_bars)

    return f"""<svg width="860" height="278" viewBox="0 0 860 278" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardSurface" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
  </defs>
  <style>
    .panel-title {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11.5px; font-weight: 700; letter-spacing: 0.8px; }}
    .stat-k {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 11px; fill: #94a3b8; }}
    .sub-label {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.7px; fill: #64748b; }}
    .stat-v {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11.5px; font-weight: 700; fill: #f8fafc; }}
    .repo-name {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11.5px; font-weight: 600; fill: #e2e8f0; }}
    .repo-lang {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 10.5px; fill: #38bdf8; }}
    .metric-label {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 11.5px; font-weight: 600; fill: #e2e8f0; }}
    .metric-val {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10.5px; fill: #94a3b8; }}
    .footnote {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 9.5px; fill: #64748b; }}
  </style>

  <!-- Left Panel: Verified GitHub Overview -->
  <g transform="translate(0, 0)">
    <rect width="418" height="278" rx="12" fill="url(#cardSurface)" stroke="#1e293b" stroke-width="1" />
    <circle cx="24" cy="26" r="4" fill="#38bdf8" />
    <text x="36" y="30" fill="#38bdf8" class="panel-title">VERIFIED GITHUB PROFILE</text>

    <rect x="24" y="46" width="180" height="44" rx="6" fill="#0f172a" stroke="#1e293b" />
    <text x="34" y="63" class="stat-k">Handle</text>
    <text x="34" y="80" class="stat-v">@{username}</text>

    <rect x="214" y="46" width="180" height="44" rx="6" fill="#0f172a" stroke="#1e293b" />
    <text x="224" y="63" class="stat-k">Public Repos (Featured)</text>
    <text x="224" y="80" class="stat-v">{public_repos} ({featured_count} Featured)</text>

    <rect x="24" y="98" width="180" height="36" rx="6" fill="#0f172a" stroke="#1e293b" />
    <text x="34" y="120" class="stat-k">Since {created_year} · Followers: {followers}</text>

    <rect x="214" y="98" width="180" height="36" rx="6" fill="#0f172a" stroke="#1e293b" />
    <text x="224" y="120" class="stat-k">Org: {company}</text>

{repos_svg}
    <text x="24" y="260" class="footnote">Source: GitHub REST API ({sync_status})</text>
  </g>

  <!-- Right Panel: Verified Codebase Language Mix -->
  <g transform="translate(442, 0)">
    <rect width="418" height="278" rx="12" fill="url(#cardSurface)" stroke="#1e293b" stroke-width="1" />
    <circle cx="24" cy="26" r="4" fill="#10b981" />
    <text x="36" y="30" fill="#10b981" class="panel-title">VERIFIED CODEBASE LANGUAGE MIX</text>

{langs_svg}
    <text x="24" y="260" class="footnote">Measured directly from non-fork repository byte counts</text>
  </g>
</svg>
"""


def render_project_preview_svg(project: dict[str, Any]) -> str:
    """Render a clean architectural preview card SVG for a featured project."""
    name = xml_escape(_truncate(project["name"], 56))
    category = xml_escape(project["category"].upper())
    tagline = xml_escape(_truncate(project["tagline"], 92))
    stack: list[str] = list(project.get("tech_stack", []))[:6]

    pills_parts: list[str] = []
    px = 0
    for tech in stack:
        pw = max(64, int(len(tech) * 6.8) + 20)
        if px + pw > 756:
            break
        pills_parts.append(
            f'    <g transform="translate({px}, 0)">\n'
            f'      <rect width="{pw}" height="24" rx="5" fill="#111827" stroke="#334155" stroke-width="1" />\n'
            f'      <text x="{pw / 2:.1f}" y="15.5" text-anchor="middle" class="tech-pill">{xml_escape(tech)}</text>\n'
            f'    </g>'
        )
        px += pw + 10

    pills_block = "\n".join(pills_parts)
    repo_label = xml_escape(project["repo_url"].replace("https://", ""))

    return f"""<svg width="820" height="156" viewBox="0 0 820 156" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="projBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <style>
    .proj-cat {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; font-weight: 700; fill: #38bdf8; letter-spacing: 1px; }}
    .proj-repo {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; fill: #64748b; }}
    .proj-title {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 20px; font-weight: 800; fill: #f8fafc; }}
    .proj-tag {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; fill: #94a3b8; }}
    .tech-pill {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; font-weight: 600; fill: #cbd5e1; }}
  </style>

  <rect width="820" height="156" rx="10" fill="url(#projBg)" stroke="#1e293b" stroke-width="1" />
  <rect x="0" y="0" width="4" height="156" rx="2" fill="#38bdf8" />

  <text x="28" y="30" class="proj-cat">{category}</text>
  <text x="792" y="30" text-anchor="end" class="proj-repo">{repo_label}</text>

  <text x="28" y="64" class="proj-title">{name}</text>
  <text x="28" y="88" class="proj-tag">{tagline}</text>

  <g transform="translate(28, 108)">
{pills_block}
  </g>
</svg>
"""


def render_comptia_badge_svg(cert: dict[str, Any]) -> str:
    """Render a clean verification badge SVG for CompTIA A+ certification."""
    title = xml_escape(cert["name"])
    issuer = xml_escape(cert["issuer"])
    status = xml_escape(cert["status"])

    return f"""<svg width="380" height="84" viewBox="0 0 380 84" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .c-issuer {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; font-weight: 700; fill: #f87171; letter-spacing: 0.9px; }}
    .c-name {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 15px; font-weight: 700; fill: #f8fafc; }}
    .c-status {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 11px; fill: #10b981; font-weight: 600; }}
  </style>
  <rect width="380" height="84" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
  <rect x="16" y="16" width="52" height="52" rx="10" fill="#C8202F" />
  <text x="42" y="48" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="800" fill="#FFFFFF">A+</text>
  <text x="84" y="28" class="c-issuer">{issuer.upper()}</text>
  <text x="84" y="49" class="c-name">{title}</text>
  <text x="84" y="67" class="c-status">Verified Status: {status}</text>
</svg>
"""


def render_readme_markdown(
    profile: dict[str, Any],
    career: dict[str, Any],
    experience: dict[str, Any],
    skills: dict[str, list[dict[str, Any]]],
    projects: list[dict[str, Any]],
    certifications: list[dict[str, Any]],
    education: list[dict[str, Any]],
    achievements: list[dict[str, Any]],
) -> str:
    """Assemble the complete GitHub Profile README.md strictly from verified data."""
    username = profile["username"]
    contact = profile["contact"]

    # Contact badges (never output broken '#' placeholders)
    contact_badges: list[str] = []
    if contact.get("linkedin"):
        contact_badges.append(
            f'<a href="{contact["linkedin"]}">'
            '<img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />'
            "</a>"
        )
    if contact.get("credly"):
        contact_badges.append(
            f'<a href="{contact["credly"]}">'
            '<img src="https://img.shields.io/badge/Credly-FF6B00?style=for-the-badge&logo=credly&logoColor=white" alt="Credly" />'
            "</a>"
        )
    if contact.get("show_email") and contact.get("email"):
        contact_badges.append(
            f'<a href="mailto:{contact["email"]}">'
            '<img src="https://img.shields.io/badge/Email-1E293B?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />'
            "</a>"
        )
    if contact.get("github"):
        contact_badges.append(
            f'<a href="{contact["github"]}">'
            '<img src="https://img.shields.io/badge/GitHub-0F172A?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />'
            "</a>"
        )
    if contact.get("portfolio"):
        contact_badges.append(
            f'<a href="{contact["portfolio"]}">'
            '<img src="https://img.shields.io/badge/Portfolio-0284C7?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" />'
            "</a>"
        )

    contact_html = "\n  &nbsp;\n  ".join(contact_badges)

    # About Me paragraphs & approach table
    summary_paragraphs = "\n\n".join(profile["summary"])
    approach_rows = "\n".join(
        f"| **{item['pillar']}** | {item['description']} |"
        for item in profile["problem_solving_approach"]
    )
    exp_highlights = "\n".join(
        f"- **{item['area']}**: {item['summary']} (`{'` · `'.join(item['tools'])}`)"
        for item in experience["highlights"]
    )

    # Technical Skills section
    skills_rows: list[str] = []
    for cat in ("Database", "Programming", "Reporting", "IT Support", "Other"):
        cat_items = skills.get(cat, [])
        if not cat_items:
            continue
        badges = " ".join(
            f'<img src="{s["badge_url"]}" alt="{s["name"]}" />'
            for s in cat_items
        )
        focus_summary = " · ".join(f"**{s['name']}** ({s['focus']})" for s in cat_items)
        skills_rows.append(f"| **{cat}** | {badges} | {focus_summary} |")
    skills_table = "\n".join(skills_rows)

    # Featured Projects section (strictly featured == True AND verified == True)
    verified_projects = [p for p in projects if p.get("featured") and p.get("verified")]
    project_blocks: list[str] = []
    for proj in verified_projects:
        links_parts = [f'[GitHub Repository]({proj["repo_url"]})']
        if proj.get("live_url"):
            links_parts.append(f'[Live Demo]({proj["live_url"]})')
        links_line = " &nbsp;•&nbsp; ".join(links_parts)
        stack_inline = " · ".join(f"`{t}`" for t in proj.get("tech_stack", []))
        features_md = "\n".join(f"- {feat}" for feat in proj.get("key_features", []))

        block = f"""#### [{proj['name']}]({proj['repo_url']})
*{proj['category']}* — {links_line}

<div align="center">
  <a href="{proj['repo_url']}">
    <img src="{proj['image_path']}" alt="{proj['name']} Preview" width="100%" />
  </a>
</div>

> {proj['description']}

**Technology Stack:** {stack_inline}

**Key Features:**
{features_md}

**My Contribution:** {proj['my_contribution']}"""
        project_blocks.append(block)

    projects_md = "\n\n---\n\n".join(project_blocks)

    # Certifications, Education & Achievements (strictly verified == True)
    verified_certs = [c for c in certifications if c.get("verified") and c.get("category") == "certification"]
    verified_courses = [c for c in certifications if c.get("verified") and c.get("category") == "course"]
    verified_edu = [e for e in education if e.get("verified")]
    verified_achievements = [a for a in achievements if a.get("verified")]

    cert_badges_html = ""
    for cert in verified_certs:
        if cert.get("badge_path"):
            img_tag = f'<img src="{cert["badge_path"]}" alt="{cert["name"]}" />'
            if cert.get("credential_url"):
                cert_badges_html += f'<a href="{cert["credential_url"]}">{img_tag}</a>\n'
            else:
                cert_badges_html += f"{img_tag}\n"

    cert_rows = "\n".join(
        f"- **{c['name']}** — *{c['issuer']}* ({c['status']})  \n  *Skills Covered:* {', '.join(c['skills_covered'])}"
        + (f"  \n  [View Credential]({c['credential_url']})" if c.get("credential_url") else "")
        for c in verified_certs
    )

    edu_rows = "\n".join(
        f"| **{e['degree']}** | {e['institution']} | {e['year']} | {e['focus']} |"
        for e in verified_edu
    )

    course_rows = "\n".join(
        f"- **{c['name']}** — *{c['issuer']}* ({c['status']})  \n  *Focus:* {', '.join(c['skills_covered'])}"
        for c in verified_courses
    )

    achievement_rows = "\n".join(
        f"- **[{a['category']}] {a['title']}**: {a['description']}"
        for a in verified_achievements
    )

    # Career Status section
    target_roles = " · ".join(f"`{role}`" for role in career["career_interests"])
    focus_items = "\n".join(f"- {item}" for item in career["current_focus"])
    updates_rows = "\n".join(
        f"| `{u['date']}` | **{u['category']}** | {u['title']} |"
        for u in career["recent_updates"]
    )
    availability_badge = (
        "https://img.shields.io/badge/Status-Open_to_Opportunities-10B981?style=flat-square"
        if career.get("available_for_hire")
        else "https://img.shields.io/badge/Status-Focused_on_Current_Projects-0284C7?style=flat-square"
    )

    return f"""<!-- AUTO-GENERATED FILE: DO NOT EDIT MANUALLY.
     Source of truth: profile-data/*.json
     Generator: python scripts/generate_readme.py -->

<div align="center">
  <img src="assets/banner/hero-banner.svg" alt="{profile['name']} - {profile['headline']}" width="100%" />
</div>

<br/>

<div align="center">

### {profile['headline']}

{profile['short_bio']}

<p>
  {contact_html}
</p>

<p>
  <a href="#about-me">About Me</a> &nbsp;•&nbsp;
  <a href="#technical-skills">Technical Skills</a> &nbsp;•&nbsp;
  <a href="#featured-projects">Featured Projects</a> &nbsp;•&nbsp;
  <a href="#certifications--education">Certifications &amp; Education</a> &nbsp;•&nbsp;
  <a href="#github-activity">GitHub Activity</a> &nbsp;•&nbsp;
  <a href="#career-status">Career Status</a>
</p>

</div>

---

## About Me

{summary_paragraphs}

### Experience & Practical Background ({experience['years_of_experience']})

{exp_highlights}

### Problem-Solving Approach

| Pillar | Engineering Practice |
| :--- | :--- |
{approach_rows}

---

## Technical Skills

<div align="center">
  <img src="assets/profile/skills-matrix.svg" alt="Technical Skills Matrix" width="100%" />
</div>

<br/>

| Category | Technologies | Core Focus |
| :--- | :--- | :--- |
{skills_table}

---

## Featured Projects

{projects_md}

---

## Certifications & Education

### Verified Certifications

{cert_badges_html}
{cert_rows}

### Academic Qualifications

| Qualification | Institution | Year / Status | Core Focus |
| :--- | :--- | :--- | :--- |
{edu_rows}

### Professional Courses & Continuous Learning

{course_rows}

### Key Achievements

{achievement_rows}

---

## GitHub Activity

<div align="center">
  <img src="assets/profile/github-telemetry.svg" alt="Verified GitHub Activity and Codebase Telemetry" width="100%" />
</div>

<br/>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/{username}/{username}/output/github-contribution-grid-snake-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/{username}/{username}/output/github-contribution-grid-snake.svg">
    <img alt="GitHub Contribution Activity Snake" src="https://raw.githubusercontent.com/{username}/{username}/output/github-contribution-grid-snake.svg" width="100%" />
  </picture>
</div>

---

## Career Status

<p>
  <img src="{availability_badge}" alt="Career Status: {career['status']}" />
</p>

- **Current Status:** {career['status']} ({profile['location']} · {profile['organization']})
- **Target Roles:** {target_roles}

**Current Focus:**
{focus_items}

**Recent Professional Updates:**

| Period | Area | Update |
| :--- | :--- | :--- |
{updates_rows}

---

<div align="center">
  <sub>Maintained through structured JSON data in <code>profile-data/</code> and automated via GitHub Actions • <a href="ARCHITECTURE.md">Maintenance &amp; Automation Guide</a></sub>
</div>
"""


def build_outputs(root_dir: Path) -> dict[Path, str]:
    """Compute all generated file paths and their exact UTF-8 contents."""
    data_dir = root_dir / "profile-data"
    profile = _load_json(data_dir / "profile.json")
    career = _load_json(data_dir / "career.json")
    experience = _load_json(data_dir / "experience.json")
    skills = _load_json(data_dir / "skills.json")
    projects = _load_json(data_dir / "projects.json")
    certifications = _load_json(data_dir / "certifications.json")
    education = _load_json(data_dir / "education.json")
    achievements = _load_json(data_dir / "achievements.json")
    github_metrics = _load_json(data_dir / "github_metrics.json")

    banner_svg = render_hero_banner_svg(profile, career)
    skills_svg = render_skills_matrix_svg(skills)
    telemetry_svg = render_github_telemetry_svg(github_metrics, projects)

    outputs: dict[Path, str] = {
        root_dir / "assets/banner/hero-banner.svg": banner_svg,
        root_dir / "banner.svg": banner_svg,
        root_dir / "assets/profile/skills-matrix.svg": skills_svg,
        root_dir / "tech-matrix.svg": skills_svg,
        root_dir / "assets/profile/github-telemetry.svg": telemetry_svg,
        root_dir / "telemetry.svg": telemetry_svg,
    }

    for proj in projects:
        if proj.get("featured") and proj.get("verified") and proj.get("image_path"):
            img_path = root_dir / proj["image_path"]
            if img_path.suffix.lower() == ".svg":
                outputs[img_path] = render_project_preview_svg(proj)

    for cert in certifications:
        if cert.get("verified") and cert.get("badge_path"):
            badge_path = root_dir / cert["badge_path"]
            if badge_path.suffix.lower() == ".svg":
                outputs[badge_path] = render_comptia_badge_svg(cert)

    outputs[root_dir / "README.md"] = render_readme_markdown(
        profile=profile,
        career=career,
        experience=experience,
        skills=skills,
        projects=projects,
        certifications=certifications,
        education=education,
        achievements=achievements,
    )
    return outputs


def generate_all(root_dir: Path | None = None, check_only: bool = False) -> tuple[bool, str]:
    """Validate profile data and generate or check README.md and SVGs with rollback."""
    base = root_dir or REPO_ROOT
    schema_errors = validate_data.validate_schemas(base / "profile-data")
    if schema_errors:
        joined = "\n  - ".join(schema_errors)
        return False, f"Input schema validation failed; existing files preserved:\n  - {joined}"

    outputs = build_outputs(base)

    if check_only:
        drifted: list[str] = []
        for path, expected in outputs.items():
            actual = _read_utf8_lf(path)
            if actual != expected:
                drifted.append(str(path.relative_to(base)))
        if drifted:
            return False, "Generated files are out of date with profile-data:\n  - " + "\n  - ".join(drifted)
        return True, "README.md and SVG assets are up-to-date with profile-data."

    snapshots: dict[Path, bytes | None] = {
        path: (path.read_bytes() if path.exists() else None)
        for path in outputs
    }

    try:
        for path, content in outputs.items():
            _write_utf8_lf(path, content)

        asset_errors = validate_data.validate_assets(base)
        if asset_errors:
            raise RuntimeError("Asset verification failed:\n  - " + "\n  - ".join(asset_errors))
    except Exception as exc:
        # Atomic rollback to preserve last valid README.md and SVGs.
        for path, original_bytes in snapshots.items():
            if original_bytes is None:
                if path.exists():
                    path.unlink()
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(original_bytes)
        return False, f"Generation failed and rolled back to previous valid state: {exc}"

    return True, f"Generated README.md and {len(outputs) - 1} SVG file(s) successfully."


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate README.md and SVG assets from profile-data.")
    parser.add_argument("--root", type=Path, default=REPO_ROOT, help="Repository root directory.")
    parser.add_argument("--check", action="store_true", help="Verify generated files match profile-data without writing.")
    args = parser.parse_args(argv)

    ok, msg = generate_all(args.root, check_only=args.check)
    stream = sys.stdout if ok else sys.stderr
    prefix = "[OK]" if ok else "[ERROR]"
    print(f"{prefix} {msg}", file=stream)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
