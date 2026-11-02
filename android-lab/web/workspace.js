// Injected inside the incumbent app closure in the Lab snapshot only.
let labScreen='jukebox';
const labPositions={jukebox:0,crate:0,manual:0};
function labState(){try{return JSON.parse(window.HipsterLab?.state?.()||'{}')}catch(e){return {}}}
function labNavigate(next,focus=true){
 if(!['jukebox','crate','manual'].includes(next)||next===labScreen)return;
 labPositions[labScreen]=window.scrollY;labScreen=next;body.dataset.labScreen=next;
 for(const [id,key] of [['labJukebox','jukebox'],['labCrate','crate'],['labManual','manual']])doc.getElementById(id).hidden=key!==next;
 doc.querySelectorAll('[data-lab-tab]').forEach(b=>{if(b.dataset.labTab===next)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 renderLabWorkspace();window.scrollTo({top:labPositions[next],behavior:'instant'});window.dispatchEvent(new Event('scroll'));
 if(focus)doc.querySelector(`[data-lab-tab="${next}"]`)?.focus({preventScroll:true});
}
function updateHandoff(){updatePwaHandoff();renderLabHandoff()}
function renderLabHandoff(){
 const state=labState(),mode=state.mode||'open',oneTap=state.oneTap!==false;
 const verb=mode==='share'?'SHARE TO':mode==='browser'?'OPEN WEB':'OPEN APP';
 const hint=doc.getElementById('goHint');if(hint)hint.textContent=oneTap?verb+' '+aiNames[ai].toUpperCase():'COPY YOUR REQUEST';
 const ready=copiedPrompt===goPrompt(ai,service,mood);
 const heading=doc.getElementById('handoffTitle'),instructions=doc.getElementById('handoffInstruction');
 if(heading)heading.textContent=oneTap&&mode==='share'?'CONTINUE IN '+aiNames[ai].toUpperCase():oneTap?'REQUEST COPIED FOR '+aiNames[ai].toUpperCase():'COPIED. OPEN '+aiNames[ai].toUpperCase()+'.';
 if(instructions)instructions.textContent=oneTap&&mode==='share'?'Review and send the shared request in your AI. If it did not arrive, paste the copied request. Check the playlist result there.':'Paste and send the copied request in your AI. Check the playlist result there.';
 const open=doc.getElementById('openAi');if(open&&ready)open.textContent=(mode==='share'?'SHARE AGAIN TO ':'OPEN ')+aiNames[ai].toUpperCase();
 const button=doc.getElementById('goButton');if(button)button.setAttribute('aria-label',oneTap?'GO! Copy request and '+(mode==='share'?'share to ':mode==='browser'?'open browser for ':'open ')+aiNames[ai]:'GO! Copy current playlist request');
}
function renderLabWorkspace(){
 if(!doc.getElementById('labCrate'))return;
 const state=labState(),reference=labInspiration(),entries=Array.isArray(state.saved)?state.saved:[];
 const dot=doc.getElementById('labUpdateDot');dot.hidden=!state.updateAvailable;dot.setAttribute('aria-hidden','true');
 doc.querySelector('[data-lab-tab="manual"]').setAttribute('aria-label',state.updateAvailable?'Manual, Gemini skill update available':'Manual');
 const first=reference.split('\n')[0];doc.getElementById('labCrateReference').textContent=reference?first.slice(0,160)+(first.length>160?'…':''):'No reference on the counter.';
 doc.getElementById('labCrateReferenceHelp').textContent=reference?'Musical reference · stays active until removed':'Share a song link to Hipster GO Lab, or add a musical idea here.';
 doc.getElementById('labCrateReview').textContent=reference?'REVIEW':'ADD';doc.getElementById('labSavedCount').textContent=entries.length+' / 10';
 const rows=doc.getElementById('labSavedRows'),stamp=JSON.stringify(entries);
 if(rows.dataset.records!==stamp){
  rows.dataset.records=stamp;rows.replaceChildren();
  if(!entries.length){const empty=doc.createElement('div');empty.className='lab-empty';const p=doc.createElement('p');p.textContent='An empty shelf. Choose Save request beside the Jukebox receipt when you find a brief worth keeping.';const b=doc.createElement('button');b.type='button';b.className='lab-text-button';b.dataset.labAction='jukebox';b.textContent='BACK TO THE JUKEBOX';empty.append(p,b);rows.append(empty)}
  for(const entry of entries.slice().reverse()){
   const row=doc.createElement('div');row.className='lab-record';const main=doc.createElement('div');main.className='lab-record-main';
   const h=doc.createElement('h3');h.textContent=String(entry.name||'Untitled crate');const p=doc.createElement('p');p.textContent=(aiNames[entry.ai]||'AI')+' · exact saved request';
   const date=doc.createElement('p');date.className='lab-date';const when=new Date(Number(entry.time));date.textContent=Number.isFinite(when.getTime())?when.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'Saved on this device';main.append(h,p,date);
   const b=doc.createElement('button');b.type='button';b.className='lab-text-button';b.dataset.labSaved=String(entry.id);b.textContent='OPTIONS';b.setAttribute('aria-label','Options for saved request: '+h.textContent);row.append(main,b);rows.append(row);
  }
 }
 doc.getElementById('labServicePair').textContent=aiNames[ai]+' → '+serviceNames[service];doc.getElementById('labUpdateState').textContent=state.updateSummary||'Check your installed skill';doc.getElementById('labUpdateDetail').textContent=state.updateDetail||'Review the release, download deliberately, then record your installation.';
 doc.getElementById('labHandoffDescription').textContent=state.oneTap===false?'GO copies your request. Then choose OPEN to launch your selected AI.':state.mode==='share'?'GO copies the request and tries sharing it to your selected AI. If unavailable, choose an app from Android’s share menu.':state.mode==='browser'?'GO copies your request and opens your selected AI in the browser. Paste and send when ready.':'GO copies your request and opens the selected AI app. Paste and send when ready. If the app is unavailable, Lab opens its website.';renderLabHandoff();
}
function labPreferences(){
 const state=labState(),dialog=doc.getElementById('labPreferences');dialog.querySelectorAll('[name="labHandoff"]').forEach(i=>i.checked=i.value===(state.mode||'open'));dialog.querySelectorAll('[data-lab-pref]').forEach(i=>i.checked=state[i.dataset.labPref]!==false);dialog.querySelector('.lab-dialog-body').scrollTop=0;dialog.showModal();body.classList.add('lab-modal-open');
}
function initLabWorkspace(){
 const jukebox=doc.querySelector('.site');jukebox.id='labJukebox';const mark=doc.createElement('span');mark.className='lab-edition-mark';mark.textContent='LAB';jukebox.querySelector('.brandrow')?.append(mark);
 const services=doc.querySelector('.service-counter'),route=doc.getElementById('routeStatus'),slot=doc.getElementById('labServicePreferences');
 if(services&&slot){slot.append(services);if(route)slot.append(route);doc.getElementById('servicesHeading').textContent='AI & MUSIC';doc.getElementById('aiLabel').textContent='AI ASSISTANT';doc.getElementById('musicLabel').textContent='MUSIC SERVICE'}
 const recording=doc.querySelector('.recording-preference'),recordingSlot=doc.getElementById('labRecordingPreferences');
 if(recording&&recordingSlot){recording.classList.add('lab-choice','lab-toggle');recordingSlot.append(recording)}
 const trail=doc.querySelector('.poster-go-trail-steps>.poster-go-trail-word:last-child');if(trail)trail.textContent='CONTINUE IN YOUR AI';
 body.classList.add('lab-workspace');body.dataset.labScreen='jukebox';doc.querySelectorAll('.topnav').forEach(nav=>nav.hidden=true);
 const heading=doc.querySelector('.receipt-heading');if(heading){const label=doc.createElement('span');while(heading.firstChild)label.appendChild(heading.firstChild);const b=doc.createElement('button');b.type='button';b.className='lab-text-button lab-save-button';b.dataset.labAction='save';b.textContent='SAVE REQUEST';heading.append(label,b)}
 doc.addEventListener('click',event=>{
  const a=event.target.closest('a[href]');if(a){const u=new URL(a.href,location.href);if(u.origin===location.origin){if(/\/(?:setup\/?)$/.test(u.pathname)){event.preventDefault();labNavigate('manual');return}if(['/','/editions/gig-poster/'].includes(u.pathname)){event.preventDefault();labNavigate('jukebox');return}}}
  const b=event.target.closest('[data-lab-tab],[data-lab-action],[data-lab-saved]');if(!b)return;
  if(b.dataset.labTab){labNavigate(b.dataset.labTab);return}if(b.dataset.labSaved){window.HipsterLab?.savedRequest?.(b.dataset.labSaved);return}
  const action=b.dataset.labAction;
  if(action==='preferences')labPreferences();else if(action==='close-preferences')doc.getElementById('labPreferences').close();
  else if(action==='inspiration')window.HipsterLab?.reviewInspiration?.();else if(action==='save')window.HipsterLab?.saveRequest?.(ai,goPrompt(ai,service,mood));else if(action==='updates')window.HipsterLab?.showUpdates?.();else if(action==='jukebox')labNavigate('jukebox');
  else if(action==='services')labPreferences();
  else if(action==='setup'){b.disabled=true;copyText(setupPrompt(ai,service)).then(ok=>{doc.getElementById('labSetupStatus').textContent=ok?'Setup check copied. Paste and send it in '+aiNames[ai]+'.':'Could not copy. Try again.'}).finally(()=>b.disabled=false)}
 });
 doc.getElementById('labPreferences').addEventListener('close',()=>{body.classList.remove('lab-modal-open');doc.querySelector('[data-lab-action="preferences"]')?.focus({preventScroll:true})});
 doc.getElementById('labPreferences').addEventListener('change',event=>{const i=event.target;if(i.name==='labHandoff')window.HipsterLab?.setPreference?.('mode',i.value);else if(i.dataset.labPref)window.HipsterLab?.setPreference?.(i.dataset.labPref,String(i.checked));renderLabWorkspace()});
 window.HipsterLabStateChanged=()=>renderLabWorkspace();window.HipsterLabBack=()=>{const d=doc.getElementById('labPreferences');if(d.open){d.close();return true}if(labScreen!=='jukebox'){labNavigate('jukebox');return true}return false};renderLabWorkspace();
}
