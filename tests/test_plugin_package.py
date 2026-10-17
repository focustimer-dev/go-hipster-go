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
        self.assertIn('## Start here — load, setup, go', readme)
        self.assertIn('skills/setup/SKILL.md', readme)
        self.assertLess(readme.index('## Start here'), readme.index('## Installation when the easy way needs help'))
        self.assertIn('<summary><strong>Field reports & compatibility notes</strong></summary>', readme)
        self.assertIn('<summary><strong>Iterative improvements & release notes</strong></summary>', readme)
        self.assertEqual(readme.count('<details>'), readme.count('</details>'))
        self.assertIn('adapters/agents.md', readme)
        self.assertIn('## Start here — load, setup, go', readme)
        self.assertIn('## Everyday commands', readme)
        self.assertIn('### Setup & preferences', readme)
        self.assertIn('### Playlists & modifiers', readme)
        self.assertIn('Run `setup` again whenever you want to change your preferences', readme)
        self.assertLess(readme.index('**1. Load the skill.**'),
                        readme.index('**2. Run `setup`'))
        self.assertLess(readme.index('**2. Run `setup`'),
                        readme.index('**3. Make some music.**'))
        self.assertIn('`setup change Spotify`', readme)
        self.assertIn('`setup status`', readme)
        self.assertIn('`go sad`', readme)
        self.assertIn('`go, text only`', readme)
        self.assertIn('session-only', readme)


    def test_install_prompt_is_compact_and_copyable_on_github(self):
        readme = (ROOT / 'README.md').read_text(encoding='utf-8')
        section = readme.split('**1. Load the skill.**', 1)[1].split('**2. Run `setup`', 1)[0]
        prompt = section.split('```text\n', 1)[1].split('\n```', 1)[0]
        self.assertLessEqual(max(map(len, prompt.splitlines())), 45)
        self.assertIn('focustimer-dev/hipster-music-generator', prompt)
        self.assertIn('Read SKILL.md', prompt)
        self.assertIn('Plugins needs the Plugin ZIP', prompt)
        self.assertIn('Skills needs the Skill ZIP', prompt)
        self.assertIn('Then run setup.', prompt)
        self.assertIn('**Copy** icon', section)
        self.assertIn('adapters/claude/README.md', section)

    def test_field_reports_separate_generated_and_saved_across_hosts(self):
        readme = (ROOT / 'README.md').read_text(encoding='utf-8')
        field_reports = readme.split(
            '<summary><strong>Field reports & compatibility notes</strong></summary>', 1
        )[1].split('</details>', 1)[0]
        for host in ('ChatGPT Work', 'ChatGPT → Spotify', 'Gemini',
                     'Claude', 'Meta Muse'):
            self.assertIn(host, field_reports)
        for term in ('generated but not saved', 'neither persisted in Spotify',
                     'zero saved playlists were confirmed', 'Save to library',
                     'Muse Code', 'exact recording-by-recording match'):
            self.assertIn(term.lower(), field_reports.lower())
        self.assertIn('| AI + service | Observed | Not yet verified |', field_reports)
        self.assertEqual(sum(line.startswith('| **') for line in field_reports.splitlines()), 5)
        for row in (line for line in field_reports.splitlines() if line.startswith('| **')):
            self.assertEqual(row.count('|'), 4, row)

    def test_skills_have_frontmatter(self):
        for path in (ROOT / 'skills').glob('*/SKILL.md'):
            data = path.read_text(encoding='utf-8')
            self.assertTrue(data.startswith('---\nname: '), str(path))
            self.assertIn('description:', data)
    def test_no_fictional_publisher(self):
        setup = (ROOT/'skills/setup/SKILL.md').read_text(encoding='utf-8')
        self.assertIn('authorization', setup.lower())
        self.assertIn('without', setup.lower())
        self.assertIn('A plugin in a directory is not evidence of authorization', setup)
    def test_skill_links_are_locally_resolvable(self):
        from re import findall
        path=ROOT/'skills/hipster-music-generator/SKILL.md'
        contents=path.read_text(encoding='utf-8')
        for dest in findall(r'\]\(([^)]+)\)',contents):
            if '://' not in dest:
                self.assertTrue((path.parent/dest).exists(),dest)

if __name__ == '__main__':
    unittest.main()
