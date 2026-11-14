"""Inspect the *packaged* native Android RC, not only source manifests.

This is a keyless M5 release gate, not a Play Store review or 16 KB emulator test.
If bundled native libraries appear, stop and perform explicit 16 KB validation
instead of assuming that AGP or Java source alone establishes compatibility.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import zipfile
from pathlib import Path

POLICY_URL = "https://hipster-go.samelling.workers.dev/privacy/"
SUPPORT_URL = "https://hipster-go.samelling.workers.dev/support/"
EXPECTED_PERMISSIONS = {"android.permission.INTERNET"}
EXPECTED_PACKAGES = {
    "production_apk": "work.samelling.hipstergo",
    "qa_apk": "work.samelling.hipstergo.qa",
}


class PackageAuditError(ValueError):
    pass


def inspect_archive(path: Path, *, is_bundle: bool) -> dict:
    path = Path(path)
    html = "base/assets/site/index.html" if is_bundle else "assets/site/index.html"
    with zipfile.ZipFile(path, "r") as archive:
        entries = archive.namelist()
        if len(entries) != len(set(entries)):
            raise PackageAuditError(f"{path.name}: duplicate ZIP entry names")
        native_libs = sorted(name for name in entries if name.lower().endswith(".so"))
        if native_libs:
            raise PackageAuditError(
                f"{path.name}: bundled native libraries require individual 16 KB "
                f"ELF/ZIP alignment and device checks: {native_libs[:12]!r}")
        if html not in entries:
            raise PackageAuditError(f"{path.name}: missing packaged offline UI {html}")
        content = archive.read(html).decode("utf-8")
        missing = [url for url in (POLICY_URL, SUPPORT_URL) if url not in content]
        if missing:
            raise PackageAuditError(f"{path.name}: packaged app missing legal links: {missing!r}")
        if is_bundle:
            if "base/manifest/AndroidManifest.xml" not in entries:
                raise PackageAuditError(f"{path.name}: no packaged AAB base manifest")
        elif "AndroidManifest.xml" not in entries:
            raise PackageAuditError(f"{path.name}: no packaged APK manifest")
        large = sorted(
            ((info.file_size, info.filename) for info in archive.infolist() if not info.is_dir()),
            reverse=True,
        )[:8]
        return {
            "bytes": path.stat().st_size,
            "entries": len(entries),
            "packaged_ui": html,
            "privacy_url_present": True,
            "support_url_present": True,
            "bundled_native_libraries": native_libs,
            "largest_uncompressed_entries": [
                {"path": name, "bytes": size} for size, name in large
            ],
        }


def parse_aapt_permissions(output: str) -> set[str]:
    return set(re.findall(
        r"(?m)^uses-permission(?:-sdk-\d+)?: name='([^']+)'", output
    ))


def inspect_apk_identity(aapt_path: Path, apk: Path, expected_package: str) -> dict:
    permissions_text = subprocess.check_output(
        [str(aapt_path), "dump", "permissions", str(apk)], text=True
    )
    permissions = parse_aapt_permissions(permissions_text)
    if permissions != EXPECTED_PERMISSIONS:
        raise PackageAuditError(
            f"{apk.name}: merged permissions changed: {sorted(permissions)!r}; "
            "re-evaluate Android policy, disclosure and Data safety")
    badging = subprocess.check_output(
        [str(aapt_path), "dump", "badging", str(apk)], text=True
    )
    package = re.search(r"(?m)^package: name='([^']+)'", badging)
    target = re.search(r"(?m)^targetSdkVersion:'(\d+)'", badging)
    if not package or package.group(1) != expected_package:
        raise PackageAuditError(f"{apk.name}: wrong compiled package identity")
    if not target or int(target.group(1)) != 36:
        raise PackageAuditError(f"{apk.name}: target SDK not 36 in final package")
    return {
        "package": package.group(1),
        "target_sdk": int(target.group(1)),
        "merged_permissions": sorted(permissions),
    }


def audit(aapt: Path, production_apk: Path, production_aab: Path, qa_apk: Path) -> dict:
    results = {
        "production_apk": inspect_archive(production_apk, is_bundle=False),
        "production_aab": inspect_archive(production_aab, is_bundle=True),
        "qa_apk": inspect_archive(qa_apk, is_bundle=False),
    }
    for label, path in [("production_apk", production_apk), ("qa_apk", qa_apk)]:
        results[label].update(
            inspect_apk_identity(aapt, path, EXPECTED_PACKAGES[label])
        )
    return {
        "schema_version": 1,
        "purpose": "keyless compiled artifact audit, not signed Play approval",
        "native_library_gate": "no bundled .so files; new .so requires 16 KB review",
        "artifacts": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--aapt", required=True, type=Path)
    parser.add_argument("--production-apk", required=True, type=Path)
    parser.add_argument("--production-aab", required=True, type=Path)
    parser.add_argument("--qa-apk", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    result = audit(
        args.aapt, args.production_apk, args.production_aab, args.qa_apk
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n")
    print("Compiled APK/AAB audit passed: HTTPS policy/support links, permissions, "
          "API 36, package IDs and no bundled native libraries.")
    for label, item in result["artifacts"].items():
        print(f"{label}: {item['bytes']:,} bytes; {item['entries']} ZIP entries")


if __name__ == "__main__":
    main()
