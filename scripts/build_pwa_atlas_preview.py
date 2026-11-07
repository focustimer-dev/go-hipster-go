#!/usr/bin/env python3
"""Build a review-only browser route from the canonical Android Lab atlas.

The Android bundle is the single source of geometry, projection transitions and
shipping lanes. Build exclusively into launcher/pwa-atlas for the isolated Worker.
The public gig-poster, native Lab files and main PWA adapter remain untouched.
"""
from pathlib import Path
import re
import shutil
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.bundle_android_lab import bundle

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "launcher" / "pwa-atlas"
PREFIX = "/pwa-atlas"

def rewrite_absolute_assets(value):
    # Preserve all absolute URLs and installed skill paths; rewrite only paths
    # that point to assets inside the self-contained Android Lab snapshot.
    # Match quoted URL strings and url(...) values without changing URLs
    # already under /pwa-atlas or strings containing https://.
    for root in ("assets/", "editions/", "manual-guide.html", "atlas-lab.html",
                 "setup/", "icon.svg", "manifest.webmanifest", "gemini-manifest.webmanifest"):
        for start in ('"/', "'/", "url(/", 'url("/', "url('/"):
            if start.startswith("url("):
                needle = start + root
                value = value.replace(needle, start + "pwa-atlas/" + root)
            else:
                needle = start + root
                value = value.replace(needle, start + "pwa-atlas/" + root)
    return value

def theme_browser_tween_assets():
    """Replace only the *generated PWA copy* of the Android transition paints.

    A CSS filter cannot faithfully turn Liberi's yellow/red raster frames into
    Bosque/Usiku geography. Keep the same geographic paths, render curves,
    timing and the Android source, but read actual browser theme paint values.
    Exact-match replacements fail closed if canonical engine code changes.
    """
    app = DEST / "assets" / "app.js"
    source = app.read_text(encoding="utf-8")
    changes = (
        ("const palette={paper:'#dfb045',ocean:'#103135',selected:'#a83223'};",
         "const paletteDefaults={paper:'#dfb045',ocean:'#103135',selected:'#a83223'};"),
        ("function paint(canvas,prepared,t,selected,fits=null){",
         "function paint(canvas,prepared,t,selected,fits=null){ const palette=window.GHGAtlasPaintColors?.()||paletteDefaults;"),
        ("return width+'@'+selectionKey(selected);",
         "return width+'@'+selectionKey(selected)+'@'+(window.GHGAtlasPaintColors?.().theme||'liberi');"),
        ("const PAL={paper:'#dfb045',ocean:'#103135',selected:'#a83223',ink:'#103135'};",
         "const PAL=new Proxy({paper:'#dfb045',ocean:'#103135',selected:'#a83223',ink:'#103135',backdrop:'#dfb045'},"
         "{get(base,key){return window.GHGAtlasPaintColors?.()?.[key]||base[key]}});"),
        ("const key=selectionKey(selected)+'@'+pixels;",
         "const key=selectionKey(selected)+'@'+pixels+'@'+(window.GHGAtlasPaintColors?.().theme||'liberi');"),
        ("ctx.fillStyle=PAL.paper;ctx.fillRect(0,0,pixels,pixels);",
         "ctx.fillStyle=PAL.backdrop;ctx.fillRect(0,0,pixels,pixels);"),
        ("ctx.globalCompositeOperation='destination-over';ctx.fillStyle=PAL.paper;",
         "ctx.globalCompositeOperation='destination-over';ctx.fillStyle=PAL.backdrop;"),
        ("ctx.fillStyle=PAL.paper;ctx.fillRect(0,0,size,size);",
         "ctx.fillStyle=PAL.backdrop;ctx.fillRect(0,0,size,size);"),
        ("ctx.fillStyle=item.getAttribute('fill');ctx.fill();",
         "ctx.fillStyle=window.GHGAtlasPaintColors?getComputedStyle(item).fill:item.getAttribute('fill');ctx.fill();"),
        ("veil.style.cssText='position:absolute;inset:0;z-index:30;overflow:hidden;background:#dfb045;pointer-events:none;';",
         "veil.style.cssText='position:absolute;inset:0;z-index:30;overflow:hidden;background:'+PAL.backdrop+';pointer-events:none;';"),
    )
    for original, replacement in changes:
        if source.count(original) != 1:
            raise AssertionError(f"Atlas PWA tween anchor changed: {original[:75]}")
        source = source.replace(original, replacement)
    app.write_text(source, encoding="utf-8")


