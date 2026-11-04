"""Build a self-contained review copy of the Android tutorial and recorded clips."""
from pathlib import Path
import base64,json,sys
root=Path(__file__).resolve().parents[1]
def data(path,mime):return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
html=(root/'android-lab/web/workspace.html').read_text()
section=html[html.index('<section id="labTutorial"'):html.index('<section aria-labelledby="labConnectionsTitle">')]
css=(root/'android-lab/web/workspace.css').read_text().replace('/editions/gig-poster/assets/stock.webp',data(root/'launcher/editions/gig-poster/assets/stock.webp','image/webp'))
app=(root/'launcher/assets/app.js').read_text();setup=app[app.index('function setupPrompt('):app.index('const universalPrompt=')]
media={n:{'poster':data(root/f'android-lab/web/tutorial-media/{n}.webp','image/webp'),'src':data(root/f'android-lab/web/tutorial-media/{n}.mp4','video/mp4')} for n in ['setup','inspiration','submit']}
js="const doc=document,ai='gemini',service='youtube',repo='https://github.com/focustimer-dev/go-hipster-go',aiNames={gemini:'Gemini'},serviceNames={youtube:'YouTube Music'};\n"+setup
js+="\nfunction status(t){doc.getElementById('labGuideStatus').textContent=t} async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){return false}} async function labCopySetup(){const ok=await copyText(setupPrompt(ai,service));doc.getElementById('labSetupStatus').textContent=ok?'Setup check copied. Paste into Gemini and send.':'Clipboard unavailable in this preview. Use Copy Setup Check in the app.'} function labNavigate(n){status('In the app, this opens '+(n==='crate'?'Your Crate':'Jukebox')+'.')} function labPreferences(){}\n"
js+='const previewMedia='+json.dumps(media)+';\n'
js+=(root/'android-lab/web/tutorial.js').read_text().replace("video.poster='/assets/tutorial-media/'+step+'.webp';video.src='/assets/tutorial-media/'+step+'.mp4';","video.poster=previewMedia[step].poster;video.src=previewMedia[step].src;")+'\ninitLabGuide();'
font=data(root/'launcher/editions/gig-poster/assets/anton.woff','font/woff')
page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gemini Quick Start — Go, Hipster, Go!</title><style>@font-face{font-family:Poster;src:url('+font+')}*{box-sizing:border-box}body{margin:0}'+css+'body.gig-poster.lab-workspace{padding-top:0}.lab-page{min-height:100vh}#labTutorial{margin-top:0}</style><body class="gig-poster lab-workspace" data-lab-screen="manual"><main class="lab-page"><p class="lab-help">Tutorial preview · Actual app captures with demo data.</p>'+section+'</main><div hidden><div id="labSetupDetails"></div><p id="labSetupStatus"></p></div><script>'+js.replace('</script','<\\/script')+'</script></body></html>'
out=Path(sys.argv[1] if len(sys.argv)>1 else root/'android-lab/build/Gemini-Quick-Start-Preview.html');out.parent.mkdir(parents=True,exist_ok=True);out.write_text(page);print(out)
