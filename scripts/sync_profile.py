#!/usr/bin/env python3
"""Synchronize live GitHub telemetry and authorized LinkedIn updates safely."""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _github_get_json(url: str, token: str | None = None, timeout: int = 12) -> Any:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "tsalmanrahman-profile-sync/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def sync_github_metrics(
    root_dir: Path,
    fetcher: Any = _github_get_json,
    token: str | None = None,
) -> tuple[bool, str]:
    """Fetch public GitHub user and repository telemetry with graceful fallback.

    Returns (updated_or_unchanged_ok, message). Never overwrites existing valid
    metrics if the GitHub API fails.
    """
    data_dir = root_dir / "profile-data"
    profile_data = _load_json(data_dir / "profile.json")
    metrics_path = data_dir / "github_metrics.json"
    existing_metrics = _load_json(metrics_path)
    username = profile_data["username"]
    projects = _load_json(data_dir / "projects.json")
    excluded_repos = {
        p["repo_url"].rstrip("/").split("/")[-1]
        for p in projects
        if not p.get("featured", False) and p.get("repo_url")
    }

    try:
        user_info = fetcher(f"https://api.github.com/users/{username}", token=token)
        repos_info = fetcher(
            f"https://api.github.com/users/{username}/repos?per_page=100&sort=updated",
            token=token,
        )
        if not isinstance(user_info, dict) or not isinstance(repos_info, list):
            raise ValueError("Unexpected response format from GitHub API.")

        created_at = str(user_info.get("created_at", ""))
        created_year = int(created_at[:4]) if len(created_at) >= 4 and created_at[:4].isdigit() else existing_metrics["profile"].get("created_year", 2023)

        new_profile = {
            "public_repos": int(user_info.get("public_repos", 0)),
            "followers": int(user_info.get("followers", 0)),
            "following": int(user_info.get("following", 0)),
            "created_year": created_year,
            "company": user_info.get("company") or "",
            "location": user_info.get("location") or "",
            "hireable": bool(user_info.get("hireable", False)),
        }

        new_repos: list[dict[str, Any]] = []
        language_totals: dict[str, int] = {}

        for repo in repos_info:
            if not isinstance(repo, dict) or repo.get("fork"):
                continue
            repo_name = str(repo.get("name", ""))
            if not repo_name:
                continue

            if repo_name not in excluded_repos:
                langs = fetcher(
                    f"https://api.github.com/repos/{username}/{repo_name}/languages",
                    token=token,
                )
                if isinstance(langs, dict):
                    for lang, byte_count in langs.items():
                        if isinstance(byte_count, int) and byte_count > 0:
                            language_totals[lang] = language_totals.get(lang, 0) + byte_count

                new_repos.append(
                    {
                        "name": repo_name,
                        "url": str(repo.get("html_url", "")),
                        "primary_language": repo.get("language") or "Markdown/Data",
                        "stars": int(repo.get("stargazers_count", 0)),
                        "forks": int(repo.get("forks_count", 0)),
                        "updated_at": str(repo.get("updated_at", "")),
                    }
                )

        sorted_languages = dict(sorted(language_totals.items(), key=lambda kv: (-kv[1], kv[0])))

        # Preserve stability: avoid rewriting timestamp if actual metrics did not change.
        changed = (
            existing_metrics.get("profile") != new_profile
            or existing_metrics.get("repositories") != new_repos
            or existing_metrics.get("language_bytes") != sorted_languages
            or existing_metrics.get("sync_status") != "live_github_api"
        )
        if not changed:
            return True, "GitHub metrics already up to date (no changes detected)."

        updated_payload = {
            "username": username,
            "last_synced_utc": _utc_now_iso(),
            "sync_status": "live_github_api",
            "profile": new_profile,
            "repositories": new_repos,
            "language_bytes": sorted_languages,
        }
        _write_json(metrics_path, updated_payload)
        return True, f"Updated GitHub metrics for '{username}' ({len(new_repos)} active repositories)."
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, OSError, KeyError) as exc:
        return False, f"GitHub API sync unavailable ({exc}); preserved cached github_metrics.json."


def _stage_linkedin_change(
    sync_state: dict[str, Any],
    target_file: str,
    field: str,
    proposed_value: Any,
    source: str,
) -> bool:
    pending = sync_state.setdefault("pending_changes", [])
    for existing in pending:
        if (
            existing.get("target_file") == target_file
            and existing.get("field") == field
            and existing.get("proposed_value") == proposed_value
        ):
            return False

    pending.append(
        {
            "id": f"{target_file}:{field}:{len(pending) + 1}",
            "target_file": target_file,
            "field": field,
            "proposed_value": proposed_value,
            "source": source,
            "detected_at_utc": _utc_now_iso(),
            "approved": False,
        }
    )
    return True


def sync_linkedin_oauth(root_dir: Path, access_token: str | None) -> str:
    """Query official LinkedIn OpenID Connect /v2/userinfo endpoint when authorized.

    Never scrapes pages or logs access tokens. All detected updates are staged
    in profile-data/linkedin_sync.json for approval.
    """
    if not access_token:
        return "LinkedIn OAuth skipped (LINKEDIN_ACCESS_TOKEN not configured; using manual/export workflow)."

    data_dir = root_dir / "profile-data"
    sync_path = data_dir / "linkedin_sync.json"
    sync_state = _load_json(sync_path)
    profile = _load_json(data_dir / "profile.json")

    req = urllib.request.Request(
        "https://api.linkedin.com/v2/userinfo",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            userinfo = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, OSError) as exc:
        return f"LinkedIn OAuth sync unavailable ({exc}); no profile files modified."

    staged_count = 0
    if isinstance(userinfo.get("name"), str) and userinfo["name"].strip():
        if userinfo["name"].strip() != profile.get("name"):
            if _stage_linkedin_change(sync_state, "profile.json", "name", userinfo["name"].strip(), "linkedin_oauth_userinfo"):
                staged_count += 1

    sync_state["last_verified_sync"] = _utc_now_iso()
    _write_json(sync_path, sync_state)
    return f"LinkedIn OAuth checked; staged {staged_count} change(s) for approval."


