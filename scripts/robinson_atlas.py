"""Project the canonical Mercator country paths into a framed Robinson atlas.

The canonical launcher retains the original paths and region IDs. Only the visual
edition is reprojected; existing button, continent, and country selectors remain.
Coordinates in the source use x=2*(longitude+180), y=235.5-116*Mercator(lat).
"""
import math
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


def render_robinson(svg):
    # Called on the built illustrated edition, not on canonical source.
    country_count = len(_COUNTRY.findall(svg))
    if country_count < 175:
        raise ValueError(f"Expected all country paths; found {country_count}")
    svg = _COUNTRY.sub(lambda m: m.group(1) + _path(m.group(2)) + m.group(3), svg)
    svg = svg.replace('class="crate-mercator"', 'class="crate-robinson"', 1)
    svg = svg.replace("MERCATOR · 75°N TO 57°S", "ROBINSON · WORLD LISTENING ATLAS")
    svg = re.sub(
        r'<g class="crate-map-grid" aria-hidden="true">.*?</g>',
        _graticule(), svg, count=1, flags=re.S
    )
    return svg
