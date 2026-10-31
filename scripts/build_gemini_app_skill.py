#!/usr/bin/env python3
"""Generate the script-free Gemini Apps ZIP from the canonical skill.

Only SKILL.md and textual reference files are included. No executable
Python, script invocation, or developer-only adapter is distributed.
"""
from __future__ import annotations
import argparse
import re
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
REFERENCES = (
    "references/reference-index.md",
    "references/funky.md",
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

    "references/global-scenes.md",
    "references/sonic-taxonomy.md",
    "references/curation-examples.md",
    "references/verification.md",
)


def section_map(canonical: str):
    return {x.split("\n", 1)[0][3:].strip(): x.strip() for x in
            re.split(r"(?=^## )", canonical, flags=re.M) if x.startswith("## ")}


def common_sections(canonical: str):
    parts = section_map(canonical)
    keys = ("Intent and activation", "Voice: the Insufferable Record-Store Clerk",
            "Playlist writing: sell the music, not a spreadsheet",
            "Go modifiers and playlist length", "Antarctica: thematic listening territory", "Fresh-crate discovery and repeat control",
            "Curate in seven steps", "Deliberate irony and Easter egg", "Scope")
    if any(k not in parts for k in keys):
        raise ValueError("Canonical skill sections changed")
    intent = parts[keys[0]]
    parts[keys[0]] = intent.split("\n", 1)[0] + "\n\n" + intent[intent.index("Curate **real recordings**"):]
    parts[keys[1]] = re.sub(r"(?m)^- Publishing limitation:.*\n", "", parts[keys[1]])
    parts[keys[2]] = (parts[keys[2]].replace("including in **Claude**", "including in **Gemini**")
                       .replace("Spotify's playlist description field", "a playlist description field")
                       .replace("Spotify/YouTube result status", "YouTube Music result status"))
    # Keep the compact Gemini file below its host budget without dropping policy.
    marker = "**Voice calibration (hypothetical examples; not verified claims about specific recordings):**"
    prose, samples = parts[keys[2]].split(marker, 1)
    rows = [line for line in samples.splitlines() if line.startswith("|")]
    parts[keys[2]] = prose.rstrip() + "\n\n" + marker + "\n\n" + "\n".join(rows[:2]+rows[3:4]) + "\n\nThese are tone examples, not evidence about recordings."
    parts["Antarctica: thematic listening territory"] = """## Antarctica: thematic listening territory

For `go antarctica` or an Antarctica region selection, read [Antarctica](references/regions/antarctica.md) before discovery. Alone: only verified penguin-themed songs. Mixed: its thematic share plus geographically valid music from the other regions. Never invent a local scene or fill shortages with unrelated songs. Keep the copied trigger compact. Skip the spontaneous DeBarge roll for every Antarctica request."""
    fresh = re.sub(r"\*\*Apple Music handoff:\*\*.*?(?=\n\n)", "", parts["Fresh-crate discovery and repeat control"],
                   count=1, flags=re.S)
    if "**Gemini + YouTube Music — publication is the default" not in fresh:
        raise ValueError("Gemini policy anchor changed")
    parts["Fresh-crate discovery and repeat control"] = fresh.split("**Gemini + YouTube Music — publication is the default")[0].strip()
    egg, n = re.subn(
        r"Never claim 1% without using a true random facility; when Python is available run .*? once and read the result\.",
        "Never claim a 1% random result without a genuine random facility in this conversation. Do not run scripts.",
        parts["Deliberate irony and Easter egg"], count=1)
    if n != 1:
        raise ValueError("DeBarge random rule changed")
    parts["Deliberate irony and Easter egg"] = egg
    return "\n\n".join(parts[k] for k in keys)


def render_reference(relative: str, content: str) -> str:
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
        content, n = re.subn(
            r"\*\*Real Claude field report, updated .*?(?=\n\n## After a service reports playlist creation)",
            "", content, count=1, flags=re.S)
        if n != 1:
            raise ValueError("Claude report changed")
        return content.replace("\n\n\n\n", "\n\n")
    if relative == "references/curation-examples.md":
        content = content.split("## Host-aware recovery", 1)[0].rstrip() + "\n"
        content = re.sub(r"(?m)^\*\*Example, publish(?:ing|er) (?:success|missing):.*\n", "", content)
        return content.replace("Do not claim Claude, ChatGPT, Gemini or Spotify saved the text",
                               "Do not claim the streaming provider saved the text")
    return content


