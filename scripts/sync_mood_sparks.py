"""Embed the reviewed mood bank in the standalone PWA; no runtime fetch needed."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
bank = json.loads((ROOT / 'references/mood-spark-bank.json').read_text())
app = ROOT / 'launcher/assets/app.js'
text = app.read_text()
start = text.index('// MOOD_SPARK_BANK_BEGIN')
end = text.index('// MOOD_SPARK_BANK_END', start)
replacement = '// MOOD_SPARK_BANK_BEGIN\nconst moodSparkBank=' + json.dumps(bank, ensure_ascii=False, separators=(',', ':')) + ';\n'
updated = text[:start] + replacement + text[end:]
if '--check' in sys.argv:
    if updated != text:
        raise SystemExit('Mood bank differs: run python scripts/sync_mood_sparks.py')
else:
    app.write_text(updated)
