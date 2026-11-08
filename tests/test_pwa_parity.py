"""Browser PWA parity contract: no Android regressions or accidental deployments."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class PwaWorkspaceContract(unittest.TestCase):
    def test_manifest_tracks_accepted_android_not_latest_experiment(self):
        doc = json.loads((ROOT / "docs/pwa-parity.json").read_text())
        self.assertEqual(doc["primary_platform"], "android-lab")
        self.assertEqual(doc["accepted_android"]["version"], "0.9.56")
        self.assertEqual(doc["accepted_android"]["ref"], "main")
        self.assertEqual(doc["accepted_android"]["commit"], "505fcd46f8834380d5cbe86c2faeab87a895ae84")
        self.assertIn("development baseline", doc["accepted_android"]["status"])
        self.assertTrue(any(g["state"] == "deferred" and "Cahill" in g["feature"] for g in doc["gaps"]))
        self.assertTrue(any(g["state"] == "candidate" and "Manual" in g["feature"] for g in doc["gaps"]))
        self.assertEqual(doc["release_policy"].split(".")[0], "Never auto-merge, publish, or deploy the production PWA")
        self.assertTrue(any(g["category"] == "android-only" for g in doc["gaps"]))

    def test_pwa_only_worker_injection_is_gated(self):
        worker = (ROOT / "cloudflare/worker.js").read_text()
        self.assertIn("new HTMLRewriter()", worker)
        self.assertIn("pwa-workspace.css", worker)
        self.assertIn("pwa-workspace.js", worker)
        self.assertIn("pwa-guides.js", worker)
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
        self.assertIn('"Inspiration: "+JSON.stringify(reference)', script)
        self.assertIn("window.HipsterPWABridge",script)

    def test_accepted_manual_and_jukebox_adapters_are_browser_only(self):
        script = (ROOT / "launcher/assets/pwa-guides.js").read_text()
        for subject in ["Overview", "ChatGPT", "Gemini", "Claude", "Other AI", "More Resources",
                        "Normal GO", "Inspiration", "Review & Publish", "Cover Art"]:
            self.assertIn(subject, script)
        self.assertIn('pwaGuidePicker', script)
        self.assertIn('pwaGuideContent', script)
        self.assertIn("window.HipsterLab", script)
        base = (ROOT / "launcher/assets/pwa-workspace.js").read_text()
        self.assertIn("pwa-add-inspiration", base)
        self.assertIn("pwaCrate", base)
        self.assertIn("ghg-pwa-crate-v1", base)
        css = (ROOT / "launcher/assets/pwa-workspace.css").read_text()
        self.assertIn(".pwa-guide-nav", css)
        self.assertIn(".pwa-add-inspiration", css)

    def test_preview_is_isolated_and_reusable(self):
        workflow = (ROOT / ".github/workflows/pwa-preview.yml").read_text()
        self.assertIn("startsWith(github.head_ref, 'feat/pwa-')", workflow)
        self.assertIn("hipster-go-pwa-preview", workflow)
        self.assertIn("node --check launcher/assets/pwa-guides.js", workflow)
        # The worker must remain isolated and its target must match the QA URL.
        import re
        worker = re.search(r"command: deploy --name (hipster-go-(?:pwa-preview|pwa-inline-preview|android-theme-preview|pwa-theme-atlas-rc))", workflow)
        self.assertIsNotNone(worker, "Only a named isolated preview Worker may be deployed")
        self.assertIn("PWA_PREVIEW_URL: https://" + worker.group(1) + ".samelling.workers.dev", workflow)
        self.assertNotIn("command: deploy --name hipster-go\n", workflow)
        self.assertNotIn("command: deploy --name hipster-go\n", workflow)

if __name__ == "__main__":
    unittest.main()
