"""Smoke checks for the v18 engraved Gig Poster edition."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "launcher/editions/gig-poster"

class EngravedEditionChecks(unittest.TestCase):
    def test_engraving_assets_exist(self):
        for name in ("engraved-six-clerks.webp","weird-v18.webp","setup-crate-record.png","atlas-engraved-details.png"):
            with self.subTest(name=name):
                path=BASE/"assets"/name
                self.assertTrue(path.is_file(),name)
                self.assertGreater(path.stat().st_size,10000)

    def test_chart_is_fixed_and_not_interactive(self):
        index=(BASE/"index.html").read_text()
        css=(BASE/"edition.css").read_text()
        self.assertIn('class="chart-viewport-frame"',index)
        self.assertIn('class="chart-details"',index)
        self.assertIn("pointer-events:none;z-index:1",css)
        self.assertIn('id="crateAtlasMap"',index)
        self.assertIn('id="atlasHome"',index)

    def test_selection_ticket_and_clean_receipt_idle_state(self):
        base=(ROOT/"launcher/index.html").read_text()
        generated=(BASE/"index.html").read_text()
        script=(ROOT/"launcher/assets/app.js").read_text()
        css=(ROOT/"launcher/assets/hipster.css").read_text()
        for page in (base,generated):
            self.assertIn('id="selectionTicket"',page)
            self.assertIn('id="selectionTicketShort"',page)
            self.assertIn('id="receiptCopy" hidden',page)
            self.assertNotIn("REQUEST DRAFT",page)
        self.assertIn('firstAiChoice=doc.querySelector(".service-counter .panel")',script)
        self.assertIn('firstAiChoice.getBoundingClientRect().bottom<=0',script)
        self.assertNotIn('moodChoices.getBoundingClientRect().bottom<=0',script)
        self.assertIn('receiptSummary.getBoundingClientRect()',script)
        self.assertIn('mark.hidden=state==="idle"',script)
        self.assertIn('COPIED TO CLIPBOARD',script)
        self.assertIn('receipt-feed', (BASE/"edition.css").read_text())
        self.assertIn('selection-ticket[hidden]',css)

    def test_artwork_and_controls_remain_separate(self):
        css=(BASE/"edition.css").read_text()
        index=(BASE/"index.html").read_text()
        self.assertIn("assets/weird-v18.webp",css)
        self.assertIn("assets/engraved-six-clerks.webp",css)
        self.assertNotIn("data:image/webp;base64",css)
        for token in ('id="includeCover"','id="goHard"','id="goButton"'):
            self.assertIn(token,index)

if __name__=="__main__":
    unittest.main()
