#!/usr/bin/env python3
"""Build one text-forward ChatGPT Project knowledge upload from canonical skill files."""
from pathlib import Path
import argparse

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "adapters/chatgpt/CHATGPT_KNOWLEDGE.md"
SOURCES = [
    "SKILL.md",
    "references/global-scenes.md",
    "references/sonic-taxonomy.md",
    "references/curation-examples.md",
    "references/verification.md",
]


def render() -> str:
    parts = [
        "# Go, Hipster, Go! — ChatGPT knowledge bundle\n\n",
        "A generated, text-forward snapshot of the **canonical** repository skill. "
        "This is reference material used together with Project instructions; "
        "it does not install scripts, APIs, music-streaming access, or authorization.\n\n",
        "**Source:** https://github.com/focustimer-dev/go-hipster-go\n\n",
        "**Files included:** " + ", ".join(f"`{path}`" for path in SOURCES) + ".\n\n",
    ]
    for path in SOURCES:
        contents = (ROOT / path).read_text(encoding="utf-8").strip()
        parts.extend([f"\n---\n\n# BEGIN SOURCE: {path}\n\n", contents, f"\n\n# END SOURCE: {path}\n"])
    return "".join(parts)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Exit nonzero if committed bundle is out of date")
    args = parser.parse_args()
    desired = render()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != desired:
            parser.exit(1, "ChatGPT knowledge bundle is stale: run python scripts/build_chatgpt_bundle.py\n")
        print("ChatGPT bundle is up to date")
    else:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT.write_text(desired, encoding="utf-8")
        print(f"Wrote {OUTPUT.relative_to(ROOT)} ({len(desired)} characters)")


if __name__ == "__main__":
    main()
