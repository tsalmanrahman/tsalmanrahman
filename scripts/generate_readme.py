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
    """Render the Neo-Matrix Terminal HUD hero banner with subtle binary rain & laser sweep."""
    name = xml_escape(profile["name"].upper().replace(" ", "_"))
    headline = xml_escape(profile["headline"])
    banner = profile["banner"]
    status_label = xml_escape(
        "SYS::OPEN_TO_WORK" if career.get("available_for_hire") else "SYS::ACTIVE_BUILD"
    )
    tagline = xml_escape(_truncate(banner["tagline"], 96))
    pills: list[str] = list(banner["pills"])[:4]

    pills_svg_parts: list[str] = []
    cursor_x = 0
    for idx, pill in enumerate(pills, start=1):
        label = f"[{idx:02d}] {pill}"
        pill_width = max(132, int(len(label) * 6.4) + 22)
        if cursor_x + pill_width > 800:
            break
        pills_svg_parts.append(
            f'    <g transform="translate({cursor_x}, 0)">\n'
            f'      <rect width="{pill_width}" height="26" rx="5" fill="#09151a" stroke="#10b981" stroke-opacity="0.35" stroke-width="1" />\n'
            f'      <text x="{pill_width / 2:.1f}" y="16.5" text-anchor="middle" class="pill-text">{xml_escape(label)}</text>\n'
            f'    </g>'
        )
        cursor_x += pill_width + 10

    pills_block = "\n".join(pills_svg_parts)
    status_color = "#00ff9c" if career.get("available_for_hire") else "#38bdf8"
    name_cursor_x = 34 + int(len(f"> {name}") * 17.6) + 8

    return f"""<svg width="860" height="252" viewBox="0 0 860 252" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="mxGrid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#00ff9c" stroke-opacity="0.045" stroke-width="0.8" />
    </pattern>
    <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#03070b" />
      <stop offset="60%" stop-color="#061017" />
      <stop offset="100%" stop-color="#03070b" />
    </linearGradient>
    <linearGradient id="mxLaser" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00ff9c" stop-opacity="0" />
      <stop offset="50%" stop-color="#00ff9c" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
    </linearGradient>
    <clipPath id="mxClip">
      <rect x="0.5" y="0.5" width="859" height="251" rx="12" />
    </clipPath>
  </defs>

  <style>
    @keyframes rainA {{
      0% {{ transform: translateY(-48px); opacity: 0; }}
      20% {{ opacity: 0.28; }}
      80% {{ opacity: 0.22; }}
      100% {{ transform: translateY(180px); opacity: 0; }}
    }}
    @keyframes rainB {{
      0% {{ transform: translateY(-72px); opacity: 0; }}
      25% {{ opacity: 0.22; }}
      85% {{ opacity: 0.16; }}
      100% {{ transform: translateY(180px); opacity: 0; }}
    }}
    @keyframes laserMove {{
      0% {{ transform: translateX(-220px); }}
      100% {{ transform: translateX(920px); }}
    }}
    @keyframes pulseDot {{
      0% {{ transform: scale(1); opacity: 0.85; }}
      100% {{ transform: scale(2.3); opacity: 0; }}
    }}
    @keyframes blinkCur {{
      0%, 49% {{ opacity: 1; }}
      50%, 100% {{ opacity: 0; }}
    }}
    .rain-a {{ animation: rainA 5.2s linear infinite; }}
    .rain-b {{ animation: rainB 6.4s 1.4s linear infinite; }}
    .laser {{ animation: laserMove 4.6s ease-in-out infinite; }}
    .pulse {{ transform-box: fill-box; transform-origin: center; animation: pulseDot 2.1s ease-out infinite; }}
    .cur {{ animation: blinkCur 1s steps(1) infinite; }}
    .win-title {{ font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; fill: #6ee7b7; }}
    .cmd-prompt {{ font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11.5px; font-weight: 600; fill: #34d399; }}
    .hero-name {{ font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 29px; font-weight: 800; fill: #ecfdf5; letter-spacing: 0.5px; }}
    .hero-role {{ font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; font-weight: 600; fill: #00ff9c; }}
    .hero-desc {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; font-weight: 400; fill: #94a3b8; }}
    .status-text {{ font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10.5px; font-weight: 700; fill: {status_color}; letter-spacing: 0.7px; }}
    .pill-text {{ font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10.5px; font-weight: 600; fill: #a7f3d0; }}
  </style>

  <rect width="860" height="252" rx="12" fill="url(#heroBg)" />
  <rect width="860" height="252" rx="12" fill="url(#mxGrid)" />

  <g clip-path="url(#mxClip)">
    <g font-family="JetBrains Mono, ui-monospace, monospace" font-size="11" fill="#00ff9c" class="rain-a">
      <text x="712" y="40">0</text><text x="712" y="56">1</text><text x="712" y="72">1</text><text x="712" y="88">0</text><text x="712" y="104">1</text>
      <text x="752" y="18">1</text><text x="752" y="34">0</text><text x="752" y="50">1</text><text x="752" y="66">1</text><text x="752" y="82">0</text>
      <text x="794" y="48">1</text><text x="794" y="64">0</text><text x="794" y="80">0</text><text x="794" y="96">1</text>
    </g>
    <g font-family="JetBrains Mono, ui-monospace, monospace" font-size="11" fill="#10b981" class="rain-b">
      <text x="732" y="24">1</text><text x="732" y="40">0</text><text x="732" y="56">1</text><text x="732" y="72">1</text>
      <text x="774" y="32">0</text><text x="774" y="48">1</text><text x="774" y="64">0</text><text x="774" y="80">1</text>
      <text x="816" y="16">1</text><text x="816" y="32">1</text><text x="816" y="48">0</text><text x="816" y="64">1</text>
    </g>

    <rect x="0" y="0" width="860" height="34" fill="#081218" />
    <line x1="0" y1="34" x2="860" y2="34" stroke="#10b981" stroke-opacity="0.25" stroke-width="1" />
    <rect x="0" y="0.5" width="210" height="2" fill="url(#mxLaser)" class="laser" />

    <circle cx="22" cy="17" r="4.5" fill="#ef4444" />
    <circle cx="37" cy="17" r="4.5" fill="#f59e0b" />
    <circle cx="52" cy="17" r="4.5" fill="#10b981" />
    <text x="72" y="21" class="win-title">salman@db-core:~/tsalmanrahman — zsh</text>

    <circle cx="704" cy="17" r="4.5" fill="{status_color}" class="pulse" />
    <circle cx="704" cy="17" r="4" fill="{status_color}" />
    <text x="716" y="20.5" class="status-text">{status_label}</text>
  </g>

  <rect x="0.5" y="0.5" width="859" height="251" rx="11.5" stroke="#10b981" stroke-opacity="0.4" stroke-width="1" />

  <text x="34" y="64" class="cmd-prompt">$ ./whoami --stack=sql,erp,python,csharp</text>
  <text x="34" y="102" class="hero-name">&gt; {name}</text>
  <rect x="{name_cursor_x}" y="79" width="12" height="24" rx="1.5" fill="#00ff9c" class="cur" />

  <text x="34" y="132" class="hero-role">[{headline}]</text>
  <text x="34" y="160" class="hero-desc">{tagline}</text>

  <line x1="34" y1="182" x2="826" y2="182" stroke="#10b981" stroke-opacity="0.2" stroke-width="1" />

  <g transform="translate(34, 198)">
{pills_block}
  </g>
</svg>
"""


