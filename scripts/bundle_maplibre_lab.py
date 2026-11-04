"""Package a pinned, offline MapLibre experiment; never changes the live atlas."""
from pathlib import Path
import hashlib,urllib.request,tarfile,tempfile,re,json,math
ROOT=Path(__file__).resolve().parents[1]
DIGEST='993200291f6d16714253c41f95138005ebbab068706f7193fea594aaf508dfc9'
def bundle_maplibre(destination):
    archive=Path(tempfile.gettempdir())/'maplibre-gl-5.6.1.tgz'
    if not archive.exists() or hashlib.sha256(archive.read_bytes()).hexdigest()!=DIGEST:
        with urllib.request.urlopen('https://registry.npmjs.org/maplibre-gl/-/maplibre-gl-5.6.1.tgz',timeout=60) as response: data=response.read()
        if hashlib.sha256(data).hexdigest()!=DIGEST: raise ValueError('MapLibre integrity mismatch')
        archive.write_bytes(data)
    target=destination/'assets/maplibre';target.mkdir(parents=True,exist_ok=True)
    with tarfile.open(archive) as tar:
        for name in ['dist/maplibre-gl.js','dist/maplibre-gl.css','LICENSE.txt']:
            (target/Path(name).name).write_bytes(tar.extractfile('package/'+name).read())
    source=(ROOT/'launcher/index.html').read_text();features=[]
    for tag in re.findall(r'<path [^>]*data-atlas-country=[^>]*>',source):
        country=re.search(r'data-atlas-country="([^"]+)"',tag).group(1)
        region=re.search(r'data-atlas-region="([^"]+)"',tag).group(1)
        d=re.search(r'\bd="([^"]+)"',tag).group(1);rings=[]
        for part in re.findall(r'M[^M]+',d):
            ring=[[round(float(x)/2-180,5),round(math.degrees(math.atan(math.sinh((235.5-float(y))/116))),5)] for x,y in re.findall(r'[ML](-?[\d.]+)\s+(-?[\d.]+)',part)]
            if len(ring)<3:continue
            if ring[0]!=ring[-1]:ring.append(ring[0])
            rings.append([ring])
        if rings:features.append({'type':'Feature','id':len(features),'properties':{'country':country,'region':region},'geometry':{'type':'MultiPolygon','coordinates':rings}})
    page=(ROOT/'android-lab/web/atlas-lab.html').read_text().replace('/*GEOGRAPHY*/',json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')))
    (destination/'atlas-lab.html').write_text(page)
    root=destination/'index.html'
    root.write_text(root.read_text().replace('</body>', '<script type="application/json" id="labGlobeGeography">'+json.dumps({'type':'FeatureCollection','features':features},separators=(',',':'))+'</script></body>'))