def main():
    bundle(DEST)
    shutil.copyfile(ROOT / "launcher/assets/pwa-atlas-bridge.js",
                    DEST / "assets/pwa-atlas-bridge.js")
    shutil.copyfile(ROOT / "launcher/assets/pwa-atlas-themes.css",
                    DEST / "assets/pwa-atlas-themes.css")
    for file in DEST.rglob("*"):
        if file.is_file() and file.suffix.lower() in {".html", ".css", ".js", ".json", ".webmanifest"}:
            # MapLibre's compiled JS is copied byte-for-byte, not rewritten.
            if "/maplibre/" in file.as_posix() or file.name == "cahill-keyes-vendor.js":
                continue
            original = file.read_text(encoding="utf-8")
            updated = rewrite_absolute_assets(original)
            if updated != original:
                file.write_text(updated, encoding="utf-8")
    theme_browser_tween_assets()
    page = DEST / "index.html"
    html = page.read_text(encoding="utf-8")
    injection = ('<link rel="stylesheet" href="/assets/pwa-themes.css">'
                 '<link rel="stylesheet" href="/pwa-atlas/assets/pwa-atlas-themes.css">'
                 '<script src="/pwa-atlas/assets/pwa-atlas-bridge.js"></script>')
    assert "id=\"labGlobeGeography\"" in html, "Canonical geographic data missing"
    assert 'src="/pwa-atlas/assets/app.js"' in html, "Atlas app URL did not rewrite"
    assert "data-atlas-view" not in html or "robinson" in html
    assert html.count("</head>") == 1
    html = html.replace("</head>", injection + "</head>")
    page.write_text(html, encoding="utf-8")
    # Build one Atlas-only UI surface from the SAME native-engine bundle.
    # Source app/region data remain canonical, but only map+mode nodes render.
    app = DEST / "assets/app.js"
    code = app.read_text(encoding="utf-8")
    expose = 'if(typeof window!=="undefined")window.HipsterPWABridge={'
    assert code.count(expose) == 1, "Canonical map-state export location changed"
    bridge = '''if(location.pathname==='/pwa-atlas/inline'||location.pathname==='/pwa-atlas/inline.html'){
 window.HipsterInlineAtlas=Object.freeze({
  getRegions:()=>[...crateSelected],
  setRegions:ids=>{
   if(!Array.isArray(ids)||ids.length>30||ids.some(id=>!validCrateRegions.has(id)))return false;
   const next=new Set(ids);
   if(next.size===crateSelected.size&&[...next].every(id=>crateSelected.has(id)))return false;
   crateSelected.clear();for(const id of next)crateSelected.add(id);
   lastCrateStamp=null;updateCrateMap(false);return true;
  }
 });
}
'''
    code = code.replace(expose, bridge + expose)
    change = 'store(crateStorageKey,JSON.stringify([...crateSelected]));' + chr(10) + ' copiedPrompt=null;selectionChanged(false,true);if(reframe)frameSelectedAtlas();'
    assert code.count(change)==1, "Canonical region-pick synchronization anchor changed"
    code=code.replace(change,change+'''
 if(window.HipsterInlineAtlas&&window.parent!==window){
  window.parent.postMessage({type:'ghg-inline-atlas-regions',
   regions:[...crateSelected]},location.origin);
 }''')
    app.write_text(code,encoding="utf-8")
    for source,target in (("pwa-inline-child.js","pwa-inline-child.js"),
                          ("pwa-inline-child.css","pwa-inline-child.css")):
        shutil.copyfile(ROOT/"launcher/assets"/source,DEST/"assets"/target)
    inline=html.replace('</head>',
        '<link rel="stylesheet" href="/pwa-atlas/assets/pwa-inline-child.css"></head>')
    assert inline.count('</body>')==1
    inline=inline.replace('</body>',
        '<div id="pwaInlineAtlasRoot" aria-label="Live listening Atlas"></div>'
        '<script src="/pwa-atlas/assets/pwa-inline-child.js"></script></body>')
    (DEST/"inline.html").write_text(inline,encoding="utf-8")
    print(f"Built canonical Android atlas browser route: {DEST}")

if __name__ == "__main__":
    main()
