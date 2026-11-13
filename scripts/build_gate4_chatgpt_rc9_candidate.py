#!/usr/bin/env python3
"""Build an isolated ChatGPT 3.11.6-rc.9 unified discovery candidate.

Input: the generated canonical 3.11.5 ChatGPT ZIP plus two existing seed banks.
The script never changes canonical/Gemini/Claude sources, installed plugins,
public assets, app code or music services.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
NAME = "go-hipster-go-gate4-release-probe"
VERSION = "3.11.6-rc.9"
BASE_NAME = "go-hipster-go"
BASE_VERSION = "3.11.5"
ZIP_EPOCH = (1980, 1, 1, 0, 0, 0)
BANKS = ("references/seed-cues.json", "references/mood-spark-bank.json")
REQUIRED = (
    "references/reference-index.md",
    "references/sonic-taxonomy.md",
    "references/global-scenes.md",
    "references/regional-atlas.md",
    "references/discovery-routes.md",
    "references/verification.md",
    "references/regions/canada-east.md",
    "references/regions/atlantic-europe.md",
    "references/regions/eastern-europe.md",
    "references/regions/central-america-additions.md",
    "references/regions/central-africa-additions.md",
    "references/regions/southern-africa-additions.md",
)

POLICY = """\
## Unified discovery checkpoint — private RC9 acceptance candidate

This is ONE early decision within the existing discovery budget, not a new
research pass, random tool, public input or replacement for musical judgment.

1. **Lock the listener brief first.** Parse mood and blend, every position in
   any `c1:` tempo/mood curve, explicit regions, exclusions, recording quality,
   GO HARD, count, inspiration, supplied seed, discovery route and publishing
   permissions. A curve overrides global pace/mood at its individual slots.
   Explicit `Seed:` or `Inspiration:` takes priority over internal seed selection;
   a supplied `Discovery route: v1/Rxx` takes priority as the search start.
2. **Choose a quiet compound seed only for genuinely new GO requests without
   supplied seed/inspiration.** Load the *actual* `references/seed-cues.json`
   and `references/mood-spark-bank.json` once. First, reject the single most
   predictable compatible rhythm/sonic start and choose a different rhythm cue
   allowed by requested pace. Next, reject its most predictable texture partner
   and choose a compatible texture cue. Finally, reject the automatic emotional
   consequence and choose a compatible mood-tension cue. Use at most one such
   rejection per component; stop if alternatives would harm fit. For a `c1:`
   curve, these cues guide the *unifying sonic thread*, not an imposed single
   tempo or mood on all twelve tracks. This is model variation, **not uniform
   RNG**; never claim a random draw, extra code execution or unseen history.
   If the banks cannot be read, skip the seed rather than inventing their data.
3. **Route before naming artists.** Read the reference index, relevant sonic
   taxonomy and verification rules. If regions are specified, start from
   `regional-atlas.md`, the selected region files and mandatory supplements;
   do NOT preload worldwide `global-scenes.md` just to increase novelty. On
   region-free/worldwide GO, consult global scenes. Respect a supplied v1/Rxx
   route by reading `discovery-routes.md` and exploring it within the regions.
   Compare three genuinely distinct *compatible* candidate-search directions
   using the existing four axes (era, audible texture/production, actual scene,
   microgenre/movement); not three variants of one familiar artist roster.
   The seed and optional Rxx route influence real candidate discovery, not only
   the title or liner notes. Never relax geography to achieve surprise.
4. **Select and verify.** Ordinary GO remains single-pass; GO HARD retains its
   existing independent-path funnel. Verify exact real recordings, song-specific
   Criminal narratives, curved slot fit, credits, versions and clean-transfer
   evidence where available. Familiar songs can earn a slot; do not enforce
   obscurity, era, country, instrument or repetition quotas. User constraints
   and text-only/no-publish instructions always win. On missing access or weak
   evidence, disclose the limitation; never claim file reads, listening,
   cross-chat memory, publication or track-level readback without evidence.

