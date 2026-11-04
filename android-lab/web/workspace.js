// Injected inside the incumbent app closure in the Lab snapshot only.
let labScreen='jukebox';
const labPositions={jukebox:0,crate:0,manual:0};
let labSetupCopySerial=0;
async function labCopySetup(button){
 const serial=++labSetupCopySerial,snapshot=setupPrompt(ai,service);
 const message=doc.getElementById('labSetupStatus'),fallback=doc.getElementById('labSetupFallback'),text=doc.getElementById('labSetupText');
 button.disabled=true;
 try{
  let ok=false;try{ok=await copyText(snapshot)}catch(e){}
  if(serial!==labSetupCopySerial)return;
  if(snapshot!==setupPrompt(ai,service)){message.textContent='Setup changed while copying. Copy the current connection check.';return}
  fallback.hidden=ok;fallback.open=!ok;text.value=ok?'':snapshot;
  message.textContent=ok?'Setup check copied. Paste and send it in '+aiNames[ai]+'.':'Clipboard unavailable. Select and copy the connection check below, then paste and send it in your AI.';
  if(!ok){text.focus();text.select()}else window.HipsterLab?.offerSetupShare?.(ai,snapshot)
 }finally{if(serial===labSetupCopySerial)button.disabled=false}
}
function labSummary(text,limit=130){
 const chars=Array.from(String(text||'').replace(/\s+/g,' ').trim());return chars.length>limit?chars.slice(0,limit-1).join('')+'…':chars.join('');
}
function labRequestSummary(prompt){
 const lines=String(prompt||'').split('\n');
 const command=lines.find(line=>/(?:^|\s)go(?:\s|$)/i.test(line))||'';
 const go=command.match(/(?:^|\s)(go(?:\s.*)?)$/i);
 const details=['Regional exploration','Mood angle','Tempo preference'].map(label=>{
  const line=lines.find(line=>line.startsWith(label+': '));return line?line.slice(label.length+2).replace(/\.$/,''):'';
 }).filter(Boolean);
 return labSummary([go?go[1]:'',...details].filter(Boolean).join(' · '),180);
}
let labSnapshot=null;
function labRefreshState(){labSnapshot=null;return labState()}
function labState(){
 if(labSnapshot)return labSnapshot;
 try{
  let state=JSON.parse(window.HipsterLab?.state?.()||'{}');
  if(!state||typeof state!=='object'||Array.isArray(state))state={};
  if(!['open','share','browser'].includes(state.mode))state.mode='open';
  // Legacy bridge support is read once per snapshot, never per prompt render.
  if(typeof state.activeInspiration!=='string')state.activeInspiration=String(window.HipsterLab?.inspiration?.()||'');
  return labSnapshot=state;
 }catch(e){return labSnapshot={activeInspiration:''}}
}
function labNavigate(next,focus=true){
 if(!['jukebox','crate','manual'].includes(next)||next===labScreen)return;
 labStopGuide();labPositions[labScreen]=window.scrollY;labScreen=next;body.dataset.labScreen=next;
 for(const [id,key] of [['labJukebox','jukebox'],['labCrate','crate'],['labManual','manual']])doc.getElementById(id).hidden=key!==next;
 doc.querySelectorAll('[data-lab-tab]').forEach(b=>{if(b.dataset.labTab===next)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 renderLabWorkspace();window.scrollTo({top:labPositions[next],behavior:'instant'});window.dispatchEvent(new Event('scroll'));
 if(focus)doc.querySelector(`[data-lab-tab="${next}"]`)?.focus({preventScroll:true});
}
function renderLabHandoff(){
 const state=labState(),mode=state.mode||'open',oneTap=state.oneTap!==false;
 if(ai==='other'){
  const guide=doc.getElementById('labGeminiGuide');if(guide)guide.hidden=true;
  const hint=doc.getElementById('goHint');if(hint)hint.textContent='COPY YOUR REQUEST';
  const heading=doc.getElementById('handoffTitle');if(heading)heading.textContent='COPIED. OPEN YOUR AI MANUALLY.';
  const instructions=doc.getElementById('handoffInstruction');if(instructions)instructions.textContent='Open your chosen AI yourself, paste the request and send it. Native handoff is unavailable for an unspecified AI.';
  const open=doc.getElementById('openAi');if(open)open.hidden=true;
  const button=doc.getElementById('goButton');if(button)button.setAttribute('aria-label','GO! Copy request for manual use in your AI');
  return;
 }

 const verb=mode==='share'?'SHARE TO':mode==='browser'?'OPEN WEB':'OPEN APP';
 const hint=doc.getElementById('goHint');if(hint)hint.textContent=oneTap?verb+' '+aiNames[ai].toUpperCase():'COPY YOUR REQUEST';
 const ready=copiedPrompt===goPrompt(ai,service,mood);
 const heading=doc.getElementById('handoffTitle'),instructions=doc.getElementById('handoffInstruction');
 if(heading)heading.textContent=oneTap&&mode==='share'?'CONTINUE IN '+aiNames[ai].toUpperCase():oneTap?'REQUEST COPIED FOR '+aiNames[ai].toUpperCase():'COPIED. OPEN '+aiNames[ai].toUpperCase()+'.';
 if(instructions)instructions.textContent=oneTap&&mode==='share'?'Review and send the shared request in your AI. If it did not arrive, paste the copied request. Check the playlist result there.':'Paste and send the copied request in your AI. Check the playlist result there.';
 const guide=doc.getElementById('labGeminiGuide');if(guide)guide.hidden=!(ai==='gemini'&&service==='youtube'&&ready);
 const open=doc.getElementById('openAi');if(open&&ready)open.textContent=(mode==='share'?'SHARE AGAIN TO ':'OPEN ')+aiNames[ai].toUpperCase();
 const button=doc.getElementById('goButton');if(button)button.setAttribute('aria-label',oneTap?'GO! Copy request and '+(mode==='share'?'share to ':mode==='browser'?'open browser for ':'open ')+aiNames[ai]:'GO! Copy current playlist request');
}
function renderLabWorkspace(){
 if(!doc.getElementById('labCrate'))return;
 const setupText=doc.getElementById('labSetupText');
 if(setupText?.value&&setupText.value!==setupPrompt(ai,service)){
  setupText.value='';doc.getElementById('labSetupFallback').hidden=true;doc.getElementById('labSetupFallback').open=false;
  doc.getElementById('labSetupStatus').textContent='Setup changed. Copy a fresh connection check for your chosen AI and music service.';
 }
 const state=labState(),reference=labInspiration(),entries=Array.isArray(state.saved)?state.saved.filter(e=>e&&typeof e==='object'&&typeof e.id==='string'&&e.id.length>0&&typeof e.prompt==='string').slice(-10):[];
 const dot=doc.getElementById('labUpdateDot');dot.hidden=!state.updateAvailable;dot.setAttribute('aria-hidden','true');
 doc.querySelector('[data-lab-tab="manual"]').setAttribute('aria-label',state.updateAvailable?'Manual, Gemini skill update available':'Manual');
 doc.getElementById('labCrateHeaderSummary').textContent=reference?labSummary(state.inspirationPreview?.title||reference):'Inspiration and exact requests, saved on this device.';
 doc.getElementById('labCrateReference').textContent=reference?'Reference ready':'No reference yet';
 doc.getElementById('labCrateReferenceHelp').textContent=reference?(state.inspirationPreview?.description||'Use it in Jukebox, or review the full reference.'):'Share a song link to Lab, or add an idea.';
 doc.getElementById('labCrateReview').textContent=reference?'REVIEW':'ADD';doc.getElementById('labCrateContinue').hidden=!reference;doc.getElementById('labSavedCount').textContent=entries.length+' / 10';
 const recent=Array.isArray(state.recentInspirations)?state.recentInspirations.filter(e=>e&&typeof e.id==='string'&&typeof e.text==='string').slice(0,3):[];
 const shelf=doc.getElementById('labRecentInspirations');
 if(shelf&&shelf.dataset.records!==JSON.stringify([reference,recent])){
  shelf.dataset.records=JSON.stringify([reference,recent]);shelf.replaceChildren();
  if(!recent.length){const p=doc.createElement('p');p.className='lab-help';p.textContent='Your last three inspirations appear here automatically.';shelf.append(p)}
  for(const entry of recent){
   const row=doc.createElement('div');row.className='lab-record';const main=doc.createElement('div');main.className='lab-record-main';
   const title=doc.createElement('h3');title.textContent=labSummary(entry.title||entry.text);
   main.append(title);if(entry.description){const p=doc.createElement('p');p.textContent=labSummary(entry.description,180);main.append(p)}
   const use=doc.createElement('button');use.type='button';use.className='lab-text-button';use.dataset.labRecent=entry.id;use.textContent=reference===entry.text?'IN USE':'USE';use.disabled=reference===entry.text;use.setAttribute('aria-label','Use inspiration: '+title.textContent);row.append(main,use);shelf.append(row);
  }
 }
 const rows=doc.getElementById('labSavedRows'),stamp=JSON.stringify(entries);
 if(rows.dataset.records!==stamp){
  rows.dataset.records=stamp;rows.replaceChildren();
  if(!entries.length){const empty=doc.createElement('div');empty.className='lab-empty';const p=doc.createElement('p');p.textContent='Save a request beside the Jukebox receipt to keep it here.';const b=doc.createElement('button');b.type='button';b.className='lab-text-button';b.dataset.labAction='jukebox';b.textContent='BACK TO THE JUKEBOX';empty.append(p,b);rows.append(empty)}
  for(const entry of entries.slice().reverse()){
   const row=doc.createElement('div');row.className='lab-record';const main=doc.createElement('div');main.className='lab-record-main';
   const h=doc.createElement('h3');h.textContent=typeof entry.name==='string'&&entry.name.trim()?entry.name:'Untitled crate';const p=doc.createElement('p');p.textContent=(aiNames[entry.ai]||'AI')+' · '+(labRequestSummary(entry.prompt)||'Exact saved request');
   const date=doc.createElement('p');date.className='lab-date';const when=new Date(Number(entry.time));date.textContent=entry.time!==null&&entry.time!==''&&Number(entry.time)>0&&Number.isFinite(when.getTime())?when.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'Saved on this device';main.append(h,p,date);
   const b=doc.createElement('button');b.type='button';b.className='lab-text-button';b.dataset.labSaved=String(entry.id);b.textContent='OPTIONS';b.setAttribute('aria-label','Options for saved request: '+h.textContent);row.append(main,b);rows.append(row);
  }
 }
 doc.getElementById('labServicePair').textContent=aiNames[ai]+' → '+serviceNames[service];doc.getElementById('labUpdateState').textContent=state.updateSummary||'Check your installed skill';doc.getElementById('labUpdateDetail').textContent=state.updateDetail||'Review the release, download deliberately, then record your installation.';
 doc.getElementById('labHandoffDescription').textContent=ai==='other'?'GO copies your request. Open your AI yourself, paste and send.':state.oneTap===false?'GO copies your request. Then choose OPEN to launch your selected AI.':state.mode==='share'?'GO copies the request and tries sharing it to your selected AI. If unavailable, choose an app from Android’s share menu.':state.mode==='browser'?'GO copies your request and opens your selected AI in the browser. Paste and send when ready.':'GO copies your request and opens the selected AI app. Paste and send when ready. If the app is unavailable, Lab opens its website.';renderLabHandoff();
}
function labPreferences(){
 const state=labState(),dialog=doc.getElementById('labPreferences');if(dialog.open)return;dialog.querySelectorAll('[name="labHandoff"]').forEach(i=>i.checked=i.value===(state.mode||'open'));dialog.querySelectorAll('[data-lab-pref]').forEach(i=>i.checked=state[i.dataset.labPref]!==false);dialog.querySelector('.lab-dialog-body').scrollTop=0;dialog.showModal();body.classList.add('lab-modal-open');
}
function initLabWorkspace(){
 // Completed setup yields the Jukebox space on the next launch. Keep its
 // original controls and storage inside Preferences, including Change setup.
 try{const setup=JSON.parse(localStorage.getItem('hmg-first-crate-v1')||'null');
  if(setup?.completed===true){doc.getElementById('labSetupPreferences').append(doc.getElementById('firstCrateSetup'));doc.getElementById('labSetupDetails').hidden=false;}
 }catch(e){}
 const jukebox=doc.querySelector('.site');jukebox.id='labJukebox';const mark=doc.createElement('span');mark.className='lab-edition-mark';mark.textContent='LAB';jukebox.querySelector('.brandrow')?.append(mark);
 const services=doc.querySelector('.service-counter'),route=doc.getElementById('routeStatus'),slot=doc.getElementById('labServicePreferences');
 if(services&&slot){slot.append(services);if(route)slot.append(route);doc.getElementById('servicesHeading').textContent='AI & MUSIC';doc.getElementById('aiLabel').textContent='AI ASSISTANT';doc.getElementById('musicLabel').textContent='MUSIC SERVICE'}
 const recording=doc.querySelector('.recording-preference'),recordingSlot=doc.getElementById('labRecordingPreferences');
 if(recording&&recordingSlot){const oldPanel=recording.closest('.listening-preferences');recording.classList.add('lab-choice','lab-toggle');recordingSlot.append(recording);const hardware=doc.getElementById('labRecordingHardware');if(hardware)recording.querySelector('.recording-rocker').replaceWith(hardware.content.firstElementChild.cloneNode(true));if(oldPanel)oldPanel.remove()}
 const trail=doc.querySelector('.poster-go-trail-steps>.poster-go-trail-word:last-child');if(trail)trail.textContent='CONTINUE IN YOUR AI';
 body.classList.add('lab-workspace');body.dataset.labScreen='jukebox';doc.querySelectorAll('.topnav').forEach(nav=>nav.hidden=true);
 initLabGuide();
 const heading=doc.querySelector('.receipt-heading');if(heading){const label=doc.createElement('span');while(heading.firstChild)label.appendChild(heading.firstChild);const b=doc.createElement('button');b.type='button';b.className='lab-text-button lab-save-button';b.dataset.labAction='save';b.textContent='SAVE REQUEST';heading.append(label,b)}
 doc.addEventListener('click',event=>{
  const a=event.target.closest('a[href]');if(a){const u=new URL(a.href,location.href);if(u.origin===location.origin){if(/\/(?:setup\/?)$/.test(u.pathname)){event.preventDefault();labNavigate('manual');return}if(['/','/editions/gig-poster/'].includes(u.pathname)){event.preventDefault();labNavigate('jukebox');return}}}
  const b=event.target.closest('[data-lab-tab],[data-lab-action],[data-lab-saved],[data-lab-recent]');if(!b)return;
  if(b.dataset.labRecent){window.HipsterLab?.useRecentInspiration?.(b.dataset.labRecent);return}
  if(b.dataset.labTab){labNavigate(b.dataset.labTab);return}if(b.dataset.labSaved){window.HipsterLab?.savedRequest?.(b.dataset.labSaved);return}
  const action=b.dataset.labAction;
  if(action==='preferences')labPreferences();else if(action==='close-preferences')doc.getElementById('labPreferences').close();
  else if(action==='inspiration')window.HipsterLab?.reviewInspiration?.();else if(action==='save')window.HipsterLab?.saveRequest?.(ai,goPrompt(ai,service,mood));else if(action==='updates')window.HipsterLab?.showUpdates?.();else if(action==='jukebox')labNavigate('jukebox');
  else if(action==='services')labPreferences();
  else if(action==='shape-inspiration')labShapeInspiration();
  else if(action==='setup')labCopySetup(b);
 });
 doc.getElementById('labPreferences').addEventListener('close',()=>{body.classList.remove('lab-modal-open');doc.querySelector('[data-lab-action="preferences"]')?.focus({preventScroll:true})});
 doc.getElementById('labPreferences').addEventListener('change',event=>{const i=event.target;if(i.name==='labHandoff')window.HipsterLab?.setPreference?.('mode',i.value);else if(i.dataset.labPref)window.HipsterLab?.setPreference?.(i.dataset.labPref,String(i.checked));renderLabWorkspace()});
 window.HipsterLabStateChanged=()=>{labRefreshState();renderLabWorkspace();renderLabInspiration()};window.HipsterLabBack=()=>{const d=doc.getElementById('labPreferences');if(d.open){d.close();return true}if(labScreen!=='jukebox'){labNavigate('jukebox');return true}return false};renderLabWorkspace();
}

function labShowManualResources(show){doc.getElementById('labMoreResources').hidden=!show;doc.getElementById('labManualGuide').hidden=show;if(!show){const frame=doc.getElementById('labManualFrame');if(frame.contentWindow)frame.contentWindow.location.hash='manual'}doc.getElementById('labManualTitle').scrollIntoView({block:'start'})}
window.addEventListener('message',event=>{if(event.source===doc.getElementById('labManualFrame')?.contentWindow&&event.origin===location.origin&&event.data?.type==='lab-manual-resources')labShowManualResources(true)});
doc.getElementById('labManualReturn').onclick=()=>labShowManualResources(false);
