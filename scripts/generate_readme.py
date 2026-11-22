#!/usr/bin/env python3
"""Generate README.md and dynamic SVG portfolio assets from profile-data/*.json."""

from __future__ import annotations

import argparse
import hashlib
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
    """Render a crisp Swiss Monochrome Koval hero header banner matching the portfolio website."""
    username_upper = xml_escape(profile["username"].upper())
    headline = xml_escape(_truncate(profile["headline"], 92))
    org = xml_escape(profile["organization"].upper())
    banner = profile["banner"]
    status_label = xml_escape(
        "OPEN TO OPPORTUNITIES" if career.get("available_for_hire") else "ACTIVE BUILD"
    )
    pills: list[str] = list(banner["pills"])[:4]

    pills_svg_parts: list[str] = []
    cursor_x = 0
    for pill in pills:
        pill_width = max(112, int(len(pill) * 6.5) + 22)
        if cursor_x + pill_width > 796:
            break
        pills_svg_parts.append(
            f'    <g transform="translate({cursor_x}, 0)">\n'
            f'      <rect x="0.5" y="0.5" width="{pill_width - 1}" height="23" rx="0" fill="#F4F4F2" stroke="#111110" stroke-opacity="0.35" stroke-width="1" />\n'
            f'      <text x="{pill_width / 2:.1f}" y="15.5" text-anchor="middle" class="pill-text">{xml_escape(pill)}</text>\n'
            f'    </g>'
        )
        cursor_x += pill_width + 8

    pills_block = "\n".join(pills_svg_parts)

    return f"""<svg width="860" height="156" viewBox="0 0 860 156" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="kovalDotsHero" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="1" fill="#111110" fill-opacity="0.12" />
    </pattern>
  </defs>
  <style>
    .top-mono {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; font-weight: 600; fill: #FFFFFF; letter-spacing: 1px; }}
    .hero-title {{ font-family: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 28px; font-weight: 700; fill: #111110; letter-spacing: -0.6px; }}
    .hero-sub {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; font-weight: 500; fill: #656561; }}
    .pill-text {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; font-weight: 600; fill: #111110; }}
  </style>

  <rect width="860" height="156" rx="0" fill="#FFFFFF" />
  <rect width="860" height="156" rx="0" fill="url(#kovalDotsHero)" />
  <rect x="0" y="0" width="860" height="32" rx="0" fill="#111110" />
  <text x="20" y="20" class="top-mono">{username_upper} // SQL SERVER &amp; ERP ENGINEERING · {org}</text>
  <text x="840" y="20" text-anchor="end" class="top-mono">{status_label}</text>

  <text x="24" y="72" class="hero-title">Built for data integrity.</text>
  <text x="24" y="96" class="hero-sub">{headline}</text>

  <g transform="translate(24, 114)">
{pills_block}
  </g>

  <rect x="0.5" y="0.5" width="859" height="155" rx="0" stroke="#111110" stroke-width="1" />
</svg>
"""


def render_about_terminal_svg(profile: dict[str, Any], experience: dict[str, Any]) -> str:
    """Render a Swiss Monochrome dual-pane Engineering Pillars & Experience ledger card."""
    pillars = list(profile.get("problem_solving_approach", []))[:4]
    highlights = list(experience.get("highlights", []))[:4]
    raw_years = str(experience.get("years_of_experience", "4+ Years"))
    short_years = xml_escape(raw_years.split("(")[0].strip() or raw_years)
    years = xml_escape(f"EXP: {short_years.upper()}")

    pillar_nodes: list[str] = []
    for idx, pillar in enumerate(pillars):
        py = 56 + idx * 54
        title = xml_escape(_truncate(pillar["pillar"], 36))
        desc = xml_escape(_truncate(pillar["description"], 54))
        pillar_nodes.append(
            f'  <g transform="translate(24, {py})">\n'
            f'    <rect x="0.5" y="0.5" width="385" height="45" rx="0" fill="#F4F4F2" stroke="#111110" stroke-opacity="0.25" stroke-width="1" />\n'
            f'    <text x="12" y="18" class="item-head">[{idx + 1:02d}] {title}</text>\n'
            f'    <text x="12" y="34" class="item-sub">{desc}</text>\n'
            f'  </g>'
        )

    exp_nodes: list[str] = []
    for idx, item in enumerate(highlights):
        ey = 56 + idx * 54
        area = xml_escape(_truncate(item["area"], 38))
        tools = xml_escape(" · ".join(list(item.get("tools", []))[:4]))
        exp_nodes.append(
            f'  <g transform="translate(450, {ey})">\n'
            f'    <rect x="0.5" y="0.5" width="385" height="45" rx="0" fill="#F4F4F2" stroke="#111110" stroke-opacity="0.25" stroke-width="1" />\n'
            f'    <text x="12" y="18" class="item-head">{area}</text>\n'
            f'    <text x="12" y="34" class="item-sub">{tools}</text>\n'
            f'  </g>'
        )

    left_block = "\n".join(pillar_nodes)
    right_block = "\n".join(exp_nodes)

    return f"""<svg width="860" height="288" viewBox="0 0 860 288" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="kovalDotsAbout" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="1" fill="#111110" fill-opacity="0.1" />
    </pattern>
  </defs>
  <style>
    .pane-hdr {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10.5px; font-weight: 600; letter-spacing: 0.9px; fill: #FFFFFF; }}
    .item-head {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; fill: #111110; }}
    .item-sub {{ font-family: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10px; fill: #656561; }}
  </style>

  <rect width="860" height="288" rx="0" fill="#FFFFFF" />
  <rect width="860" height="288" rx="0" fill="url(#kovalDotsAbout)" />
  <rect x="0" y="0" width="860" height="32" rx="0" fill="#111110" />

  <text x="24" y="20" class="pane-hdr">01 // ENGINEERING PILLARS</text>
  <text x="450" y="20" class="pane-hdr">02 // PRACTICAL EXPERIENCE</text>
  <text x="836" y="20" text-anchor="end" class="pane-hdr">{years}</text>

  <line x1="430" y1="32" x2="430" y2="288" stroke="#111110" stroke-opacity="0.18" stroke-width="1" />

{left_block}
{right_block}

  <rect x="0.5" y="0.5" width="859" height="287" rx="0" stroke="#111110" stroke-width="1" />
</svg>
"""


