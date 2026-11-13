"""Regression: Android GO exports Gemini-readable exact twelve-slot curves."""
import pathlib
import shutil
import subprocess
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]

class CurveSlotAuditTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which("node"),"Node required for launcher codec test")
    def test_compact_curve_and_numbered_export(self):
        result=subprocess.run(
            ["node","tests/fixtures/curve_slot_audit.cjs"],
            cwd=ROOT,capture_output=True,text=True,
        )
        self.assertEqual(result.returncode,0,result.stdout+"\n"+result.stderr)
