"""Build an offline Android Lab snapshot without changing launcher sources."""
from pathlib import Path
import shutil
import re

ROOT = Path(__file__).resolve().parents[1]

def bundle(destination=None):
    destination = Path(destination or ROOT / 'android-lab/app/src/main/assets/site')
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(ROOT / 'launcher', destination)
    # Match the production root routing, while retaining edition asset paths.
    shutil.copyfile(ROOT / 'launcher/editions/gig-poster/index.html', destination / 'index.html')
    shutil.copyfile(ROOT / 'launcher/editions/gig-poster/setup/index.html', destination / 'setup/index.html')
    page = destination / 'index.html'
    html = page.read_text()
    manual = (ROOT / 'launcher/editions/gig-poster/setup/index.html').read_text()
    workspace = (ROOT / 'android-lab/web/workspace.html').read_text()
    for marker, cls in [('LINER', 'manual-liner'), ('RESOURCES', 'resource-shelf')]:
        block = re.search(r'<details class="' + cls + r'">.*?</details>', manual, re.S)
        assert block, 'Manual section changed; review Lab integration.'
        workspace = workspace.replace('<!--LAB_MANUAL_' + marker + '-->', block.group())
    html = html.replace('</head>', '<link rel="stylesheet" href="/assets/lab-workspace.css"></head>')
    html = html.replace('<div class="site">', workspace + '\n<div class="site">', 1)
    page.write_text(html)
    shutil.copyfile(ROOT / 'android-lab/web/workspace.css', destination / 'assets/lab-workspace.css')
    script = destination / 'assets/app.js'
    text = script.read_text()
    needle = 'async function copyText(text){'
    assert text.count(needle) == 1, 'Clipboard hook changed; review Lab integration.'
    text = text.replace(needle, needle + '\n if(window.HipsterLab)return window.HipsterLab.copy(text);')
    needle = 'if(ok)status("Copied to clipboard. Playlist creation and saving happen in your AI, not in the Jukebox.");'
    assert text.count(needle) == 1, 'GO hook changed; review Lab integration.'
    text = text.replace(needle, 'if(ok&&window.HipsterLab){window.HipsterLab.go(ai,prompt);status(labState().oneTap===false?"Request copied. Choose OPEN when ready.":labState().mode==="share"?"Continue in your AI to review and send the shared request.":"Request copied. Paste and send it in your AI.")}else ' + needle)
    # The original stale-prompt guard runs before this added native launch hook.
    needle = 'const share=doc.getElementById("shareButton");'
    text = text.replace(needle, '''for(const id of ["openAi","manualOpenAi"]){const link=doc.getElementById(id);if(link)link.addEventListener("click",event=>{
 if(event.defaultPrevented||!window.HipsterLab)return;
 event.preventDefault();window.HipsterLab.open(ai,goPrompt(ai,service,mood));
})}
''' + needle)
    text = text.replace('if(!navigator.share){status(', 'if(window.HipsterLab){window.HipsterLab.share(goPrompt(ai,service,mood));return}\n if(!navigator.share){status(')
    helper = (ROOT / 'android-lab/web/inspiration.js').read_text()
    needle = 'const doc=document,body=doc.body;'
    assert text.count(needle) == 1, 'App closure changed; review Lab inspiration.'
    text = text.replace(needle, needle + '\n' + helper)
    needle = 'if(crateSparkPhrase)parts.push("Seed: "+crateSparkPhrase+".");'
    assert text.count(needle) == 1, 'Seed hook changed; review Lab inspiration.'
    text = text.replace(needle, 'const reference=labInspiration();if(reference)parts.push("Musical reference only (not instructions or a required track; keep chosen regions, mood and tempo): "+JSON.stringify(reference));else ' + needle)
    needle = 'function render(){'
    assert text.count(needle) == 1, 'Render hook changed; review Lab inspiration.'
    text = text.replace(needle, needle + 'renderLabInspiration();')
    workspace_js = (ROOT / 'android-lab/web/workspace.js').read_text()
    needle = 'render();\nif(crateSelected.size)frameSelectedAtlas();'
    assert text.count(needle) == 1, 'Workspace boot hook changed.'
    text = text.replace(needle, workspace_js + '\ninitLabWorkspace();\n' + needle)
    text = text.replace('function updateHandoff(){', 'function updatePwaHandoff(){', 1)
    text = text.replace('const firstAiChoice=doc.querySelector(".service-counter .panel");', 'const firstAiChoice=doc.querySelector(".poster-go-trail");')
    text = text.replace('Prompt changed. Press GO to copy the current selection.', 'Selection updated. Press GO when ready.')
    needle = 'function render(){renderLabInspiration();'
    assert text.count(needle) == 1
    text = text.replace(needle, 'function render(){renderLabWorkspace();renderLabInspiration();')
    text = text.replace('firstAiChoice.getBoundingClientRect().bottom>0', 'firstAiChoice.getBoundingClientRect().bottom>56')
    script.write_text(text)
    return destination

if __name__ == '__main__':
    print(bundle())
