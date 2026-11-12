#!/usr/bin/env python3
"""Build isolated Gate 4 ChatGPT Lab and Gemini QA ZIPs from validated source.

Developer test distribution only. Does not update any installed plugin, public
manifest, tag, production branch, source skill, or music provider.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
VERSION = "3.11.6-rc.4"
PROVENANCE = "Private Gate 4 TEST build (not public or production)"
ZIP_EPOCH = (1980, 1, 1, 0, 0, 0)


def _write(z: ZipFile, name: str, data: bytes) -> None:
    info = ZipInfo(name, ZIP_EPOCH)
    info.compress_type = ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    z.writestr(info, data)


def _stamp_skill(text: str, name: str, source_sha: str, gemini: bool) -> str:
    if not text.startswith("---\n"):
        raise ValueError("Missing skill frontmatter")
    text, n = re.subn(r"(?m)^name: go-hipster-go$", "name: " + name, text, count=1)
    if n != 1:
        raise ValueError("Unexpected canonical skill name")
    if gemini:
        text, n = re.subn(r"(?m)^version: 3\.11\.5$", "version: " + VERSION, text, count=1)
    else:
        text, n = re.subn(r'(?m)^  version: "3\.11\.5"$',
                          '  version: "' + VERSION + '"', text, count=1)
    if n != 1:
        raise ValueError("Unexpected candidate source version")
    frontmatter_end = text.index("\n---\n", 4) + len("\n---\n")
    stamp = (f"\n**{PROVENANCE}.** Build {VERSION}; "
             f"source commit {source_sha}. For text-only acceptance; "
             "do not publish or claim installed access without verification.\n")
    return text[:frontmatter_end] + stamp + text[frontmatter_end:]


def build_chatgpt(source_sha: str, output: Path) -> None:
    src = ROOT / "dist/go-hipster-go-chatgpt-plugin.zip"
    with ZipFile(src) as inp, ZipFile(output, "w") as out:
        names = set(inp.namelist())
        required = {"plugin.json", "skills/go-hipster-go/SKILL.md",
                    "skills/setup/SKILL.md"}
        if not required <= names:
            raise ValueError(f"Missing ChatGPT source archive members: {required - names}")
        plugin = json.loads(inp.read("plugin.json"))
        if plugin.get("name") != "go-hipster-go" or plugin.get("version") != "3.11.5":
            raise ValueError("Unexpected production plugin manifest")
        plugin["name"] = "go-hipster-go-lab"
        plugin["version"] = VERSION
        plugin["description"] = ("Private Go, Hipster, Go! Gate 4 candidate "
                                 "for controlled ChatGPT/Gemini tests; not public.")
        ui = plugin["extensions"]["com.openai"]["interface"]
        ui["displayName"] = "Go, Hipster, Go! Lab"
        ui["shortDescription"] = "Private rc.4 Gate 4 test"
        ui["longDescription"] = (f"{PROVENANCE}. Content pinned to {source_sha}; "
                                 "no publishing tests authorized.")
        ui["defaultPrompt"] = [
            "Use the Go, Hipster, Go! Lab skill. Report its exact candidate source SHA without making music.",
            "Use Go, Hipster, Go! Lab: go weird mid; exactly 12 tracks, text only. Do not publish.",
        ]
        for name in inp.namelist():
            dest = name.replace("skills/go-hipster-go/", "skills/go-hipster-go-lab/", 1)
            payload = inp.read(name)
            if name == "plugin.json":
                payload = (json.dumps(plugin, ensure_ascii=False, indent=2) + "\n").encode()
            elif name == "skills/go-hipster-go/SKILL.md":
                payload = _stamp_skill(payload.decode("utf-8"), "go-hipster-go-lab",
                                       source_sha, False).encode()
            _write(out, dest, payload)
        codex = {
            "interface": ui,
            "extensions": {"com.openai": {
                "onboardingSkill": plugin["extensions"]["com.openai"]["onboardingSkill"]}},
            "name": plugin["name"],
            "version": VERSION,
            "description": plugin["description"],
            "author": {"name": "Workspace upload"},
            "keywords": plugin["keywords"],
            "homepage": plugin["homepage"],
            "repository": plugin["repository"],
            "license": plugin["license"],
            "skills": "./skills",
        }
        _write(out, ".codex-plugin/plugin.json",
               (json.dumps(codex, ensure_ascii=False, indent=2) + "\n").encode())


def build_gemini(source_sha: str, output: Path) -> None:
    src = ROOT / "dist/go-hipster-go-gemini-app-skill.zip"
    with ZipFile(src) as inp, ZipFile(output, "w") as out:
        names = set(inp.namelist())
        if "SKILL.md" not in names or "references/verification.md" not in names:
            raise ValueError("Missing Gemini skill or verification reference")
        for name in inp.namelist():
            payload = inp.read(name)
            if name == "SKILL.md":
                payload = _stamp_skill(payload.decode("utf-8"),
                                       "go-hipster-go-gate4", source_sha, True).encode()
            _write(out, name, payload)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-sha", required=True)
    args = parser.parse_args()
    if not re.fullmatch(r"[a-f0-9]{40}", args.source_sha):
        parser.error("--source-sha must be one full Git commit SHA")
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    chatgpt = dist / "ghg-gate4-chatgpt-lab-rc4.zip"
    gemini = dist / "ghg-gate4-gemini-qa-rc4.zip"
    build_chatgpt(args.source_sha, chatgpt)
    build_gemini(args.source_sha, gemini)
    print("Built isolated private host QA ZIPs:", chatgpt.name, gemini.name)


if __name__ == "__main__":
    main()
