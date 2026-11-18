#!/usr/bin/env python3
"""Generate the script-free Gemini Apps ZIP from the canonical skill.

Only SKILL.md and textual reference files are included. No executable
Python, script invocation, or developer-only adapter is distributed.
"""
from __future__ import annotations
import argparse
import re
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
REFERENCES = (
    "references/recording-quality.md",
    "references/reference-index.md",
    "references/de-cheese.md",
    "references/discovery-routes.md",
    "references/seed-cues.json",
    "references/mood-spark-bank.json",
    "references/funky.md",
    "references/desire-triumphant.md",
    "references/regions/antarctica.md",
    "references/go-hard.md",
    "references/regional-review.md",
    "references/regions/oceania-additions.md",
    "references/regions/central-america-additions.md",
    "references/regions/central-africa-additions.md",
    "references/regions/southern-africa-additions.md",

    "references/regional-atlas.md",
    "references/regions/us-west.md",
    "references/regions/us-east.md",
    "references/regions/us-midwest.md",
    "references/regions/us-south.md",
    "references/regions/canada-west.md",
    "references/regions/canada-east.md",
    "references/regions/mexico.md",
    "references/regions/central-america.md",
    "references/regions/caribbean.md",
    "references/regions/northern-south-america.md",
    "references/regions/southern-south-america.md",
    "references/regions/atlantic-europe.md",
    "references/regions/mediterranean-europe.md",
    "references/regions/balkans.md",
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

    "references/global-scenes.md",
    "references/sonic-taxonomy.md",
    "references/curation-examples.md",
    "references/verification.md",
    "references/cover-art.md",
    "references/gemini-publish.md",
)


def section_map(canonical: str):
    return {x.split("\n", 1)[0][3:].strip(): x.strip() for x in
            re.split(r"(?=^## )", canonical, flags=re.M) if x.startswith("## ")}


def render_reference(relative: str, content: str) -> str:
    if relative in ("references/de-cheese.md", "references/sonic-taxonomy.md",
                    "references/curation-examples.md", "references/regions/antarctica.md"):
        path = ROOT / "adapters/gemini/templates" / relative
        return path.read_text(encoding="utf-8")
    if relative.startswith("references/regions/"):
        return re.sub(r"\[([^\]\n]*)\]\(https://drive\.google\.com/[^)\s]*\)",
                      r"\1 (archival source)", content)
    if relative == "references/verification.md":
        content, n = re.subn(
            r"Use .verification.status. on each entry:.*?\n\n",
            "For each recording, distinguish verified facts from unresolved claims. Never guess catalog or service IDs.\n\n",
            content, count=1, flags=re.S)
        if n != 1:
            raise ValueError("Verification schema wording changed")
        content = re.sub(
            r"The validator's .--strict. flag checks minimum verification metadata, not factual truth; independent listening/catalog validation is still needed\.",
            "A verified result needs actual trustworthy sources, not just well-formed metadata.", content)
        # Strip developer-only CLI/schema details from Gemini's script-free
        # verification reference; keep the six listener-facing evidence statuses.
        content, n = re.subn(
            r"\*\*Do not write these six values into playlist JSON format 1\.0\.\*\*.*?(?=\*\*Partial preview example:\*\*)",
            "**Gemini runtime:** These six labels describe the actual user-facing outcome, not a claim that a generated card was saved. Compare requested, curated and full provider-confirmed totals separately; unknown or hidden positions are not missing tracks. Confirm library saving before reporting SAVED. Report PUBLISHED — EXACT only after saved-library confirmation, a fully known provider count and independently verified artist/title/version and order for every position. If the result differs, describe only observed mismatches. Match intentionally repeated recordings position by position. Never guess item IDs or claim tool access from this guidance.\n\n",
            content, count=1, flags=re.S,
        )
        if n != 1:
            raise ValueError("Gemini verification status section changed")
        return content.replace("\n\n\n\n", "\n\n")
    if relative == "references/curation-examples.md":
        content = content.split("## Host-aware recovery", 1)[0].rstrip() + "\n"
        content = re.sub(r"(?m)^\*\*Example, publish(?:ing|er) (?:success|missing):.*\n", "", content)
        return content.replace("Do not claim Claude, ChatGPT, Gemini or Spotify saved the text",
                               "Do not claim the streaming provider saved the text")
    return content


def render(canonical: str, root: Path = ROOT) -> str:
    files = modular_files(canonical, root=root)
    return "\n\n".join(files[path].rstrip() for path in (
        "SKILL.md", "references/workflow.md", "references/setup.md"
    )) + "\n"


def modular_files(canonical: str, online: bool = False, root: Path = ROOT) -> dict[str, str]:
    templates = root / "adapters/gemini/templates"
    files = {
        path: (templates / path).read_text(encoding="utf-8")
        for path in ("SKILL.md", "references/workflow.md", "references/setup.md")
    }
    version = re.search(r'(?m)^  version: "([^"]+)"$', canonical).group(1)
    files["SKILL.md"] = files["SKILL.md"].replace("{version}", version)
    curve = section_map(canonical)["Tempo and mood curve"].strip() + "\n"
    files["references/tempo-curve.md"] = curve.replace(
        " and skip the surprise Easter-egg roll for a curve request", ""
    )
    if online:
        # Published online references use a manually promoted production branch.
        # Never point deployed Gemini instructions at the moving main branch.
        base = "https://raw.githubusercontent.com/focustimer-dev/go-hipster-go/release/skill-prod/"
        def link(match):
            path = match.group(1)
            target = "adapters/gemini/" + path if path in files else path
            return "](" + base + target + ")"
        for path, content in list(files.items()):
            files[path] = re.sub(r"\]\((references/[^)]+)\)", link, content)
    return files


def build(root: Path, output: Path) -> None:
    files = modular_files((root / "SKILL.md").read_text(encoding="utf-8"), root=root)
    output.parent.mkdir(parents=True, exist_ok=True)
    # Match the portable ChatGPT/Claude ZIP determinism contract: stable
    # member paths, timestamps, permissions, compression and UTF-8 bytes.
    def add_text(bundle: ZipFile, name: str, content: str):
        info = ZipInfo(name, (1980, 1, 1, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        bundle.writestr(info, content.encode("utf-8"))

    with ZipFile(output, "w", ZIP_DEFLATED) as bundle:
        for path in sorted(files):
            add_text(bundle, path, files[path])
        for relative in sorted(REFERENCES):
            add_text(bundle, relative, render_reference(relative, (root / relative).read_text(encoding="utf-8")))
    print("Created", output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=ROOT / "dist/go-hipster-go-gemini-app-skill.zip")
    args = parser.parse_args()
    build(ROOT, args.output)


if __name__ == "__main__":
    main()