def render(canonical: str) -> str:
    preface = """---
name: go-hipster-go
version: 3.8.0
description: Use for Go, Hipster, Go! go, mood, speed and length commands, setup, obscure global music discovery, and verified deep-cut playlists with authorized Gemini YouTube Music publishing.
---

# Go, Hipster, Go! — Gemini Apps

## The personality is mandatory in Gemini

Play an insufferably smug, passive-aggressive record-store clerk. Open with a dry barb, add two or three varied little jabs grounded in real musical reasons and close smugly. If YouTube Music returns a neutral provider card, add truthful commentary, never invented service details. Lower the snark for distress or on request. Full voice rules follow below.

This is an instruction-only skill needing no code execution. Do not refuse curation because scripts cannot run.

## Gemini-native playlist creation

**Service precedence:** Explicit service in this request > accessible listener-approved setup preference > visible current-conversation preference > YouTube Music (Gemini default). No inherited Spotify default. Never silently substitute YouTube Music when Spotify is expressly requested. Gemini Spotify may support search or playback but cannot be assumed to expose a writer; ask before switching destination.

**Publish-first GO:** An ordinary go or go live curates 12 real, verified, ordered artist/title/version recordings by default (or the requested count), then attempts ONE connected and authorized YouTube Music playlist when selected and actually available. Non-mutating capability preflight happens before costly discovery; missing writer never blocks curation. Only explicit go, text only skips publishing. No saved account or typed @mention proves tool availability; setup never triggers a playlist.

**Fidelity and status:** Retain the exact intended ordered crate FIRST. When the connected playlist writer exposes explicit track-list input (for example `video_titles`), submit the full ordered `Artist - Track Title` list on the FIRST attempt, not a freeform mood/genre `query`. Omit label/catalog/year and editorial notes from lookup strings, while retaining necessary live/mix/instrumental distinctions; simplify punctuation only on a failed match. Preserve the original verified recording metadata and check available item-level results. If only themed playlist generation is offered, DO NOT call it as a fallback: keep the verified crate and report **PLAYLIST NOT CREATED — exact-track publishing unavailable**. Never invent an action or field. A generated card is not automatically saved: distinguish **Save to library**, user confirmation, writer-confirmed creation, and item-level readback. If no playlist exists, return the original crate and **PLAYLIST NOT CREATED**. Never invent matches, saved counts, order or URLs, generate individual YouTube video search cards instead of a playlist, reroll DeBarge or auto-retry. Offer one genuine next step such as selecting the real @YouTubeMusic connected app.

## Creative cue and count safeguards

A PWA **Mood angle** is an optional subplot, never a twelve-track quota. For Criminal, vary actual criminal narratives, languages, cultural scenes and storytelling perspectives; a prison-escape angle can inspire some tracks without reducing the entire crate to songs with escape in their titles. Treat a fresh-crate discovery lens and random spark as weak hypotheses, and omit a lens when its lyrical story cannot be verified. Song-specific criminal evidence always outranks word association.

**Pre-publish deduplication:** Produce the intended 12 **distinct recordings** (or requested count) before publication, aside from the expressly triggered DeBarge exception. Reject duplicate lyric uploads, compilations and transliterated or remastered versions of the same underlying song masquerading as different picks; compare normalized artist/title/recording and note real version differences. Prefer different artists where musical fit allows it. If YouTube Music returns extra songs, duplicate tracks or a different count, label the result **APPROXIMATE**, state the observed discrepancy and never claim the intended crate was saved exactly.

## Gemini setup

On setup, setup status, or setup change inspect actual connected music tools and optional user-approved preferences. With none, default to YouTube Music, 12 tracks, adventurous crate-digging, private where supported, and the comic persona. Do not interrogate every go or store preferences without approved real persistence. Setup does not publish, make an empty playlist, or roll DeBarge.

## Resource routing

Follow the [reference index](references/reference-index.md) before choosing a thesis. It specifies the required taxonomy, category discovery and verification sections, regional supplements and optional depth. Keep all four axes and the complete research map available. PWA angles, lenses and sparks remain hypotheses, not quotas or verified claims.

"""
    result = preface + common_sections(canonical) + "\n"
    forbidden = ("scripts/", "python ", "add_playlist_items", "--strict",
                 "Spotify is the default service", "Spotify by default",
                 "In ordinary **ChatGPT**", "Apple Music handoff",
                 "Real Claude field report", "\\n\\n##")
    if any(x.lower() in result.lower() for x in forbidden):
        raise ValueError("Gemini skill contains non-Gemini policy or malformed Markdown")
    return result


def modular_files(canonical: str, online: bool = False) -> dict[str, str]:
    """Keep installation small; preserve all policy in a deferred workflow reference."""
    full = render(canonical)
    split = full.index("## Intent and activation")
    entry, workflow = full[:split], full[split:]
    entry += "## Detailed workflow\n\nBefore curating, read [workflow.md](references/workflow.md) for the full voice, sequencing, freshness and surprise rules. Load only references relevant to the request; do not crawl all regions or preload references during installation. If a required reference cannot be read, report that limitation rather than claiming the full skill is loaded.\n"
    files = {"SKILL.md": entry, "references/workflow.md": workflow}
    if online:
        base = "https://raw.githubusercontent.com/focustimer-dev/go-hipster-go/main/"
        import re
        def link(match):
            path = match.group(1)
            target = "adapters/gemini/references/workflow.md" if path == "references/workflow.md" else path
            return "](" + base + target + ")"
        for path, content in list(files.items()):
            files[path] = re.sub(r"\]\((references/[^)]+)\)", link, content)
    return files


def build(root: Path, output: Path) -> None:
    files = modular_files((root / "SKILL.md").read_text(encoding="utf-8"))
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", ZIP_DEFLATED) as bundle:
        for path, text in files.items():
            bundle.writestr(path, text)
        for relative in REFERENCES:
            bundle.writestr(relative, render_reference(relative, (root / relative).read_text(encoding="utf-8")))
    print("Created", output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=ROOT / "dist/go-hipster-go-gemini-app-skill.zip")
    args = parser.parse_args()
    build(ROOT, args.output)


if __name__ == "__main__":
    main()
