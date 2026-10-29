#!/usr/bin/env python3
"""Sync and optionally ZIP portable Claude/Gemini skill distributions from the canonical skill."""
from __future__ import annotations
import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
SKILL_PATH = Path("skills/go-hipster-go")
SOURCES = [
    "references/reference-index.md",
    "references/funky.md",
    "references/go-hard.md",
    "references/discovery-lenses.json",
    "references/regional-review.md",
    "references/regions/oceania-additions.md",
    "references/regions/central-america-additions.md",
    "references/regions/central-africa-additions.md",
    "references/regions/southern-africa-additions.md",

    "references/regional-atlas.md",
    "references/regions/us-west.md",
    "references/regions/us-east.md",
    "references/regions/canada-west.md",
    "references/regions/canada-east.md",
    "references/regions/mexico.md",
    "references/regions/central-america.md",
    "references/regions/caribbean.md",
    "references/regions/northern-south-america.md",
    "references/regions/southern-south-america.md",
    "references/regions/atlantic-europe.md",
    "references/regions/mediterranean-europe.md",
    "references/regions/northern-europe.md",
    "references/regions/eastern-europe.md",
    "references/regions/north-africa.md",
    "references/regions/west-africa.md",
    "references/regions/east-africa.md",
    "references/regions/central-southern-africa.md",
    "references/regions/middle-east.md",
    "references/regions/central-asia.md",
    "references/regions/south-asia.md",
    "references/regions/east-asia.md",
    "references/regions/southeast-asia.md",
    "references/regions/northern-asia.md",
    "references/regions/oceania.md",

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
    """Reuse the Gemini-filtered skill for Gem knowledge, not the multi-host source."""
    from build_gemini_app_skill import render, render_reference, REFERENCES
    canon = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    parts = ["# Go, Hipster, Go! — Gemini Skill knowledge bundle\n\n",
             "Generated from the filtered Gemini skill and regional reference files.\n\n",
             "# BEGIN SOURCE: SKILL.md\n\n", render(canon),
             "\n# END SOURCE: SKILL.md\n"]
    for path in REFERENCES:
        data = (ROOT / path).read_text(encoding="utf-8")
        parts.extend(["\n---\n\n# BEGIN SOURCE: " + path + "\n\n",
                      render_reference(path, data).strip(),
                      "\n\n# END SOURCE: " + path + "\n"])
    return "".join(parts)


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
    from build_gemini_app_skill import modular_files
    online = modular_files((ROOT / "SKILL.md").read_text(encoding="utf-8"), online=True)
    for relative, data in online.items():
        target = ROOT / "adapters/gemini" / relative
        if check:
            if not target.is_file() or target.read_text(encoding="utf-8") != data:
                mismatches.append(str(target.relative_to(ROOT)))
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(data, encoding="utf-8")
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
    # ChatGPT personal plugin upload needs the root manifest and complete skill.
    chatgpt_zip = output / "go-hipster-go-chatgpt-plugin.zip"
    with ZipFile(chatgpt_zip, "w", ZIP_DEFLATED) as z:
        for rel in ("plugin.json", "assets/icon.svg", "assets/logo.svg"):
            z.write(ROOT / rel, rel)
        for folder in ("skills/go-hipster-go", "skills/setup"):
            for src in (ROOT / folder).rglob("*"):
                if src.is_file():
                    z.write(src, str(src.relative_to(ROOT)))
    # Gemini web Skills uploader expects SKILL.md at the archive root.
    gemini_zip = output / "go-hipster-go-gemini-app-skill.zip"
    # Gemini Apps cannot rely on code execution. Ship text-only skill + references.
    from build_gemini_app_skill import build as build_gemini_app
    build_gemini_app(ROOT, gemini_zip)
    # Retire exact old-name aliases, including leftovers from earlier local builds.
    # Do not remove user-created or unknown archives from dist/.
    for obsolete in (
        "hipster-music-generator-gemini-app-skill.zip",
        "hipster-music-generator-claude-skill.zip",
        "hipster-music-generator-claude-plugin.zip",
        "hipster-music-generator-chatgpt-plugin.zip",
    ):
        (output / obsolete).unlink(missing_ok=True)
    print("Created", skill_zip.relative_to(ROOT), "and",
          plugin_zip.relative_to(ROOT), "and", gemini_zip.relative_to(ROOT), "and", chatgpt_zip.relative_to(ROOT))


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
