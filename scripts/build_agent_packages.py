#!/usr/bin/env python3
"""Sync and optionally ZIP portable Claude/Gemini skill distributions from the canonical skill."""
from __future__ import annotations
import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from shutil import copyfile

ROOT = Path(__file__).resolve().parents[1]
SKILL_PATH = Path("skills/go-hipster-go")
SOURCES = [
    "SKILL.md",
    "references/global-scenes.md",
    "references/sonic-taxonomy.md",
    "references/curation-examples.md",
    "references/verification.md",
    "schemas/playlist.schema.json",
    "scripts/playlist_cli.py",
    "adapters/README.md",
    "adapters/streaming/youtube.md",
    "adapters/streaming/spotify.md",
    "adapters/streaming/apple-music.md",
    "tests/discovery-cases.md",
]
CHATGPT_BUNDLE = Path("adapters/chatgpt/CHATGPT_KNOWLEDGE.md")
GEM_BUNDLE = Path("adapters/gemini/GEM_KNOWLEDGE.md")


def gem_knowledge():
    contents = (ROOT / CHATGPT_BUNDLE).read_text(encoding="utf-8")
    return (contents.replace("ChatGPT knowledge bundle", "Gemini Skill knowledge bundle")
            .replace("used together with Project instructions", "used together with Gem instructions"))


def sync(check: bool):
    mismatches = []
    for path in SOURCES:
        original = (ROOT / path).read_bytes()
        target = ROOT / SKILL_PATH / path
        if check:
            if not target.is_file() or target.read_bytes() != original:
                mismatches.append(str(target.relative_to(ROOT)))
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(original)
    target = ROOT / GEM_BUNDLE
    desired = gem_knowledge()
    if check:
        if not target.is_file() or target.read_text(encoding="utf-8") != desired:
            mismatches.append(str(GEM_BUNDLE))
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(desired, encoding="utf-8")
    if mismatches:
        raise SystemExit("Out-of-sync distribution files (run without --check): " + ", ".join(mismatches))
    print("Portable distributions synchronized" if not check else "Portable distributions are up to date")


def make_zips():
    output = ROOT / "dist"
    output.mkdir(exist_ok=True)
    skill_zip = output / "go-hipster-go-claude-skill.zip"
    with ZipFile(skill_zip, "w", ZIP_DEFLATED) as z:
        for src in (ROOT / SKILL_PATH).rglob("*"):
            if src.is_file():
                z.write(src, "go-hipster-go/" + str(src.relative_to(ROOT / SKILL_PATH)))
    plugin_zip = output / "go-hipster-go-claude-plugin.zip"
    with ZipFile(plugin_zip, "w", ZIP_DEFLATED) as z:
        for src in (ROOT / ".claude-plugin" / "plugin.json",):
            z.write(src, str(src.relative_to(ROOT)))
        for folder in ("skills/go-hipster-go", "skills/setup"):
            for src in (ROOT / folder).rglob("*"):
                if src.is_file():
                    z.write(src, str(src.relative_to(ROOT)))
    # Gemini web Skills uploader expects SKILL.md at the archive root.
    gemini_zip = output / "go-hipster-go-gemini-app-skill.zip"
    # Gemini Apps cannot rely on code execution. Ship text-only skill + references.
    from build_gemini_app_skill import build as build_gemini_app
    build_gemini_app(ROOT, gemini_zip)
    # Legacy ZIP filenames are aliases containing the new identity.
    for renamed, legacy in (
        ("go-hipster-go-claude-skill.zip", "hipster-music-generator-claude-skill.zip"),
        ("go-hipster-go-claude-plugin.zip", "hipster-music-generator-claude-plugin.zip"),
        ("go-hipster-go-gemini-app-skill.zip", "hipster-music-generator-gemini-app-skill.zip"),
    ):
        copyfile(output / renamed, output / legacy)
    print("Created", skill_zip.relative_to(ROOT), "and",
          plugin_zip.relative_to(ROOT), "and", gemini_zip.relative_to(ROOT))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify vendored files match their canonical sources")
    parser.add_argument("--zip", action="store_true", help="Build Claude upload ZIPs in dist/")
    args = parser.parse_args()
    sync(args.check)
    if args.zip:
        make_zips()


if __name__ == "__main__":
    main()
