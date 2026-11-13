#!/usr/bin/env python3
"""Build an isolated ChatGPT-only Gate 4 rc.5 discovery-routing probe.

Consumes the byte-for-byte frozen rc.4 QA package. Never updates the canonical
skill, Gemini, an installed plugin, public release assets, or music services.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import tempfile
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

try:
    from scripts.build_gate4_host_candidates import build_chatgpt
except ModuleNotFoundError:  # CLI execution: python scripts/build_gate4_chatgpt_rc5_probe.py
    from build_gate4_host_candidates import build_chatgpt

ROOT = Path(__file__).resolve().parents[1]
FROZEN_SOURCE_SHA = "3f383f4ea1d91ba288b6d04de248e4904e76a809"
FROZEN_RC4_SHA256 = "a0d2088eef997cb2c68e117085e3af70d8e973122bdaa140bfe6cdf15baf9f2d"
BASE_NAME = "go-hipster-go-gate4"
PROBE_NAME = "go-hipster-go-gate4-probe"
BASE_VERSION = "3.11.6-rc.4"
PROBE_VERSION = "3.11.6-rc.5"
ZIP_EPOCH = (1980, 1, 1, 0, 0, 0)

# A targeted, internal route-selection checkpoint, NOT a new research phase.
PROBE_RULE = (
    "**ChatGPT-only rc.5 discovery-route checkpoint (experimental):** "
    "For an open-ended, region-free ordinary GO, especially `go weird`, "
    "**before choosing a thesis or naming artists**, consult the available "
    "`references/reference-index.md`, the `Freshness procedure` and "
    "`Peculiarity by audible mechanism` headings of "
    "`references/sonic-taxonomy.md`, and relevant `references/global-scenes.md` "
    "directions. Within the **existing single discovery pass**, compare three "
    "actually different sonic mechanisms or scene families (not three variations "
    "of the familiar 1979–84 US/UK post-punk-funk corridor). Pick the most "
    "musically coherent and verified path; then research actual recordings. "
    "Treat the paths as hypotheses, **not a compulsory era, country, obscurity, "
    "song, or instrument quota**. Do not add a second research round or show a "
    "route checklist to ordinary listeners. When explicitly asked for three "
    "routes before music, report three genuinely distinct directions instead "
    "of only summarizing the reference files. Never claim file access that was "
    "not actually available. Explicit region, mood, tempo, exact count, "
    "recording quality, user-selected services and no-publish overrides win."
)


def _replace_once(value: str, old: str, new: str) -> str:
    if value.count(old) != 1:
        raise ValueError(f"Expected one occurrence of {old!r}; found {value.count(old)}")
    return value.replace(old, new, 1)


def _write(out: ZipFile, name: str, payload: bytes) -> None:
    info = ZipInfo(name, ZIP_EPOCH)
    info.compress_type = ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    out.writestr(info, payload)


def _probe_from_frozen_rc4(base_zip: Path, output: Path) -> None:
    actual = hashlib.sha256(base_zip.read_bytes()).hexdigest()
    if actual != FROZEN_RC4_SHA256:
        raise ValueError("Refusing to build from a non-frozen rc.4 package: " + actual)
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(base_zip) as inp, ZipFile(output, "w") as out:
        if inp.testzip() is not None:
            raise ValueError("Corrupt base package")
        names = inp.namelist()
        if len(names) != len(set(names)):
            raise ValueError("Duplicate ZIP entry")
        for name in names:
            payload = inp.read(name)
            dest = name.replace("skills/" + BASE_NAME + "/", "skills/" + PROBE_NAME + "/", 1)
            if name in ("plugin.json", ".codex-plugin/plugin.json"):
                manifest = json.loads(payload)
                if manifest.get("name") != BASE_NAME or manifest.get("version") != BASE_VERSION:
                    raise ValueError("Unexpected frozen ChatGPT manifest identity")
                manifest["name"] = PROBE_NAME
                manifest["version"] = PROBE_VERSION
                manifest["description"] = "Private ChatGPT-only rc.5 early-discovery routing experiment; not public."
                ui = (manifest.get("extensions", {}).get("com.openai", {}).get("interface")
                      if name == "plugin.json" else manifest.get("interface"))
                if not isinstance(ui, dict):
                    raise ValueError("Missing ChatGPT UI manifest")
                ui["displayName"] = "Go, Hipster, Go! Route Probe"
                ui["shortDescription"] = "Private rc.5 discovery test"
                ui["longDescription"] = (
                    "Private ChatGPT-only route checkpoint based on original QA source "
                    + FROZEN_SOURCE_SHA + "; no music publishing authorized for this test."
                )
                ui["defaultPrompt"] = [
                    "Use the go-hipster-go-gate4-probe skill. Confirm its version only.",
                    "Use the go-hipster-go-gate4-probe skill. go weird mid. "
                    "Exactly 12 tracks. Text only. Do not publish.",
                ]
                payload = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()
            elif name == "skills/" + BASE_NAME + "/SKILL.md":
                skill = payload.decode("utf-8")
                skill = _replace_once(skill, "name: " + BASE_NAME + "\n",
                                      "name: " + PROBE_NAME + "\n")
                skill = _replace_once(skill, '  version: "' + BASE_VERSION + '"',
                                      '  version: "' + PROBE_VERSION + '"')
                skill = _replace_once(skill, "Build " + BASE_VERSION + ";",
                                      "Build " + PROBE_VERSION + ";")
                anchor = ("For text-only acceptance; do not publish or claim installed "
                          "access without verification.\n")
                skill = _replace_once(skill, anchor, anchor + "\n" + PROBE_RULE + "\n")
                payload = skill.encode()
            _write(out, dest, payload)


def build_probe(output: Path, *, frozen_rc4: Path | None = None) -> None:
    if frozen_rc4 is not None:
        _probe_from_frozen_rc4(frozen_rc4, output)
        return
    with tempfile.TemporaryDirectory(prefix="ghg-gate4-probe-") as tmp:
        base = Path(tmp) / "rc4.zip"
        build_chatgpt(FROZEN_SOURCE_SHA, base)
        _probe_from_frozen_rc4(base, output)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--output", type=Path, default=ROOT / "dist/ghg-gate4-chatgpt-probe-rc5.zip")
    ap.add_argument("--frozen-rc4", type=Path, default=None)
    args = ap.parse_args()
    build_probe(args.output, frozen_rc4=args.frozen_rc4)
    print(args.output, hashlib.sha256(args.output.read_bytes()).hexdigest())


if __name__ == "__main__":
    main()
