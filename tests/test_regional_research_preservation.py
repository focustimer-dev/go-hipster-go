"""Freeze unverified regional research across policy deduplication.

The checksums cover each complete research/sources section, not policy boilerplate.
An addition-table warning is normalized to its equivalent short status marker.
"""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGIONS = ROOT / "references/regions"
WARN = "Unreviewed; check semantic overlap before treating as a distinct route."
HASHES = {
    'antarctica.md': '21cf18203b6f68e4',
    'atlantic-europe.md': '2df43a3ed6bfbd5a',
    'balkans.md': '27be4964d028ed32',
    'canada-east.md': '9f1b009552c48ec7',
    'canada-west.md': '8db257a45428bdbd',
    'caribbean.md': 'efdbade26d3cf884',
    'central-africa-additions.md': 'f7569700923450ae',
    'central-america-additions.md': '5faba000a389c4f5',
    'central-america.md': '23900699ffaf3369',
    'central-asia.md': '6fd520a328c70133',
    'central-southern-africa.md': '4701a33db1183263',
    'east-africa.md': '0860252a1a13f177',
    'east-asia.md': '8327333b45bc6023',
    'eastern-europe.md': '023aa31b62aeb8e7',
    'mediterranean-europe.md': '9299dbaa1171cf14',
    'mexico.md': 'bb828eca90bc5221',
    'middle-east.md': '10f00348b70aca1f',
    'north-africa.md': '74bed3c4ff2f1e40',
    'northern-asia.md': 'c9662c02eb0ea628',
    'northern-europe.md': '3befd531701e0821',
    'northern-south-america.md': 'e975f73b9d5e0333',
    'oceania-additions.md': '5d428015685304dc',
    'oceania.md': 'e03d871528a26315',
    'south-asia.md': 'b1bf1218022a00ea',
    'southeast-asia.md': '4a98e81357c1b022',
    'southern-africa-additions.md': 'd8db641a7fe50a40',
    'southern-south-america.md': '5efd89b713bf9847',
    'us-east.md': 'a55d341ea46370a1',
    'us-midwest.md': '0694bbc1935e3e50',
    'us-south.md': '12f90bcc40d6e90d',
    'us-west.md': '5ab513394e14bbc3',
    'west-africa.md': '4a6a1c971542505a'
}

def fingerprint(text):
    h = 0xcbf29ce484222325
    for b in text.encode("utf-8"):
        h = ((h ^ b) * 0x100000001b3) & 0xffffffffffffffff
    return f"{h:016x}"

def source_content(text):
    start = text.find("## Source and status")
    if start < 0:
        start = text.find("## Addressable additions")
    return (text[start:] if start >= 0 else text).replace(WARN, "Unreviewed")

class RegionalResearchPreservationTests(unittest.TestCase):
    def test_all_research_and_source_text_is_unchanged(self):
        actual = {p.name for p in REGIONS.glob("*.md")}
        self.assertEqual(actual, set(HASHES))
        for name, expected in HASHES.items():
            with self.subTest(name=name):
                actual = source_content((REGIONS / name).read_text(encoding="utf-8"))
                self.assertEqual(fingerprint(actual), expected,
                    f"Research text, source links, or a unique regional guide changed in {name}")

    def test_exact_source_row_handles_survive(self):
        baseline_count = additions_count = 0
        for name in HASHES:
            text = (REGIONS / name).read_text(encoding="utf-8")
            ids = re.findall(r"^\| `([a-z0-9-]+:(?:\d{2}|add-\d{2}))` \|", text, re.M)
            region = name.removesuffix(".md")
            if name.endswith("-additions.md"):
                self.assertEqual(ids, [f"{region}:add-{n:02}" for n in range(1, 51)])
                additions_count += len(ids)
            elif name not in {"antarctica.md", "balkans.md", "us-midwest.md", "us-south.md"}:
                self.assertEqual(ids, [f"{region}:{n:02}" for n in range(1, 31)])
                baseline_count += len(ids)
        self.assertEqual((baseline_count, additions_count), (720, 200))

    def test_common_safeguards_have_a_single_home(self):
        atlas = (ROOT / "references/regional-atlas.md").read_text(encoding="utf-8")
        self.assertIn("Treat every entry below as a listener-supplied research hypothesis", atlas)
        self.assertIn("Do not promote these unreviewed entries into the PWA's automatic lens pool", atlas)
        self.assertIn("Unreviewed", atlas)
        for name in HASHES:
            text = (REGIONS / name).read_text(encoding="utf-8")
            if "## Source and status" in text:
                self.assertIn("[regional safeguards](../regional-atlas.md)", text, name)
                self.assertNotIn("Treat every entry below as a listener-supplied research hypothesis", text, name)
            if name.endswith("-additions.md"):
                self.assertNotIn(WARN, text, name)
                self.assertIn("| Unreviewed |", text, name)

if __name__ == "__main__":
    unittest.main()
