"""Build the production RC from the exact canonical native implementation.

No signing, Play upload, or changes to the installed Lab application.
"""
from pathlib import Path
import re
import shutil

from bundle_android_lab import bundle

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "android-production/app"
NATIVE_RES = ROOT / "android-lab/app/src/main/res"


def prepare() -> None:
    # Merge the shared Android resources with the one package-specific shortcut.
    # Gradle reads only this generated directory; no duplicate resource origins.
    resources = APP / "build/production-res"
    if resources.exists():
        shutil.rmtree(resources)
    shutil.copytree(NATIVE_RES, resources)
    # Lab's widget-picker label must never appear in the production build.
    strings = resources / "values/strings.xml"
    original = strings.read_text()
    source = '<string name="chaos_roll_widget_name">Chaos Roll (Lab)</string>'
    if original.count(source) != 1:
        raise ValueError("Unexpected widget label template; audit production branding")
    strings.write_text(original.replace(source,
        '<string name="chaos_roll_widget_name">Chaos Roll</string>'))
    shortcuts = APP / "config/shortcuts.xml"
    shutil.copyfile(shortcuts, resources / "xml/shortcuts.xml")

    gradle = (APP / "build.gradle").read_text()
    versions = re.findall(r"versionName\s+['\"]([0-9A-Za-z.+_-]+)['\"]", gradle)
    if len(versions) != 1:
        raise ValueError("Production versionName must be unambiguous")

    assets = APP / "src/main/assets"
    assets.mkdir(parents=True, exist_ok=True)
    bundle(
        destination=assets / "site",
        version_name=versions[0],
        widget_asset_output=assets / "chaos-roll-config.json",
        drawable_output=resources / "drawable-nodpi",
        production=True,
    )

    # Reject known release-copy regressions. 'lab' in CSS, IDs and Java class
    # names is private plumbing and deliberately excluded from this check.
    page = (assets / "site/index.html").read_text()
    guide = (assets / "site/manual-guide.html").read_text()
    js = (assets / "site/assets/app.js").read_text()
    for forbidden in ("Hipster GO Lab", "Uninstalling Lab", "ANDROID LAB", "Lab opens its website."):
        if forbidden in page + guide + js:
            raise ValueError("Lab copy leaked into production: " + forbidden)
    if "mark.textContent='LAB'" in js:
        raise ValueError("Lab brand badge leaked into production")
    if versions[0] not in page:
        raise ValueError("Production Manual version does not match Gradle")


if __name__ == "__main__":
    prepare()
    print("Unsigned production RC assets ready")
