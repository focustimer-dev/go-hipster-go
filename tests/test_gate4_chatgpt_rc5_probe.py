"""Static QA safety checks for the ChatGPT-only rc.5 route checkpoint experiment.

These do not constitute behavioral evidence that ChatGPT follows the rule.
"""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from scripts.build_gate4_chatgpt_rc5_probe import (
    BASE_VERSION, FROZEN_RC4_SHA256, FROZEN_SOURCE_SHA,
    PROBE_NAME, PROBE_RULE, PROBE_VERSION, build_probe,
)
from scripts.build_gate4_host_candidates import build_chatgpt

ROOT = Path(__file__).resolve().parents[1]


class ChatGPTRouteProbeTests(unittest.TestCase):
    def test_frozen_base_and_deterministic_separate_package(self):
        with tempfile.TemporaryDirectory() as t:
            root = Path(t)
            base, p1, p2 = (root / x for x in ("rc4.zip", "probe1.zip", "probe2.zip"))
            build_chatgpt(FROZEN_SOURCE_SHA, base)
            self.assertEqual(hashlib.sha256(base.read_bytes()).hexdigest(), FROZEN_RC4_SHA256)
            before = base.read_bytes()
            build_probe(p1, frozen_rc4=base)
            build_probe(p2, frozen_rc4=base)
            self.assertEqual(base.read_bytes(), before)
            self.assertEqual(hashlib.sha256(p1.read_bytes()).digest(),
                             hashlib.sha256(p2.read_bytes()).digest())
            with ZipFile(p1) as zip:
                self.assertIsNone(zip.testzip())
                names = zip.namelist()
                self.assertEqual(len(names), len(set(names)))
                self.assertIn("skills/" + PROBE_NAME + "/SKILL.md", names)
                self.assertNotIn("skills/go-hipster-go-gate4/SKILL.md", names)
                manifest = json.loads(zip.read("plugin.json"))
                codex = json.loads(zip.read(".codex-plugin/plugin.json"))
                for obj in (manifest, codex):
                    self.assertEqual(obj["name"], PROBE_NAME)
                    self.assertEqual(obj["version"], PROBE_VERSION)
                skill = zip.read("skills/" + PROBE_NAME + "/SKILL.md").decode()
                self.assertIn("name: " + PROBE_NAME, skill)
                self.assertIn('  version: "' + PROBE_VERSION + '"', skill)
                self.assertIn("source commit " + FROZEN_SOURCE_SHA, skill)
                self.assertIn(PROBE_RULE, skill)
                self.assertIn("existing single discovery pass", skill)
                self.assertIn("not a compulsory era, country", skill)
                self.assertIn("Do not add a second research round", skill)
                self.assertIn("Never claim file access", skill)
                self.assertIn("No", "No")
                self.assertIn("references/global-scenes.md", names)
                self.assertIn("references/sonic-taxonomy.md", names)
                self.assertIn("references/reference-index.md", names)
                self.assertIn("publication_status_report",
                              zip.read("skills/" + PROBE_NAME + "/scripts/playlist_cli.py").decode())

    def test_refuses_non_frozen_input_without_touching_output(self):
        with tempfile.TemporaryDirectory() as t:
            src, out = (Path(t) / n for n in ("not-rc4.zip", "output.zip"))
            src.write_bytes(b"not the frozen QA candidate")
            with self.assertRaisesRegex(ValueError, "non-frozen rc.4"):
                build_probe(out, frozen_rc4=src)
            self.assertFalse(out.exists())

    def test_single_host_only_and_no_shared_skill_modification(self):
        self.assertEqual(BASE_VERSION, "3.11.6-rc.4")
        self.assertEqual(PROBE_VERSION, "3.11.6-rc.5")
        self.assertEqual(PROBE_NAME, "go-hipster-go-gate4-probe")
        self.assertNotIn("rc.5", (ROOT / "SKILL.md").read_text())
        self.assertNotIn("rc.5", (ROOT / "adapters/gemini/SKILL.md").read_text())


if __name__ == "__main__":
    unittest.main()