def import_linkedin_export(root_dir: Path, export_dir: Path) -> str:
    """Import official LinkedIn Data Archive CSV files into approval-gated staging."""
    if not export_dir.exists() or not export_dir.is_dir():
        raise FileNotFoundError(f"LinkedIn export directory not found: {export_dir}")

    data_dir = root_dir / "profile-data"
    sync_path = data_dir / "linkedin_sync.json"
    sync_state = _load_json(sync_path)
    profile = _load_json(data_dir / "profile.json")
    certs = _load_json(data_dir / "certifications.json")
    staged_count = 0

    profile_csv = export_dir / "Profile.csv"
    if profile_csv.exists():
        with profile_csv.open("r", encoding="utf-8-sig", newline="") as handle:
            rows = list(csv.DictReader(handle))
        if rows:
            headline = (rows[0].get("Headline") or "").strip()
            if headline and headline != profile.get("headline"):
                if _stage_linkedin_change(sync_state, "profile.json", "headline", headline, "linkedin_export_Profile.csv"):
                    staged_count += 1

    certs_csv = export_dir / "Certifications.csv"
    if certs_csv.exists():
        existing_names = {c.get("name", "").lower() for c in certs}
        with certs_csv.open("r", encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle):
                cert_name = (row.get("Name") or "").strip()
                issuer = (row.get("Authority") or "").strip()
                if cert_name and cert_name.lower() not in existing_names:
                    candidate = {
                        "id": cert_name.lower().replace(" ", "-")[:40],
                        "name": cert_name,
                        "issuer": issuer or "Verified Authority",
                        "category": "certification",
                        "status": "Certified",
                        "issue_date": (row.get("Started On") or "Verified").strip(),
                        "credential_id": (row.get("License Number") or "").strip(),
                        "credential_url": (row.get("Url") or "").strip(),
                        "badge_path": "",
                        "skills_covered": [cert_name],
                        "verified": True,
                    }
                    if _stage_linkedin_change(sync_state, "certifications.json", "append", candidate, "linkedin_export_Certifications.csv"):
                        staged_count += 1

    sync_state["last_verified_sync"] = _utc_now_iso()
    _write_json(sync_path, sync_state)
    return f"LinkedIn data export parsed; staged {staged_count} pending change(s) in linkedin_sync.json."


def apply_approved_linkedin_changes(root_dir: Path) -> int:
    """Apply only explicitly approved changes from profile-data/linkedin_sync.json."""
    data_dir = root_dir / "profile-data"
    sync_path = data_dir / "linkedin_sync.json"
    sync_state = _load_json(sync_path)
    pending = sync_state.get("pending_changes", [])

    applied = 0
    remaining: list[dict[str, Any]] = []
    for change in pending:
        if not change.get("approved"):
            remaining.append(change)
            continue
        target_name = change.get("target_file")
        field = change.get("field")
        value = change.get("proposed_value")
        target_path = data_dir / str(target_name)
        if not target_path.exists():
            remaining.append(change)
            continue
        payload = _load_json(target_path)
        if isinstance(payload, dict) and isinstance(field, str):
            payload[field] = value
            _write_json(target_path, payload)
            applied += 1
        elif isinstance(payload, list) and field == "append" and isinstance(value, dict):
            payload.append(value)
            _write_json(target_path, payload)
            applied += 1
        else:
            remaining.append(change)

    sync_state["pending_changes"] = remaining
    _write_json(sync_path, sync_state)
    return applied


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Sync live GitHub metrics and authorized LinkedIn updates.")
    parser.add_argument("--root", type=Path, default=REPO_ROOT, help="Repository root directory.")
    parser.add_argument("--skip-github", action="store_true", help="Skip GitHub API sync.")
    parser.add_argument("--linkedin-export-dir", type=Path, default=None, help="Path to unzipped LinkedIn Data Archive CSVs.")
    parser.add_argument("--apply-approved", action="store_true", help="Apply approved pending changes in linkedin_sync.json.")
    args = parser.parse_args(argv)

    if not args.skip_github:
        gh_ok, gh_msg = sync_github_metrics(args.root, token=os.environ.get("GITHUB_TOKEN"))
        prefix = "[OK]" if gh_ok else "[WARN]"
        print(f"{prefix} {gh_msg}")

    if args.linkedin_export_dir:
        li_msg = import_linkedin_export(args.root, args.linkedin_export_dir)
        print(f"[OK] {li_msg}")
    else:
        li_msg = sync_linkedin_oauth(args.root, os.environ.get("LINKEDIN_ACCESS_TOKEN"))
        print(f"[INFO] {li_msg}")

    if args.apply_approved:
        count = apply_approved_linkedin_changes(args.root)
        print(f"[OK] Applied {count} approved LinkedIn change(s).")

    return 0


if __name__ == "__main__":
    sys.exit(main())
