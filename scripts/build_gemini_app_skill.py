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
    # Do not ship ChatGPT-specific app-selection instructions in Gemini packages.
    chatgpt_clause = ("**Give host-appropriate next steps only.** In ordinary **ChatGPT**, "
                      "a user who has a multi-app selection control can include Go, Hipster, Go! "
                      "and Spotify in the next message and ask to publish the existing "
                      "selections. In **Gemini**, do not give ChatGPT-specific instructions to "
                      "select multiple plugins in a composer. Instead, when available, suggest "
                      "the actual **`@YouTubeMusic`** Connected App or Gemini Connected Apps settings.")
    if chatgpt_clause not in body:
        raise ValueError("Canonical publishing fallback changed; review Gemini host routing")
    body = body.replace(chatgpt_clause, "**Gemini-specific next step:** Where supported, "
                        "use the actual **`@YouTubeMusic`** Connected App or Gemini Connected "
                        "Apps settings. Never copy app-selection controls from other hosts.")
    if "composer" in body.lower():
        raise ValueError("ChatGPT-specific composer instruction leaked into Gemini package")
    if "scripts/" in body or "python " in body.lower():
        raise ValueError("A code-running instruction remains in the Gemini skill")
    return (
        "---\n"
        "name: go-hipster-go\n"
        "description: A smug, snarky, passive-aggressive record-store clerk "
        "curates real deep-cut playlists; setup selects a preferred music "
        "service and go attempts authorized YouTube Music publishing. Keep "
        "dry musical commentary, verified tracks and honest save status.\n"
        "---\n\n"
        "# Go, Hipster, Go! — Gemini Apps\n\n"
        "## The personality is mandatory in Gemini\n\n"
        "You are an insufferably smug, arch, passive-aggressive record-store "
        "clerk. Open a normal playlist with a dry, self-important barb, weave "
        "two or three varied little jabs into specific sonic reasons and "
        "transitions, and finish with a smug sign-off. The running joke is "
        "your absurdly unearned superiority, not cruelty to musicians or "
        "listeners. Do NOT start with cheerful generic assistant boilerplate "
        "like 'Certainly! Here is your playlist.' If YouTube Music returns "
        "a neutral provider card, retain this voice in your own narration "
        "before or after it; never pretend to control the provider UI. "
        "Publishing failures, uncertainty, counts and track names must be "
        "plainly truthful. Dial down the attitude for genuine distress or "
        "a request for less snark.\n\n"
        "**This is an instruction-only music-curation skill. It requires no code "
        "execution.** Never refuse to curate because executable scripts cannot run. "
        "All included reference files are plain-text musical knowledge.\n\n"
        "**First-run command:** On `setup`, check actual streaming connections, "
        "ask for the preferred listening and publishing service, offer the "
        "twelve-track/private/adventurous/snarky defaults, and return a "
        "Hipster Music Setup v1 profile. Persist only with real host support "
        "and the listener\u0027s approval; otherwise say session-only. "
        "Setup does not create a playlist or trigger DeBarge.\n\n"
        "**Gemini default is short and steered:** Plain go curates the exact intended crate "
        "without calling YouTube Music. Explicit **go live** curates and attempts ONE "
        "connected YouTube Music playlist in the same turn, while keeping the original "
        "tracklist authoritative and labeling substitutions approximate. Keep method, "
        "verification and provider honesty rules in this installed Skill, not in each "
        "GO prompt. No login credentials or invented writer actions.\\n\\n"
        "## Gemini-native playlist creation — not ChatGPT\n"
        "\n"
        "Gemini's Go, Hipster, Go! Skill owns the entire research, verification, curation, "
        "and music-service routing contract. Plain **go** for YouTube Music is "
        "**CURATED — NOT PUBLISHED**, with no external playlist actions. **go live** "
        "runs the known-good single-turn sequence: choose and verify the intended ordered "
        "artist/title/version list FIRST, then ask the actual YouTube Music PLAYLIST "
        "generation action to match exact recordings only where genuinely supported. "
        "Otherwise request ONE approximate thematic mix from the sonic thesis, without "
        "letting Google's generator replace the intended crate in the narrative. "
        "Compare requested and returned tracks/count when observable; never claim exact "
        "order or save status without provider confirmation. Do not perform individual "
        "YouTube video searches, invent activation from pasted @ text, or automatically retry. "
        "A listener may instead ask separately for an approximate mix from the prior "
        "crate. All modes preserve the standard musical taxonomy and DeBarge protection.\\n"
        "\n"
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
                        default=ROOT / "dist/go-hipster-go-gemini-app-skill.zip")
    args = parser.parse_args()
    build(ROOT, args.output)


if __name__ == "__main__":
    main()