SKILL_ICON_SVGS: dict[str, str] = {
    "microsoft sql server": (
        '<g stroke="#B91C1C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" fill="#B91C1C" fill-opacity="0.18" />'
        '<path d="M4.5 5.5v13c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-13" />'
        '<path d="M4.5 9.8c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />'
        '<path d="M4.5 14.2c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />'
        "</g>"
    ),
    "sql": (
        '<g stroke="#0369A1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<rect x="3" y="4" width="18" height="16" rx="2.5" fill="#0369A1" fill-opacity="0.14" />'
        '<path d="M3 9.5h18" />'
        '<path d="M9.5 9.5v10.5" />'
        '<path d="M13 13.5h4.5M13 16.8h3" stroke="#0284C7" />'
        "</g>"
    ),
    "pl/sql": (
        '<g stroke="#B45309" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<ellipse cx="10" cy="6" rx="6" ry="2.4" fill="#B45309" fill-opacity="0.16" />'
        '<path d="M4 6v10.5c0 1.33 2.69 2.4 6 2.4 1.1 0 2.13-.12 3-.32" />'
        '<path d="M4 11.2c0 1.33 2.69 2.4 6 2.4 1.25 0 2.4-.15 3.35-.4" />'
        '<path d="M16 6v4.5" />'
        '<polygon points="17.8 11.2 13.6 16.8 16.7 16.8 15.6 21.5 20.6 15.4 17.4 15.4" fill="#B45309" stroke="none" />'
        "</g>"
    ),
    "python": (
        "<g>"
        '<path d="M11.8 2C7.9 2 8.2 3.7 8.2 3.7V5.9H12.5V6.6H5.9C3.9 6.6 2.8 8.1 2.8 10.8C2.8 13.5 3.8 15 5.9 15H7.6V12.8C7.6 10.7 9.1 9.8 11.2 9.8H15.2C17 9.8 18.2 8.7 18.2 6.8V3.7C18.2 3.7 18.4 2 11.8 2ZM9.7 3.2A.9.9 0 1 1 9.7 5A.9.9 0 1 1 9.7 3.2Z" fill="#3776AB" />'
        '<path d="M12.2 22C16.1 22 15.8 20.3 15.8 20.3V18.1H11.5V17.4H18.1C20.1 17.4 21.2 15.9 21.2 13.2C21.2 10.5 20.2 9 18.1 9H16.4V11.2C16.4 13.3 14.9 14.2 12.8 14.2H8.8C7 14.2 5.8 15.3 5.8 17.2V20.3C5.8 20.3 5.6 22 12.2 22ZM14.3 19A.9.9 0 1 1 14.3 20.8A.9.9 0 1 1 14.3 19Z" fill="#FFD43B" />'
        "</g>"
    ),
    "c#": (
        "<g>"
        '<polygon points="12 2.5 20.2 7.25 20.2 16.75 12 21.5 3.8 16.75 3.8 7.25" fill="#7C3AED" fill-opacity="0.22" stroke="#5B21B6" stroke-width="1.6" stroke-linejoin="round" />'
        '<path d="M12.4 9.5a3.5 3.5 0 1 0 0 5.0" stroke="#4C1D95" stroke-width="2.1" stroke-linecap="round" fill="none" />'
        '<path d="M14.8 9.5l-.6 5M17.2 9.5l-.6 5M13.6 11.1h4.2M13.3 13.1h4.2" stroke="#4C1D95" stroke-width="1.35" stroke-linecap="round" fill="none" />'
        "</g>"
    ),
    "crystal reports": (
        '<g stroke="#0F766E" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M6 3h8l4.5 4.5V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V4.5A1.5 1.5 0 0 1 6 3z" fill="#0F766E" fill-opacity="0.14" />'
        '<path d="M14 3v4.5h4.5" />'
        '<path d="M8.5 17v-3.5M11.5 17V11M14.5 17v-5" stroke="#0D9488" stroke-width="2" />'
        '<path d="M8 8.5h3.5" stroke="#0D9488" />'
        "</g>"
    ),
    "hardware & systems": (
        '<g stroke="#334155" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<rect x="6" y="6" width="12" height="12" rx="2" fill="#475569" fill-opacity="0.18" />'
        '<rect x="9.5" y="9.5" width="5" height="5" rx="0.8" fill="#334155" fill-opacity="0.3" />'
        '<path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />'
        "</g>"
    ),
    "troubleshooting": (
        '<g stroke="#0369A1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="#0369A1" fill-opacity="0.14" />'
        "</g>"
    ),
    "technical support": (
        '<g stroke="#1D4ED8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M4 14v-2a8 8 0 1 1 16 0v2" />'
        '<rect x="3" y="13" width="3.5" height="5" rx="1.5" fill="#1D4ED8" fill-opacity="0.2" />'
        '<rect x="17.5" y="13" width="3.5" height="5" rx="1.5" fill="#1D4ED8" fill-opacity="0.2" />'
        '<path d="M21 16v1.5a3 3 0 0 1-3 3h-3.5" />'
        "</g>"
    ),
    "data analysis": (
        '<g stroke="#047857" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M4 20h16" />'
        '<rect x="5.5" y="13" width="3" height="4.5" rx="0.6" fill="#047857" fill-opacity="0.25" />'
        '<rect x="10.5" y="10" width="3" height="7.5" rx="0.6" fill="#047857" fill-opacity="0.25" />'
        '<rect x="15.5" y="6.5" width="3" height="11" rx="0.6" fill="#047857" fill-opacity="0.25" />'
        '<path d="M5.5 9.5L10.5 6.5L15 8L19 4" stroke="#059669" />'
        '<polyline points="16.5 4 19 4 19 6.5" stroke="#059669" />'
        "</g>"
    ),
    "erp systems": (
        '<g stroke="#4338CA" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<rect x="9" y="3.5" width="6" height="4.5" rx="1" fill="#4338CA" fill-opacity="0.2" />'
        '<rect x="3" y="15.5" width="5" height="4.5" rx="1" fill="#4338CA" fill-opacity="0.2" />'
        '<rect x="9.5" y="15.5" width="5" height="4.5" rx="1" fill="#4338CA" fill-opacity="0.2" />'
        '<rect x="16" y="15.5" width="5" height="4.5" rx="1" fill="#4338CA" fill-opacity="0.2" />'
        '<path d="M12 8v3.5M5.5 15.5v-2.5h13v2.5M12 11.5v4" />'
        "</g>"
    ),
    "backend development": (
        '<g stroke="#0369A1" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M8.5 5C6.8 5 6.5 6.2 6.5 7.5v2.2c0 1.1-.8 2-2 2.3 1.2.3 2 1.2 2 2.3v2.2c0 1.3.3 2.5 2 2.5" />'
        '<path d="M15.5 5c1.7 0 2 1.2 2 2.5v2.2c0 1.1.8 2 2 2.3-1.2.3-2 1.2-2 2.3v2.2c0 1.3-.3 2.5-2 2.5" />'
        '<path d="M13 8.5l-2 7" stroke="#0284C7" stroke-width="1.75" />'
        "</g>"
    ),
    "database design": (
        '<g stroke="#6D28D9" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<rect x="3" y="4" width="8" height="6.5" rx="1.2" fill="#6D28D9" fill-opacity="0.2" />'
        '<rect x="13" y="13.5" width="8" height="6.5" rx="1.2" fill="#6D28D9" fill-opacity="0.2" />'
        '<path d="M11 7.2h4.5a1.5 1.5 0 0 1 1.5 1.5v4.8" />'
        '<path d="M7 10.5v4.8a1.5 1.5 0 0 0 1.5 1.5H13" stroke="#7C3AED" stroke-opacity="0.7" />'
        '<circle cx="17" cy="13.5" r="1.2" fill="#6D28D9" stroke="none" />'
        "</g>"
    ),
}

SKILL_ICON_ALIASES: dict[str, str] = {
    "mssql": "microsoft sql server",
    "plsql": "pl/sql",
    "py": "python",
    "csharp": "c#",
    "cr": "crystal reports",
    "hw": "hardware & systems",
    "dbg": "troubleshooting",
    "it": "technical support",
    "data": "data analysis",
    "erp": "erp systems",
    "api": "backend development",
    "db": "database design",
}

SKILL_DEFAULT_ICON_SVG = (
    '<g stroke="#111110" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none">'
    '<polyline points="16 18 22 12 16 6" />'
    '<polyline points="8 6 2 12 8 18" />'
    "</g>"
)


def _get_skill_icon_svg(skill: dict[str, Any]) -> str:
    """Resolve an inline 24x24 vector SVG icon for a skill, with a clean code fallback."""
    candidates = [
        str(skill.get("icon", "")).strip().lower(),
        str(skill.get("name", "")).strip().lower(),
        str(skill.get("short_code", "")).strip().lower(),
    ]
    for candidate in candidates:
        if not candidate:
            continue
        canonical = SKILL_ICON_ALIASES.get(candidate, candidate)
        if canonical in SKILL_ICON_SVGS:
            return SKILL_ICON_SVGS[canonical]
    return SKILL_DEFAULT_ICON_SVG


