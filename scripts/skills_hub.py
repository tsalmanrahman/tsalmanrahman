#!/usr/bin/env python3
"""Centralized AI Skills Hub validator, discovery tool, agent syncer, and platform exporter."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent

VALID_PRICING_TIERS = frozenset(
    {
        "free-open-source",
        "free-tier-limited",
        "freemium",
        "paid",
    }
)

VALID_SOURCE_TYPES = frozenset({"repo-authored", "local-verified"})

REQUIRED_SKILL_FIELDS = (
    "id",
    "name",
    "version",
    "domain",
    "summary",
    "license",
    "pricing_tier",
    "source_type",
    "skill_path",
    "install_command",
)

REQUIRED_AGENT_FIELDS = (
    "id",
    "name",
    "role",
    "status",
    "pricing_tier",
)

SECURITY_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    (
        "piped curl shell execution",
        re.compile(r"curl\s+[^\n|]*\|\s*(?:ba)?sh\b", re.IGNORECASE),
    ),
    (
        "piped wget shell execution",
        re.compile(r"wget\s+[^\n|]*\|\s*(?:ba)?sh\b", re.IGNORECASE),
    ),
    (
        "PowerShell Invoke-Expression",
        re.compile(r"\bInvoke-Expression\b", re.IGNORECASE),
    ),
    (
        "PowerShell iex alias",
        re.compile(r"\biex\b", re.IGNORECASE),
    ),
    (
        "destructive root deletion",
        re.compile(r"rm\s+-rf\s+/(?:\s|$)", re.IGNORECASE),
    ),
    (
        "hardcoded OpenAI-style key",
        re.compile(r"\bsk-[A-Za-z0-9]{16,}\b"),
    ),
    (
        "hardcoded GitHub PAT",
        re.compile(r"\bghp_[A-Za-z0-9]{20,}\b"),
    ),
    (
        "hardcoded Google API key",
        re.compile(r"\bAIza[0-9A-Za-z_-]{20,}\b"),
    ),
)


def _load_json(path: Path) -> Any:
    if not path.exists():
        raise FileNotFoundError(f"Missing required file: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _write_utf8_lf(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    normalized = text.replace("\r\n", "\n")
    path.write_bytes(normalized.encode("utf-8"))


def _parse_frontmatter(markdown_text: str) -> dict[str, str]:
    """Parse top-level YAML frontmatter keys using Python stdlib only."""
    lines = markdown_text.replace("\r\n", "\n").split("\n")
    if not lines or lines[0].strip() != "---":
        return {}

    end_idx: int | None = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            end_idx = idx
            break
    if end_idx is None:
        return {}

    fields: dict[str, str] = {}
    for line in lines[1:end_idx]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line[0].isspace():
            continue
        if ":" in line:
            key, val = line.split(":", 1)
            fields[key.strip()] = val.strip().strip('"').strip("'")
    return fields


def scan_security(root: Path) -> list[str]:
    """Scan skill markdown files and registry payloads for dangerous commands or tokens."""
    findings: list[str] = []

    library_dir = root / "ai-skills" / "library"
    if library_dir.exists():
        for md_file in sorted(library_dir.rglob("*.md")):
            content = md_file.read_text(encoding="utf-8")
            rel = md_file.relative_to(root).as_posix()
            for label, pattern in SECURITY_PATTERNS:
                if pattern.search(content):
                    findings.append(f"Security scan flagged {label} in {rel}")

    registry_path = root / "ai-skills" / "registry.json"
    if registry_path.exists():
        try:
            reg = _load_json(registry_path)
            skills = reg.get("skills", []) if isinstance(reg, dict) else []
            for skill in skills:
                if not isinstance(skill, dict):
                    continue
                sid = str(skill.get("id", "<unknown>"))
                for field_name in ("install_command", "summary", "pricing_notes"):
                    val = str(skill.get(field_name, ""))
                    for label, pattern in SECURITY_PATTERNS:
                        if pattern.search(val):
                            findings.append(
                                f"Security scan flagged {label} in registry skill '{sid}' ({field_name})"
                            )
        except Exception as exc:  # noqa: BLE001
            findings.append(f"Security scan could not parse ai-skills/registry.json: {exc}")

    return findings


def validate_hub(root: Path | None = None) -> list[str]:
    """Validate registry.json, agents.json, IDENTITY_LOCK.json, SKILL.md frontmatter, and security."""
    base = root or REPO_ROOT
    errors: list[str] = []

    agents_path = base / "ai-skills" / "agents.json"
    valid_agent_ids: set[str] = set()
    try:
        agents_payload = _load_json(agents_path)
        agents_list = agents_payload.get("agents") if isinstance(agents_payload, dict) else None
        if not isinstance(agents_list, list) or not agents_list:
            errors.append("ai-skills/agents.json: 'agents' must be a non-empty list.")
        else:
            for idx, agent in enumerate(agents_list):
                ctx = f"ai-skills/agents.json[{idx}]"
                if not isinstance(agent, dict):
                    errors.append(f"{ctx}: must be an object.")
                    continue
                for key in REQUIRED_AGENT_FIELDS:
                    val = agent.get(key)
                    if not isinstance(val, str) or not val.strip():
                        errors.append(f"{ctx}: '{key}' must be a non-empty string.")
                aid = agent.get("id")
                if isinstance(aid, str) and aid.strip():
                    if aid in valid_agent_ids:
                        errors.append(f"{ctx}: duplicate agent id '{aid}'.")
                    valid_agent_ids.add(aid)
                tier = agent.get("pricing_tier")
                if tier not in VALID_PRICING_TIERS:
                    errors.append(
                        f"{ctx}: invalid pricing_tier '{tier}' (must be one of {sorted(VALID_PRICING_TIERS)})."
                    )
                resps = agent.get("responsibilities")
                if not isinstance(resps, list) or not resps or not all(
                    isinstance(r, str) and r.strip() for r in resps
                ):
                    errors.append(f"{ctx}: 'responsibilities' must be a non-empty list of strings.")
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        errors.append(f"ai-skills/agents.json error: {exc}")

    registry_path = base / "ai-skills" / "registry.json"
    try:
        reg_payload = _load_json(registry_path)
        skills_list = reg_payload.get("skills") if isinstance(reg_payload, dict) else None
        if not isinstance(skills_list, list) or not skills_list:
            errors.append("ai-skills/registry.json: 'skills' must be a non-empty list.")
            skills_list = []

        seen_ids: set[str] = set()
        for idx, skill in enumerate(skills_list):
            ctx = f"ai-skills/registry.json.skills[{idx}]"
            if not isinstance(skill, dict):
                errors.append(f"{ctx}: must be an object.")
                continue
            for key in REQUIRED_SKILL_FIELDS:
                val = skill.get(key)
                if not isinstance(val, str) or not val.strip():
                    errors.append(f"{ctx}: '{key}' must be a non-empty string.")
            sid = skill.get("id")
            if isinstance(sid, str) and sid.strip():
                if sid in seen_ids:
                    errors.append(f"{ctx}: duplicate skill id '{sid}'.")
                seen_ids.add(sid)
            tier = skill.get("pricing_tier")
            if tier not in VALID_PRICING_TIERS:
                errors.append(
                    f"{ctx}: invalid pricing_tier '{tier}' (must be one of {sorted(VALID_PRICING_TIERS)})."
                )
            src_type = skill.get("source_type")
            if src_type not in VALID_SOURCE_TYPES:
                errors.append(
                    f"{ctx}: invalid source_type '{src_type}' (must be one of {sorted(VALID_SOURCE_TYPES)})."
                )

            compat = skill.get("compatible_agents")
            if not isinstance(compat, list) or not compat:
                errors.append(f"{ctx}: 'compatible_agents' must be a non-empty list.")
            elif valid_agent_ids:
                for ag in compat:
                    if ag not in valid_agent_ids:
                        errors.append(f"{ctx}: unknown compatible_agent '{ag}'.")

            if not isinstance(skill.get("dependencies"), list):
                errors.append(f"{ctx}: 'dependencies' must be a list.")

            if src_type == "repo-authored":
                rel_skill = skill.get("skill_path", "")
                skill_file = base / rel_skill
                if not skill_file.exists():
                    errors.append(f"{ctx}: missing repo-authored skill file '{rel_skill}'.")
                else:
                    fm = _parse_frontmatter(skill_file.read_text(encoding="utf-8"))
                    for req_fm in ("name", "description", "license", "metadata"):
                        if req_fm not in fm:
                            errors.append(
                                f"{ctx}: '{rel_skill}' YAML frontmatter missing required key '{req_fm}'."
                            )
                    if fm.get("name") and isinstance(sid, str) and fm["name"] != sid:
                        errors.append(
                            f"{ctx}: frontmatter name '{fm['name']}' does not match registry id '{sid}'."
                        )

        # Second pass: verify dependencies reference valid registered skill IDs
        for idx, skill in enumerate(skills_list):
            if not isinstance(skill, dict):
                continue
            deps = skill.get("dependencies")
            if isinstance(deps, list):
                for dep in deps:
                    if not isinstance(dep, str) or dep not in seen_ids:
                        errors.append(
                            f"ai-skills/registry.json.skills[{idx}]: unknown dependency '{dep}'."
                        )
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        errors.append(f"ai-skills/registry.json error: {exc}")

    # Identity Lock SHA-256 verification
    lock_path = base / "assets" / "identity" / "IDENTITY_LOCK.json"
    try:
        lock = _load_json(lock_path)
        if not isinstance(lock, dict):
            errors.append("assets/identity/IDENTITY_LOCK.json: root must be a JSON object.")
        else:
            if lock.get("identity_lock_enforced") is not True:
                errors.append("assets/identity/IDENTITY_LOCK.json: 'identity_lock_enforced' must be true.")
            orig_rel = str(lock.get("original_path", ""))
            web_rel = str(lock.get("web_path", ""))
            expected_sha = str(lock.get("sha256", "")).strip().lower()
            orig_file = base / orig_rel
            web_file = base / web_rel
            if not orig_rel or not orig_file.exists():
                errors.append(f"IDENTITY_LOCK: missing original portrait '{orig_rel}'.")
            else:
                actual_sha = hashlib.sha256(orig_file.read_bytes()).hexdigest().lower()
                if actual_sha != expected_sha:
                    errors.append(
                        f"IDENTITY_LOCK SHA-256 mismatch for '{orig_rel}': expected {expected_sha}, got {actual_sha}."
                    )
            if not web_rel or not web_file.exists():
                errors.append(f"IDENTITY_LOCK: missing web portrait '{web_rel}'.")
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        errors.append(f"assets/identity/IDENTITY_LOCK.json error: {exc}")

    errors.extend(scan_security(base))
    return errors


def discover_skills(
    root: Path | None = None,
    home_skills_dir: Path | None = None,
) -> dict[str, Any]:
    """Scan ~/.agents/skills and <root>/.opencode/skills and compare with ai-skills/registry.json."""
    base = root or REPO_ROOT
    global_dir = home_skills_dir or (Path.home() / ".agents" / "skills")
    opencode_dir = base / ".opencode" / "skills"

    def _scan_dir(target: Path) -> list[str]:
        if not target.exists():
            return []
        return sorted(
            d.name for d in target.iterdir() if d.is_dir() and (d / "SKILL.md").exists()
        )

    local_found = _scan_dir(global_dir)
    opencode_found = _scan_dir(opencode_dir)

    reg = _load_json(base / "ai-skills" / "registry.json")
    registered_ids = sorted(
        str(s["id"]) for s in reg.get("skills", []) if isinstance(s, dict) and s.get("id")
    )
    registered_set = set(registered_ids)
    registered_local = [s for s in local_found if s in registered_set]
    unregistered_local = [s for s in local_found if s not in registered_set]

    return {
        "global_skills_dir": str(global_dir),
        "opencode_skills_dir": str(opencode_dir),
        "global_discovered_count": len(local_found),
        "opencode_synced_count": len(opencode_found),
        "registered_total_count": len(registered_ids),
        "registered_local_matches": registered_local,
        "unregistered_local": unregistered_local,
        "opencode_synced_ids": opencode_found,
    }


def sync_agents(root: Path | None = None) -> list[str]:
    """Sync all repo-authored SKILL.md files from ai-skills/library/ to .opencode/skills/."""
    base = root or REPO_ROOT
    reg = _load_json(base / "ai-skills" / "registry.json")
    synced: list[str] = []

    for skill in reg.get("skills", []):
        if not isinstance(skill, dict):
            continue
        if skill.get("source_type") != "repo-authored":
            continue
        sid = str(skill["id"])
        src = base / str(skill["skill_path"])
        if not src.exists():
            raise FileNotFoundError(f"Cannot sync missing repo skill: {src}")
        dest = base / ".opencode" / "skills" / sid / "SKILL.md"
        _write_utf8_lf(dest, src.read_text(encoding="utf-8"))
        synced.append(sid)

    return sorted(synced)


def export_platform(root: Path | None = None) -> Path:
    """Bundle verified profile, identity lock, and AI skills data + copy public assets into platform/."""
    base = root or REPO_ROOT
    data_dir = base / "profile-data"

    bundle = {
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "profile": _load_json(data_dir / "profile.json"),
        "career": _load_json(data_dir / "career.json"),
        "experience": _load_json(data_dir / "experience.json"),
        "skills": _load_json(data_dir / "skills.json"),
        "projects": _load_json(data_dir / "projects.json"),
        "certifications": _load_json(data_dir / "certifications.json"),
        "education": _load_json(data_dir / "education.json"),
        "achievements": _load_json(data_dir / "achievements.json"),
        "github_metrics": _load_json(data_dir / "github_metrics.json"),
        "verification_status": _load_json(data_dir / "verification_status.json"),
        "identity_lock": _load_json(base / "assets" / "identity" / "IDENTITY_LOCK.json"),
        "ai_skills_registry": _load_json(base / "ai-skills" / "registry.json"),
        "ai_agents": _load_json(base / "ai-skills" / "agents.json"),
    }

    out_json = base / "platform" / "src" / "data" / "ecosystem.generated.json"
    _write_utf8_lf(out_json, json.dumps(bundle, indent=2, ensure_ascii=False) + "\n")

    public_assets = base / "platform" / "public" / "assets"
    identity_dest = public_assets / "identity" / "salman-rahman-portrait.jpg"
    identity_src = base / "assets" / "identity" / "web" / "salman-rahman-portrait.jpg"
    if identity_src.exists():
        identity_dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(identity_src, identity_dest)

    for folder_name in ("certificates", "projects"):
        src_dir = base / "assets" / folder_name
        dst_dir = public_assets / folder_name
        if src_dir.exists():
            dst_dir.mkdir(parents=True, exist_ok=True)
            for asset in src_dir.iterdir():
                if asset.is_file():
                    shutil.copy2(asset, dst_dir / asset.name)

    return out_json


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Centralized AI Skills Hub CLI (validate, discover, sync-agents, export-platform)."
    )
    parser.add_argument("--root", type=Path, default=REPO_ROOT, help="Repository root directory.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("validate", help="Validate skills hub, agents, Identity Lock, and security.")
    subparsers.add_parser("discover", help="Scan local shared skills directories vs. registry.json.")
    subparsers.add_parser("sync-agents", help="Sync repo-authored skills into .opencode/skills/.")
    subparsers.add_parser("export-platform", help="Generate unified JSON bundle & copy assets for platform/.")

    args = parser.parse_args(argv)
    root = args.root.resolve()

    if args.command == "validate":
        errors = validate_hub(root)
        if errors:
            print("[ERROR] AI Skills Hub validation failed:", file=sys.stderr)
            for err in errors:
                print(f"  - {err}", file=sys.stderr)
            return 1
        reg = _load_json(root / "ai-skills" / "registry.json")
        agents = _load_json(root / "ai-skills" / "agents.json")
        print(
            f"[OK] Validated {len(reg['skills'])} AI skills, {len(agents['agents'])} agents, "
            "Identity Lock SHA-256, and static security scan."
        )
        return 0

    if args.command == "discover":
        report = discover_skills(root)
        print(f"Global skills directory : {report['global_skills_dir']}")
        print(f"OpenCode skills dir     : {report['opencode_skills_dir']}")
        print(f"Discovered global skills: {report['global_discovered_count']}")
        print(f"Registered in hub       : {report['registered_total_count']}")
        print(f"Matched local in hub    : {len(report['registered_local_matches'])}")
        print(f"Synced to .opencode     : {report['opencode_synced_count']}")
        print(f"Additional local skills : {len(report['unregistered_local'])}")
        return 0

    if args.command == "sync-agents":
        synced = sync_agents(root)
        print(f"[OK] Synced {len(synced)} repo-authored skills to .opencode/skills/: {', '.join(synced)}")
        return 0

    if args.command == "export-platform":
        out_path = export_platform(root)
        print(f"[OK] Exported unified ecosystem bundle to {out_path}")
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