def render_about_terminal_svg(profile: dict[str, Any], experience: dict[str, Any]) -> str:
    """Render a dual-pane About & Engineering Pillars terminal HUD card."""
    pillars = list(profile.get("problem_solving_approach", []))[:4]
    highlights = list(experience.get("highlights", []))[:4]
    raw_years = str(experience.get("years_of_experience", "4+ Years"))
    short_years = xml_escape(raw_years.split("(")[0].strip() or raw_years)
    years = xml_escape(f"EXP: {short_years.upper()}")

    pillar_nodes: list[str] = []
    for idx, pillar in enumerate(pillars):
        py = 52 + idx * 54
        title = xml_escape(_truncate(pillar["pillar"], 36))
        desc = xml_escape(_truncate(pillar["description"], 54))
        pillar_nodes.append(
            f'  <g transform="translate(24, {py})">\n'
            f'    <rect width="386" height="46" rx="6" fill="#09131a" stroke="#10b981" stroke-opacity="0.22" />\n'
            f'    <text x="12" y="18" class="item-head">&gt; [{idx + 1:02d}] {title}</text>\n'
            f'    <text x="12" y="34" class="item-sub">{desc}</text>\n'
            f'  </g>'
        )

    exp_nodes: list[str] = []
    for idx, item in enumerate(highlights):
        ey = 52 + idx * 54
        area = xml_escape(_truncate(item["area"], 38))
        tools = xml_escape(" · ".join(list(item.get("tools", []))[:4]))
        exp_nodes.append(
            f'  <g transform="translate(450, {ey})">\n'
            f'    <rect width="386" height="46" rx="6" fill="#09131a" stroke="#38bdf8" stroke-opacity="0.22" />\n'
            f'    <text x="12" y="18" class="item-head-cyan">$ {area}</text>\n'
            f'    <text x="12" y="34" class="item-sub">{tools}</text>\n'
            f'  </g>'
        )

    left_block = "\n".join(pillar_nodes)
    right_block = "\n".join(exp_nodes)

    return f"""<svg width="860" height="284" viewBox="0 0 860 284" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="abtGrid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#00ff9c" stroke-opacity="0.035" stroke-width="0.8" />
    </pattern>
  </defs>
  <style>
    .pane-hdr {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.9px; fill: #00ff9c; }}
    .pane-hdr-c {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.9px; fill: #38bdf8; }}
    .exp-tag {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 9.5px; font-weight: 700; fill: #6ee7b7; }}
    .item-head {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; font-weight: 700; fill: #ecfdf5; }}
    .item-head-cyan {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; font-weight: 700; fill: #e0f2fe; }}
    .item-sub {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10px; fill: #94a3b8; }}
  </style>

  <rect width="860" height="284" rx="12" fill="#03070b" stroke="#10b981" stroke-opacity="0.3" stroke-width="1" />
  <rect width="860" height="284" rx="12" fill="url(#abtGrid)" />

  <text x="24" y="30" class="pane-hdr">[01] ./ENGINEERING_PILLARS</text>
  <text x="450" y="30" class="pane-hdr-c">[02] ./PRACTICAL_EXPERIENCE</text>
  <text x="836" y="30" text-anchor="end" class="exp-tag">{years}</text>

  <line x1="430" y1="20" x2="430" y2="266" stroke="#10b981" stroke-opacity="0.18" stroke-width="1" />

{left_block}
{right_block}
</svg>
"""