def render_skills_matrix_svg(skills: dict[str, list[dict[str, Any]]]) -> str:
    """Render the Swiss Monochrome Technical Skills Matrix with tinted vector icon tiles."""
    category_order = ["Database", "Programming", "Reporting", "IT Support", "Other"]
    total_inner_w = 804
    card_h = 58
    col_gap = 18
    row_gap = 12
    section_gap = 22
    pad_x = 28

    blocks_svg: list[str] = []
    cur_y = 28

    for cat_idx, cat in enumerate(category_order, start=1):
        items = skills.get(cat, [])
        if not items:
            continue
        cat_label = xml_escape(f"{cat_idx:02d} · {cat.upper()}")
        blocks_svg.append(
            f'  <text x="{pad_x}" y="{cur_y}" class="cat-title">{cat_label}</text>'
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
            color = xml_escape(skill.get("color", "#111110"))
            icon_svg = _get_skill_icon_svg(skill)
            s_name = xml_escape(_truncate(skill["name"], 34 if cols < 3 else 23))
            subtitle_raw = f"{skill['role']} · {skill['focus']}" if cols == 1 else (skill["focus"] if cols == 2 else skill["role"])
            s_role = xml_escape(_truncate(subtitle_raw, 90 if cols == 1 else (58 if cols == 2 else 29)))

            blocks_svg.append(
                f'  <g transform="translate({x}, {y})">\n'
                f'    <rect x="0.5" y="0.5" width="{card_w - 1}" height="{card_h - 1}" rx="0" fill="#FFFFFF" stroke="#111110" stroke-opacity="0.25" stroke-width="1" />\n'
                f'    <rect x="12" y="11" width="36" height="36" rx="0" fill="{color}" fill-opacity="0.16" stroke="#111110" stroke-opacity="0.25" stroke-width="1" />\n'
                f'    <g transform="translate(19, 18) scale(0.9167)">{icon_svg}</g>\n'
                f'    <text x="58" y="25" class="skill-name">{s_name}</text>\n'
                f'    <text x="58" y="41" class="skill-role">{s_role}</text>\n'
                f'  </g>'
            )

        rows_used = (count + cols - 1) // cols
        cur_y += rows_used * card_h + (rows_used - 1) * row_gap + section_gap

    total_height = cur_y + 6
    body = "\n".join(blocks_svg)

    return f"""<svg width="860" height="{total_height}" viewBox="0 0 860 {total_height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="kovalDotsSkills" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="1" fill="#111110" fill-opacity="0.1" />
    </pattern>
  </defs>
  <style>
    .cat-title {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; fill: #111110; }}
    .skill-name {{ font-family: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12.5px; font-weight: 700; fill: #111110; }}
    .skill-role {{ font-family: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10.5px; font-weight: 400; fill: #656561; }}
  </style>

  <rect width="860" height="{total_height}" rx="0" fill="#FFFFFF" />
  <rect width="860" height="{total_height}" rx="0" fill="url(#kovalDotsSkills)" />
  <rect x="0.5" y="0.5" width="859" height="{total_height - 1}" rx="0" stroke="#111110" stroke-width="1" />
{body}
</svg>
"""


def render_github_telemetry_svg(metrics: dict[str, Any], projects: list[dict[str, Any]]) -> str:
    """Render Swiss Monochrome two-panel GitHub telemetry & codebase mix card SVG."""
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
        '    <text x="24" y="154" class="sub-label">ACTIVE REPOSITORIES</text>'
    ]
    for idx, repo in enumerate(repos):
        box_y = 164 + idx * 27
        text_y = box_y + 15
        r_name = xml_escape(_truncate(str(repo.get("name", "")), 24))
        r_lang = xml_escape(str(repo.get("primary_language", "Code")))
        repo_lines.append(
            f'    <rect x="24.5" y="{box_y + 0.5}" width="369" height="21" rx="0" fill="#F4F4F2" stroke="#111110" stroke-opacity="0.22" />\n'
            f'    <text x="34" y="{text_y}" class="repo-name">{r_name}</text>\n'
            f'    <text x="384" y="{text_y}" text-anchor="end" class="repo-lang">[{r_lang}]</text>'
        )
    repos_svg = "\n".join(repo_lines)

    lang_bytes: dict[str, int] = metrics.get("language_bytes", {})
    total_bytes = sum(v for v in lang_bytes.values() if isinstance(v, int) and v > 0)
    mono_shades = ["#111110", "#3A3A38", "#52524E", "#656561", "#787873", "#94948F"]

    lang_bars: list[str] = []
    if total_bytes > 0:
        sorted_langs = sorted(lang_bytes.items(), key=lambda kv: (-kv[1], kv[0]))
        top_langs = sorted_langs[:5]
        other_bytes = sum(v for _, v in sorted_langs[5:])
        if other_bytes > 0:
            top_langs.append(("Other", other_bytes))

        for idx, (lang_name, byte_val) in enumerate(top_langs):
            pct = (byte_val / total_bytes) * 100.0
            bar_w = max(8, int((pct / 100.0) * 370))
            y_label = 64 + idx * 34
            y_bar = y_label + 7
            kb = max(1, byte_val // 1024)
            color = mono_shades[idx % len(mono_shades)]
            lang_bars.append(
                f'    <text x="24" y="{y_label}" class="metric-label">{xml_escape(lang_name)}</text>\n'
                f'    <text x="394" y="{y_label}" text-anchor="end" class="metric-val">{pct:.1f}% ({kb:,} KB)</text>\n'
                f'    <rect x="24" y="{y_bar}" width="370" height="6" rx="0" fill="#F4F4F2" stroke="#111110" stroke-opacity="0.15" stroke-width="1" />\n'
                f'    <rect x="24" y="{y_bar}" width="{bar_w}" height="6" rx="0" fill="{color}" />'
            )
    else:
        lang_bars.append(
            '    <text x="24" y="110" class="metric-label">Language bytes unavailable (fallback active).</text>'
        )

    langs_svg = "\n".join(lang_bars)

    return f"""<svg width="860" height="278" viewBox="0 0 860 278" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .panel-hdr {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10.5px; font-weight: 600; letter-spacing: 0.9px; fill: #FFFFFF; }}
    .stat-k {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9.5px; fill: #656561; }}
    .sub-label {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9.5px; font-weight: 700; letter-spacing: 0.8px; fill: #656561; }}
    .stat-v {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11.5px; font-weight: 700; fill: #111110; }}
    .repo-name {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10.5px; font-weight: 600; fill: #111110; }}
    .repo-lang {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; fill: #3A3A38; }}
    .metric-label {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; font-weight: 600; fill: #111110; }}
    .metric-val {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; fill: #656561; }}
    .footnote {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; fill: #656561; }}
  </style>

  <g transform="translate(0, 0)">
    <rect x="0.5" y="0.5" width="417" height="277" rx="0" fill="#FFFFFF" stroke="#111110" stroke-width="1" />
    <rect x="0" y="0" width="418" height="32" rx="0" fill="#111110" />
    <text x="20" y="20" class="panel-hdr">01 // GITHUB PROFILE DAEMON</text>

    <rect x="24.5" y="46.5" width="179" height="43" rx="0" fill="#F4F4F2" stroke="#111110" stroke-opacity="0.22" />
    <text x="34" y="63" class="stat-k">HANDLE</text>
    <text x="34" y="80" class="stat-v">@{username}</text>

    <rect x="214.5" y="46.5" width="179" height="43" rx="0" fill="#F4F4F2" stroke="#111110" stroke-opacity="0.22" />
    <text x="224" y="63" class="stat-k">REPOS (FEATURED)</text>
    <text x="224" y="80" class="stat-v">{public_repos} ({featured_count} Featured)</text>

    <rect x="24.5" y="98.5" width="179" height="35" rx="0" fill="#F4F4F2" stroke="#111110" stroke-opacity="0.22" />
    <text x="34" y="120" class="stat-k">SINCE {created_year} · FOLLOWERS: {followers}</text>

    <rect x="214.5" y="98.5" width="179" height="35" rx="0" fill="#F4F4F2" stroke="#111110" stroke-opacity="0.22" />
    <text x="224" y="120" class="stat-k">ORG: {company}</text>

{repos_svg}
    <text x="24" y="260" class="footnote">SOURCE: GITHUB REST API ({sync_status})</text>
  </g>

  <g transform="translate(442, 0)">
    <rect x="0.5" y="0.5" width="417" height="277" rx="0" fill="#FFFFFF" stroke="#111110" stroke-width="1" />
    <rect x="0" y="0" width="418" height="32" rx="0" fill="#111110" />
    <text x="20" y="20" class="panel-hdr">02 // CODEBASE LANGUAGE MIX</text>

{langs_svg}
    <text x="24" y="260" class="footnote">MEASURED BYTE COUNTS (NON-FORK REPOS)</text>
  </g>
</svg>
"""


def render_project_preview_svg(project: dict[str, Any], index: int = 1) -> str:
    """Render a crisp Swiss Monochrome Koval architectural wireframe SVG for a featured project."""
    pid = str(project.get("id", "")).strip().lower()

    if pid == "erp":
        modules = [
            "GL &amp; BANKING",
            "INVENTORY",
            "AP / AR",
            "HR &amp; PAYROLL",
            "FIXED ASSETS",
            "MANUFACTURING",
        ]
        cells: list[str] = []
        for idx, mod in enumerate(modules):
            col = idx % 3
            row = idx // 3
            cx = 14 + col * 134
            cy = 46 + row * 62
            cells.append(
                f'  <rect x="{cx}.5" y="{cy}.5" width="123" height="49" rx="0" fill="#FFFFFF" stroke="#111110" stroke-opacity="0.22" stroke-width="1" />\n'
                f'  <text x="{cx + 62}" y="{cy + 29}" text-anchor="middle" class="wf-cell">{mod}</text>'
            )
        cells_block = "\n".join(cells)
        return f"""<svg width="420" height="206" viewBox="0 0 420 206" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .wf-hdr {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.6px; fill: #FFFFFF; }}
    .wf-cell {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.4px; fill: #111110; }}
    .wf-ftr {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.6px; fill: #656561; }}
  </style>
  <rect x="0.5" y="0.5" width="419" height="205" rx="0" fill="#FFFFFF" stroke="#111110" stroke-width="1" />
  <rect x="0" y="0" width="420" height="32" rx="0" fill="#111110" />
  <text x="14" y="20" class="wf-hdr">ERP // .NET 10 + SQL SERVER</text>
  <text x="406" y="20" text-anchor="end" class="wf-hdr">80 TABLES</text>

  <rect x="1" y="32" width="418" height="140" rx="0" fill="#F4F4F2" />
{cells_block}

  <line x1="1" y1="172" x2="419" y2="172" stroke="#111110" stroke-opacity="0.18" stroke-width="1" />
  <text x="14" y="193" class="wf-ftr">TENANT ISOLATION · EF CORE + DAPPER · AUDIT TRAIL</text>
</svg>
"""

    if pid == "pyrix":
        nav_items = ["COMPANIES", "SQL INSPECTOR", "WORKFLOWS", "AUDIT LOG"]
        nav_blocks: list[str] = []
        for idx, item in enumerate(nav_items):
            ny = 44 + idx * 30
            nav_blocks.append(
                f'  <rect x="14.5" y="{ny}.5" width="151" height="23" rx="0" fill="#FFFFFF" stroke="#111110" stroke-opacity="0.18" stroke-width="1" />\n'
                f'  <text x="24" y="{ny + 15.5}" class="wf-nav">{item}</text>'
            )

        status_rows = [
            ("SCHEMA_CHECK", "OK", 32),
            ("QUERY_CACHE", "ACTIVE", 54),
            ("SESSION_GUARD", "ON", 32),
        ]
        status_blocks: list[str] = []
        for idx, (label, badge_txt, badge_w) in enumerate(status_rows):
            ry = 44 + idx * 42
            bx = 396 - badge_w
            status_blocks.append(
                f'  <rect x="188.5" y="{ry}.5" width="217" height="31" rx="0" fill="#FFFFFF" stroke="#111110" stroke-opacity="0.22" stroke-width="1" />\n'
                f'  <text x="200" y="{ry + 19.5}" class="wf-row">{label}</text>\n'
                f'  <rect x="{bx}" y="{ry + 7}" width="{badge_w}" height="18" rx="0" fill="#111110" />\n'
                f'  <text x="{bx + badge_w / 2:.1f}" y="{ry + 19}" text-anchor="middle" class="wf-badge">{badge_txt}</text>'
            )

        return f"""<svg width="420" height="206" viewBox="0 0 420 206" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .wf-hdr {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.6px; fill: #FFFFFF; }}
    .wf-nav {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; font-weight: 500; fill: #3A3A38; }}
    .wf-row {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; font-weight: 500; fill: #3A3A38; }}
    .wf-badge {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 8px; font-weight: 700; fill: #FFFFFF; }}
    .wf-ftr {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.6px; fill: #656561; }}
  </style>
  <rect x="0.5" y="0.5" width="419" height="205" rx="0" fill="#FFFFFF" stroke="#111110" stroke-width="1" />
  <rect x="0" y="0" width="420" height="32" rx="0" fill="#111110" />
  <text x="14" y="20" class="wf-hdr">PYRIX // FASTAPI + ODBC 18</text>
  <text x="406" y="20" text-anchor="end" class="wf-hdr">TTL CACHE</text>

  <rect x="1" y="32" width="418" height="140" rx="0" fill="#F4F4F2" />
{chr(10).join(nav_blocks)}
  <line x1="176" y1="44" x2="176" y2="160" stroke="#111110" stroke-opacity="0.18" stroke-width="1" />
{chr(10).join(status_blocks)}

  <line x1="1" y1="172" x2="419" y2="172" stroke="#111110" stroke-opacity="0.18" stroke-width="1" />
  <text x="14" y="193" class="wf-ftr">MULTI-COMPANY OPS · DYNAMIC TABLES &amp; FORMS</text>
</svg>
"""

    name = xml_escape(_truncate(project["name"], 38))
    tagline = xml_escape(_truncate(project["tagline"], 56))
    slug = xml_escape(f"{index:02d} // {project['id'].upper()} ARCHITECTURE")
    stack: list[str] = list(project.get("tech_stack", []))[:4]
    pills_parts: list[str] = []
    px = 0
    for tech in stack:
        pw = max(62, int(len(tech) * 6.5) + 18)
        if px + pw > 392:
            break
        pills_parts.append(
            f'    <g transform="translate({px}, 0)">\n'
            f'      <rect x="0.5" y="0.5" width="{pw - 1}" height="21" rx="0" fill="#FFFFFF" stroke="#111110" stroke-opacity="0.25" stroke-width="1" />\n'
            f'      <text x="{pw / 2:.1f}" y="14" text-anchor="middle" class="wf-pill">{xml_escape(tech)}</text>\n'
            f'    </g>'
        )
        px += pw + 8

    return f"""<svg width="420" height="206" viewBox="0 0 420 206" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .wf-hdr {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.6px; fill: #FFFFFF; }}
    .wf-title {{ font-family: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 16px; font-weight: 700; fill: #111110; }}
    .wf-tag {{ font-family: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 11px; fill: #656561; }}
    .wf-pill {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; font-weight: 600; fill: #111110; }}
    .wf-ftr {{ font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; font-weight: 500; letter-spacing: 0.6px; fill: #656561; }}
  </style>
  <rect x="0.5" y="0.5" width="419" height="205" rx="0" fill="#FFFFFF" stroke="#111110" stroke-width="1" />
  <rect x="0" y="0" width="420" height="32" rx="0" fill="#111110" />
  <text x="14" y="20" class="wf-hdr">{slug}</text>

  <rect x="1" y="32" width="418" height="140" rx="0" fill="#F4F4F2" />
  <text x="16" y="70" class="wf-title">{name}</text>
  <text x="16" y="94" class="wf-tag">{tagline}</text>
  <g transform="translate(16, 124)">
{chr(10).join(pills_parts)}
  </g>

  <line x1="1" y1="172" x2="419" y2="172" stroke="#111110" stroke-opacity="0.18" stroke-width="1" />
  <text x="14" y="193" class="wf-ftr">SYSTEM ARCHITECTURE</text>
</svg>
"""


NAV_ITEMS: tuple[dict[str, str], ...] = (
    {
        "filename": "assets/icons/nav-about.svg",
        "href": "#about-me",
        "label": "About",
        "accent": "#111110",
        "icon": '<circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />',
    },
    {
        "filename": "assets/icons/nav-skills.svg",
        "href": "#technical-skills",
        "label": "Skills",
        "accent": "#111110",
        "icon": '<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />',
    },
    {
        "filename": "assets/icons/nav-projects.svg",
        "href": "#selected-work",
        "label": "Projects",
        "accent": "#111110",
        "icon": '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />',
    },
    {
        "filename": "assets/icons/nav-credentials.svg",
        "href": "#verified-credentials",
        "label": "Credentials",
        "accent": "#111110",
        "icon": '<circle cx="12" cy="9" r="6" /><path d="M8.5 14l-1.5 7 5-2.5 5 2.5-1.5-7" />',
    },
    {
        "filename": "assets/icons/nav-activity.svg",
        "href": "#github-activity",
        "label": "Activity",
        "accent": "#111110",
        "icon": '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />',
    },
    {
        "filename": "assets/icons/nav-career.svg",
        "href": "#career--education",
        "label": "Career",
        "accent": "#111110",
        "icon": '<rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
    },
)


CONTACT_PILL_SPECS: dict[str, dict[str, str]] = {
    "linkedin": {
        "filename": "assets/icons/contact-linkedin.svg",
        "label": "linkedin",
    },
    "credly": {
        "filename": "assets/icons/contact-credly.svg",
        "label": "credly",
    },
    "email": {
        "filename": "assets/icons/contact-email.svg",
        "label": "email",
    },
    "github": {
        "filename": "assets/icons/contact-github.svg",
        "label": "github",
    },
    "portfolio": {
        "filename": "assets/icons/contact-portfolio.svg",
        "label": "portfolio",
    },
}


def render_contact_pill_svg(spec: dict[str, str]) -> str:
    """Render an exact Koval Swiss Monochrome [ / | label ] split chip SVG."""
    label = xml_escape(spec["label"].lower())
    width = max(84, int(24 + len(spec["label"]) * 7.2 + 24))
    return f"""<svg width="{width}" height="28" viewBox="0 0 {width} 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="{width - 1}" height="27" rx="0" fill="#FFFFFF" stroke="#111110" stroke-width="1" />
  <rect x="0" y="0" width="24" height="28" rx="0" fill="#111110" />
  <text x="12" y="18" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="11.5" font-weight="600" fill="#FFFFFF">/</text>
  <text x="34" y="18" font-family="IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="11" font-weight="600" fill="#111110">{label}</text>
</svg>
"""


def render_nav_pill_svg(item: dict[str, str]) -> str:
    """Render an exact Koval Swiss Monochrome [ / | label ] navigation chip SVG."""
    label = xml_escape(item["label"].lower())
    width = max(80, int(22 + len(label) * 7.0 + 22))
    return f"""<svg width="{width}" height="26" viewBox="0 0 {width} 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="{width - 1}" height="25" rx="0" fill="#FFFFFF" stroke="#111110" stroke-width="1" />
  <rect x="0" y="0" width="22" height="26" rx="0" fill="#111110" />
  <text x="11" y="17" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="11" font-weight="600" fill="#FFFFFF">/</text>
  <text x="32" y="17" font-family="IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="10.5" font-weight="600" fill="#111110">{label}</text>
</svg>
"""


def render_career_status_svg(career: dict[str, Any]) -> str:
    """Render crisp Swiss Monochrome status split chip SVG."""
    label = "OPEN TO OPPORTUNITIES" if career.get("available_for_hire") else "FOCUSED ON PROJECTS"
    width = 216 if career.get("available_for_hire") else 204
    return f"""<svg width="{width}" height="28" viewBox="0 0 {width} 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="{width - 1}" height="27" rx="0" fill="#FFFFFF" stroke="#111110" stroke-width="1" />
  <rect x="0" y="0" width="26" height="28" rx="0" fill="#111110" />
  <circle cx="13" cy="14" r="3.5" fill="#FFFFFF" />
  <text x="36" y="18" font-family="IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="10.5" font-weight="600" letter-spacing="0.6" fill="#111110">{label}</text>
</svg>
"""


def render_cert_badge_svg(cert: dict[str, Any]) -> str:
    """Render a borderless transparent monochrome verification seal SVG for a certification."""
    if "microsoft" in str(cert.get("id", "")).lower():
        return """<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="90" cy="90" r="82" stroke="#111110" stroke-width="2.5" />
  <circle cx="90" cy="90" r="74" stroke="#111110" stroke-opacity="0.25" stroke-width="1" />
  <text x="90" y="34" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="9.5" font-weight="600" letter-spacing="1.6" fill="#111110">MICROSOFT</text>
  <rect x="69" y="48" width="19" height="19" fill="#F25022" />
  <rect x="92" y="48" width="19" height="19" fill="#7FBA00" />
  <rect x="69" y="71" width="19" height="19" fill="#00A4EF" />
  <rect x="92" y="71" width="19" height="19" fill="#FFB900" />
  <text x="90" y="116" text-anchor="middle" font-family="Instrument Sans, ui-sans-serif, sans-serif" font-size="14" font-weight="700" fill="#111110">Foundational C#</text>
  <text x="90" y="133" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="9.5" font-weight="500" fill="#656561">C# · .NET · FCC</text>
  <text x="90" y="154" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="8.5" font-weight="600" letter-spacing="1.2" fill="#111110">FEB 2025</text>
</svg>
"""

    issuer_short = xml_escape(_truncate(cert["issuer"].upper(), 16))
    monogram = xml_escape("".join(w[0].upper() for w in cert["issuer"].split()[:2]) or "ID")
    name_short = xml_escape(_truncate(cert["name"], 20))
    date_short = xml_escape(_truncate(str(cert.get("issue_date") or cert["status"]).upper(), 16))

    return f"""<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="90" cy="90" r="82" stroke="#111110" stroke-width="2.5" />
  <circle cx="90" cy="90" r="74" stroke="#111110" stroke-opacity="0.25" stroke-width="1" />
  <text x="90" y="38" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="9" font-weight="600" letter-spacing="1.4" fill="#111110">{issuer_short}</text>
  <line x1="50" y1="49" x2="130" y2="49" stroke="#111110" stroke-opacity="0.25" stroke-width="1" />
  <text x="90" y="88" text-anchor="middle" font-family="Instrument Sans, ui-sans-serif, sans-serif" font-size="34" font-weight="700" fill="#111110">{monogram}</text>
  <text x="90" y="118" text-anchor="middle" font-family="Instrument Sans, ui-sans-serif, sans-serif" font-size="11.5" font-weight="700" fill="#111110">{name_short}</text>
  <text x="90" y="148" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="8.5" font-weight="600" letter-spacing="1.2" fill="#656561">{date_short}</text>
</svg>
"""


def _versioned_asset(rel_path: str, asset_versions: dict[str, str] | None) -> str:
    """Append deterministic content-hash query param so GitHub Camo CDN serves updated SVGs immediately."""
    if not asset_versions:
        return rel_path
    digest = asset_versions.get(rel_path)
    return f"{rel_path}?v={digest}" if digest else rel_path


def render_readme_markdown(
    profile: dict[str, Any],
    career: dict[str, Any],
    experience: dict[str, Any],
    skills: dict[str, list[dict[str, Any]]],
    projects: list[dict[str, Any]],
    certifications: list[dict[str, Any]],
    education: list[dict[str, Any]],
    achievements: list[dict[str, Any]],
    asset_versions: dict[str, str] | None = None,
) -> str:
    """Assemble the complete GitHub Profile README.md strictly from verified data."""
    username = profile["username"]
    contact = profile["contact"]

    # Contact badges (never output broken '#' placeholders)
    contact_badges: list[str] = []
    for key, label in (("linkedin", "LinkedIn"), ("credly", "Credly")):
        if contact.get(key):
            src = _versioned_asset(CONTACT_PILL_SPECS[key]["filename"], asset_versions)
            contact_badges.append(
                f'<a href="{contact[key]}"><img src="{src}" alt="{label}" /></a>'
            )
    if contact.get("show_email") and contact.get("email"):
        src = _versioned_asset(CONTACT_PILL_SPECS["email"]["filename"], asset_versions)
        contact_badges.append(
            f'<a href="mailto:{contact["email"]}"><img src="{src}" alt="Email" /></a>'
        )
    for key, label in (("github", "GitHub"), ("portfolio", "Portfolio")):
        if contact.get(key):
            src = _versioned_asset(CONTACT_PILL_SPECS[key]["filename"], asset_versions)
            contact_badges.append(
                f'<a href="{contact[key]}"><img src="{src}" alt="{label}" /></a>'
            )

    contact_html = "\n  &nbsp;\n  ".join(contact_badges)

    # About Me paragraphs
    summary_paragraphs = "\n\n".join(profile["summary"])

    # Technical Skills section (compact reference inside collapsible block)
    skills_rows: list[str] = []
    for cat in ("Database", "Programming", "Reporting", "IT Support", "Other"):
        cat_items = skills.get(cat, [])
        if not cat_items:
            continue
        techs_inline = " · ".join(f"`{s['name']}`" for s in cat_items)
        focus_summary = " · ".join(f"**{s['name']}** ({s['focus']})" for s in cat_items)
        skills_rows.append(f"| **{cat}** | {techs_inline} | {focus_summary} |")
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
    <img src="{_versioned_asset(proj['image_path'], asset_versions)}" alt="{proj['name']} Preview" width="100%" />
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

    cert_badge_tags: list[str] = []
    for cert in verified_certs:
        badge_path = cert.get("badge_path", "")
        if not badge_path:
            continue
        size_attr = "" if badge_path.lower().endswith(".svg") else ' height="112"'
        img_tag = f'<img src="{_versioned_asset(badge_path, asset_versions)}" alt="{cert["name"]}"{size_attr} />'
        if cert.get("credential_url"):
            cert_badge_tags.append(f'<a href="{cert["credential_url"]}">{img_tag}</a>')
        else:
            cert_badge_tags.append(img_tag)
    cert_badges_html = (
        "<p>\n  " + "\n  &nbsp;&nbsp;\n  ".join(cert_badge_tags) + "\n</p>\n"
        if cert_badge_tags
        else ""
    )

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

    return f"""<!-- AUTO-GENERATED FILE: DO NOT EDIT MANUALLY.
     Source of truth: profile-data/*.json
     Generator: python scripts/generate_readme.py -->

<div align="center">
  <img src="{_versioned_asset('assets/banner/hero-banner.svg', asset_versions)}" alt="{profile['name']} - {profile['headline']}" width="100%" />
</div>

<br/>

<div align="center">

<p>
  {contact_html}
</p>

<p>
  {'\n  &nbsp;\n  '.join(f'<a href="{item["href"]}"><img src="{_versioned_asset(item["filename"], asset_versions)}" alt="{item["label"]}" /></a>' for item in NAV_ITEMS)}
</p>

</div>

---

## About Me

{summary_paragraphs}

<br/>

<div align="center">
  <img src="{_versioned_asset('assets/profile/about-terminal.svg', asset_versions)}" alt="Engineering Pillars and Experience Terminal ({experience['years_of_experience']})" width="100%" />
</div>

---

## Technical Skills

<div align="center">
  <img src="{_versioned_asset('assets/profile/skills-matrix.svg', asset_versions)}" alt="Technical Skills Matrix" width="100%" />
</div>

<details>
<summary><code>$ cat skills_index.md</code> — Structured Skill Reference</summary>

| Category | Technologies | Core Focus |
| :--- | :--- | :--- |
{skills_table}

</details>

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
  <img src="{_versioned_asset('assets/profile/github-telemetry.svg', asset_versions)}" alt="Verified GitHub Activity and Codebase Telemetry" width="100%" />
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
  <img src="{_versioned_asset('assets/icons/career-status.svg', asset_versions)}" alt="Career Status: {career['status']}" />
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


CREDENTIAL_STAMPS: dict[str, tuple[str, str]] = {
    "ibm-databases-sql": ("ISSUER // IBM", "IBM / SQL"),
    "google-it-support": ("ISSUER // GOOGLE", "G / IT-OPS"),
    "microsoft-freecodecamp-csharp": ("ISSUER // MICROSOFT", "MS / C#"),
}


def render_readme_markdown_website(
    profile: dict[str, Any],
    career: dict[str, Any],
    experience: dict[str, Any],
    skills: dict[str, list[dict[str, Any]]],
    projects: list[dict[str, Any]],
    certifications: list[dict[str, Any]],
    education: list[dict[str, Any]],
    achievements: list[dict[str, Any]],
    github_metrics: dict[str, Any],
    ai_skill_count: int,
    asset_versions: dict[str, str] | None = None,
) -> str:
    """Assemble a Swiss Monochrome website-matched GitHub Profile README strictly from verified data."""
    username = profile["username"]
    contact = profile["contact"]
    live_url = f"https://{username}.github.io/{username}/"
    location_short = profile["location"].split(",")[0].upper()

    # Contact Koval chips (never output broken '#' placeholders)
    contact_badges: list[str] = []
    for key, label in (("linkedin", "LinkedIn"), ("credly", "Credly")):
        if contact.get(key):
            src = _versioned_asset(CONTACT_PILL_SPECS[key]["filename"], asset_versions)
            contact_badges.append(
                f'<a href="{contact[key]}"><img src="{src}" alt="{label}" /></a>'
            )
    if contact.get("show_email") and contact.get("email"):
        src = _versioned_asset(CONTACT_PILL_SPECS["email"]["filename"], asset_versions)
        contact_badges.append(
            f'<a href="mailto:{contact["email"]}"><img src="{src}" alt="Email" /></a>'
        )
    for key, label in (("github", "GitHub"), ("portfolio", "Portfolio")):
        if contact.get(key):
            src = _versioned_asset(CONTACT_PILL_SPECS[key]["filename"], asset_versions)
            contact_badges.append(
                f'<a href="{contact[key]}"><img src="{src}" alt="{label}" /></a>'
            )
    contact_html = "\n    &nbsp;\n    ".join(contact_badges)

    contact_text: list[str] = []
    for key, label in (("linkedin", "LinkedIn"), ("github", "GitHub"), ("credly", "Credly")):
        if contact.get(key):
            contact_text.append(f'<a href="{contact[key]}">{label}</a>')
    contact_text.append(f'<a href="{live_url}">Live website</a>')
    contact_text_html = " &nbsp;·&nbsp; ".join(contact_text)

    summary_paragraphs = "\n\n".join(profile["summary"])

    # Verified data selections
    featured_projects = [p for p in projects if p.get("featured") and p.get("verified")]
    verified_certs = [
        c for c in certifications if c.get("verified") and c.get("category") == "certification"
    ]
    verified_courses = [
        c for c in certifications if c.get("verified") and c.get("category") == "course"
    ]
    verified_edu = [e for e in education if e.get("verified")]
    verified_achievements = [a for a in achievements if a.get("verified")]

    total_bytes = sum((github_metrics.get("language_bytes") or {}).values())
    codebase_mb = f"{total_bytes / (1024 * 1024):.2f} MB"

    # Selected work cards with Swiss Monochrome wireframes
    project_cells: list[str] = []
    for idx, proj in enumerate(featured_projects, start=1):
        stack = " · ".join(proj.get("tech_stack", [])[:5])
        image = ""
        if proj.get("image_path"):
            image = (
                f'<a href="{proj["repo_url"]}"><img src="'
                f'{_versioned_asset(proj["image_path"], asset_versions)}" '
                f'alt="{xml_escape(proj["name"])} Preview" width="100%" /></a>'
            )
        project_cells.append(
            f"""<td width="50%" valign="top">
  <sub>{idx:02d} · {xml_escape(proj['category'].upper())}</sub><br/>
  <b>{xml_escape(proj['name'])}</b><br/><br/>
  {image}
  <p>{xml_escape(proj['tagline'])}</p>
  <p><sub>{xml_escape(stack)}</sub></p>
  <a href="{live_url}#work"><b>/ inspect</b></a> &nbsp;·&nbsp; <a href="{proj['repo_url']}"><b>/ github</b></a>
</td>"""
        )
    projects_table = "\n".join(project_cells)

    # Credential Option 1 Stamp Plates (Row 1) + Borderless High-Res Badges Below (Row 2)
    cert_card_cells: list[str] = []
    cert_badge_cells: list[str] = []
    for idx, cert in enumerate(verified_certs, start=1):
        issuer_tag, stamp_label = CREDENTIAL_STAMPS.get(
            str(cert.get("id", "")).lower(),
            (f"ISSUER // {cert['issuer'].upper()}", cert["issuer"].upper()),
        )
        verify = (
            f'<a href="{cert["credential_url"]}"><b>/ verify</b></a>'
            if cert.get("credential_url")
            else ""
        )
        cert_card_cells.append(
            f"""<td align="center" width="25%" valign="top">
  <sub>{xml_escape(issuer_tag)} · {idx:02d}</sub><br/>
  <b><code>{xml_escape(stamp_label)}</code></b><br/><br/>
  <sub>{xml_escape(cert['issuer'].upper())}</sub><br/>
  <b>{xml_escape(cert['name'])}</b><br/>
  <sub>{xml_escape(cert['issue_date'])}</sub><br/><br/>
  {verify}
</td>"""
        )

        badge_path = cert.get("badge_path", "")
        badge_html = ""
        if badge_path:
            img_tag = (
                f'<img src="{_versioned_asset(badge_path, asset_versions)}" '
                f'alt="{xml_escape(cert["name"])} badge" height="120" />'
            )
            badge_html = (
                f'<a href="{cert["credential_url"]}">{img_tag}</a>'
                if cert.get("credential_url")
                else img_tag
            )
        cert_badge_cells.append(
            f'<td align="center" width="25%" valign="middle">\n  {badge_html}\n</td>'
        )

    top_edu = verified_edu[0] if verified_edu else {}
    cgpa = str(top_edu.get("cgpa", "")).split(" / ")[0] or "3.56"
    pgdds_title = "PGDDS Data Science" if "PGDDS" in str(top_edu.get("degree", "")) else str(top_edu.get("degree", "PGDDS Data Science"))
    cert_card_cells.append(
        f"""<td align="center" width="25%" valign="top">
  <sub>UIU &amp; BITM · {len(verified_certs) + 1:02d}</sub><br/>
  <b><code>PGDDS · {xml_escape(cgpa)}</code></b><br/><br/>
  <sub>UIU &amp; BITM · 2024</sub><br/>
  <b>{xml_escape(pgdds_title)}</b><br/>
  <sub>{xml_escape(top_edu.get('year', ''))}</sub><br/><br/>
  <sub>PGDDS 102 A · 103 A</sub>
</td>"""
    )

    uiu_rel = "assets/certificates/uiu-pgdds-transparent.svg"
    if asset_versions and uiu_rel in asset_versions:
        uiu_badge_tag = (
            f'<a href="{live_url}#credentials">'
            f'<img src="{_versioned_asset(uiu_rel, asset_versions)}" '
            f'alt="UIU &amp; BITM PGDDS {xml_escape(cgpa)} Emblem" height="120" /></a>'
        )
    else:
        uiu_badge_tag = f"<b>{xml_escape(cgpa)}</b>"
    cert_badge_cells.append(
        f'<td align="center" width="25%" valign="middle">\n  {uiu_badge_tag}\n</td>'
    )

    credentials_cards_row = "\n".join(cert_card_cells)
    credentials_badges_row = "\n".join(cert_badge_cells)

    # Career & Education Ledgers
    experience_rows = "\n".join(
        f"| **{p['organization']}** | {p['role'].replace('|', '\\|')} | {p['period']} |"
        for p in experience.get("positions", [])
    )
    education_rows = "\n".join(
        f"| **{e['institution']}** | {e['degree']} | {e['year']} | {e.get('cgpa', '')} |"
        for e in verified_edu
    )
    endorsement_rows = "\n".join(
        f"> “{r['excerpt']}” — **{r['author']}**, {r['date']}"
        for r in experience.get("recommendations", [])
    )

    skills_rows: list[str] = []
    for cat in ("Database", "Programming", "Reporting", "IT Support", "Other"):
        cat_items = skills.get(cat, [])
        if not cat_items:
            continue
        techs_inline = " · ".join(f"`{s['name']}`" for s in cat_items)
        focus_summary = " · ".join(f"**{s['name']}** ({s['focus']})" for s in cat_items)
        skills_rows.append(f"| **{cat}** | {techs_inline} | {focus_summary} |")
    skills_table = "\n".join(skills_rows)

    course_rows = "\n".join(
        f"- **{c['name']}** — *{c['issuer']}* ({c['status']})  \n  *Focus:* {', '.join(c['skills_covered'])}"
        for c in verified_courses
    )
    achievement_rows = "\n".join(
        f"- **[{a['category']}] {a['title']}**: {a['description']}"
        for a in verified_achievements
    )

    target_roles = " · ".join(f"`{role}`" for role in career["career_interests"])
    focus_items = "\n".join(f"- {item}" for item in career["current_focus"])
    updates_rows = "\n".join(
        f"| `{u['date']}` | **{u['category']}** | {u['title']} |"
        for u in career["recent_updates"]
    )

    portrait_src = _versioned_asset("assets/identity/web/salman-rahman-portrait.jpg", asset_versions)
    email_block = (
        f'<a href="mailto:{contact["email"]}"><b>{contact["email"]}</b></a> &nbsp;·&nbsp; '
        if contact.get("show_email") and contact.get("email")
        else ""
    )

    return f"""<!-- AUTO-GENERATED FILE: DO NOT EDIT MANUALLY.
     Source of truth: profile-data/*.json
     Generator: python scripts/generate_readme.py -->
<!-- Swiss Monochrome Portfolio-Matched Profile: {live_url} -->

<div align="center">
  <img src="{_versioned_asset('assets/banner/hero-banner.svg', asset_versions)}" alt="{xml_escape(profile['name'])} - Built for data integrity." width="100%" />
</div>

<table width="100%">
<tr>
<td width="70%" valign="top">
  <sub>SQL &amp; ERP ENGINEER · AT {xml_escape(profile['organization'])} · {xml_escape(location_short)}</sub>
  <h1>{xml_escape(profile['name'])}.</h1>
  <p>{xml_escape(profile['short_bio'])}</p>
  <p>
    {contact_html}
  </p>
  <p>
    <a href="{live_url}"><img src="{_versioned_asset('assets/icons/career-status.svg', asset_versions)}" alt="Career Status: {xml_escape(career['status'])}" /></a>
  </p>
</td>
<td width="30%" align="center" valign="middle">
  <img src="{portrait_src}" width="180" alt="{xml_escape(profile['name'])}" />
</td>
</tr>
</table>

<table width="100%">
<tr>
<td align="center" width="25%"><b>{len(featured_projects):02d}</b><br/><sub>VERIFIED SYSTEMS</sub></td>
<td align="center" width="25%"><b>{len(verified_certs):02d}</b><br/><sub>BADGE CREDENTIALS</sub></td>
<td align="center" width="25%"><a href="{live_url}#skills-hub"><b>{ai_skill_count}</b><br/><sub>AI SKILLS HUB →</sub></a></td>
<td align="center" width="25%"><b>{codebase_mb}</b><br/><sub>GITHUB CODEBASE</sub></td>
</tr>
</table>

---

## Selected WORK.

<table width="100%">
<tr>
{projects_table}
</tr>
</table>

---

## Verified CREDENTIALS.

<table width="100%">
<tr>
{credentials_cards_row}
</tr>
<tr>
{credentials_badges_row}
</tr>
</table>

---

## Career &amp; EDUCATION.

### EXPERIENCE

| Organization | Role | Period |
| :--- | :--- | :--- |
{experience_rows}

### EDUCATION

| Institution | Qualification | Period | CGPA |
| :--- | :--- | :--- | :--- |
{education_rows}

### ENDORSEMENTS

{endorsement_rows}

### ECOSYSTEM HUB

Browse all **{ai_skill_count}** audited AI agent skills &amp; orchestrators — <a href="{live_url}"><b>Open AI Skills Hub →</b></a>

---

<details>
<summary><code>$ cat about_engineering.md</code> — Engineering Summary, Pillars &amp; Career Focus</summary>

{summary_paragraphs}

<br/>

<div align="center">
  <img src="{_versioned_asset('assets/profile/about-terminal.svg', asset_versions)}" alt="Engineering Pillars and Experience ({xml_escape(experience['years_of_experience'])})" width="100%" />
</div>

- **Target Roles:** {target_roles}

**Current Focus:**
{focus_items}

**Key Achievements:**
{achievement_rows}

</details>

<details>
<summary><code>$ cat skills_matrix.md</code> — Technical Skills Reference</summary>

<br/>

<div align="center">
  <img src="{_versioned_asset('assets/profile/skills-matrix.svg', asset_versions)}" alt="Technical Skills Matrix" width="100%" />
</div>

| Category | Technologies | Core Focus |
| :--- | :--- | :--- |
{skills_table}

</details>

<details>
<summary><code>$ cat github_telemetry.md</code> — Codebase Telemetry, Training &amp; Updates</summary>

<br/>

<div align="center">
  <img src="{_versioned_asset('assets/profile/github-telemetry.svg', asset_versions)}" alt="Verified GitHub Activity and Codebase Telemetry" width="100%" />
</div>

**Professional Courses &amp; Continuous Learning:**
{course_rows}

| Period | Area | Update |
| :--- | :--- | :--- |
{updates_rows}

</details>

---

## Start with A MESSAGE.

{email_block}{contact_text_html}

---

<div align="center">
  <sub>Structured data in <code>profile-data/</code> · Synchronized with <a href="{live_url}">{live_url}</a> · <a href="ARCHITECTURE.md">Architecture</a></sub>
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
    # Tests use minimal temp fixtures without the AI skills hub; keep generation backward compatible.
    ai_registry_path = root_dir / "ai-skills" / "registry.json"
    ai_skill_count = 0
    if ai_registry_path.exists():
        ai_skill_count = len(_load_json(ai_registry_path).get("skills", []))

    banner_svg = render_hero_banner_svg(profile, career)
    about_svg = render_about_terminal_svg(profile, experience)
    skills_svg = render_skills_matrix_svg(skills)
    telemetry_svg = render_github_telemetry_svg(github_metrics, projects)

    outputs: dict[Path, str] = {
        root_dir / "assets/banner/hero-banner.svg": banner_svg,
        root_dir / "banner.svg": banner_svg,
        root_dir / "assets/profile/about-terminal.svg": about_svg,
        root_dir / "assets/profile/skills-matrix.svg": skills_svg,
        root_dir / "tech-matrix.svg": skills_svg,
        root_dir / "assets/profile/github-telemetry.svg": telemetry_svg,
        root_dir / "telemetry.svg": telemetry_svg,
        root_dir / "assets/icons/career-status.svg": render_career_status_svg(career),
    }

    for nav_item in NAV_ITEMS:
        outputs[root_dir / nav_item["filename"]] = render_nav_pill_svg(nav_item)

    contact = profile.get("contact", {})
    active_contacts = [
        key for key in ("linkedin", "credly", "github", "portfolio") if contact.get(key)
    ]
    if contact.get("show_email") and contact.get("email"):
        active_contacts.append("email")
    for key in active_contacts:
        spec = CONTACT_PILL_SPECS[key]
        outputs[root_dir / spec["filename"]] = render_contact_pill_svg(spec)

    verified_featured = [p for p in projects if p.get("featured") and p.get("verified")]
    for idx, proj in enumerate(verified_featured, start=1):
        if proj.get("image_path"):
            img_path = root_dir / proj["image_path"]
            if img_path.suffix.lower() == ".svg":
                outputs[img_path] = render_project_preview_svg(proj, idx)

    for cert in certifications:
        if cert.get("verified") and cert.get("badge_path"):
            badge_path = root_dir / cert["badge_path"]
            if badge_path.suffix.lower() == ".svg":
                outputs[badge_path] = render_cert_badge_svg(cert)

    asset_versions: dict[str, str] = {
        path.relative_to(root_dir).as_posix(): hashlib.sha256(
            content.replace("\r\n", "\n").encode("utf-8")
        ).hexdigest()[:8]
        for path, content in outputs.items()
    }
    for static_group in (projects, certifications):
        for entry in static_group:
            for field in ("image_path", "badge_path"):
                rel = entry.get(field, "")
                if rel and rel not in asset_versions:
                    static_file = root_dir / rel
                    if static_file.exists():
                        asset_versions[rel] = hashlib.sha256(
                            static_file.read_bytes()
                        ).hexdigest()[:8]

    for extra_static in (
        "assets/certificates/uiu-pgdds-transparent.svg",
        "assets/identity/web/salman-rahman-portrait.jpg",
    ):
        if extra_static not in asset_versions:
            static_file = root_dir / extra_static
            if static_file.exists():
                asset_versions[extra_static] = hashlib.sha256(
                    static_file.read_bytes()
                ).hexdigest()[:8]

    outputs[root_dir / "README.md"] = render_readme_markdown_website(
        profile=profile,
        career=career,
        experience=experience,
        skills=skills,
        projects=projects,
        certifications=certifications,
        education=education,
        achievements=achievements,
        github_metrics=github_metrics,
        ai_skill_count=ai_skill_count,
        asset_versions=asset_versions,
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
