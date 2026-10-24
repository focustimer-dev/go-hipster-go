"""Embed the reviewed discovery catalog into the buildless launcher."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
rows=json.loads((ROOT/'references/discovery-lenses.json').read_text())
assert len({r['id'] for r in rows})==len(rows)
p=ROOT/'launcher/assets/app.js'
block='// DISCOVERY_CATALOG_BEGIN\nconst discoveryLensCatalog='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\nconst freshCrateLenses=discoveryLensCatalog.map(lens=>lens.text);\n// DISCOVERY_CATALOG_END'
s,n=re.subn(r'// DISCOVERY_CATALOG_BEGIN.*?// DISCOVERY_CATALOG_END',lambda _:block,p.read_text(),count=1,flags=re.S)
assert n==1
p.write_text(s)
