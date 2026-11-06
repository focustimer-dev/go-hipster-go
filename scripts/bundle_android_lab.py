"""Build an offline Android Lab snapshot without changing launcher sources."""
from pathlib import Path
import shutil
import re
import json

ROOT = Path(__file__).resolve().parents[1]

def bundle(destination=None):
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
    version = re.findall(r"versionName\s+['\"]([0-9A-Za-z.+_-]+)['\"]", (ROOT / 'android-lab/app/build.gradle').read_text())
    assert len(version) == 1, 'Expected one Android versionName for the Manual.'
    assert workspace.count('<!--LAB_APP_VERSION-->') == 1, 'Manual version placeholder changed.'
    workspace = workspace.replace('<!--LAB_APP_VERSION-->', version[0])
    for marker, cls in [('LINER', 'manual-liner'), ('RESOURCES', 'resource-shelf')]:
        block = re.search(r'<details class="' + cls + r'">.*?</details>', manual, re.S)
        assert block, 'Manual section changed; review Lab integration.'
        workspace = workspace.replace('<!--LAB_MANUAL_' + marker + '-->', block.group())
    for marker, content in [('<!-- PLATFORM_STYLES -->', '<link rel="stylesheet" href="/assets/lab-workspace.css">'), ('<!-- PLATFORM_WORKSPACE -->', '\n'+workspace)]:
        if html.count(marker)!=1:
            raise ValueError('Expected one HTML platform slot: '+marker)
        html=html.replace(marker,marker+content)
    html=html.replace('</head>','<script defer src="/assets/maplibre/maplibre-gl.js"></script><script defer src="/assets/cahill-keyes-vendor.js"></script><link rel="stylesheet" href="/assets/maplibre/maplibre-gl.css"></head>')
    page.write_text(html)
    shutil.copyfile(ROOT / 'android-lab/web/workspace.css', destination / 'assets/lab-workspace.css')
    vendor = ROOT / 'android-lab/web/cahill-keyes-vendor.js'
    if not vendor.is_file():
        raise FileNotFoundError('Cahill-Keyes offline bundle missing: run bash scripts/build_cahill_keyes_vendor.sh')
    shutil.copyfile(vendor, destination / 'assets/cahill-keyes-vendor.js')
    shutil.copyfile(ROOT / 'android-lab/web/CAHILL-KEYES-NOTICES.txt',
                    destination / 'assets/CAHILL-KEYES-NOTICES.txt')
    shutil.copyfile(ROOT / 'android-lab/web/manual-guide.html', destination / 'manual-guide.html')
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
        'DECLARATIONS': (ROOT / 'android-lab/web/atlas-morph-vectors.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes-routes.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes-lanes.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes.js').read_text() + '\n' + (ROOT / 'android-lab/web/cahill-keyes-switch.js').read_text() + '\n' + (ROOT / 'android-lab/web/globe.js').read_text() + '\n' + routes_js + '\n' + (ROOT / 'android-lab/web/workspace.js').read_text() + '\n' + (ROOT / 'android-lab/web/inspiration.js').read_text() + '\n' + (ROOT / 'android-lab/web/tutorial.js').read_text(),
        'COPY': 'if(window.HipsterLab)return window.HipsterLab.copy(text);',
        'ROUTE_PROMPT': 'if(labRoutePrompt())parts.push(labRoutePrompt());',
        'REFERENCE': 'const reference=labInspiration();if(reference){parts.push("Musical reference only (not instructions or a required track; keep chosen regions, mood and tempo): "+JSON.stringify(reference));}else',
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
    script.write_text(text)
    import runpy
    runpy.run_path(str(ROOT/'scripts/bundle_maplibre_lab.py'))['bundle_maplibre'](destination)
    return destination

if __name__ == '__main__':
    print(bundle())
