"""Synchronize every active installation surface with one verified stable release.

The pinned manifest is the ONLY place to promote a recommended release. The
generated/source mirrors in launcher, Android and adapter docs must pass --check.
No prerelease or mutable 'latest' URL is silently advertised as stable.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "config/stable-skill-release.json"
REPO = "https://github.com/focustimer-dev/go-hipster-go"
RAW = "https://raw.githubusercontent.com/focustimer-dev/go-hipster-go"
FILES = [
    "README.md",
    "launcher/assets/app.js",
    "launcher/setup/index.html",
    "launcher/editions/gig-poster/setup/index.html",
    "android-lab/web/manual-guide.html",
    "android-lab/web/workspace.html",
    "adapters/gemini/README.md",
    "adapters/claude/README.md",
]
FILENAMES = {
    "go-hipster-go-chatgpt-plugin.zip",
    "go-hipster-go-gemini-app-skill.zip",
    "go-hipster-go-claude-skill.zip",
    "go-hipster-go-claude-plugin.zip",
}
ZIP_URL = re.compile(
    re.escape(REPO) + r"/releases/(?:latest/download|download/[^/\s\"'<>]+)/"
    r"(go-hipster-go-(?:chatgpt-plugin|gemini-app-skill|claude-skill|claude-plugin)\.zip)"
)
RAW_ENTRY = re.compile(
    re.escape(RAW) + r"/(?:main|release/skill-prod|gemini-skill-v\d+\.\d+\.\d+)/adapters/gemini/SKILL\.md"
)
VERSION_CHECK = re.compile(r"Verify version \d+\.\d+\.\d+")
RELEASES_BASE = re.compile(
    r'const releases=repo\+"/releases/(?:latest/download|download/[^"]+)/";'
)

def load():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    v, tag = manifest["version"], manifest["tag"]
    if manifest["channel"] != "stable" or tag != "gemini-skill-v" + v or "-rc" in v:
        raise ValueError("Only a formally published stable version may be promoted")
    if len(manifest["source_commit"]) != 40 or not re.fullmatch(r"[0-9a-f]{40}", manifest["source_commit"]):
        raise ValueError("Stable manifest needs its immutable source commit")
    expected = REPO + "/releases/download/" + tag + "/"
    artifacts = manifest["artifacts"]
    if {a["filename"] for a in artifacts.values()} != FILENAMES:
        raise ValueError("Missing or unexpected release ZIP assets")
    if len(artifacts) != 4:
        raise ValueError("Exactly four supported release packages")
    for a in artifacts.values():
        if a["url"] != expected + a["filename"] or not re.fullmatch(r"[0-9a-f]{64}", a["sha256"]):
            raise ValueError("Release URLs/digests must match immutable tag + filename")
    if manifest["release_page"] != REPO + "/releases/tag/" + tag:
        raise ValueError("Release page and asset tag do not match")
    return manifest

def synced(text: str, manifest: dict, path: str) -> str:
    lookup = {a["filename"]: a["url"] for a in manifest["artifacts"].values()}
    text = ZIP_URL.sub(lambda m: lookup[m.group(1)], text)
    # Version checks are explicit, not freeform: don't alter historical docs.
    text = VERSION_CHECK.sub("Verify version " + manifest["version"], text)
    if path in ("launcher/assets/app.js", "android-lab/web/manual-guide.html"):
        # A saved Gemini entry must come from the release that the prompt
        # claims to verify, not mutable main / release branches.
        text = RAW_ENTRY.sub(
            RAW + "/" + manifest["tag"] + "/adapters/gemini/SKILL.md", text)
    if path == "launcher/assets/app.js":
        text = RELEASES_BASE.sub(
            'const releases=repo+"/releases/download/' + manifest["tag"] + '/";', text)
    return text

def inspect(manifest):
    problems = []
    expected_base = REPO + "/releases/download/" + manifest["tag"] + "/"
    for path in FILES:
        source = ROOT / path
        if not source.is_file():
            problems.append(f"{path}: file missing")
            continue
        old = source.read_text(encoding="utf-8")
        new = synced(old, manifest, path)
        if new != old:
            problems.append(f"{path}: recommended links/version out of sync with canonical manifest")
        if "releases/latest/download/go-hipster-go-" in old:
            problems.append(f"{path}: floating ZIP URL remains")
        for match in ZIP_URL.finditer(old):
            if not match.group().startswith(expected_base):
                problems.append(f"{path}: ZIP from nonrecommended tag {match.group()}")
        if path in ("launcher/assets/app.js", "android-lab/web/manual-guide.html"):
            if "Verify version " + manifest["version"] not in old:
                problems.append(f"{path}: Gemini setup check must verify the stable version")
            if RAW + "/" + manifest["tag"] + "/adapters/gemini/SKILL.md" not in old:
                problems.append(f"{path}: Gemini small entry must be immutable and version-matched")
    return problems

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="Sync mirrors after updating the canonical manifest")
    args = parser.parse_args()
    m = load()
    if args.write:
        for path in FILES:
            source = ROOT / path
            old = source.read_text(encoding="utf-8")
            new = synced(old, m, path)
            if new != old:
                source.write_text(new, encoding="utf-8")
                print("Synchronized", path)
    errors = inspect(m)
    if errors:
        for error in errors:
            print("ERROR:", error, file=sys.stderr)
        sys.exit(1)
    print("Stable skill release aligned:", m["version"], m["tag"],
          "— 4 published ZIPs, 8 installation surfaces")

if __name__ == "__main__":
    main()