This checkpoint is not used for de-cheese, setup, or publication/retry of an
existing crate. A genuine new refresh may make new internal choices while
preserving its visible brief and non-publishing preference.
"""


def _write(archive: ZipFile, name: str, payload: bytes) -> None:
    info = ZipInfo(name, ZIP_EPOCH)
    info.compress_type = ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    archive.writestr(info, payload)


def _swap_one(value: str, old: str, new: str) -> str:
    if value.count(old) != 1:
        raise ValueError(f"Expected exactly one {old!r}; saw {value.count(old)}")
    return value.replace(old, new, 1)


def build_candidate(source_sha: str, output: Path, base_zip: Path | None = None) -> None:
    if not re.fullmatch(r"[0-9a-f]{40}", source_sha):
        raise ValueError("source_sha must be a full commit SHA")
    src = base_zip or ROOT / "dist/go-hipster-go-chatgpt-plugin.zip"
    if output.resolve() == src.resolve():
        raise ValueError("Refusing to overwrite original ChatGPT package")
    with ZipFile(src) as inp:
        if inp.testzip() is not None:
            raise ValueError("Invalid source archive")
        names = inp.namelist()
        if len(names) != len(set(names)):
            raise ValueError("Duplicate source members")
        required = {"plugin.json", f"skills/{BASE_NAME}/SKILL.md"}
        required.update(f"skills/{BASE_NAME}/{p}" for p in REQUIRED)
        if not required.issubset(names):
            raise ValueError("Missing required canonical source references")
        manifest = json.loads(inp.read("plugin.json"))
        if manifest.get("name") != BASE_NAME or manifest.get("version") != BASE_VERSION:
            raise ValueError("Unexpected canonical version or identity")
        skill = inp.read(f"skills/{BASE_NAME}/SKILL.md").decode("utf-8")
        skill = _swap_one(skill, f"name: {BASE_NAME}\n", f"name: {NAME}\n")
        skill = _swap_one(skill, f'  version: "{BASE_VERSION}"',
                          f'  version: "{VERSION}"')
        anchor = skill.index("\n---\n", 4) + len("\n---\n")
        stamp = (f"\n**PRIVATE QA BUILD — not published.** Version {VERSION}; "
                 f"source commit {source_sha}. No test authorizes playlist writes.\n\n")
        skill = skill[:anchor] + stamp + POLICY + "\n" + skill[anchor:]
        manifest["name"] = NAME
        manifest["version"] = VERSION
        manifest["description"] = "Private RC9 unified discovery acceptance; not public."
        ui = manifest["extensions"]["com.openai"]["interface"]
        ui["displayName"] = "Go, Hipster, Go! Release Probe"
        ui["shortDescription"] = "Private RC9 acceptance"
        ui["longDescription"] = (f"Private reproducible unified-discovery candidate, "
                                 f"source {source_sha}. No publishing in acceptance.")
        ui["defaultPrompt"] = [
            f"Use the {NAME} skill. Confirm version only.",
            f"Use the {NAME} skill. go weird mid. Exactly 12 tracks. "
            "Text only. Do not publish.",
        ]
        codex = {
            "interface": ui,
            "extensions": {"com.openai": {
                "onboardingSkill": manifest["extensions"]["com.openai"]["onboardingSkill"]}},
            "name": NAME,
            "version": VERSION,
            "description": manifest["description"],
            "author": {"name": "Workspace upload"},
            "keywords": manifest["keywords"],
            "homepage": manifest["homepage"],
            "repository": manifest["repository"],
            "license": manifest["license"],
            "skills": "./skills",
        }
        bank_bytes = {p: (ROOT / p).read_bytes() for p in BANKS}
        rhythm = json.loads(bank_bytes[BANKS[0]])
        moods = json.loads(bank_bytes[BANKS[1]])
        if not rhythm.get("rhythm") or not rhythm.get("texture") or not moods.get("weird"):
            raise ValueError("Source seed banks are incomplete")
        output.parent.mkdir(parents=True, exist_ok=True)
        with ZipFile(output, "w") as out:
            for old in names:
                dest = old.replace(f"skills/{BASE_NAME}/",
                                   f"skills/{NAME}/", 1)
                data = inp.read(old)
                if old == "plugin.json":
                    data = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()
                elif old == f"skills/{BASE_NAME}/SKILL.md":
                    data = skill.encode("utf-8")
                _write(out, dest, data)
            if ".codex-plugin/plugin.json" not in names:
                _write(out, ".codex-plugin/plugin.json",
                       (json.dumps(codex, ensure_ascii=False, indent=2) + "\n").encode())
            for path, data in bank_bytes.items():
                member = f"skills/{NAME}/{path}"
                if member not in out.namelist():
                    _write(out, member, data)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-sha", required=True)
    parser.add_argument("--output", type=Path,
                        default=ROOT / "dist/ghg-gate4-chatgpt-release-probe-rc9.zip")
    args = parser.parse_args()
    build_candidate(args.source_sha, args.output)
    print(f"Built private RC9: {args.output} sha256="
          f"{hashlib.sha256(args.output.read_bytes()).hexdigest()}")


if __name__ == "__main__":
    main()
