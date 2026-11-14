"""Release guardrails for restricted/missing Android AI and browser handlers.

These are static checks; device-level tests must still verify OEM and managed
device intent behavior. The source paths are shared by Lab and production.
"""
from pathlib import Path
import re
import unittest

ROOT=Path(__file__).resolve().parents[2]
JAVA=ROOT/"android-lab/app/src/main/java/work/samelling/hipstergo/lab"

def source(name):
    return (JAVA/name).read_text(encoding="utf-8")

def method_block(text,start,end):
    return text.split(start,1)[1].split(end,1)[0]

class NativeHandoffResilience(unittest.TestCase):
    def test_browser_falls_back_from_restricted_preferred_handler(self):
        code=method_block(source("LabActivity.java"),
                          "private void browser(String url) {",
                          "private void share(String text, String target)")
        self.assertIn("Intent.ACTION_VIEW",code)
        self.assertIn("Intent.CATEGORY_APP_BROWSER",code)
        self.assertIn("catch (SecurityException ignored)",code)
        self.assertIn("i.getPackage() != null",code)
        self.assertIn("i.setPackage(null)",code)
        self.assertEqual(code.count("startActivity(i); return;"),2,
                         "Try preferred handler, then unscoped HTTPS VIEW")
        self.assertGreaterEqual(
            code.count("catch (ActivityNotFoundException | SecurityException"),2)
        self.assertIn("Your request remains copied",code)

    def test_native_share_and_app_open_keep_clipboard_fallback(self):
        lab=source("LabActivity.java")
        share=method_block(lab,"private void share(String text, String target)",
                           "private String aiPackage(String ai)")
        self.assertIn("i.setPackage(null)",share)
        self.assertEqual(share.count("catch (ActivityNotFoundException | SecurityException"),2)
        self.assertIn("Your request remains copied",share)

        handoff=method_block(lab,"private void handoff(String ai, String text, boolean alreadyCopied)",
                             "private void refreshWorkspace()")
        self.assertIn("getLaunchIntentForPackage(pkg)",handoff)
        self.assertIn("catch (SecurityException ignored)",handoff)
        self.assertIn("catch (ActivityNotFoundException | SecurityException ignored)",handoff)
        self.assertIn("browser(destination)",handoff)
        self.assertIn('if(!alreadyCopied&&!copy(text))',handoff)

    def test_widget_never_conflates_copied_prompt_with_failed_open(self):
        widget=source("ChaosRollActivity.java")
        self.assertIn('setPrimaryClip(ClipData.newPlainText',widget)
        handoff=method_block(widget,"private void handoff(String ai, String brief, String mode)",
                             "private void notifyUser(")
        self.assertIn("getLaunchIntentForPackage(pkg)",handoff)
        self.assertIn("catch (SecurityException ignored)",handoff)
        self.assertIn("catch (ActivityNotFoundException | SecurityException ignored)",handoff)
        self.assertIn("catch (ActivityNotFoundException | SecurityException unavailable)",handoff)
        self.assertIn("No AI browser available; paste it manually",handoff)
        self.assertIn('new Intent(Intent.ACTION_VIEW, Uri.parse(url(ai)))',handoff)

if __name__=="__main__":
    unittest.main()
