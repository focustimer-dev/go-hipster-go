"""Produce inspectable, keyless Android RC build provenance.

This is a factual CI evidence record, NOT a signed attestation or Play approval.
The QA APK uses a temporary runner debug key. The actual production APK/AAB
remain unsigned until the owner approves Play identity and upload signing.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = {
    "production_apk": (
        "android-production/app/build/outputs/apk/release/app-release-unsigned.apk",
        "work.samelling.hipstergo", "unsigned"),
    "production_aab": (
        "android-production/app/build/outputs/bundle/release/app-release.aab",
        "work.samelling.hipstergo", "unsigned"),
    "qa_apk": (
        "android-production/app/build/outputs/apk/qa/app-qa.apk",
        "work.samelling.hipstergo.qa", "temporary_runner_debug"),
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for part in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(part)
    return digest.hexdigest()


def git_head() -> str:
    return subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
    ).strip()


def version_info() -> tuple[int, str]:
    gradle = (ROOT / "android-production/app/build.gradle").read_text()
    number = re.search(r"\bversionCode\s+(\d+)\b", gradle)
    name = re.search(r"\bversionName\s+['\"]([^'\"]+)['\"]", gradle)
    if not number or not name:
        raise ValueError("Android version missing; abort release evidence")
    return int(number.group(1)), name.group(1)


def make_evidence(
    source_head: str,
    checkout_sha: str,
    qa_certificate_sha256: str,
    *,
    when: str | None = None,
) -> dict:
    for label, value in (
        ("source head", source_head),
        ("checkout SHA", checkout_sha),
        ("QA certificate fingerprint", qa_certificate_sha256),
    ):
        if not re.fullmatch(r"[a-fA-F0-9]{40 if label != 'QA certificate fingerprint' else 64}", value):
            raise ValueError(f"Invalid {label}")

    version_code, version_name = version_info()
    release = json.loads((ROOT / "config/stable-skill-release.json").read_text())
    artifacts = {}
    for kind, (relative, package, signing) in FILES.items():
        path = ROOT / relative
        if not path.is_file() or path.stat().st_size == 0:
            raise FileNotFoundError(f"Missing or empty {kind}: {relative}")
        artifacts[kind] = {
            "path": relative,
            "package": package,
            "signing": signing,
            "size_bytes": path.stat().st_size,
            "sha256": sha256(path),
        }

    return {
        "schema_version": 1,
        "purpose": "keyless CI evidence only; not a signed attestation or Play approval",
        "generated_utc": when or datetime.now(timezone.utc).isoformat(),
        "repository": "focustimer-dev/go-hipster-go",
        "source_head_sha": source_head.lower(),
        "actual_checkout_sha": checkout_sha.lower(),
        "version_code": version_code,
        "version_name": version_name,
        "target_sdk": 36,
        "stable_skill_version": release["version"],
        "stable_skill_tag": release["tag"],
        "production_signing_approved": False,
        "qa_certificate_sha256": qa_certificate_sha256.lower(),
        "artifacts": artifacts,
    }


def write_evidence(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--source-head", required=True)
    parser.add_argument("--qa-certificate-sha256", required=True)
    args = parser.parse_args()
    evidence = make_evidence(args.source_head, git_head(), args.qa_certificate_sha256)
    write_evidence(args.output, evidence)
    print(
        "RC evidence recorded: checkout", evidence["actual_checkout_sha"],
        "source", evidence["source_head_sha"],
        "artifacts", ", ".join(evidence["artifacts"]),
    )


if __name__ == "__main__":
    main()
