#!/usr/bin/env python3
"""Offline, read-only qualification of candidate skill distributions.

Runs only against local generated ZIPs and source files. No GitHub release,
playlist publishing, account access, production branch promotion or deployment.
The frozen published 3.11.5 asset sizes below are *metadata* comparisons, not
a reproduced byte-for-byte build of that historical release.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
BASELINE_TAG = "gemini-skill-v3.11.5"
BASELINE_SHA = "625941ab0e931230554393035df6b4b851783298"
PUBLISHED_3115_ZIP_BYTES = {
    "go-hipster-go-chatgpt-plugin.zip": 242009,
    "go-hipster-go-claude-plugin.zip": 239639,
    "go-hipster-go-claude-skill.zip": 236252,
    "go-hipster-go-gemini-app-skill.zip": 196447,
}
BASELINE_SOURCE_BYTES = {
    "SKILL.md": 54578,
    "adapters/gemini/SKILL.md": 6816,
    "references/reference-index.md": 4891,
    "references/global-scenes.md": 31310,
}
REQUIRED_ARCHIVE_MEMBERS = {
    "go-hipster-go-chatgpt-plugin.zip": {
        "plugin.json", "skills/setup/SKILL.md",
        "skills/go-hipster-go/SKILL.md",
        "skills/go-hipster-go/references/evaluation-smoke.md",
        "skills/go-hipster-go/references/claude-spotify-recovery.md",
    },
    "go-hipster-go-claude-plugin.zip": {
        ".claude-plugin/plugin.json", "skills/setup/SKILL.md",
        "skills/go-hipster-go/SKILL.md",
        "skills/go-hipster-go/references/claude-spotify-recovery.md",
    },
    "go-hipster-go-claude-skill.zip": {
        "go-hipster-go/SKILL.md",
        "go-hipster-go/references/claude-spotify-recovery.md",
        "go-hipster-go/references/evaluation-smoke.md",
    },
    "go-hipster-go-gemini-app-skill.zip": {
        "SKILL.md", "references/workflow.md",
        "references/tempo-curve.md", "references/go-hard.md",
        "references/regional-atlas.md", "references/regions/antarctica.md",
        "references/gemini-publish.md",
    },
}
# Full-file size illustration only: it is not host telemetry or actual token use.
# The published reference index listed global scenes for ordinary regional GO.
BASELINE_SOUTH_REFERENCE_BYTES = (
    4891 + 10653 + 4704 + 31310 + 11193 + 2299
)
SOUTH_CURRENT_REFERENCES = (
    "references/sonic-taxonomy.md",
    "references/verification.md",
    "references/regional-atlas.md",
    "references/regions/us-south.md",
)


def _version_from_skill(text: str) -> str:
    match = re.search(r'(?m)^  version: "([0-9]+\.[0-9]+\.[0-9]+)"$', text)
    if not match:
        raise ValueError("Canonical skill metadata.version missing")
    return match.group(1)


def inspect(root: Path = ROOT, dist: Path | None = None) -> dict:
    """Report measured local state, never infer live behavior from static tests."""
    dist = dist or root / "dist"
    errors: list[str] = []
    versions = {}
    canonical = (root / "SKILL.md").read_bytes()
    mirror = (root / "skills/go-hipster-go/SKILL.md").read_bytes()
    if canonical != mirror:
        errors.append("Canonical and mirrored SKILL.md differ")
    versions["canonical"] = _version_from_skill(canonical.decode("utf-8"))
    for key, path in (
        ("chatgpt", "plugin.json"),
        ("claude", ".claude-plugin/plugin.json"),
        ("gemini", "gemini-extension.json"),
    ):
        versions[key] = json.loads((root / path).read_text(encoding="utf-8"))["version"]
    gemini_online = (root / "adapters/gemini/SKILL.md").read_text(encoding="utf-8")
    hit = re.search(r"(?m)^version: ([0-9]+\.[0-9]+\.[0-9]+)$", gemini_online)
    if not hit:
        errors.append("Generated Gemini version missing")
    else:
        versions["gemini_entry"] = hit.group(1)
    if len(set(versions.values())) != 1:
        errors.append("Version mismatch across skill manifests and Gemini entry")
    for key in ("SKILL.md", "references/workflow.md"):
        online_path = root / "adapters/gemini" / key
        text = online_path.read_text(encoding="utf-8")
        if "https://raw.githubusercontent.com/focustimer-dev/go-hipster-go/main/" in text:
            errors.append("Development main URL in Gemini online " + key)
        if "release/skill-prod/" not in text:
            errors.append("Frozen production reference missing in Gemini online " + key)
    source_bytes = {
        name: (root / name).stat().st_size
        for name in ("SKILL.md", "adapters/gemini/SKILL.md",
                     "adapters/chatgpt/CHATGPT_KNOWLEDGE.md",
                     "adapters/gemini/GEM_KNOWLEDGE.md",
                     "references/global-scenes.md")
    }
    packages = {}
    for filename, required in PUBLISHED_3115_ZIP_BYTES.items():
        path = dist / filename
        if not path.is_file():
            errors.append("Missing locally built archive " + filename)
            continue
        names: set[str] = set()
        try:
            with ZipFile(path) as archive:
                listed = archive.namelist()
                names = set(listed)
                if len(names) != len(listed):
                    errors.append("Duplicate archive entries: " + filename)
                missing = required - names
                if missing:
                    errors.append(filename + " missing " + ", ".join(sorted(missing)))
                if any("__pycache__" in x or x.endswith(".pyc") for x in names):
                    errors.append("Python build cache in " + filename)
                if any(x.endswith("tests/discovery-cases.md") for x in names):
                    errors.append("Full development corpus leaked into " + filename)
                if any(i.date_time != (1980, 1, 1, 0, 0, 0) for i in archive.infolist()):
                    errors.append("Nondeterministic ZIP timestamp in " + filename)
                if filename.endswith("gemini-app-skill.zip") and any(
                    n.startswith("scripts/") or n.endswith(".py") for n in names
                ):
                    errors.append("Executable/script member in Gemini skill ZIP")
        except Exception as exc:
            errors.append(filename + " unreadable: " + type(exc).__name__)
        actual = path.stat().st_size
        packages[filename] = {
            "measured_candidate_bytes": actual,
            "published_3_11_5_asset_bytes": PUBLISHED_3115_ZIP_BYTES[filename],
            "delta_vs_published_asset_bytes": actual - PUBLISHED_3115_ZIP_BYTES[filename],
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            "member_count": len(names),
        }
    current_reference_bytes = sum((root / path).stat().st_size for path in SOUTH_CURRENT_REFERENCES)
    return {
        "status": "offline_checks_passed" if not errors else "offline_checks_failed",
        "errors": errors,
        "versions": versions,
        "baseline_tag": BASELINE_TAG,
        "baseline_sha": BASELINE_SHA,
        "published_baseline_asset_metadata": True,
        "baseline_source_bytes": BASELINE_SOURCE_BYTES,
        "candidate_source_bytes": source_bytes,
        "packages": packages,
        "illustrative_regional_core_full_file_bytes": {
            "baseline_reference_index_included": BASELINE_SOUTH_REFERENCE_BYTES,
            "candidate_direct_route_subset": current_reference_bytes,
            "delta_bytes": current_reference_bytes - BASELINE_SOUTH_REFERENCE_BYTES,
            "note": "Illustrative only. Different routing surfaces; excludes Gemini workflow/entry, caching and all host fetch observations.",
        },
        "live_host_tests": "not_performed",
        "music_quality_comparison": "not_performed",
        "publication": "not_authorized_or_attempted",
        "release_status": "candidate_only_no_promotion_or_tag",
    }


def render_markdown(result: dict) -> str:
    lines = [
        "# Skill release qualification — offline measurements", "",
        f"**Status:** {result['status']}  ",
        f"**Current version:** {result['versions'].get('canonical', 'unknown')}  ",
        f"**Published baseline:** {result['baseline_tag']} (`{result['baseline_sha'][:8]}`)  ",
        "**Boundary:** local packaging/static checks only; no live host, catalog or music-quality measurements.",
        "",
        "## Source bytes", "",
        "| File | Published 3.11.5 tag | Candidate |",
        "| --- | ---: | ---: |",
    ]
    for name, baseline in result["baseline_source_bytes"].items():
        current = result["candidate_source_bytes"].get(name)
        lines.append(f"| `{name}` | {baseline:,} | {f'{current:,}' if current is not None else 'not measured'} |")
    lines += ["", "## ZIP bytes", "",
              "| Archive | Published 3.11.5 asset metadata | Candidate local build | Delta |",
              "| --- | ---: | ---: | ---: |"]
    for name, value in result["packages"].items():
        lines.append(
            f"| `{name}` | {value['published_3_11_5_asset_bytes']:,} | "
            f"{value['measured_candidate_bytes']:,} | {value['delta_vs_published_asset_bytes']:+,} |"
        )
    rr = result["illustrative_regional_core_full_file_bytes"]
    lines += [
        "", "## Reference routing illustration", "",
        f"US South full-file *subset* if the published index is followed: **{rr['baseline_reference_index_included']:,} bytes**.",
        f"Optimized direct-route subset (taxonomy, verification, atlas, US South): **{rr['candidate_direct_route_subset']:,} bytes**.",
        rr["note"], "",
        "## Remaining release gates", "",
        "- [ ] Live ChatGPT, Gemini and Claude host loading/behavior checked",
        "- [ ] Baseline-vs-candidate musical quality reviewed with real recording evidence",
        "- [ ] Track matching, saved state and live publishing limitations evaluated without making unauthorized playlists",
        "- [ ] Version 3.11.6 synchronized *after qualification*",
        "- [ ] Separate approval obtained before public release/tag/reference promotion",
        "",
        "**No publication, deployment, tag or production-reference promotion was performed.**",
    ]
    if result["errors"]:
        lines += ["", "## Blocking findings", ""] + ["- " + issue for issue in result["errors"]]
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail if offline packaging/version checks fail")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "dist",
                        help="Local-only report path; never uploads or publishes")
    args = parser.parse_args()
    result = inspect(dist=args.output_dir)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "skill-release-qualification.json").write_text(
        json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (args.output_dir / "skill-release-qualification.md").write_text(
        render_markdown(result), encoding="utf-8")
    for filename, package in result["packages"].items():
        print(filename, "candidate_bytes=", package["measured_candidate_bytes"],
              "published_baseline_asset_bytes=", package["published_3_11_5_asset_bytes"])
    print("Offline qualification:", result["status"], "; live hosts: not tested; release: not authorized")
    for error in result["errors"]:
        print("FAIL:", error)
    return 1 if args.check and result["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
