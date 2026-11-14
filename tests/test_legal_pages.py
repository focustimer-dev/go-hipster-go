"""Public legal pages and Android privacy link contract."""
from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PRIVACY = "https://hipster-go.samelling.workers.dev/privacy/"
SUPPORT = "https://hipster-go.samelling.workers.dev/support/"

class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.body, self.titles = [], [], []
        self.in_title = False
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "a":
            self.links.append(d.get("href"))
        if tag == "title":
            self.in_title = True
    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
    def handle_data(self, data):
        self.body.append(data)
        if self.in_title:
            self.titles.append(data)

def read(path):
    source = (ROOT / path).read_text(encoding="utf-8")
    obj = Collector()
    obj.feed(source)
    return source, obj

class LegalPages(unittest.TestCase):
    def test_policy_covers_actual_transmissions_and_deletion(self):
        source, page = read("launcher/privacy/index.html")
        self.assertIn("<!doctype html>", source.lower())
        self.assertIn('<main id="main">', source)
        self.assertIn("privacy policy", "".join(page.titles).lower())
        text = " ".join(page.body).lower()
        for term in (
            "go, hipster, go!", "november 14, 2026", "full url you supplied",
            "cloudflare", "github", "until removed", "retention",
            "deleting", "security", "no user-account deletion login",
            "ai and music services", "gohipstergosupport@proton.me",
        ):
            self.assertIn(term, text, term)
        self.assertIn("mailto:gohipstergosupport@proton.me", page.links)
        self.assertIn("/support/", page.links)
        self.assertNotIn("<form", source.lower())
        self.assertNotIn("we collect no data", text)

    def test_support_page_crosslinks(self):
        source, page = read("launcher/support/index.html")
        self.assertIn("support", "".join(page.titles).lower())
        self.assertIn("mailto:gohipstergosupport@proton.me", page.links)
        self.assertIn("/privacy/", page.links)
        self.assertIn("/setup/", page.links)
        self.assertIn('id="main"', source)

    def test_native_browser_link_exists(self):
        native = (ROOT / "android-lab/web/workspace.html").read_text()
        self.assertGreaterEqual(native.count(PRIVACY), 2)
        self.assertGreaterEqual(native.count(SUPPORT), 2)
        self.assertIn('id="labLegalLinks"', native)
        self.assertIn('id="labMoreResources"', native)
        java = (ROOT / "android-lab/app/src/main/java/work/samelling/hipstergo/lab/LabActivity.java").read_text()
        self.assertIn("request.isForMainFrame() && request.hasGesture()", java)
        self.assertIn("browser(u.toString())", java)

    def test_pwa_navigation_and_worker_routes(self):
        worker = (ROOT / "cloudflare/worker.js").read_text()
        self.assertIn('path === "/privacy"', worker)
        self.assertIn('path === "/support"', worker)
        self.assertIn('path + "index.html"', worker)
        self.assertTrue((ROOT / "launcher/assets/legal.css").is_file())
        for path in (
            "launcher/index.html", "launcher/setup/index.html",
            "launcher/editions/gig-poster/index.html",
            "launcher/editions/gig-poster/setup/index.html",
        ):
            page = (ROOT / path).read_text()
            self.assertIn('href="/privacy/"', page, path)
            self.assertIn('href="/support/"', page, path)

if __name__ == "__main__":
    unittest.main()
