"""Package a pinned, offline MapLibre experiment; never changes the live atlas."""
from pathlib import Path
import hashlib,urllib.request,tarfile,tempfile,re,json,math
ROOT=Path(__file__).resolve().parents[1]
DIGEST='993200291f6d16714253c41f95138005ebbab068706f7193fea594aaf508dfc9'

def _clip_longitude(ring, boundary, keep_west):
    """Clip geographic rings at the existing app region meridians."""
    result = []
    for start, end in zip(ring, ring[1:] + ring[:1]):
        inside_start = start[0] <= boundary if keep_west else start[0] >= boundary
        inside_end = end[0] <= boundary if keep_west else end[0] >= boundary
        if inside_start != inside_end:
            fraction = (boundary - start[0]) / (end[0] - start[0])
            result.append([boundary, start[1] + fraction * (end[1] - start[1])])
        if inside_end:
            result.append(list(end))
    if len(result) < 3:
        return []
    if result[0] != result[-1]:
        result.append(result[0])
    return result

def complete_polar_coastlines(features):
    """Restore source coastlines before projection, retaining IDs and region splits."""
    source = json.loads((ROOT / 'android-lab/web/polar-coastlines.geojson').read_text())
    replacements = {f['properties']['country']: f['geometry'] for f in source['features']}
    for feature in features:
        country = feature['properties']['country']
        if country not in replacements:
            continue
        geometry = replacements[country]
        polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
        region = feature['properties']['region']
        split = (-95, region == 'canada-west') if country == 'CAN' else (60, region == 'eastern-europe') if country == 'RUS' else None
        if split:
            polygons = [[clipped for ring in polygon if (clipped := _clip_longitude(ring, *split))] for polygon in polygons]
            polygons = [polygon for polygon in polygons if polygon]
        feature['geometry'] = {'type': 'MultiPolygon', 'coordinates': polygons}
    return features

def _regional_mesh(source):
    """Use one cached topology mesh, and fail if poster geometry changes."""
    import hashlib
    tags = [tag for tag in re.findall(r'<path [^>]*data-atlas-country=[^>]*>', source)
            if 'data-atlas-country="USA"' in tag]
    packed = json.loads((ROOT / 'android-lab/web/us-region-mesh.json').read_text())
    digest = hashlib.sha256('\n'.join(tags).encode('utf-8')).hexdigest()
    if len(tags) != 51 or packed.get('sourceFeatureCount') != 51 or packed.get('sourceSha256') != digest:
        raise ValueError('Atlas poster geometry changed: regenerate the shared TopoJSON mesh before building Android')
    feature = packed.get('feature', {})
    if feature.get('geometry', {}).get('type') != 'MultiLineString':
        raise ValueError('Invalid TopoJSON-derived US listening-region mesh')
    fills = packed.get('fills', [])
    expected_regions = {re.search(r'data-atlas-region="([^"]+)"', tag).group(1) for tag in tags}
    if (len(fills) != len(expected_regions)
            or {f['properties']['region'] for f in fills} != expected_regions
            or any(f['properties']['country'] != 'USA'
                   or f['geometry']['type'] != 'MultiPolygon'
                   or not f['geometry']['coordinates'] for f in fills)):
        raise ValueError('Invalid TopoJSON-derived US listening-region fills')
    return feature, fills

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
    shared_us_borders, us_fills = _regional_mesh(source)
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
    features = complete_polar_coastlines(features)
    page=(ROOT/'android-lab/web/atlas-lab.html').read_text().replace('/*GEOGRAPHY*/',json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')))
    (destination/'atlas-lab.html').write_text(page)
    root=destination/'index.html'
    root.write_text(root.read_text().replace('</body>',
        '<script type="application/json" id="labGlobeGeography">'+json.dumps({'type':'FeatureCollection','features':features},separators=(',',':'))+'</script>'
        +'<script type="application/json" id="labUSRegionBorders">'+json.dumps(shared_us_borders,separators=(',',':'))+'</script>'
        +'<script type="application/json" id="labUSRegionFills">'+json.dumps(us_fills,separators=(',',':'))+'</script></body>'))
