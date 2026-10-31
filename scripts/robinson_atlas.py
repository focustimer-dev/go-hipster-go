"""Project the canonical Mercator country paths into a framed Robinson atlas.

The canonical launcher retains the original paths and region IDs. Only the visual
edition is reprojected; existing button, continent, and country selectors remain.
Coordinates in the source use x=2*(longitude+180), y=235.5-116*Mercator(lat).
"""
import math
import json
from pathlib import Path
import re

# Snyder/Robinson tabulated coefficients at five-degree latitude intervals.
ROBINSON_X = (
    1.0, .9986, .9954, .99, .9822, .973, .96, .9427, .9216,
    .8962, .8679, .835, .7986, .7597, .7186, .6732, .6213, .5722, .5322,
)
ROBINSON_Y = (
    0, .062, .124, .186, .248, .31, .372, .434, .4958,
    .5571, .6176, .6769, .7346, .7903, .8435, .8936, .9394, .9761, 1.0,
)

SOURCE_EQUATOR = 235.5
SOURCE_MERCATOR_SCALE = 116.0
MAP_CENTER_X = 360.0
MAP_CENTER_Y = 188.0
MAP_HALF_WIDTH = 335.0
MAP_HALF_HEIGHT = 168.0

_POINT = re.compile(r"([ML])(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)")
_COUNTRY = re.compile(r'(<path d=")([^"]+)("(?=[^>]*data-atlas-country=))')


def _interp(table, latitude):
    latitude = max(0.0, min(90.0, abs(latitude)))
    i = min(int(latitude // 5), 17)
    t = (latitude - i * 5) / 5
    return table[i] + (table[i + 1] - table[i]) * t


def project(longitude, latitude):
    """True tabular Robinson shape, with generous breathing room at the poles."""
    latitude = max(-90.0, min(90.0, latitude))
    x = MAP_CENTER_X + MAP_HALF_WIDTH * (longitude / 180) * _interp(ROBINSON_X, latitude)
    y = MAP_CENTER_Y - math.copysign(MAP_HALF_HEIGHT * _interp(ROBINSON_Y, latitude), latitude)
    return x, y


def reproject_source(x, y):
    longitude = x / 2 - 180
    mercator = (SOURCE_EQUATOR - y) / SOURCE_MERCATOR_SCALE
    latitude = math.degrees(math.atan(math.sinh(mercator)))
    return project(longitude, latitude)


def _path(d):
    # Existing country data contains only absolute M/L and closing Z commands.
    # Keep every original vertex, territory ID and clickable path intact.
    result = _POINT.sub(
        lambda m: "{}{:.1f} {:.1f}".format(
            m.group(1), *reproject_source(float(m.group(2)), float(m.group(3)))
        ),
        d,
    )
    if re.search("[A-YA-y]", _POINT.sub("", d).replace("Z", "")):
        raise ValueError("Unexpected country path command")
    return result


def _graticule():
    lines = []
    # Curved meridians (unlike Mercator); draw in the same cartographic plate.
    for lon in range(-150, 180, 30):
        pts = [project(lon, lat) for lat in range(-85, 86, 5)]
        lines.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts))
    for lat in range(-75, 76, 15):
        pts = [project(lon, lat) for lon in range(-180, 181, 5)]
        lines.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts))
    return '<g class="crate-map-grid" aria-hidden="true"><path d="' + "".join(lines) + '"/></g>'




def _world_shape():
    """Closed Robinson boundary including flat poles and bowed side meridians."""
    points = (
        [project(lon, 90) for lon in range(-180, 181, 5)]
        + [project(180, lat) for lat in range(85, -91, -5)]
        + [project(lon, -90) for lon in range(175, -181, -5)]
        + [project(-180, lat) for lat in range(-85, 90, 5)]
    )
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in points) + "Z"



