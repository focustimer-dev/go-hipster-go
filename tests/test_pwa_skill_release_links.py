"""Browser skill download links always follow the stable manifest."""
import json
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
class PwaReleaseLinkTests(unittest.TestCase):
    def test_four_browser_downloads_follow_stable_manifest(self):
        release=json.loads((ROOT/'config/stable-skill-release.json').read_text())
        guide=(ROOT/'launcher/assets/pwa-guides.js').read_text()
        self.assertEqual(release['channel'],'stable')
        self.assertEqual(len(release['artifacts']),4)
        self.assertIn(release['release_page'],guide)
        self.assertIn('Stable skill release: '+release['version'],guide)
        self.assertNotIn('/releases/latest',guide)
        for artifact in release['artifacts'].values():
            self.assertIn(artifact['url'],guide)
        for label in ('ChatGPT Plugin ZIP','Gemini Skill ZIP','Claude Skill ZIP','Claude Plugin ZIP'):
            self.assertIn(label,guide)
        self.assertIn('Downloading is not installation',guide)
    def test_link_sync_includes_browser_guide(self):
        sync=(ROOT/'scripts/sync_stable_skill_links.py').read_text()
        self.assertIn('"launcher/assets/pwa-guides.js"',sync)
        self.assertIn('missing verified',sync)
if __name__=='__main__':
    unittest.main()
