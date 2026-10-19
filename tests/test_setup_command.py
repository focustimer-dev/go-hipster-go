"""Text-contract tests only: no claims about actual streaming tools or persistence."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class SetupContractTests(unittest.TestCase):
    def test_commands_and_portable_profile(self):
        root=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        setup=(ROOT/"skills/setup/SKILL.md").read_text(encoding="utf-8")
        for key in ("setup", "setup status", "setup change", "setup again",
                    "Hipster Music Setup v1", "session-only"):
            self.assertIn(key,root)
            self.assertIn(key,setup)

    def test_real_permissions_and_no_setup_lottery(self):
        root=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        setup=(ROOT/"skills/setup/SKILL.md").read_text(encoding="utf-8")
        for key in ("fallback_service", "user-owned", "current-session",
                    "No playlist is made during `setup`",
                    "setup` never consumes a DeBarge roll"):
            self.assertIn(key,root)
        self.assertIn("Never report success before a write is confirmed",setup)
        self.assertIn("permission",root)

    def test_override_and_host_specificity(self):
        root=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        self.assertIn("priority is **explicit instructions in the current `go`**",root)
        self.assertIn("setup` with no storage API",cases)
        self.assertIn("Gemini uses its own Connected Apps",root)
        self.assertIn("setup status",cases)
        self.assertIn("go sad",cases)

    def test_spotify_default_is_not_writer_authorization(self):
        root=(ROOT/"SKILL.md").read_text(encoding="utf-8")
        setup=(ROOT/"skills/setup/SKILL.md").read_text(encoding="utf-8")
        cases=(ROOT/"tests/discovery-cases.md").read_text(encoding="utf-8")
        for phrase in ("Spotify as the default preference", "setup change YouTube Music",
                       "Do not silently choose a different provider"):
            self.assertIn(phrase.lower(),root.lower())
        self.assertIn("without a service question",setup)
        self.assertIn("listening_service=Spotify",setup)
        self.assertIn("publish_to=Spotify",setup)
        self.assertIn("Spotify writer exposed and no prior preference",cases)
        self.assertIn("YouTube Music only authorized writer",cases)

    def test_plugin_promotes_setup(self):
        data=json.loads((ROOT/"plugin.json").read_text(encoding="utf-8"))
        self.assertEqual(data["version"],"3.5.0")
        self.assertTrue(any("Setup" in t for t in
            data["extensions"]["com.openai"]["interface"]["defaultPrompt"]))
        self.assertEqual((ROOT/"SKILL.md").read_bytes(),
                         (ROOT/"skills/go-hipster-go/SKILL.md").read_bytes())

if __name__ == "__main__":
    unittest.main()
