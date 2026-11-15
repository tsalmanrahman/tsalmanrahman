#!/usr/bin/env python3
"""Schema, asset, and external link validator for the GitHub profile ecosystem."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent

REQUIRED_DATA_FILES = (
    "profile.json",
    "career.json",
    "experience.json",
    "skills.json",
    "projects.json",
    "certifications.json",
    "education.json",
    "achievements.json",
    "github_metrics.json",
    "linkedin_sync.json",
)

REQUIRED_SKILL_CATEGORIES = (
    "Database",
    "Programming",
    "Reporting",
    "IT Support",
    "Other",
)

FORBIDDEN_METRIC_KEYS = {
    "percentage",
    "percent",
    "score",
    "proficiency_pct",
    "rating",
    "level_pct",
}


class ValidationError(Exception):
    """Raised when profile data, assets, or links fail validation."""


def load_json(path: Path) -> Any:
    """Load and parse a UTF-8 JSON file."""
    if not path.exists():
        raise ValidationError(f"Missing required data file: {path}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValidationError(f"Invalid JSON in {path}: {exc}") from exc


def _require_non_empty_str(obj: dict[str, Any], key: str, ctx: str) -> str:
    val = obj.get(key)
    if not isinstance(val, str) or not val.strip():
        raise ValidationError(f"{ctx}: '{key}' must be a non-empty string.")
    return val.strip()


def _require_bool(obj: dict[str, Any], key: str, ctx: str) -> bool:
    val = obj.get(key)
    if not isinstance(val, bool):
        raise ValidationError(f"{ctx}: '{key}' must be a boolean.")
    return val


def _validate_url_or_empty(url: Any, key: str, ctx: str, allow_mailto: bool = False) -> None:
    if url is None or url == "":
        return
    if not isinstance(url, str):
        raise ValidationError(f"{ctx}: '{key}' must be a string.")
    stripped = url.strip()
    if stripped == "#" or stripped.endswith("/#"):
        raise ValidationError(f"{ctx}: '{key}' contains forbidden placeholder URL '{stripped}'.")
    prefixes = ("https://", "http://") + (("mailto:",) if allow_mailto else ())
    if not stripped.startswith(prefixes):
        raise ValidationError(f"{ctx}: '{key}' must start with one of {prefixes}, got '{stripped}'.")


def _validate_profile(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "profile.json"
    if not isinstance(data, dict):
        return [f"{ctx}: root must be a JSON object."]

    for key in ("name", "username", "headline", "short_bio", "location"):
        try:
            _require_non_empty_str(data, key, ctx)
        except ValidationError as exc:
            errors.append(str(exc))

    summary = data.get("summary")
    if not isinstance(summary, list) or not summary or not all(isinstance(x, str) and x.strip() for x in summary):
        errors.append(f"{ctx}: 'summary' must be a non-empty list of strings.")

    approach = data.get("problem_solving_approach")
    if not isinstance(approach, list) or not approach:
        errors.append(f"{ctx}: 'problem_solving_approach' must be a non-empty list.")
    else:
        for idx, item in enumerate(approach):
            if not isinstance(item, dict):
                errors.append(f"{ctx}: problem_solving_approach[{idx}] must be an object.")
                continue
            for k in ("pillar", "description"):
                if not isinstance(item.get(k), str) or not item[k].strip():
                    errors.append(f"{ctx}: problem_solving_approach[{idx}].{k} must be a non-empty string.")

    contact = data.get("contact")
    if not isinstance(contact, dict):
        errors.append(f"{ctx}: 'contact' must be an object.")
    else:
        for url_key in ("linkedin", "credly", "github", "portfolio"):
            try:
                _validate_url_or_empty(contact.get(url_key, ""), url_key, f"{ctx}.contact")
            except ValidationError as exc:
                errors.append(str(exc))
        if not isinstance(contact.get("show_email"), bool):
            errors.append(f"{ctx}.contact: 'show_email' must be a boolean.")
        email = contact.get("email", "")
        if contact.get("show_email") and (not isinstance(email, str) or "@" not in email):
            errors.append(f"{ctx}.contact: 'email' must be valid when show_email is true.")

    banner = data.get("banner")
    if not isinstance(banner, dict):
        errors.append(f"{ctx}: 'banner' must be an object.")
    else:
        for k in ("badge_text", "tagline"):
            if not isinstance(banner.get(k), str) or not banner[k].strip():
                errors.append(f"{ctx}.banner: '{k}' must be a non-empty string.")
        pills = banner.get("pills")
        if not isinstance(pills, list) or not pills or not all(isinstance(p, str) and p.strip() for p in pills):
            errors.append(f"{ctx}.banner: 'pills' must be a non-empty list of strings.")

    return errors


def _validate_career(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "career.json"
    if not isinstance(data, dict):
        return [f"{ctx}: root must be a JSON object."]
    try:
        _require_non_empty_str(data, "status", ctx)
        _require_bool(data, "available_for_hire", ctx)
    except ValidationError as exc:
        errors.append(str(exc))

    for list_key in ("current_focus", "career_interests"):
        val = data.get(list_key)
        if not isinstance(val, list) or not val or not all(isinstance(x, str) and x.strip() for x in val):
            errors.append(f"{ctx}: '{list_key}' must be a non-empty list of strings.")

    updates = data.get("recent_updates")
    if not isinstance(updates, list) or not updates:
        errors.append(f"{ctx}: 'recent_updates' must be a non-empty list.")
    else:
        for idx, item in enumerate(updates):
            if not isinstance(item, dict):
                errors.append(f"{ctx}: recent_updates[{idx}] must be an object.")
                continue
            for k in ("date", "category", "title"):
                if not isinstance(item.get(k), str) or not item[k].strip():
                    errors.append(f"{ctx}: recent_updates[{idx}].{k} must be a non-empty string.")
    return errors


def _validate_experience(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "experience.json"
    if not isinstance(data, dict):
        return [f"{ctx}: root must be a JSON object."]
    try:
        _require_non_empty_str(data, "years_of_experience", ctx)
    except ValidationError as exc:
        errors.append(str(exc))

    highlights = data.get("highlights")
    if not isinstance(highlights, list) or not highlights:
        errors.append(f"{ctx}: 'highlights' must be a non-empty list.")
    else:
        for idx, item in enumerate(highlights):
            if not isinstance(item, dict):
                errors.append(f"{ctx}: highlights[{idx}] must be an object.")
                continue
            for k in ("area", "summary"):
                if not isinstance(item.get(k), str) or not item[k].strip():
                    errors.append(f"{ctx}: highlights[{idx}].{k} must be a non-empty string.")
            tools = item.get("tools")
            if not isinstance(tools, list) or not tools or not all(isinstance(t, str) and t.strip() for t in tools):
                errors.append(f"{ctx}: highlights[{idx}].tools must be a non-empty list of strings.")
    return errors


def _validate_skills(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "skills.json"
    if not isinstance(data, dict):
        return [f"{ctx}: root must be a JSON object."]

    for category in REQUIRED_SKILL_CATEGORIES:
        items = data.get(category)
        if not isinstance(items, list) or not items:
            errors.append(f"{ctx}: category '{category}' must be a non-empty list.")
            continue
        for idx, item in enumerate(items):
            item_ctx = f"{ctx}.{category}[{idx}]"
            if not isinstance(item, dict):
                errors.append(f"{item_ctx}: must be an object.")
                continue
            for forbidden in FORBIDDEN_METRIC_KEYS.intersection(item.keys()):
                errors.append(f"{item_ctx}: forbidden proficiency metric key '{forbidden}' found.")
            for k in ("name", "role", "focus", "badge_url"):
                val = item.get(k)
                if not isinstance(val, str) or not val.strip():
                    errors.append(f"{item_ctx}: '{k}' must be a non-empty string.")
                elif k != "badge_url" and "%" in val:
                    errors.append(f"{item_ctx}: '{k}' must not contain percentage metrics ('{val}').")
            try:
                _validate_url_or_empty(item.get("badge_url", ""), "badge_url", item_ctx)
            except ValidationError as exc:
                errors.append(str(exc))
    return errors


def _validate_projects(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "projects.json"
    if not isinstance(data, list) or not data:
        return [f"{ctx}: root must be a non-empty list."]

    seen_ids: set[str] = set()
    for idx, item in enumerate(data):
        item_ctx = f"{ctx}[{idx}]"
        if not isinstance(item, dict):
            errors.append(f"{item_ctx}: must be an object.")
            continue
        for k in ("id", "name", "tagline", "description", "category", "my_contribution"):
            try:
                _require_non_empty_str(item, k, item_ctx)
            except ValidationError as exc:
                errors.append(str(exc))
        pid = item.get("id")
        if isinstance(pid, str):
            if pid in seen_ids:
                errors.append(f"{item_ctx}: duplicate project id '{pid}'.")
            seen_ids.add(pid)

        for list_k in ("tech_stack", "key_features"):
            if not isinstance(item.get(list_k), list):
                errors.append(f"{item_ctx}: '{list_k}' must be a list.")

        try:
            featured = _require_bool(item, "featured", item_ctx)
            verified = _require_bool(item, "verified", item_ctx)
            _validate_url_or_empty(item.get("repo_url", ""), "repo_url", item_ctx)
            _validate_url_or_empty(item.get("live_url", ""), "live_url", item_ctx)
        except ValidationError as exc:
            errors.append(str(exc))
            continue

        if featured and not verified:
            errors.append(f"{item_ctx}: featured project must also have verified=true.")
        if featured and not str(item.get("repo_url", "")).startswith("https://"):
            errors.append(f"{item_ctx}: featured project must have a valid https:// repo_url.")
        if featured and not str(item.get("image_path", "")).strip():
            errors.append(f"{item_ctx}: featured project must specify an 'image_path'.")

    return errors


def _validate_certifications(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "certifications.json"
    if not isinstance(data, list) or not data:
        return [f"{ctx}: root must be a non-empty list."]

    for idx, item in enumerate(data):
        item_ctx = f"{ctx}[{idx}]"
        if not isinstance(item, dict):
            errors.append(f"{item_ctx}: must be an object.")
            continue
        for k in ("id", "name", "issuer", "category", "status", "issue_date"):
            try:
                _require_non_empty_str(item, k, item_ctx)
            except ValidationError as exc:
                errors.append(str(exc))
        if item.get("category") not in {"certification", "course"}:
            errors.append(f"{item_ctx}: 'category' must be 'certification' or 'course'.")
        if not isinstance(item.get("skills_covered"), list) or not item["skills_covered"]:
            errors.append(f"{item_ctx}: 'skills_covered' must be a non-empty list.")
        try:
            _require_bool(item, "verified", item_ctx)
            _validate_url_or_empty(item.get("credential_url", ""), "credential_url", item_ctx)
        except ValidationError as exc:
            errors.append(str(exc))
    return errors


def _validate_education(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "education.json"
    if not isinstance(data, list) or not data:
        return [f"{ctx}: root must be a non-empty list."]
    for idx, item in enumerate(data):
        item_ctx = f"{ctx}[{idx}]"
        if not isinstance(item, dict):
            errors.append(f"{item_ctx}: must be an object.")
            continue
        for k in ("id", "degree", "institution", "year", "status", "focus"):
            try:
                _require_non_empty_str(item, k, item_ctx)
            except ValidationError as exc:
                errors.append(str(exc))
        try:
            _require_bool(item, "verified", item_ctx)
        except ValidationError as exc:
            errors.append(str(exc))
    return errors


def _validate_achievements(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "achievements.json"
    if not isinstance(data, list) or not data:
        return [f"{ctx}: root must be a non-empty list."]
    for idx, item in enumerate(data):
        item_ctx = f"{ctx}[{idx}]"
        if not isinstance(item, dict):
            errors.append(f"{item_ctx}: must be an object.")
            continue
        for k in ("id", "title", "category", "description"):
            try:
                _require_non_empty_str(item, k, item_ctx)
            except ValidationError as exc:
                errors.append(str(exc))
        try:
            _require_bool(item, "verified", item_ctx)
        except ValidationError as exc:
            errors.append(str(exc))
    return errors


def _validate_github_metrics(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "github_metrics.json"
    if not isinstance(data, dict):
        return [f"{ctx}: root must be a JSON object."]
    for k in ("username", "last_synced_utc", "sync_status"):
        try:
            _require_non_empty_str(data, k, ctx)
        except ValidationError as exc:
            errors.append(str(exc))
    if not isinstance(data.get("profile"), dict):
        errors.append(f"{ctx}: 'profile' must be an object.")
    if not isinstance(data.get("repositories"), list):
        errors.append(f"{ctx}: 'repositories' must be a list.")
    if not isinstance(data.get("language_bytes"), dict):
        errors.append(f"{ctx}: 'language_bytes' must be an object.")
    return errors


def _validate_linkedin_sync(data: Any) -> list[str]:
    errors: list[str] = []
    ctx = "linkedin_sync.json"
    if not isinstance(data, dict):
        return [f"{ctx}: root must be a JSON object."]
    try:
        _validate_url_or_empty(data.get("profile_url", ""), "profile_url", ctx)
        _require_non_empty_str(data, "sync_mode", ctx)
        _require_bool(data, "require_approval", ctx)
    except ValidationError as exc:
        errors.append(str(exc))
    if not isinstance(data.get("pending_changes"), list):
        errors.append(f"{ctx}: 'pending_changes' must be a list.")
    return errors


def validate_schemas(data_dir: Path) -> list[str]:
    """Validate all profile-data JSON files and return a list of error strings."""
    errors: list[str] = []
    validators = {
        "profile.json": _validate_profile,
        "career.json": _validate_career,
        "experience.json": _validate_experience,
        "skills.json": _validate_skills,
        "projects.json": _validate_projects,
        "certifications.json": _validate_certifications,
        "education.json": _validate_education,
        "achievements.json": _validate_achievements,
        "github_metrics.json": _validate_github_metrics,
        "linkedin_sync.json": _validate_linkedin_sync,
    }

    for filename in REQUIRED_DATA_FILES:
        file_path = data_dir / filename
        try:
            payload = load_json(file_path)
        except ValidationError as exc:
            errors.append(str(exc))
            continue
        errors.extend(validators[filename](payload))
    return errors


def _validate_svg_file(svg_path: Path) -> list[str]:
    errors: list[str] = []
    if not svg_path.exists():
        return [f"Missing SVG asset: {svg_path}"]
    content = svg_path.read_text(encoding="utf-8").strip()
    if not content:
        return [f"Empty SVG asset: {svg_path}"]
    try:
        root = ET.fromstring(content)
    except ET.ParseError as exc:
        return [f"Malformed SVG XML in {svg_path}: {exc}"]
    if not root.tag.lower().endswith("svg"):
        errors.append(f"Root XML tag in {svg_path} is '{root.tag}', expected 'svg'.")
    return errors


def validate_assets(root_dir: Path) -> list[str]:
    """Validate all local image and SVG assets referenced in profile-data and README.md."""
    errors: list[str] = []
    data_dir = root_dir / "profile-data"

    projects = load_json(data_dir / "projects.json")
    for proj in projects:
        if proj.get("verified") and proj.get("image_path"):
            asset_path = root_dir / proj["image_path"]
            if not asset_path.exists():
                errors.append(f"Missing project preview asset: {proj['image_path']}")
            elif asset_path.suffix.lower() == ".svg":
                errors.extend(_validate_svg_file(asset_path))

    certs = load_json(data_dir / "certifications.json")
    for cert in certs:
        if cert.get("verified") and cert.get("badge_path"):
            badge_path = root_dir / cert["badge_path"]
            if not badge_path.exists():
                errors.append(f"Missing certification badge asset: {cert['badge_path']}")
            elif badge_path.suffix.lower() == ".svg":
                errors.extend(_validate_svg_file(badge_path))

    required_svgs = (
        "banner.svg",
        "tech-matrix.svg",
        "telemetry.svg",
        "assets/banner/hero-banner.svg",
        "assets/profile/skills-matrix.svg",
        "assets/profile/github-telemetry.svg",
    )
    for rel in required_svgs:
        errors.extend(_validate_svg_file(root_dir / rel))

    icons_dir = root_dir / "assets" / "icons"
    if not icons_dir.exists() or not list(icons_dir.glob("*.svg")):
        errors.append("assets/icons/ must contain SVG icon files.")
    else:
        for icon in icons_dir.glob("*.svg"):
            errors.extend(_validate_svg_file(icon))

    readme_path = root_dir / "README.md"
    if readme_path.exists():
        readme_text = readme_path.read_text(encoding="utf-8")
        local_refs: set[str] = set()
        for attr_match in re.findall(r'(?:src|srcset)=["\']([^"\']+)["\']', readme_text):
            if not attr_match.startswith(("http://", "https://", "data:", "#")):
                local_refs.add(attr_match)
        for md_img in re.findall(r'!\[[^\]]*\]\(([^)]+)\)', readme_text):
            if not md_img.startswith(("http://", "https://", "data:", "#")):
                local_refs.add(md_img)
        for rel in sorted(local_refs):
            target = root_dir / rel
            if not target.exists():
                errors.append(f"README.md references missing local asset: {rel}")
            elif target.suffix.lower() == ".svg":
                errors.extend(_validate_svg_file(target))
    return errors


def _collect_external_urls(root_dir: Path) -> set[str]:
    urls: set[str] = set()
    data_dir = root_dir / "profile-data"
    url_pattern = re.compile(r'https?://[^\s"\'<>)]+')

    for filename in REQUIRED_DATA_FILES:
        file_path = data_dir / filename
        if file_path.exists():
            urls.update(url_pattern.findall(file_path.read_text(encoding="utf-8")))

    readme_path = root_dir / "README.md"
    if readme_path.exists():
        readme_text = readme_path.read_text(encoding="utf-8")
        urls.update(url_pattern.findall(readme_text))
        if re.search(r'href=["\']#["\']|\]\(#\)', readme_text):
            raise ValidationError("README.md contains broken placeholder '#' link.")

    return urls


def _check_single_url(url: str, timeout: int = 12) -> tuple[bool, str]:
    headers = {"User-Agent": "tsalmanrahman-profile-validator/1.0 (+https://github.com/tsalmanrahman)"}
    parsed = urllib.parse.urlparse(url)
    for method in ("HEAD", "GET"):
        req = urllib.request.Request(url, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if 200 <= resp.status < 400:
                    return True, f"HTTP {resp.status}"
                return False, f"HTTP {resp.status}"
        except urllib.error.HTTPError as exc:
            if method == "HEAD" and exc.code in (403, 405, 501):
                continue
            # LinkedIn (999) and Cloudflare-protected Credly (403) reject automated scrapers on valid public profiles
            if "linkedin.com" in parsed.netloc.lower() and exc.code == 999:
                return True, "HTTP 999 (LinkedIn bot guard; host reachable)"
            if "credly.com" in parsed.netloc.lower() and exc.code == 403:
                return True, "HTTP 403 (Credly bot guard; host reachable)"
            return False, f"HTTP {exc.code}"
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            if method == "HEAD":
                continue
            return False, str(exc)
    return False, "Request failed"


def validate_links(root_dir: Path) -> list[str]:
    """Verify all external HTTP/HTTPS links in profile-data and README.md."""
    errors: list[str] = []
    try:
        urls = sorted(_collect_external_urls(root_dir))
    except ValidationError as exc:
        return [str(exc)]

    for url in urls:
        ok, detail = _check_single_url(url)
        if not ok:
            # Brief retry for transient CDN rate limits
            time.sleep(0.5)
            ok, detail = _check_single_url(url)
        if not ok:
            errors.append(f"Broken external URL ({detail}): {url}")
    return errors


def validate_all(
    root_dir: Path | None = None,
    check_assets: bool = False,
    check_links: bool = False,
) -> list[str]:
    """Run schema validation and optional asset/link verification."""
    base = root_dir or REPO_ROOT
    errors = validate_schemas(base / "profile-data")
    if check_assets and not errors:
        errors.extend(validate_assets(base))
    if check_links:
        errors.extend(validate_links(base))
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate profile-data schemas, SVG assets, and external links.")
    parser.add_argument("--root", type=Path, default=REPO_ROOT, help="Repository root directory.")
    parser.add_argument("--check-assets", action="store_true", help="Verify referenced local SVG/image assets.")
    parser.add_argument("--check-links", action="store_true", help="Verify reachability of external URLs.")
    args = parser.parse_args(argv)

    errors = validate_all(args.root, check_assets=args.check_assets, check_links=args.check_links)
    if errors:
        print("[ERROR] Profile validation failed:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print("[OK] All profile-data JSON schemas valid")
    if args.check_assets:
        print("[OK] All local assets verified")
    if args.check_links:
        print("[OK] All external URLs reachable")
    return 0


if __name__ == "__main__":
    sys.exit(main())
