"""Build an offline Android Lab snapshot without changing launcher sources."""
from pathlib import Path
import shutil
import re
import json

ROOT = Path(__file__).resolve().parents[1]

def bundle(destination=None, *, version_name=None, widget_asset_output=None, drawable_output=None, production=False):
    destination = Path(destination or ROOT / 'android-lab/app/src/main/assets/site')
    if destination.exists():
        shutil.rmtree(destination)
    assets = json.loads((ROOT / 'android-lab/web/runtime-assets.json').read_text())
    for name in assets:
        relative=Path(name)
        if relative.is_absolute() or '..' in relative.parts:
            raise ValueError('Unsafe runtime asset: ' + name)
        target=destination / relative
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(ROOT / 'launcher' / relative,target)
    # Match the production root routing, while retaining edition asset paths.
    shutil.copyfile(ROOT / 'launcher/editions/gig-poster/index.html', destination / 'index.html')
    shutil.copyfile(ROOT / 'launcher/editions/gig-poster/setup/index.html', destination / 'setup/index.html')
    page = destination / 'index.html'
    html = page.read_text()
    manual = (ROOT / 'launcher/editions/gig-poster/setup/index.html').read_text()
    workspace = (ROOT / 'android-lab/web/workspace.html').read_text()
    version = ([version_name] if version_name is not None else
               re.findall(r"versionName\s+['\"]([0-9A-Za-z.+_-]+)['\"]", (ROOT / 'android-lab/app/build.gradle').read_text()))
    assert len(version) == 1, 'Expected one Android versionName for the Manual.'
    assert workspace.count('<!--LAB_APP_VERSION-->') == 1, 'Manual version placeholder changed.'
    workspace = workspace.replace('<!--LAB_APP_VERSION-->', version[0])
    if production:
        # Only copy displayed content. Keep Lab DOM IDs, bridge names, and CSS hooks.
        visible_copy = {
            'Share a song link to Hipster GO Lab, or add a musical idea here.':
                'Share a song link to Go, Hipster, Go!, or add a musical idea here.',
            'Uninstalling Lab removes your Crate.':
                'Uninstalling the app removes your Crate.',
            'Lab prepares the request.':
                'Go, Hipster, Go! prepares the request.',
            'Gemini’s installed version cannot be read by Lab.':
                'This app cannot read Gemini’s installed version.',
            'ANDROID LAB · ': 'GO, HIPSTER, GO! · ',
            'A separate offline install.': 'An offline-ready app.',
            'If the installed app is unavailable, Lab opens its website.':
                'If the installed AI app is unavailable, its website opens.',
        }
        for source, replacement in visible_copy.items():
            if workspace.count(source) != 1:
                raise ValueError('Production display contract changed: ' + source)
            workspace = workspace.replace(source, replacement)
    for marker, cls in [('LINER', 'manual-liner'), ('RESOURCES', 'resource-shelf')]:
        block = re.search(r'<details class="' + cls + r'">.*?</details>', manual, re.S)
        assert block, 'Manual section changed; review Lab integration.'
        workspace = workspace.replace('<!--LAB_MANUAL_' + marker + '-->', block.group())
    for marker, content in [('<!-- PLATFORM_STYLES -->', '<link rel="stylesheet" href="/assets/lab-workspace.css">'), ('<!-- PLATFORM_WORKSPACE -->', '\n'+workspace)]:
        if html.count(marker)!=1:
            raise ValueError('Expected one HTML platform slot: '+marker)
        html=html.replace(marker,marker+content)
    # Palette is applied before first paint. The existing Android renderer
    # receives only color values; no geographic geometry or state is replaced.
    # Liberi uses the unmodified poster styling. Keep inactive Bosque/Usiku
    # rules out of its style recalculation path; apply saved themes synchronously
    # in the head, before first paint, then toggle on user choice.
    theme_head=('<script src="/assets/lab-themes.js"></script>'
                '<link rel="stylesheet" href="/assets/lab-theme-tokens.css" data-lab-palette-style media="not all">'
                '<link rel="stylesheet" href="/assets/pwa-themes.css" data-lab-palette-style media="not all">'
                '<link rel="stylesheet" href="/assets/pwa-atlas-themes.css" data-lab-palette-style media="not all">'
                '<link rel="stylesheet" href="/assets/lab-theme-print.css" data-lab-print-style media="not all">'
                '<script>for(const link of document.querySelectorAll("link[data-lab-palette-style]"))link.media=document.documentElement.dataset.pwaTheme==="liberi"?"not all":"all";</script>'
                '<script>for(const link of document.querySelectorAll("link[data-lab-print-style]"))link.media=document.documentElement.dataset.ghgThemeProfile==="print"?"all":"not all";</script>')
    html=html.replace('</head>',theme_head+'<script defer src="/assets/maplibre/maplibre-gl.js"></script><script defer src="/assets/cahill-keyes-vendor.js"></script><link rel="stylesheet" href="/assets/maplibre/maplibre-gl.css"></head>')
    page.write_text(html)
    shutil.copyfile(ROOT / 'android-lab/web/workspace.css', destination / 'assets/lab-workspace.css')
    shutil.copyfile(ROOT / 'android-lab/web/theme.js', destination / 'assets/lab-themes.js')
    # Bake the approved, theme-independent selected Funk art from the locked
    # sprite instead of relying on WebView's pseudo-element SVG filter.
    import runpy
    runpy.run_path(str(ROOT / 'scripts/bake_funk_selected.py'))['bake_funk'](
              ROOT / 'launcher/editions/gig-poster/assets/moods-selected-ink-v2.webp',
              destination / 'assets/funk-selected-engraved.webp')
    # A single semantic UI palette is loaded by the app and Manual iframe.
    shutil.copyfile(ROOT / 'android-lab/web/theme-tokens.css', destination / 'assets/lab-theme-tokens.css')
    shutil.copyfile(ROOT / 'android-lab/web/theme-print.css', destination / 'assets/lab-theme-print.css')
    # One shared color system for the Android app and browser companion.
    shutil.copyfile(ROOT / 'launcher/assets/pwa-themes.css', destination / 'assets/pwa-themes.css')
    shutil.copyfile(ROOT / 'launcher/assets/pwa-atlas-themes.css', destination / 'assets/pwa-atlas-themes.css')
    vendor = ROOT / 'android-lab/web/cahill-keyes-vendor.js'
    if not vendor.is_file():
        raise FileNotFoundError('Cahill-Keyes offline bundle missing: run bash scripts/build_cahill_keyes_vendor.sh')
    shutil.copyfile(vendor, destination / 'assets/cahill-keyes-vendor.js')
    shutil.copyfile(ROOT / 'android-lab/web/CAHILL-KEYES-NOTICES.txt',
                    destination / 'assets/CAHILL-KEYES-NOTICES.txt')
    shutil.copyfile(ROOT / 'android-lab/web/manual-guide.html', destination / 'manual-guide.html')
    if production:
        guide = destination / 'manual-guide.html'
        # Manual content uses the term only for on-screen instructions/demos.
        guide.write_text(re.sub(r'\bLAB\b', 'APP',
                              re.sub(r'\bLab\b', 'Go, Hipster, Go!', guide.read_text())))
    shutil.copyfile(ROOT / 'android-lab/web/manual-guide-theme.css', destination / 'assets/lab-manual-themes.css')
    shutil.copytree(ROOT / 'android-lab/web/tutorial-media', destination / 'assets/tutorial-media')
    script = destination / 'assets/app.js'
    text = script.read_text()
    route_index = json.loads((ROOT / 'android-lab/web/discovery-route-index.json').read_text())
    routes_js = (ROOT / 'android-lab/web/discovery-routes.js').read_text().replace('/*LAB_ROUTE_INDEX*/', json.dumps(route_index, separators=(',', ':')))
    # Versioned, explicit extension slots: never patch implementation statements.
    def inject(source, name, code):
        marker = '/* PLATFORM_' + name + ' */'
        if source.count(marker) != 1:
            raise ValueError('Expected one platform slot: ' + name)
        return source.replace(marker, code)
    slots = {
        'ATLAS_CAMERA': 'if(labGlobeReady){labGlobeBounds(view);return}',
        'ATLAS_SELECTION': 'labGlobeSync();',
        'ATLAS_INSTRUCTION': 'labAtlasInstruction();',
        'DECLARATIONS': (ROOT / 'android-lab/web/atlas-touch-targets.js').read_text() + '\n' + (ROOT / 'android-lab/web/atlas-morph-vectors.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes-routes.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes-lanes.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes-navigator.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes-motion.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes-switch.js').read_text() + '\n' + (ROOT / 'android-lab/web/globe.js').read_text() + '\n' + routes_js + '\n' + (ROOT / 'android-lab/web/workspace.js').read_text() + '\n' + (ROOT / 'android-lab/web/inspiration.js').read_text() + '\n' + (ROOT / 'android-lab/web/tutorial.js').read_text(),
        'COPY': 'if(window.HipsterLab)return window.HipsterLab.copy(text);',
        'ROUTE_PROMPT': 'if(labRoutePrompt())parts.push(labRoutePrompt());',
        'REFERENCE': 'const reference=labInspiration();if(reference){parts.push(...inspirationPromptLines(reference,labState().inspirationPreview));}else',
        'HANDOFF_RENDER': 'renderLabHandoff();',
        'RENDER': 'labRefreshState();renderLabWorkspace();renderLabInspiration();',
        'BEFORE_GO': 'if(labSubmitDraftBeforeGo())return;',
        'ROUTE_DRAW': 'crateSparkPhrase="";labActiveRoute=labInspiration()?null:nextLabDiscoveryRoute();',
        'COPIED': 'if(ok&&window.HipsterLab){if(ai==="other"){status("Request copied. Open your AI manually, paste and send.")}else{window.HipsterLab.go(ai,prompt);status(labState().oneTap===false?"Request copied. Choose OPEN when ready.":labState().mode==="share"?"Continue in your AI to review and send the shared request.":"Request copied. Paste and send it in your AI.")}return;}',
        'OPEN': '''for(const id of ["openAi","manualOpenAi"]){const link=doc.getElementById(id);if(link)link.addEventListener("click",event=>{
 if(event.defaultPrevented||!window.HipsterLab)return;
 event.preventDefault();window.HipsterLab.open(ai,goPrompt(ai,service,mood));
})}''',
        'SHARE': 'if(window.HipsterLab){window.HipsterLab.share(goPrompt(ai,service,mood));return}',
        'BOOT': 'initLabWorkspace();initLabGlobe();',
    }
    for name, code in slots.items():
        text = inject(text, name, code)
    setup_script = destination / 'assets/first-crate.js'
    setup_text = inject(setup_script.read_text(), 'SETUP_COPY', 'if(window.HipsterLab)return window.HipsterLab.copy(text);')
    setup_text = inject(setup_text, 'SETUP_OPEN', '''
 const external=e.target.closest('a.primary[href]');
 if(external&&window.HipsterLab){e.preventDefault();window.HipsterLab.open(aiKeys[$('ai').value],setup());return}
''')
    setup_script.write_text(setup_text)
    if production:
        # Exact user-facing JS strings only: internal lab* state keys are shared.
        translations = {
            "mark.textContent='LAB';": "mark.textContent='';mark.hidden=true;",
            "'Share a song link to Lab, or add an idea.'":
                "'Share a song link to Go, Hipster, Go!, or add an idea.'",
            "If the app is unavailable, Lab opens its website.":
                "If the app is unavailable, its website opens.",
            "frames:[['LAB','Copy Setup Check']":
                "frames:[['APP','Copy Setup Check']",
        }
        for source, replacement in translations.items():
            if text.count(source) != 1:
                raise ValueError('Production script contract changed: ' + source)
            text = text.replace(source, replacement)
    script.write_text(text)
    # A versioned widget catalog derived from canonical Jukebox definitions.
    # Bundled assets are outputs only, never a second prompt specification.
    catalog = (ROOT / 'launcher/assets/app.js').read_text()
    def literal(pattern, label):
        match = re.search(pattern, catalog, re.M)
        if not match:
            raise ValueError('Chaos Roll source contract changed: ' + label)
        return json.loads(match.group(1))
    regions = literal(r'^const crateRegions=(\[.*\]);$', 'regions')
    moods = [x for x in literal(r'^const moods=new Set\((\[.*\])\);$', 'moods') if x != 'go']
    rhythm_and_texture = literal(r'^const seedCueBank=(\{.*\});$', 'sparks')
    tensions = literal(r'^const moodSparkBank=(\{.*\});$', 'mood sparks')
    for mood in moods:
        if mood not in tensions:
            tensions[mood] = literal(
                r'^moodInterpretations\.' + re.escape(mood) + r'=(\[.*\]);$',
                'mood ' + mood)
    route_index = json.loads((ROOT / 'android-lab/web/discovery-route-index.json').read_text())
    if len(moods) != 8 or not regions or len(route_index['routes']) != 24:
        raise ValueError('Unexpected Chaos Roll catalog shape; review sources')
    chaos_config = {
        'version': 1,
        'moods': moods,
        'regions': [{'id': x['id'], 'label': x['label']} for x in regions if x['id'] != 'antarctica'],
        'routeVersion': route_index['version'],
        'routes': [x['id'] for x in route_index['routes']],
        'sparks': {
            'rhythm': [x['text'] for x in rhythm_and_texture['rhythm']],
            'texture': rhythm_and_texture['texture'],
            'tension': tensions,
        },
    }
    widget_asset = Path(widget_asset_output or ROOT / 'android-lab/app/src/main/assets/chaos-roll-config.json')
    widget_asset.parent.mkdir(parents=True, exist_ok=True)
    widget_asset.write_text(json.dumps(chaos_config, ensure_ascii=False, separators=(',', ':')))
    import runpy
    runpy.run_path(str(ROOT/'scripts/bundle_maplibre_lab.py'))['bundle_maplibre'](destination)
    # Copy the two approved raster artworks without redrawing or cropping.
    runpy.run_path(str(ROOT/'scripts/render_chaos_widget.py'))['render'](
        Path(drawable_output or ROOT / 'android-lab/app/src/main/res/drawable-nodpi'))
    # Only the packaged Android copies are compressed. Originals in launcher/
    # remain lossless and can be re-encoded for future visual revisions.
    runpy.run_path(str(ROOT/'scripts/optimize_android_artwork.py'))['optimize'](destination)
    return destination

if __name__ == '__main__':
    print(bundle())
