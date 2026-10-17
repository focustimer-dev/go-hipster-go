#!/usr/bin/env python3
"""Generate the script-free Gemini Apps ZIP from the canonical skill.

Only SKILL.md and four textual reference files are included. No executable
Python, script invocation, or developer-only adapter is distributed.
"""
from __future__ import annotations
import argparse
import re
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
REFERENCES = (
    "references/global-scenes.md",
    "references/sonic-taxonomy.md",
    "references/curation-examples.md",
    "references/verification.md",
)


def render(canonical: str) -> str:
    body = canonical[canonical.index("## Intent and activation"):]
    old_roll = r"Never claim 1% without using a true random facility; when Python is available run .*? once and read the result\."
    new_roll = ("Never claim a 1% chance unless an actual random facility is available "
                "in this Gemini conversation. Do not run scripts. If no reliable random "
                "source is available, skip the spontaneous Easter egg; an explicitly "
                "requested DeBarge Protocol still works.")
    body, count = re.subn(old_roll, new_roll, body)
    if count != 1:
        raise ValueError("Canonical DeBarge paragraph changed; review the Gemini rendering")
    start = body.index("For structured export, follow")
    end = body.index("List unresolved tracks clearly.", start)
    body = (body[:start] + "For structured export, provide an ordered artist/title list "
            "or JSON when requested; no script execution is required. " + body[end:])
    old_adapter = "Use [the adapter contract](adapters/README.md) and the provider guides."
    if old_adapter not in body:
        raise ValueError("Canonical adapter paragraph changed; review the Gemini rendering")
    body = body.replace(old_adapter,
                        "For YouTube Music, use only real connected-app actions exposed "
                        "in this conversation when authorized. Do not promise exact tracks "
                        "or ordering if the resulting playlist cannot be confirmed.")
    body = body.replace(" See [evaluation prompts](tests/discovery-cases.md).", "")
    if "scripts/" in body or "python " in body.lower():
        raise ValueError("A code-running instruction remains in the Gemini skill")
    return (
        "---\n"
        "name: hipster-music-generator\n"
        "description: On go, attempt to create a playable playlist in connected "
        "YouTube Music or another available music app. Explore adventurous real "
        "global music and verify the saved recordings.\n"
        "---\n\n"
        "# Hipster Music Generator — Gemini Apps\n\n"
        "**This is an instruction-only music-curation skill. It requires no code "
        "execution.** Never refuse to curate because executable scripts cannot run. "
        "All included reference files are plain-text musical knowledge.\n\n"
        "**Start with a non-mutating publishing preflight:** On go, inspect "
        "genuinely exposed connected playlist-writing capabilities before choosing "
        "songs, then curate and attempt to save a playable playlist. This is user "
        "publishing intent but cannot bypass account or host permissions. A service "
        "may support search/play without precise playlist creation. Use only available "
        "and authorized actions; never claim a playlist was saved without confirmation. "
        "Do not request login credentials.\n\n"
        + body
    )


def build(root: Path, output: Path) -> None:
    text = render((root / "SKILL.md").read_text(encoding="utf-8"))
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", ZIP_DEFLATED) as bundle:
        bundle.writestr("SKILL.md", text)
        for relative in REFERENCES:
            bundle.write(root / relative, relative)
    print("Created", output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=ROOT / "dist/hipster-music-generator-gemini-app-skill.zip")
    args = parser.parse_args()
    build(ROOT, args.output)


if __name__ == "__main__":
    main()
