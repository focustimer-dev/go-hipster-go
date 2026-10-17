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
    def test_brand_icons_are_square_real_svg_paths(self):
        from xml.etree import ElementTree
        manifest=json.loads((ROOT / 'plugin.json').read_text(encoding='utf-8'))
        ui=manifest['extensions']['com.openai']['interface']
        self.assertEqual(ui['composerIcon'], './assets/icon.svg')
        self.assertEqual(ui['logo'], './assets/logo.svg')
        for key in ('composerIcon','composerIconDark','logo','logoDark'):
            path=ROOT / ui[key].removeprefix('./')
            self.assertTrue(path.is_file(), path)
            svg=path.read_text(encoding='utf-8')
            tree=ElementTree.fromstring(svg)
            self.assertEqual(tree.attrib['viewBox'], '0 0 1024 1024')
            self.assertTrue(tree.findall('{http://www.w3.org/2000/svg}path'))
            self.assertNotIn('<image', svg)
            self.assertNotIn('checkerboard', svg.lower().split('<desc>')[-1])
            self.assertNotIn('fill="#ffffff"', svg.lower())

    def test_readme_is_easy_first_and_reports_are_collapsed(self):
        readme = (ROOT / 'README.md').read_text(encoding='utf-8')
        self.assertIn('## Start here — let your agent do the paperwork', readme)
        self.assertIn('skills/setup/SKILL.md', readme)
        self.assertLess(readme.index('## Start here'), readme.index('## Installation when the easy way needs help'))
        self.assertIn('<summary><strong>Field reports & compatibility notes</strong></summary>', readme)
        self.assertIn('<summary><strong>Iterative improvements & release notes</strong></summary>', readme)
        self.assertEqual(readme.count('<details>'), readme.count('</details>'))
        self.assertIn('adapters/agents.md', readme)

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
