"""Offline checks for portable ChatGPT plugin packaging (not a live install test)."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class PluginPackageTests(unittest.TestCase):
    def test_manifest_and_onboarding(self):
        manifest = json.loads((ROOT / 'plugin.json').read_text(encoding='utf-8'))
        self.assertEqual(manifest['name'], 'hipster-music-generator')
        self.assertEqual(manifest['$schema'], 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json')
        skill = manifest['extensions']['com.openai']['onboardingSkill'].removeprefix('./')
        self.assertTrue((ROOT / skill).is_file())
    def test_skills_have_frontmatter(self):
        for path in (ROOT / 'skills').glob('*/SKILL.md'):
            data = path.read_text(encoding='utf-8')
            self.assertTrue(data.startswith('---\nname: '), str(path))
            self.assertIn('description:', data)
    def test_no_fictional_publisher(self):
        setup = (ROOT/'skills/setup/SKILL.md').read_text(encoding='utf-8')
        self.assertIn('authorization', setup.lower())
        self.assertIn('without', setup.lower())
        self.assertIn('not a complete user account inventory', setup)
    def test_skill_links_are_locally_resolvable(self):
        from re import findall
        path=ROOT/'skills/hipster-music-generator/SKILL.md'
        contents=path.read_text(encoding='utf-8')
        for dest in findall(r'\]\(([^)]+)\)',contents):
            if '://' not in dest:
                self.assertTrue((path.parent/dest).exists(),dest)

if __name__ == '__main__':
    unittest.main()