def _radial_field():
    """5-degree rays sharing the Robinson camera, drawn BEHIND its opaque ocean.

    A static mask would cut out the world's ORIGINAL position and leave blank
    space when panning. Instead, SVG painter order makes the moving ocean
    itself the occluder. The radial and map viewBoxes are kept identical by
    launcher JS, so their common center moves with the projection.
    """
    rays = []
    for degrees in range(0, 360, 5):
        angle = math.radians(degrees)
        x = MAP_CENTER_X + 1000 * math.cos(angle)
        y = MAP_CENTER_Y + 1000 * math.sin(angle)
        level = ("major" if degrees % 90 == 0 else
                 "secondary" if degrees % 45 == 0 else
                 "tertiary" if degrees % 15 == 0 else "fine")
        rays.append(
            f'<line class="radial-ray radial-{level}" '
            f'x1="360" y1="188" x2="{x:.1f}" y2="{y:.1f}"/>'
        )
    return (
        '<svg class="atlas-radial-field" viewBox="0 0 720 372" '
        'aria-hidden="true" focusable="false">'
        + "".join(rays) + '</svg>'
    )


def _complete_polar_coasts(svg):
    """Recover coastlines lost by the source Mercator latitude crop."""
    data = json.loads((Path(__file__).resolve().parents[1] / 'assets/polar-coastlines.geojson').read_text())
    for feature in data['features']:
        name = feature['properties']['name']
        geometry = feature['geometry']
        polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
        d = ''.join('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x,y in (project(lon,lat) for lon,lat in ring)) + 'Z'
                    for polygon in polygons for ring in polygon)
        code = 'GRL' if name == 'Greenland' else 'ATA'
        pattern = r'(<path d=")[^"]+("(?=[^>]*data-atlas-country="' + code + r'"))'
        svg, count = re.subn(pattern, lambda m: m.group(1)+d+m.group(2), svg)
        if count != 1:
            raise ValueError(f'Expected one {name} coastline, got {count}')
    return svg


def render_robinson(svg):
    # Called on the built illustrated edition, not on canonical source.
    country_count = len(_COUNTRY.findall(svg))
    if country_count < 175:
        raise ValueError(f"Expected all country paths; found {country_count}")
    svg = _COUNTRY.sub(lambda m: m.group(1) + _path(m.group(2)) + m.group(3), svg)
    svg = _complete_polar_coasts(svg)
    svg = svg.replace('class="crate-mercator"', 'class="crate-robinson"', 1)
    svg = svg.replace("MERCATOR · 75°N TO 57°S", "ROBINSON · WORLD LISTENING ATLAS")
    svg = re.sub(
        r'<g class="crate-map-grid" aria-hidden="true">.*?</g>',
        _graticule(), svg, count=1, flags=re.S
    )
    # Only the Robinson-projected countries should draw map boundaries.
    # Legacy Mercator zone outlines would otherwise produce ghost landmasses.
    svg, removed = re.subn(
        r'<path class="crate-zone-boundaries"[^>]*?/>', '', svg
    )
    if removed != 1:
        raise ValueError(f"Expected one legacy Mercator boundary layer, got {removed}")
    outline = _world_shape()
    ocean = (
        '<defs><clipPath id="robinsonWorldClip">'
        '<path d="' + outline + '"/></clipPath></defs>'
        '<path class="crate-map-ocean" d="' + outline + '"/>'
        '<g class="robinson-plate-content" clip-path="url(#robinsonWorldClip)">'
    )
    old_ocean = '<rect class="crate-map-ocean" width="720" height="372"/>'
    if old_ocean not in svg:
        raise ValueError("Source ocean rectangle not found")
    svg = svg.replace(old_ocean, ocean, 1)
    # All country paths, the graticule and ships are clipped as a single plate.
    old_end = '</svg><div class="chart-viewport-frame"'
    if old_end not in svg:
        raise ValueError("Fixed overlay must follow the moving SVG")
    svg = svg.replace(old_end, '</g></svg><div class="chart-viewport-frame"', 1)
    # Radials are painted under the projected map; its opaque ocean masks them.
    marker = '<svg id="crateAtlasMap"'
    if svg.count(marker) != 1:
        raise ValueError("Expected exactly one map SVG for the radial engraving")
    svg = svg.replace(marker, _radial_field() + marker, 1)
    return svg
