#!/usr/bin/env python3
"""Automated unit and integration tests for the GitHub profile ecosystem."""

from __future__ import annotations

import json
import shutil
import sys
import tempfile
import unittest
import urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path
from unittest import mock

REPO_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = REPO_ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import generate_readme  # noqa: E402
import sync_profile  # noqa: E402
import validate_data  # noqa: E402


class TestProfileEcosystem(unittest.TestCase):
    """Test schema validation, generation, verification gating, rollback, and sync safety."""

    def _copy_repo_to_temp(self) -> Path:
        tmp = Path(tempfile.mkdtemp(prefix="gh_profile_test_"))
        self.addCleanup(lambda: shutil.rmtree(tmp, ignore_errors=True))
        for subdir in ("profile-data", "assets"):
            src = REPO_ROOT / subdir
            if src.exists():
                shutil.copytree(src, tmp / subdir)
        for root_file in ("README.md", "banner.svg", "tech-matrix.svg", "telemetry.svg"):
            src_f = REPO_ROOT / root_file
            if src_f.exists():
                shutil.copy2(src_f, tmp / root_file)
        return tmp

    def test_current_profile_data_is_valid(self) -> None:
        errors = validate_data.validate_schemas(REPO_ROOT / "profile-data")
        self.assertEqual(errors, [], f"Unexpected schema errors: {errors}")

    def test_rejects_fake_skill_percentages_and_placeholder_links(self) -> None:
        tmp = self._copy_repo_to_temp()
        skills_path = tmp / "profile-data" / "skills.json"
        skills = json.loads(skills_path.read_text(encoding="utf-8"))
        skills["Database"][0]["percentage"] = 95
        skills_path.write_text(json.dumps(skills), encoding="utf-8")

        projects_path = tmp / "profile-data" / "projects.json"
        projects = json.loads(projects_path.read_text(encoding="utf-8"))
        projects[0]["repo_url"] = "#"
        projects_path.write_text(json.dumps(projects), encoding="utf-8")

        errors = validate_data.validate_schemas(tmp / "profile-data")
        joined = "\n".join(errors)
        self.assertIn("forbidden proficiency metric key 'percentage'", joined)
        self.assertIn("forbidden placeholder URL '#'", joined)

    def test_excludes_unverified_certifications_education_and_achievements(self) -> None:
        tmp = self._copy_repo_to_temp()

        certs_path = tmp / "profile-data" / "certifications.json"
        certs = json.loads(certs_path.read_text(encoding="utf-8"))
        certs.append(
            {
                "id": "unverified-cert",
                "name": "UNVERIFIED_SECRET_CERT_XYZ",
                "issuer": "Pending",
                "category": "certification",
                "status": "Pending",
                "issue_date": "2026",
                "credential_id": "",
                "credential_url": "",
                "badge_path": "",
                "skills_covered": ["Testing"],
                "verified": False,
            }
        )
        certs_path.write_text(json.dumps(certs), encoding="utf-8")

        ach_path = tmp / "profile-data" / "achievements.json"
        achs = json.loads(ach_path.read_text(encoding="utf-8"))
        achs.append(
            {
                "id": "unverified-ach",
                "title": "UNVERIFIED_ACHIEVEMENT_XYZ",
                "category": "Test",
                "description": "Should never appear.",
                "verified": False,
            }
        )
        ach_path.write_text(json.dumps(achs), encoding="utf-8")

        ok, msg = generate_readme.generate_all(tmp)
        self.assertTrue(ok, msg)
        readme = (tmp / "README.md").read_text(encoding="utf-8")
        self.assertNotIn("UNVERIFIED_SECRET_CERT_XYZ", readme)
        self.assertNotIn("UNVERIFIED_ACHIEVEMENT_XYZ", readme)
        self.assertNotIn("Personal File Storage", readme)

    def test_atomic_rollback_preserves_valid_readme_on_generation_failure(self) -> None:
        tmp = self._copy_repo_to_temp()
        sentinel = "<!-- LAST VALID README SENTINEL -->\n"
        (tmp / "README.md").write_text(sentinel, encoding="utf-8")

        with mock.patch.object(validate_data, "validate_assets", return_value=["Simulated SVG failure"]):
            ok, msg = generate_readme.generate_all(tmp)

        self.assertFalse(ok)
        self.assertIn("rolled back", msg.lower())
        self.assertEqual((tmp / "README.md").read_text(encoding="utf-8"), sentinel)

    def test_github_sync_graceful_fallback_preserves_cached_metrics(self) -> None:
        tmp = self._copy_repo_to_temp()
        metrics_path = tmp / "profile-data" / "github_metrics.json"
        before_bytes = metrics_path.read_bytes()

        def failing_fetcher(*_args, **_kwargs):
            raise urllib.error.URLError("Simulated network outage")

        ok, msg = sync_profile.sync_github_metrics(tmp, fetcher=failing_fetcher)
        self.assertFalse(ok)
        self.assertIn("preserved cached github_metrics.json", msg)
        self.assertEqual(metrics_path.read_bytes(), before_bytes)

    def test_linkedin_export_requires_approval_before_updating_profile(self) -> None:
        tmp = self._copy_repo_to_temp()
        export_dir = tmp / "li_export"
        export_dir.mkdir(parents=True, exist_ok=True)
        (export_dir / "Profile.csv").write_text(
            "First Name,Last Name,Headline\nSalman,Rahman,Senior SQL & ERP Architect\n",
            encoding="utf-8",
        )

        profile_path = tmp / "profile-data" / "profile.json"
        original_headline = json.loads(profile_path.read_text(encoding="utf-8"))["headline"]

        msg = sync_profile.import_linkedin_export(tmp, export_dir)
        self.assertIn("staged 1 pending change", msg)

        # Profile headline must remain unchanged until approved
        self.assertEqual(json.loads(profile_path.read_text(encoding="utf-8"))["headline"], original_headline)

        # Without explicit approval, apply_approved_linkedin_changes applies 0 changes
        self.assertEqual(sync_profile.apply_approved_linkedin_changes(tmp), 0)
        self.assertEqual(json.loads(profile_path.read_text(encoding="utf-8"))["headline"], original_headline)

        # Mark change approved and apply
        sync_path = tmp / "profile-data" / "linkedin_sync.json"
        sync_state = json.loads(sync_path.read_text(encoding="utf-8"))
        sync_state["pending_changes"][0]["approved"] = True
        sync_path.write_text(json.dumps(sync_state), encoding="utf-8")

        self.assertEqual(sync_profile.apply_approved_linkedin_changes(tmp), 1)
        self.assertEqual(json.loads(profile_path.read_text(encoding="utf-8"))["headline"], "Senior SQL & ERP Architect")

    def test_skills_matrix_renders_tinted_vector_icons_and_fallback(self) -> None:
        skills = json.loads((REPO_ROOT / "profile-data" / "skills.json").read_text(encoding="utf-8"))
        skills["Other"].append(
            {
                "name": "Custom Stack",
                "role": "Specialized Tooling",
                "focus": "Automation",
                "color": "#14B8A6",
                "badge_url": "https://img.shields.io/badge/Custom-14B8A6",
            }
        )
        svg = generate_readme.render_skills_matrix_svg(skills)
        ET.fromstring(svg)  # Must remain well-formed SVG XML
        self.assertIn('fill-opacity="0.16"', svg)
        self.assertIn("#FFD43B", svg)  # Python dual-tone emblem
        self.assertIn("Custom Stack", svg)
        self.assertIn(generate_readme.SKILL_DEFAULT_ICON_SVG, svg)
        self.assertNotIn('font-family="monospace"', svg)

    def test_generated_assets_and_check_mode(self) -> None:
        tmp = self._copy_repo_to_temp()
        ok, msg = generate_readme.generate_all(tmp)
        self.assertTrue(ok, msg)

        asset_errors = validate_data.validate_assets(tmp)
        self.assertEqual(asset_errors, [], f"Asset errors: {asset_errors}")

        up_to_date, check_msg = generate_readme.generate_all(tmp, check_only=True)
        self.assertTrue(up_to_date, check_msg)

        readme = (tmp / "README.md").read_text(encoding="utf-8")
        self.assertNotIn("CompTIA", readme)
        self.assertIn("https://www.credly.com/badges/0e52798c-e483-499b-ad1c-723ebf802f42", readme)
        self.assertIn("https://www.credly.com/badges/d145c575-283d-482e-920f-8038d431ba43", readme)
        self.assertIn("https://www.freecodecamp.org/certification/salman_rahman/foundational-c-sharp-with-microsoft", readme)
        self.assertIn('assets/certificates/google-it-support-badge.png', readme)
        self.assertIn('assets/certificates/ibm-databases-sql-badge.png', readme)
        self.assertIn('assets/certificates/microsoft-csharp-badge.svg', readme)
        self.assertTrue((tmp / "assets/certificates/google-it-support-badge.png").exists())
        self.assertTrue((tmp / "assets/certificates/ibm-databases-sql-badge.png").exists())


if __name__ == "__main__":
    unittest.main()
