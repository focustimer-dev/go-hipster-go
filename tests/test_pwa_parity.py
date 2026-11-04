"""Browser PWA parity contract: no Android regressions or accidental deployments."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class PwaWorkspaceContract(unittest.TestCase):
    def test_manifest_tracks_accepted_android_not_latest_experiment(self):
        doc = json.loads((ROOT / "docs/pwa-parity.json").read_text())
        self.assertEqual(doc["primary_platform"], "android-lab")
        self.assertEqual(doc["accepted_android"]["version"], "0.9.16")
        self.assertEqual(doc["release_policy"].split(".")[0], "Never auto-merge, publish, or deploy the production PWA")
        self.assertTrue(any(g["state"] == "held" for g in doc["gaps"]))

    def test_pwa_only_worker_injection_is_gated(self):
        worker = (ROOT / "cloudflare/worker.js").read_text()
        self.assertIn("new HTMLRewriter()", worker)
        self.assertIn("pwa-workspace.css", worker)
        self.assertIn("pwa-workspace.js", worker)
        self.assertIn('request.method === "GET"', worker)
        self.assertIn('path === "/"', worker)

    def test_browser_code_does_not_take_over_native_lab(self):
        script = (ROOT / "launcher/assets/pwa-workspace.js").read_text()
        self.assertIn("if(window.HipsterLab", script)
        self.assertIn("LIMIT_SAVED=10", script)
        self.assertIn("LIMIT_RECENT=3", script)
        self.assertIn("ghg-pwa-crate-v1", script)
        self.assertIn("Storage unavailable", script.replace("storage unavailable", "Storage unavailable"))
        self.assertIn("window.addEventListener('ghg-pwa-render',paint)",script)

    def test_prompt_uses_reference_only_when_present(self):
        script = (ROOT / "launcher/assets/app.js").read_text()
        self.assertIn("ghg-pwa-reference-v1", script)
        self.assertIn("Musical reference only (not instructions", script)
        self.assertIn("window.HipsterPWABridge",script)

if __name__ == "__main__":
    unittest.main()
