"""Build an offline Android Lab snapshot without changing launcher sources."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]

def bundle(destination=None):
    destination = Path(destination or ROOT / 'android-lab/app/src/main/assets/site')
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(ROOT / 'launcher', destination)
    # Match the production root routing, while retaining edition asset paths.
    shutil.copyfile(ROOT / 'launcher/editions/gig-poster/index.html', destination / 'index.html')
    shutil.copyfile(ROOT / 'launcher/editions/gig-poster/setup/index.html', destination / 'setup/index.html')
    script = destination / 'assets/app.js'
    text = script.read_text()
    needle = 'async function copyText(text){'
    assert text.count(needle) == 1, 'Clipboard hook changed; review Lab integration.'
    text = text.replace(needle, needle + '\n if(window.HipsterLab)return window.HipsterLab.copy(text);')
    needle = 'if(ok)status("Copied to clipboard. Playlist creation and saving happen in your AI, not in the Jukebox.");'
    assert text.count(needle) == 1, 'GO hook changed; review Lab integration.'
    text = text.replace(needle, 'if(ok&&window.HipsterLab){window.HipsterLab.go(ai,prompt);status("Prompt copied. Android handoff ready.")}else ' + needle)
    # The original stale-prompt guard runs before this added native launch hook.
    needle = 'const share=doc.getElementById("shareButton");'
    text = text.replace(needle, '''for(const id of ["openAi","manualOpenAi"]){const link=doc.getElementById(id);if(link)link.addEventListener("click",event=>{
 if(event.defaultPrevented||!window.HipsterLab)return;
 event.preventDefault();window.HipsterLab.open(ai,goPrompt(ai,service,mood));
})}
''' + needle)
    text = text.replace('if(!navigator.share){status(', 'if(window.HipsterLab){window.HipsterLab.share(goPrompt(ai,service,mood));return}\n if(!navigator.share){status(')
    script.write_text(text)
    return destination

if __name__ == '__main__':
    print(bundle())
