"""Build navigation data from the exact projected country paths, off-device."""
import json
import re


def _winding(points, x, y):
    winding = 0
    for a, b in zip(points, points[1:] + points[:1]):
        cross = (b[0]-a[0])*(y-a[1]) - (x-a[0])*(b[1]-a[1])
        if a[1] <= y < b[1] and cross > 0:
            winding += 1
        elif b[1] <= y < a[1] and cross < 0:
            winding -= 1
    return winding


def navigation_data(html):
    countries, shapes = [], []
    for tag in re.findall(r'<path [^>]*data-atlas-country=[^>]*>', html):
        region = re.search(r'data-atlas-region="([^"]+)"', tag).group(1)
        d = re.search(r'\bd="([^"]+)"', tag).group(1)
        rings = []
        for part in re.findall(r'M[^M]+', d):
            points = [(float(x), float(y)) for x, y in
                      re.findall(r'[ML](-?[\d.]+)\s+(-?[\d.]+)', part)]
            if len(points) < 3:
                continue
            x, y = min(p[0] for p in points), min(p[1] for p in points)
            w = max(p[0] for p in points)-x
            h = max(p[1] for p in points)-y
            area = abs(sum(a[0]*b[1]-b[0]*a[1]
                           for a, b in zip(points, points[1:]+points[:1])))/2
            rings.append((points, x, y, w, h))
            shapes.append([region, x, y, round(w, 3), round(h, 3), round(area, 3)])
        countries.append(rings)
    if len(countries) < 175:
        raise ValueError('Projected country paths missing from navigation build')
    anchors = []
    for y in range(26, 350, 12):
        for x in range(26, 696, 12):
            if any(sum(_winding(points, x, y)
                       for points, rx, ry, rw, rh in rings
                       if rx <= x <= rx+rw and ry <= y <= ry+rh)
                   for rings in countries):
                anchors.append([x, y])
    # Match the selection-framing policy; subpixel offshore fragments do not
    # need to travel to the client, but all polygons above that floor remain.
    largest = {}
    for region, *_, area in shapes:
        largest[region] = max(largest.get(region, 0), area)
    shapes = [s for s in shapes if s[-1] >= max(.05, largest[s[0]]*.005)]
    return {'version': 1, 'anchors': anchors, 'shapes': shapes}


def navigation_script(html):
    data = json.dumps(navigation_data(html), separators=(',', ':'))
    return '<script type="application/json" id="atlasNavigationGeometry">'+data+'</script>'