SKILL_ICON_SVGS: dict[str, str] = {
    "microsoft sql server": (
        '<g stroke="#F87171" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" fill="#F87171" fill-opacity="0.18" />'
        '<path d="M4.5 5.5v13c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-13" />'
        '<path d="M4.5 9.8c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />'
        '<path d="M4.5 14.2c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />'
        "</g>"
    ),
    "sql": (
        '<g stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<rect x="3" y="4" width="18" height="16" rx="2.5" fill="#38BDF8" fill-opacity="0.14" />'
        '<path d="M3 9.5h18" />'
        '<path d="M9.5 9.5v10.5" />'
        '<path d="M13 13.5h4.5M13 16.8h3" stroke="#7DD3FC" />'
        "</g>"
    ),
    "pl/sql": (
        '<g stroke="#FBBF24" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<ellipse cx="10" cy="6" rx="6" ry="2.4" fill="#FBBF24" fill-opacity="0.16" />'
        '<path d="M4 6v10.5c0 1.33 2.69 2.4 6 2.4 1.1 0 2.13-.12 3-.32" />'
        '<path d="M4 11.2c0 1.33 2.69 2.4 6 2.4 1.25 0 2.4-.15 3.35-.4" />'
        '<path d="M16 6v4.5" />'
        '<polygon points="17.8 11.2 13.6 16.8 16.7 16.8 15.6 21.5 20.6 15.4 17.4 15.4" fill="#FBBF24" stroke="none" />'
        "</g>"
    ),
    "python": (
        "<g>"
        '<path d="M11.8 2C7.9 2 8.2 3.7 8.2 3.7V5.9H12.5V6.6H5.9C3.9 6.6 2.8 8.1 2.8 10.8C2.8 13.5 3.8 15 5.9 15H7.6V12.8C7.6 10.7 9.1 9.8 11.2 9.8H15.2C17 9.8 18.2 8.7 18.2 6.8V3.7C18.2 3.7 18.4 2 11.8 2ZM9.7 3.2A.9.9 0 1 1 9.7 5A.9.9 0 1 1 9.7 3.2Z" fill="#4B8BBE" />'
        '<path d="M12.2 22C16.1 22 15.8 20.3 15.8 20.3V18.1H11.5V17.4H18.1C20.1 17.4 21.2 15.9 21.2 13.2C21.2 10.5 20.2 9 18.1 9H16.4V11.2C16.4 13.3 14.9 14.2 12.8 14.2H8.8C7 14.2 5.8 15.3 5.8 17.2V20.3C5.8 20.3 5.6 22 12.2 22ZM14.3 19A.9.9 0 1 1 14.3 20.8A.9.9 0 1 1 14.3 19Z" fill="#FFD43B" />'
        "</g>"
    ),
    "c#": (
        "<g>"
        '<polygon points="12 2.5 20.2 7.25 20.2 16.75 12 21.5 3.8 16.75 3.8 7.25" fill="#7C3AED" fill-opacity="0.35" stroke="#A78BFA" stroke-width="1.6" stroke-linejoin="round" />'
        '<path d="M12.4 9.5a3.5 3.5 0 1 0 0 5.0" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" fill="none" />'
        '<path d="M14.8 9.5l-.6 5M17.2 9.5l-.6 5M13.6 11.1h4.2M13.3 13.1h4.2" stroke="#DDD6FE" stroke-width="1.35" stroke-linecap="round" fill="none" />'
        "</g>"
    ),
    "crystal reports": (
        '<g stroke="#2DD4BF" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M6 3h8l4.5 4.5V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V4.5A1.5 1.5 0 0 1 6 3z" fill="#2DD4BF" fill-opacity="0.14" />'
        '<path d="M14 3v4.5h4.5" />'
        '<path d="M8.5 17v-3.5M11.5 17V11M14.5 17v-5" stroke="#5EEAD4" stroke-width="2" />'
        '<path d="M8 8.5h3.5" stroke="#5EEAD4" />'
        "</g>"
    ),
    "hardware & systems": (
        '<g stroke="#CBD5E1" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<rect x="6" y="6" width="12" height="12" rx="2" fill="#94A3B8" fill-opacity="0.2" />'
        '<rect x="9.5" y="9.5" width="5" height="5" rx="0.8" fill="#CBD5E1" fill-opacity="0.35" />'
        '<path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />'
        "</g>"
    ),
    "troubleshooting": (
        '<g stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="#38BDF8" fill-opacity="0.14" />'
        "</g>"
    ),
    "technical support": (
        '<g stroke="#60A5FA" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M4 14v-2a8 8 0 1 1 16 0v2" />'
        '<rect x="3" y="13" width="3.5" height="5" rx="1.5" fill="#60A5FA" fill-opacity="0.22" />'
        '<rect x="17.5" y="13" width="3.5" height="5" rx="1.5" fill="#60A5FA" fill-opacity="0.22" />'
        '<path d="M21 16v1.5a3 3 0 0 1-3 3h-3.5" />'
        "</g>"
    ),
    "data analysis": (
        '<g stroke="#34D399" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M4 20h16" />'
        '<rect x="5.5" y="13" width="3" height="4.5" rx="0.6" fill="#34D399" fill-opacity="0.3" />'
        '<rect x="10.5" y="10" width="3" height="7.5" rx="0.6" fill="#34D399" fill-opacity="0.3" />'
        '<rect x="15.5" y="6.5" width="3" height="11" rx="0.6" fill="#34D399" fill-opacity="0.3" />'
        '<path d="M5.5 9.5L10.5 6.5L15 8L19 4" stroke="#6EE7B7" />'
        '<polyline points="16.5 4 19 4 19 6.5" stroke="#6EE7B7" />'
        "</g>"
    ),
    "erp systems": (
        '<g stroke="#818CF8" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<rect x="9" y="3.5" width="6" height="4.5" rx="1" fill="#818CF8" fill-opacity="0.25" />'
        '<rect x="3" y="15.5" width="5" height="4.5" rx="1" fill="#818CF8" fill-opacity="0.25" />'
        '<rect x="9.5" y="15.5" width="5" height="4.5" rx="1" fill="#818CF8" fill-opacity="0.25" />'
        '<rect x="16" y="15.5" width="5" height="4.5" rx="1" fill="#818CF8" fill-opacity="0.25" />'
        '<path d="M12 8v3.5M5.5 15.5v-2.5h13v2.5M12 11.5v4" />'
        "</g>"
    ),
    "backend development": (
        '<g stroke="#38BDF8" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<path d="M8.5 5C6.8 5 6.5 6.2 6.5 7.5v2.2c0 1.1-.8 2-2 2.3 1.2.3 2 1.2 2 2.3v2.2c0 1.3.3 2.5 2 2.5" />'
        '<path d="M15.5 5c1.7 0 2 1.2 2 2.5v2.2c0 1.1.8 2 2 2.3-1.2.3-2 1.2-2 2.3v2.2c0 1.3-.3 2.5-2 2.5" />'
        '<path d="M13 8.5l-2 7" stroke="#7DD3FC" stroke-width="1.75" />'
        "</g>"
    ),
    "database design": (
        '<g stroke="#A78BFA" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">'
        '<rect x="3" y="4" width="8" height="6.5" rx="1.2" fill="#A78BFA" fill-opacity="0.22" />'
        '<rect x="13" y="13.5" width="8" height="6.5" rx="1.2" fill="#A78BFA" fill-opacity="0.22" />'
        '<path d="M11 7.2h4.5a1.5 1.5 0 0 1 1.5 1.5v4.8" />'
        '<path d="M7 10.5v4.8a1.5 1.5 0 0 0 1.5 1.5H13" stroke="#C4B5FD" stroke-opacity="0.7" />'
        '<circle cx="17" cy="13.5" r="1.2" fill="#A78BFA" stroke="none" />'
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
    '<g stroke="#E2E8F0" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none">'
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
    """Render the Neo-Matrix Terminal HUD technical skills matrix with tinted vector icon tiles."""
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
        cat_label = xml_escape(f"> [{cat_idx:02d}] {cat.upper().replace(' ', '_')}")
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
            color = xml_escape(skill.get("color", "#00ff9c"))
            icon_svg = _get_skill_icon_svg(skill)
            s_name = xml_escape(_truncate(skill["name"], 34 if cols < 3 else 23))
            subtitle_raw = f"{skill['role']} · {skill['focus']}" if cols == 1 else (skill["focus"] if cols == 2 else skill["role"])
            s_role = xml_escape(_truncate(subtitle_raw, 90 if cols == 1 else (58 if cols == 2 else 29)))

            blocks_svg.append(
                f'  <g transform="translate({x}, {y})">\n'
                f'    <rect width="{card_w}" height="{card_h}" rx="7" fill="#060d12" stroke="#10b981" stroke-opacity="0.24" stroke-width="1" />\n'
                f'    <rect x="12" y="11" width="36" height="36" rx="8" fill="{color}" fill-opacity="0.16" stroke="{color}" stroke-opacity="0.45" stroke-width="1" />\n'
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
    <pattern id="skGrid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#00ff9c" stroke-opacity="0.035" stroke-width="0.8" />
    </pattern>
  </defs>
  <style>
    .cat-title {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; fill: #00ff9c; }}
    .skill-name {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12.5px; font-weight: 700; fill: #ecfdf5; }}
    .skill-role {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10.5px; font-weight: 400; fill: #94a3b8; }}
  </style>

  <rect width="860" height="{total_height}" rx="12" fill="#03070b" stroke="#10b981" stroke-opacity="0.3" stroke-width="1" />
  <rect width="860" height="{total_height}" rx="12" fill="url(#skGrid)" />
{body}
</svg>
"""


def render_github_telemetry_svg(metrics: dict[str, Any], projects: list[dict[str, Any]]) -> str:
    """Render Neo-Matrix Telemetry Daemon SVG with radar pulse & animated language bars."""
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
        '    <text x="24" y="154" class="sub-label">ACTIVE_REPOSITORIES</text>'
    ]
    for idx, repo in enumerate(repos):
        box_y = 164 + idx * 27
        text_y = box_y + 15
        r_name = xml_escape(_truncate(str(repo.get("name", "")), 24))
        r_lang = xml_escape(str(repo.get("primary_language", "Code")))
        repo_lines.append(
            f'    <rect x="24" y="{box_y}" width="370" height="22" rx="5" fill="#09131a" stroke="#10b981" stroke-opacity="0.22" />\n'
            f'    <text x="34" y="{text_y}" class="repo-name">$ {r_name}</text>\n'
            f'    <text x="384" y="{text_y}" text-anchor="end" class="repo-lang">[{r_lang}]</text>'
        )
    repos_svg = "\n".join(repo_lines)

    lang_bytes: dict[str, int] = metrics.get("language_bytes", {})
    total_bytes = sum(v for v in lang_bytes.values() if isinstance(v, int) and v > 0)
    lang_colors = {
        "C#": "#a78bfa",
        "Python": "#00ff9c",
        "TSQL": "#f87171",
        "HTML": "#38bdf8",
        "JavaScript": "#facc15",
        "CSS": "#2dd4bf",
        "PowerShell": "#60a5fa",
        "Dockerfile": "#22d3ee",
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
            bar_w = max(8, int((pct / 100.0) * 370))
            y_label = 64 + idx * 34
            y_bar = y_label + 7
            kb = max(1, byte_val // 1024)
            color = lang_colors.get(lang_name, "#64748b")
            lang_bars.append(
                f'    <text x="24" y="{y_label}" class="metric-label">{xml_escape(lang_name)}</text>\n'
                f'    <text x="394" y="{y_label}" text-anchor="end" class="metric-val">{pct:.1f}% ({kb:,} KB)</text>\n'
                f'    <rect x="24" y="{y_bar}" width="370" height="6" rx="3" fill="#0f1e24" />\n'
                f'    <rect x="24" y="{y_bar}" width="{bar_w}" height="6" rx="3" fill="{color}" class="bar-grow" />'
            )
    else:
        lang_bars.append(
            '    <text x="24" y="110" class="metric-label">Language bytes unavailable (fallback active).</text>'
        )

    langs_svg = "\n".join(lang_bars)

    return f"""<svg width="860" height="278" viewBox="0 0 860 278" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    @keyframes barGrow {{
      0% {{ transform: scaleX(0); }}
      100% {{ transform: scaleX(1); }}
    }}
    @keyframes beacon {{
      0% {{ transform: scale(1); opacity: 0.85; }}
      100% {{ transform: scale(2.2); opacity: 0; }}
    }}
    .bar-grow {{ transform-box: fill-box; transform-origin: left center; animation: barGrow 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }}
    .beacon {{ transform-box: fill-box; transform-origin: center; animation: beacon 2.2s ease-out infinite; }}
    .panel-title {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; }}
    .stat-k {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; fill: #6ee7b7; }}
    .sub-label {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.7px; fill: #64748b; }}
    .stat-v {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11.5px; font-weight: 700; fill: #ecfdf5; }}
    .repo-name {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; font-weight: 600; fill: #e2e8f0; }}
    .repo-lang {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; fill: #00ff9c; }}
    .metric-label {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; font-weight: 600; fill: #e2e8f0; }}
    .metric-val {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; fill: #94a3b8; }}
    .footnote {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 9px; fill: #64748b; }}
  </style>

  <g transform="translate(0, 0)">
    <rect width="418" height="278" rx="12" fill="#03070b" stroke="#10b981" stroke-opacity="0.3" stroke-width="1" />
    <circle cx="24" cy="26" r="4" fill="#38bdf8" class="beacon" />
    <circle cx="24" cy="26" r="3.5" fill="#38bdf8" />
    <text x="36" y="30" fill="#38bdf8" class="panel-title">[01] ./GITHUB_PROFILE_DAEMON</text>

    <rect x="24" y="46" width="180" height="44" rx="6" fill="#060d12" stroke="#10b981" stroke-opacity="0.22" />
    <text x="34" y="63" class="stat-k">HANDLE</text>
    <text x="34" y="80" class="stat-v">@{username}</text>

    <rect x="214" y="46" width="180" height="44" rx="6" fill="#060d12" stroke="#10b981" stroke-opacity="0.22" />
    <text x="224" y="63" class="stat-k">REPOS (FEATURED)</text>
    <text x="224" y="80" class="stat-v">{public_repos} ({featured_count} Featured)</text>

    <rect x="24" y="98" width="180" height="36" rx="6" fill="#060d12" stroke="#10b981" stroke-opacity="0.22" />
    <text x="34" y="120" class="stat-k">SINCE {created_year} · FOLLOWERS: {followers}</text>

    <rect x="214" y="98" width="180" height="36" rx="6" fill="#060d12" stroke="#10b981" stroke-opacity="0.22" />
    <text x="224" y="120" class="stat-k">ORG: {company}</text>

{repos_svg}
    <text x="24" y="260" class="footnote">SOURCE: GITHUB_REST_API ({sync_status})</text>
  </g>

  <g transform="translate(442, 0)">
    <rect width="418" height="278" rx="12" fill="#03070b" stroke="#10b981" stroke-opacity="0.3" stroke-width="1" />
    <circle cx="24" cy="26" r="4" fill="#00ff9c" class="beacon" />
    <circle cx="24" cy="26" r="3.5" fill="#00ff9c" />
    <text x="36" y="30" fill="#00ff9c" class="panel-title">[02] ./CODEBASE_LANGUAGE_MIX</text>

{langs_svg}
    <text x="24" y="260" class="footnote">MEASURED BYTE COUNTS (NON-FORK REPOS)</text>
  </g>
</svg>
"""


def render_project_preview_svg(project: dict[str, Any], index: int = 1) -> str:
    """Render a Neo-Matrix Terminal deployment preview card SVG for a featured project."""
    name = xml_escape(_truncate(project["name"], 54))
    category = xml_escape(project["category"].upper())
    tagline = xml_escape(_truncate(project["tagline"], 90))
    slug = xml_escape(f"DEPLOY_{index:02d} // {project['id'].upper()}")
    accent = "#00ff9c" if index % 2 == 1 else "#38bdf8"
    stack: list[str] = list(project.get("tech_stack", []))[:6]

    pills_parts: list[str] = []
    px = 0
    for tech in stack:
        pw = max(68, int(len(tech) * 6.8) + 20)
        if px + pw > 756:
            break
        pills_parts.append(
            f'    <g transform="translate({px}, 0)">\n'
            f'      <rect width="{pw}" height="24" rx="5" fill="#09131a" stroke="#10b981" stroke-opacity="0.35" stroke-width="1" />\n'
            f'      <text x="{pw / 2:.1f}" y="15.5" text-anchor="middle" class="tech-pill">{xml_escape(tech)}</text>\n'
            f'    </g>'
        )
        px += pw + 10

    pills_block = "\n".join(pills_parts)
    repo_label = xml_escape(project["repo_url"].replace("https://", ""))

    return f"""<svg width="820" height="160" viewBox="0 0 820 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pSheen{index}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{accent}" stop-opacity="0" />
      <stop offset="50%" stop-color="{accent}" stop-opacity="0.75" />
      <stop offset="100%" stop-color="{accent}" stop-opacity="0" />
    </linearGradient>
    <clipPath id="pClip{index}"><rect width="820" height="160" rx="10" /></clipPath>
  </defs>
  <style>
    @keyframes pSweep{index} {{
      0% {{ transform: translateX(-200px); }}
      100% {{ transform: translateX(860px); }}
    }}
    .psweep{index} {{ animation: pSweep{index} 5s ease-in-out infinite; }}
    .proj-cat {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10.5px; font-weight: 700; fill: {accent}; letter-spacing: 0.9px; }}
    .proj-repo {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; fill: #6ee7b7; }}
    .proj-title {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 20px; font-weight: 800; fill: #ecfdf5; }}
    .proj-tag {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; fill: #94a3b8; }}
    .tech-pill {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; font-weight: 600; fill: #a7f3d0; }}
  </style>

  <rect width="820" height="160" rx="10" fill="#060d12" stroke="#10b981" stroke-opacity="0.3" stroke-width="1" />
  <g clip-path="url(#pClip{index})">
    <rect x="0" y="0" width="180" height="2" fill="url(#pSheen{index})" class="psweep{index}" />
    <rect x="0" y="0" width="4" height="160" fill="{accent}" />
  </g>

  <text x="28" y="30" class="proj-cat">&gt; {slug} · {category}</text>
  <text x="792" y="30" text-anchor="end" class="proj-repo">{repo_label} ↗</text>

  <text x="28" y="66" class="proj-title">{name}</text>
  <text x="28" y="90" class="proj-tag">{tagline}</text>

  <g transform="translate(28, 112)">
{pills_block}
  </g>
</svg>
"""


NAV_ITEMS: tuple[dict[str, str], ...] = (
    {
        "filename": "assets/icons/nav-about.svg",
        "href": "#about-me",
        "label": "About",
        "accent": "#38bdf8",
        "icon": '<circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />',
    },
    {
        "filename": "assets/icons/nav-skills.svg",
        "href": "#technical-skills",
        "label": "Skills",
        "accent": "#38bdf8",
        "icon": '<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />',
    },
    {
        "filename": "assets/icons/nav-projects.svg",
        "href": "#featured-projects",
        "label": "Projects",
        "accent": "#38bdf8",
        "icon": '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />',
    },
    {
        "filename": "assets/icons/nav-credentials.svg",
        "href": "#certifications--education",
        "label": "Credentials",
        "accent": "#38bdf8",
        "icon": '<circle cx="12" cy="9" r="6" /><path d="M8.5 14l-1.5 7 5-2.5 5 2.5-1.5-7" />',
    },
    {
        "filename": "assets/icons/nav-activity.svg",
        "href": "#github-activity",
        "label": "Activity",
        "accent": "#10b981",
        "icon": '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />',
    },
    {
        "filename": "assets/icons/nav-career.svg",
        "href": "#career-status",
        "label": "Career",
        "accent": "#10b981",
        "icon": '<rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
    },
)


CONTACT_PILL_SPECS: dict[str, dict[str, str]] = {
    "linkedin": {
        "filename": "assets/icons/contact-linkedin.svg",
        "label": "LinkedIn",
        "box_fill": "#0A66C2",
        "box_stroke": "#0A66C2",
        "icon": '<text x="18" y="21" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif" font-size="11.5" font-weight="800" fill="#ffffff">in</text>',
    },
    "credly": {
        "filename": "assets/icons/contact-credly.svg",
        "label": "Credly",
        "box_fill": "#EA580C",
        "box_stroke": "#EA580C",
        "icon": '<g transform="translate(10.5, 9.5) scale(0.625)" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="9" r="5.5" /><path d="M8.5 14l-1.5 7 5-2.5 5 2.5-1.5-7" /></g>',
    },
    "email": {
        "filename": "assets/icons/contact-email.svg",
        "label": "Email",
        "box_fill": "#0284C7",
        "box_stroke": "#0284C7",
        "icon": '<g transform="translate(10.5, 9.5) scale(0.625)" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></g>',
    },
    "github": {
        "filename": "assets/icons/contact-github.svg",
        "label": "GitHub",
        "box_fill": "#24292F",
        "box_stroke": "#475569",
        "icon": '<g transform="translate(11, 10) scale(0.583)" fill="#ffffff"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></g>',
    },
    "portfolio": {
        "filename": "assets/icons/contact-portfolio.svg",
        "label": "Portfolio",
        "box_fill": "#0F766E",
        "box_stroke": "#0F766E",
        "icon": '<g transform="translate(10.5, 9.5) scale(0.625)" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" /></g>',
    },
}


def render_contact_pill_svg(spec: dict[str, str]) -> str:
    """Render a Neo-Matrix Terminal HUD SVG contact pill with brand badge and arrow."""
    label = xml_escape(spec["label"])
    box_fill = xml_escape(spec["box_fill"])
    box_stroke = xml_escape(spec["box_stroke"])
    width = max(102, int(36 + len(spec["label"]) * 7.4 + 26))
    return f"""<svg width="{width}" height="34" viewBox="0 0 {width} 34" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="{width - 1}" height="33" rx="7" fill="#060d12" stroke="#10b981" stroke-opacity="0.4" stroke-width="1" />
  <rect x="8" y="7" width="20" height="20" rx="5" fill="{box_fill}" stroke="{box_stroke}" stroke-width="0.8" />
  {spec['icon']}
  <text x="36" y="21" font-family="JetBrains Mono, ui-monospace, monospace" font-size="11.5" font-weight="700" fill="#ecfdf5">{label}</text>
  <text x="{width - 11}" y="20.5" text-anchor="end" font-family="JetBrains Mono, ui-monospace, monospace" font-size="11" font-weight="700" fill="#00ff9c">↗</text>
</svg>
"""


def render_nav_pill_svg(item: dict[str, str]) -> str:
    """Render a Neo-Matrix Terminal HUD SVG navigation pill with icon and short label."""
    label = xml_escape(item["label"].upper())
    accent = "#00ff9c" if item["accent"] == "#10b981" else "#38bdf8"
    width = max(84, int(33 + len(label) * 6.9 + 16))
    return f"""<svg width="{width}" height="30" viewBox="0 0 {width} 30" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="{width - 1}" height="29" rx="6" fill="#060d12" stroke="#10b981" stroke-opacity="0.38" stroke-width="1" />
  <g transform="translate(10, 7) scale(0.667)" stroke="{accent}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="none">
    {item['icon']}
  </g>
  <text x="32" y="19" font-family="JetBrains Mono, ui-monospace, monospace" font-size="10.5" font-weight="700" fill="#d1fae5">{label}</text>
</svg>
"""


def render_career_status_svg(career: dict[str, Any]) -> str:
    """Render Neo-Matrix animated career status pill SVG."""
    label = "STATUS: OPEN_TO_OPPORTUNITIES" if career.get("available_for_hire") else "STATUS: FOCUSED_ON_PROJECTS"
    color = "#00ff9c" if career.get("available_for_hire") else "#38bdf8"
    width = 278 if career.get("available_for_hire") else 258
    return f"""<svg width="{width}" height="32" viewBox="0 0 {width} 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    @keyframes stPulse {{
      0% {{ transform: scale(1); opacity: 0.85; }}
      100% {{ transform: scale(2.2); opacity: 0; }}
    }}
    .st-p {{ transform-box: fill-box; transform-origin: center; animation: stPulse 2s ease-out infinite; }}
  </style>
  <rect x="0.5" y="0.5" width="{width - 1}" height="31" rx="6" fill="#060d12" stroke="{color}" stroke-opacity="0.45" stroke-width="1" />
  <circle cx="18" cy="16" r="4" fill="{color}" class="st-p" />
  <circle cx="18" cy="16" r="3.5" fill="{color}" />
  <text x="31" y="20" font-family="JetBrains Mono, ui-monospace, monospace" font-size="11" font-weight="700" fill="{color}">{label}</text>
</svg>
"""


def render_cert_badge_svg(cert: dict[str, Any]) -> str:
    """Render a crisp Neo-Matrix verification badge SVG card for a verified certification."""
    title = xml_escape(cert["name"])
    issuer_upper = xml_escape(cert["issuer"].upper())
    status = xml_escape(cert["status"])

    if "microsoft" in str(cert.get("id", "")).lower():
        issue_label = xml_escape(cert.get("issue_date") or cert["status"])
        if " with " in cert["name"]:
            top_line, rest_line = cert["name"].split(" with ", 1)
            line1 = xml_escape(top_line)
            line2 = xml_escape(f"with {rest_line}")
        else:
            line1 = title
            line2 = ""
        return f"""<svg width="336" height="112" viewBox="0 0 336 112" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .mc-issuer {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 9.5px; font-weight: 700; fill: #00ff9c; letter-spacing: 0.9px; }}
    .mc-title {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; font-weight: 800; fill: #ecfdf5; }}
    .mc-sub {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13.5px; font-weight: 600; fill: #cbd5e1; }}
    .mc-status {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; fill: #6ee7b7; font-weight: 600; }}
  </style>
  <rect x="0.5" y="0.5" width="335" height="111" rx="10" fill="#060d12" stroke="#10b981" stroke-opacity="0.4" stroke-width="1" />
  <rect x="18" y="20" width="72" height="72" rx="10" fill="#09151a" stroke="#10b981" stroke-opacity="0.3" stroke-width="1" />
  <rect x="37" y="30" width="16" height="16" rx="2" fill="#F25022" />
  <rect x="55" y="30" width="16" height="16" rx="2" fill="#7FBA00" />
  <rect x="37" y="48" width="16" height="16" rx="2" fill="#00A4EF" />
  <rect x="55" y="48" width="16" height="16" rx="2" fill="#FFB900" />
  <text x="54" y="81" text-anchor="middle" font-family="JetBrains Mono, ui-monospace, monospace" font-size="10.5" font-weight="800" fill="#A78BFA">C# · .NET</text>
  <text x="106" y="34" class="mc-issuer">&gt; {issuer_upper}</text>
  <text x="106" y="55" class="mc-title">{line1}</text>
  <text x="106" y="73" class="mc-sub">{line2}</text>
  <circle cx="110" cy="87.5" r="3.5" fill="#00ff9c" />
  <text x="119" y="91" class="mc-status">VERIFIED · {issue_label}</text>
</svg>
"""

    monogram = xml_escape("".join(w[0].upper() for w in cert["issuer"].split()[:2]) or "ID")

    return f"""<svg width="380" height="96" viewBox="0 0 380 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .c-issuer {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; font-weight: 700; fill: #00ff9c; letter-spacing: 0.9px; }}
    .c-name {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; font-weight: 700; fill: #ecfdf5; }}
    .c-status {{ font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10.5px; fill: #6ee7b7; font-weight: 600; }}
  </style>
  <rect width="380" height="96" rx="10" fill="#060d12" stroke="#10b981" stroke-opacity="0.35" stroke-width="1" />
  <rect x="16" y="22" width="52" height="52" rx="10" fill="#09151a" stroke="#10b981" stroke-opacity="0.35" />
  <text x="42" y="54" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="800" fill="#00ff9c">{monogram}</text>
  <text x="84" y="34" class="c-issuer">{issuer_upper}</text>
  <text x="84" y="55" class="c-name">{title}</text>
  <text x="84" y="73" class="c-status">VERIFIED: {status}</text>
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
    """Assemble a website-matched GitHub Profile README strictly from verified data."""
    username = profile["username"]
    contact = profile["contact"]
    live_url = f"https://{username}.github.io/{username}/"
    location_short = profile["location"].split(",")[0].upper()

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

    contact_text: list[str] = []
    for key, label in (("linkedin", "LinkedIn"), ("credly", "Credly")):
        if contact.get(key):
            contact_text.append(f'<a href="{contact[key]}">{label}</a>')
    if contact.get("show_email") and contact.get("email"):
        contact_text.append(f'<a href="mailto:{contact["email"]}">Email</a>')
    if contact.get("github"):
        contact_text.append(f'<a href="{contact["github"]}">GitHub</a>')
    contact_text.append(f'<a href="{live_url}">Live website</a>')
    contact_text_html = " · ".join(contact_text)

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

    # Selected work cards
    project_cells: list[str] = []
    for idx, proj in enumerate(featured_projects, start=1):
        stack = " · ".join(proj.get("tech_stack", []))
        image = ""
        if proj.get("image_path"):
            image = (
                f'<a href="{proj["repo_url"]}"><img src="'
                f'{_versioned_asset(proj["image_path"], asset_versions)}" '
                f'alt="{proj["name"]} Preview" width="100%" /></a>'
            )
        project_cells.append(
            f"""
<td width="50%" valign="top">
  <sub>{idx:02d} · {proj['category'].upper().replace('&', '&amp;')}</sub><br/>
  <b>{proj['name']}</b><br/>
  {image}
  <p>{proj['tagline']}</p>
  <p><sub>{stack}</sub></p>
  <a href="{proj['repo_url']}">/inspect</a> · <a href="{proj['repo_url']}">/github</a>
</td>"""
        )
    projects_table = "\n".join(project_cells)

    # Credential cards
    cert_cells: list[str] = []
    for cert in verified_certs:
        badge = ""
        badge_path = cert.get("badge_path", "")
        if badge_path:
            size_attr = "" if badge_path.lower().endswith(".svg") else ' height="112"'
            img_tag = (
                f'<img src="{_versioned_asset(badge_path, asset_versions)}" '
                f'alt="{cert["name"]}"{size_attr} />'
            )
            badge = (
                f'<a href="{cert["credential_url"]}">{img_tag}</a>'
                if cert.get("credential_url")
                else img_tag
            )
        verify = (
            f'<a href="{cert["credential_url"]}">/verify</a>'
            if cert.get("credential_url")
            else ""
        )
        cert_cells.append(
            f"""
<td align="center" width="25%" valign="top">
  {badge}<br/>
  <sub>{cert['issuer'].upper().replace('&', '&amp;')}</sub><br/>
  <b>{cert['name']}</b><br/>
  <sub>{cert['issue_date']}</sub><br/>
  {verify}
</td>"""
        )

    top_edu = verified_edu[0] if verified_edu else {}
    cgpa = str(top_edu.get("cgpa", "")).split(" / ")[0]
    cert_cells.append(
        f"""
<td align="center" width="25%" valign="top">
  <b>{cgpa}</b><br/>
  <sub>{top_edu.get('institution', '')}</sub><br/>
  <b>{top_edu.get('degree', '')}</b><br/>
  <sub>{top_edu.get('year', '')}</sub><br/>
  <a href="{live_url}#credentials">/audit</a>
</td>"""
    )
    credentials_table = "\n".join(cert_cells)

    # Ledgers
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

    return f"""<!-- AUTO-GENERATED FILE: DO NOT EDIT MANUALLY.
     Source of truth: profile-data/*.json
     Generator: python scripts/generate_readme.py -->
<!-- Website-matched profile README: {live_url} -->

<div align="center">
  <img src="assets/identity/web/salman-rahman-portrait.jpg" width="140" alt="{profile['name']}" />
  <h1>{profile['name']}.</h1>
  <p><b>SQL &amp; ERP ENGINEER</b><br/>AT {profile['organization']} · {location_short}</p>
  <p>{profile['short_bio'].replace('&', '&amp;')}</p>
  <p>
  {contact_html}
  </p>
  <p>{contact_text_html}</p>
</div>

<table align="center" cellpadding="12">
<tr>
<td align="center"><b>{len(featured_projects):02d}</b><br/><sub>VERIFIED SYSTEMS</sub></td>
<td align="center"><b>{len(verified_certs):02d}</b><br/><sub>BADGE CREDENTIALS</sub></td>
<td align="center"><b>{ai_skill_count}</b><br/><sub>AI SKILLS HUB →</sub></td>
<td align="center"><b>{codebase_mb}</b><br/><sub>GITHUB CODEBASE</sub></td>
</tr>
</table>

---

## About Me

{summary_paragraphs}

<br/>

<div align="center">
  <img src="{_versioned_asset('assets/profile/about-terminal.svg', asset_versions)}" alt="Engineering Pillars and Experience Terminal ({experience['years_of_experience']})" width="100%" />
</div>

---

## Selected WORK.

<table>
<tr>
{projects_table}
</tr>
</table>

---

## Verified CREDENTIALS.

<table>
<tr>
{credentials_table}
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

## ECOSYSTEM HUB.

Browse all **{ai_skill_count}** audited AI agent skills &amp; orchestrators.

<a href="{live_url}#skills-hub">Open AI Skills Hub →</a>

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

<details>
<summary><code>$ cat achievements.md</code> — Key Achievements</summary>

{achievement_rows}

</details>

<details>
<summary><code>$ cat continuous_learning.md</code> — Professional Courses</summary>

{course_rows}

</details>

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

## Start with A MESSAGE.

<a href="mailto:{contact['email']}">{contact['email']}</a> · <a href="mailto:{contact['email']}">Send email</a> · {contact_text_html}

---

<details>
<summary><code>$ cat profile_architecture_banner.svg</code> — Original Profile Banner</summary>

<div align="center">
  <img src="{_versioned_asset('assets/banner/hero-banner.svg', asset_versions)}" alt="{profile['name']} - {profile['headline']}" width="100%" />
</div>

</details>

<div align="center">
  <sub>Maintained through structured JSON data in <code>profile-data/</code> and automated via GitHub Actions • <a href="{live_url}">Live website</a> • <a href="ARCHITECTURE.md">Maintenance &amp; Automation Guide</a></sub>
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
    ai_registry = _load_json(root_dir / "ai-skills" / "registry.json")

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
        ai_skill_count=len(ai_registry.get("skills", [])),
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
