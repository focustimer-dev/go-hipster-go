/* Browser workspace adapter. Android retains its native Lab bridge and storage. */
(function(){
'use strict';
if(window.HipsterLab || document.body.dataset.page!=='launch' || !document.body.classList.contains('gig-poster'))return;
const doc=document,api=window.HipsterPWABridge;
if(!api || !doc.querySelector('.site'))return;
const STORE='ghg-pwa-crate-v1';
const LIMIT_SAVED=10,LIMIT_RECENT=3,LIMIT_REFERENCE=2000;
const destinations={chatgpt:'https://chatgpt.com/',gemini:'https://gemini.google.com/app',claude:'https://claude.ai/'};
let data=load(),screen='jukebox',activeSaved=null;
const positions={jukebox:0,crate:0,manual:0};
function cut(value,length){const text=String(value||'').replace(/\s+/g,' ').trim();return [...text].length>length?[...text].slice(0,length-1).join('')+'…':text}
function cleanEntry(x){return x&&typeof x.id==='string'&&typeof x.prompt==='string'&&x.prompt.length<=24000&&x.prompt.length>0}
function load(){
 const state={saved:[],recent:[]};
 try{
  const raw=JSON.parse(localStorage.getItem(STORE)||'{}');
  if(Array.isArray(raw.saved))state.saved=raw.saved.filter(cleanEntry).slice(-LIMIT_SAVED);
  if(Array.isArray(raw.recent))state.recent=raw.recent.filter(x=>x&&typeof x.id==='string'&&typeof x.text==='string'&&x.text.length<=LIMIT_REFERENCE).slice(0,LIMIT_RECENT);
 }catch(e){}
 return state;
}
function store(mutator){
 const next={saved:data.saved.slice(),recent:data.recent.slice()};
 mutator(next);
 try{localStorage.setItem(STORE,JSON.stringify(next));}
 catch(e){notice('Browser storage unavailable or full. Nothing was saved.');return false}
 data=next;paint();return true;
}
function id(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+String(Math.random()).slice(2)}
function notice(message){const el=doc.getElementById('pwaNotice');if(el)el.textContent=message}
function node(tag,cls,value){const el=doc.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el}
const shell=node('div','pwa-shell');
shell.innerHTML=[
 '<nav class="pwa-rail" aria-label="App destinations">',
 '<button type="button" data-pwa-tab="jukebox" aria-current="page"><span aria-hidden="true">♫</span>JUKEBOX</button>',
 '<button type="button" data-pwa-tab="crate"><span aria-hidden="true">▣</span>YOUR CRATE</button>',
 '<button type="button" data-pwa-tab="manual"><span aria-hidden="true">▤</span>MANUAL</button>',
 '<button type="button" data-pwa-action="prefs" aria-label="Preferences"><span aria-hidden="true">•••</span></button>',
 '</nav>',
 '<main class="pwa-page" id="pwaCrate" hidden><h1>YOUR CRATE</h1>',
 '<p class="pwa-intro" id="pwaCrateSummary">Inspiration and exact requests, saved in this browser.</p>',
 '<section><h2>INSPIRATION</h2><div class="pwa-record"><div><h3 id="pwaReferenceName">No reference yet</h3><p id="pwaReferenceHelp">Paste a song link, title or musical idea.</p></div><button type="button" data-pwa-action="edit-reference">ADD</button></div>',
 '<button type="button" class="pwa-wide" data-pwa-action="shape" id="pwaUseInJukebox" hidden>USE IN JUKEBOX</button></section>',
 '<section><h2>RECENT INSPIRATIONS</h2><div id="pwaRecent"></div></section>',
 '<section><div class="pwa-section-head"><h2>SAVED REQUESTS</h2><span id="pwaSavedCount">0 / 10</span></div><div id="pwaSaved"></div></section>',
 '<p class="pwa-local-note">Stored in this browser, not synchronized with your Android app or music service.</p></main>',
 '<main class="pwa-page" id="pwaManual" hidden><h1>THE MANUAL</h1>',
 '<p class="pwa-intro">The machinery behind the questionable taste.</p>',
 '<section><h2>YOUR SERVICES</h2><p id="pwaServicePair"></p><button type="button" class="pwa-wide" data-pwa-action="services">CHANGE AI &amp; MUSIC</button>',
 '<button type="button" class="pwa-wide" data-pwa-action="copy-setup">COPY SETUP CHECK</button><p id="pwaSetupStatus" role="status"></p>',
 '<details id="pwaSetupFallback" hidden><summary>View setup check / copy manually</summary><textarea id="pwaSetupText" aria-label="Setup check" readonly></textarea></details></section>',
 '<section><h2>INSTALLATION &amp; HELP</h2><p>Browser settings and Android app settings are separate. The AI must still have the appropriate skill and music tools.</p>',
 '<a class="pwa-wide" href="/setup/">OPEN THE FULL MANUAL</a></section></main>',
 '<dialog class="pwa-dialog" id="pwaPrefs" aria-labelledby="pwaPrefsTitle"><div class="pwa-dialog-head"><h2 id="pwaPrefsTitle">PREFERENCES</h2><button type="button" data-pwa-action="close">CLOSE</button></div>',
 '<div class="pwa-dialog-body"><p>AI and music choices stay on the Jukebox for the browser edition.</p><button type="button" class="pwa-wide" data-pwa-action="services">CHANGE AI &amp; MUSIC</button>',
 '<button type="button" class="pwa-wide" data-pwa-action="recording">LISTENING PREFERENCES</button><p>GO copies your request. Open your chosen AI, paste and send; the browser does not automatically submit it.</p></div></dialog>',
 '<dialog class="pwa-dialog" id="pwaReferenceDialog" aria-labelledby="pwaReferenceTitle"><form method="dialog" class="pwa-dialog-body"><h2 id="pwaReferenceTitle">YOUR INSPIRATION</h2>',
 '<p>Use a song link, title or musical idea. This is a reference, not an instruction to your AI.</p><label for="pwaReferenceInput">Reference</label>',
 '<textarea id="pwaReferenceInput" maxlength="2000" rows="5"></textarea><div class="pwa-dialog-actions"><button type="button" data-pwa-action="remove-reference">REMOVE</button>',
 '<button type="button" data-pwa-action="cancel-reference">CANCEL</button><button type="submit" id="pwaReferenceKeep">USE IN JUKEBOX</button></div></form></dialog>',
 '<dialog class="pwa-dialog" id="pwaSaveDialog" aria-labelledby="pwaSaveTitle"><form method="dialog" class="pwa-dialog-body"><h2 id="pwaSaveTitle">SAVE REQUEST</h2>',
 '<label for="pwaSaveName">Name this crate</label><input id="pwaSaveName" maxlength="80" required><p>Stores the exact request, not a playlist.</p>',
 '<div class="pwa-dialog-actions"><button type="button" data-pwa-action="cancel-save">CANCEL</button><button type="submit">SAVE</button></div></form></dialog>',
 '<dialog class="pwa-dialog" id="pwaSavedDialog" aria-labelledby="pwaSavedTitle"><div class="pwa-dialog-body"><h2 id="pwaSavedTitle">SAVED REQUEST</h2>',
 '<pre id="pwaSavedPrompt" tabindex="0"></pre><p id="pwaSavedStatus" role="status"></p>',
 '<div class="pwa-dialog-actions"><button type="button" data-pwa-action="copy-saved">COPY</button><button type="button" data-pwa-action="share-saved">SHARE</button>',
 '<a id="pwaSavedOpen" href="https://chatgpt.com/" rel="noopener" target="_blank">OPEN AI</a><button type="button" data-pwa-action="delete-saved">DELETE</button><button type="button" data-pwa-action="close-saved">CLOSE</button></div></div></dialog>'
].join('');
const site=doc.querySelector('.site');
site.id='pwaJukebox';
doc.body.insertBefore(shell,site);
doc.body.classList.add('pwa-workspace');
doc.body.dataset.pwaScreen='jukebox';
const pwaNotice=node('p','pwa-notice');pwaNotice.id='pwaNotice';pwaNotice.setAttribute('role','status');pwaNotice.setAttribute('aria-live','polite');shell.append(pwaNotice);
doc.querySelectorAll('.topnav').forEach(el=>el.hidden=true);
const heading=doc.querySelector('.receipt-heading');
if(heading){
 const save=node('button','pwa-save-button','SAVE REQUEST');
 save.type='button';save.dataset.pwaAction='save';
 heading.appendChild(save);
}
const refinements=doc.querySelector('.refinements');
let sleeve=null,addInspiration=null;
if(refinements){
 addInspiration=node('button','pwa-add-inspiration','+ ADD AN INSPIRATION');
 addInspiration.type='button';addInspiration.dataset.pwaAction='edit-reference';
 addInspiration.setAttribute('aria-label','Add a musical inspiration without leaving Jukebox');
 refinements.parentElement.insertBefore(addInspiration,refinements);
 sleeve=node('aside','pwa-inspiration');sleeve.id='pwaInspiration';sleeve.setAttribute('aria-label','Active musical inspiration');
 sleeve.innerHTML='<strong>YOUR CRATE</strong><p id="pwaSleeveText"></p><p>Choose moods, pace and places, then GO.</p><div class="pwa-sleeve-actions"><button type="button" data-pwa-action="edit-reference">REVIEW</button><button type="button" data-pwa-action="remove-reference" aria-label="Remove active inspiration">×</button></div>';
 refinements.parentElement.insertBefore(sleeve,refinements);
}
function navigate(next){
 if(!['jukebox','crate','manual'].includes(next))return;
 if(screen!==next){positions[screen]=window.scrollY;screen=next}
 doc.body.dataset.pwaScreen=screen;
 site.hidden=screen!=='jukebox';
 doc.getElementById('pwaCrate').hidden=screen!=='crate';
 doc.getElementById('pwaManual').hidden=screen!=='manual';
 doc.querySelectorAll('[data-pwa-tab]').forEach(b=>{if(b.dataset.pwaTab===screen)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 paint();window.scrollTo({top:positions[screen]||0,behavior:'instant'});
}
function row(parent,title,description,buttonText,action){
 const el=node('div','pwa-record'),text=node('div','pwa-record-main');
 text.append(node('h3','',cut(title,130)),node('p','',cut(description,190)));
 const button=node('button','',buttonText);button.type='button';button.addEventListener('click',action);
 el.append(text,button);parent.append(el);
}
function promptSummary(text){
 const lines=String(text||'').split('\n');
 const go=lines.find(x=>/(?:^|\s)go(?:\s|$)/i.test(x))||'';
 const facts=lines.filter(x=>/^(Regional exploration|Mood angle|Tempo preference):/.test(x)).slice(0,2);
 return cut([go,...facts].join(' · '),160);
}
function paint(){
 const s=api.getSnapshot(),reference=s.reference||'';
 const summary=doc.getElementById('pwaCrateSummary');
 summary.textContent=reference?cut(reference,130):'Inspiration and exact requests, saved in this browser.';
 doc.getElementById('pwaReferenceName').textContent=reference?cut(reference,130):'No reference yet';
 doc.getElementById('pwaReferenceHelp').textContent=reference?'Ready for your next GO. The original text remains editable.':'Paste a song link, title or musical idea.';
 doc.getElementById('pwaUseInJukebox').hidden=!reference;
 if(sleeve){sleeve.hidden=!reference;if(reference)doc.getElementById('pwaSleeveText').textContent=cut(reference,170)}
  if(addInspiration)addInspiration.hidden=!!reference;
 doc.getElementById('pwaSavedCount').textContent=data.saved.length+' / '+LIMIT_SAVED;
 doc.getElementById('pwaServicePair').textContent=s.ai.toUpperCase()+' → '+s.service.toUpperCase();
 const recent=doc.getElementById('pwaRecent'),saved=doc.getElementById('pwaSaved');
 recent.replaceChildren();saved.replaceChildren();
 if(!data.recent.length)recent.append(node('p','pwa-help','Your last three inspirations appear here automatically.'));
 for(const entry of data.recent)row(recent,entry.text,entry.time?new Date(entry.time).toLocaleDateString():'Saved in this browser',reference===entry.text?'IN USE':'USE',()=>{api.setReference(entry.text);navigate('jukebox');});
 if(!data.saved.length)saved.append(node('p','pwa-help','Save a request beside the Jukebox receipt to keep it here.'));
 for(const entry of data.saved.slice().reverse())row(saved,entry.name||'Untitled crate',promptSummary(entry.prompt), 'OPTIONS',()=>openSaved(entry.id));
}
function openDialog(name){const el=doc.getElementById(name);if(el&&!el.open)el.showModal()}
function editReference(){
 doc.getElementById('pwaReferenceInput').value=api.getSnapshot().reference||'';
 openDialog('pwaReferenceDialog');
}
function openSaved(value){
 const entry=data.saved.find(x=>x.id===value);if(!entry)return;
 activeSaved=entry.id;
 doc.getElementById('pwaSavedTitle').textContent=entry.name||'Untitled crate';
 doc.getElementById('pwaSavedPrompt').textContent=entry.prompt;
 doc.getElementById('pwaSavedStatus').textContent='Copy this exact request before opening your AI.';
 const link=doc.getElementById('pwaSavedOpen');
 link.href=destinations[entry.ai]||destinations.chatgpt;
 link.textContent=entry.ai==='other'?'OPEN YOUR AI MANUALLY':'OPEN '+String(entry.ai||'AI').toUpperCase();
 link.hidden=entry.ai==='other';
 openDialog('pwaSavedDialog');
}
function closeDialog(id){const e=doc.getElementById(id);if(e.open)e.close()}
function serviceChoices(){
 closeDialog('pwaPrefs');navigate('jukebox');
 doc.querySelector('.service-counter')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function recordingChoices(){
 closeDialog('pwaPrefs');navigate('jukebox');
 doc.getElementById('listeningPreferences')?.scrollIntoView({behavior:'smooth',block:'start'});
}
doc.addEventListener('click',async event=>{
 const target=event.target.closest('[data-pwa-tab],[data-pwa-action]');if(!target)return;
 if(target.dataset.pwaTab){navigate(target.dataset.pwaTab);return}
 switch(target.dataset.pwaAction){
 case 'prefs':openDialog('pwaPrefs');break;
 case 'close':closeDialog('pwaPrefs');break;
 case 'services':serviceChoices();break;
 case 'recording':recordingChoices();break;
 case 'shape':navigate('jukebox');doc.querySelector('[data-mood]')?.scrollIntoView({block:'start'});break;
 case 'save':
  if(data.saved.length>=LIMIT_SAVED){notice('The shelf is full. Delete a saved request first.');navigate('crate');return}
  doc.getElementById('pwaSaveName').value='';openDialog('pwaSaveDialog');break;
 case 'edit-reference':editReference();break;
 case 'remove-reference':api.setReference('');closeDialog('pwaReferenceDialog');notice('Active inspiration cleared; recent inspirations kept.');break;
 case 'cancel-reference':closeDialog('pwaReferenceDialog');break;
 case 'cancel-save':closeDialog('pwaSaveDialog');break;
 case 'copy-setup':{
  const prompt=api.getSetupPrompt(),ok=await api.copy(prompt);
  doc.getElementById('pwaSetupStatus').textContent=ok?'Setup check copied. Paste and send in your AI.':'Copy the setup check below, then paste and send in your AI.';
  const fallback=doc.getElementById('pwaSetupFallback');fallback.hidden=ok;fallback.open=!ok;
  doc.getElementById('pwaSetupText').value=ok?'':prompt;break;
 }
 case 'copy-saved':{
  const entry=data.saved.find(x=>x.id===activeSaved);if(!entry)return;
  const ok=await api.copy(entry.prompt);
  doc.getElementById('pwaSavedStatus').textContent=ok?'Exact request copied. Paste and send it in your AI.':'Clipboard unavailable. Select and copy the request above.';break;
 }
 case 'share-saved':{
  const entry=data.saved.find(x=>x.id===activeSaved);if(!entry)return;
  try{if(!navigator.share)throw new Error('unavailable');await navigator.share({text:entry.prompt})}
  catch(e){if(e.name!=='AbortError')doc.getElementById('pwaSavedStatus').textContent='Browser sharing unavailable. Copy the request instead.'}break;
 }
 case 'delete-saved':{
  const saved=data.saved.find(x=>x.id===activeSaved);if(!saved)return;
  if(!window.confirm('Delete this saved request from this browser?'))return;
  if(store(s=>{s.saved=s.saved.filter(x=>x.id!==activeSaved)})){closeDialog('pwaSavedDialog');notice('Saved request deleted.')}break;
 }
 case 'close-saved':closeDialog('pwaSavedDialog');break;
 }
});
doc.getElementById('pwaReferenceDialog').querySelector('form').addEventListener('submit',event=>{
 event.preventDefault();
 const value=doc.getElementById('pwaReferenceInput').value.trim();
 if(!value){notice('Enter a reference or use Remove to clear it.');return}
 if([...value].length>LIMIT_REFERENCE)return;
 if(store(s=>{s.recent=s.recent.filter(x=>x.text!==value);s.recent.unshift({id:id(),text:value,time:Date.now()});s.recent=s.recent.slice(0,LIMIT_RECENT)})){
  api.setReference(value);closeDialog('pwaReferenceDialog');navigate('jukebox');
  sleeve?.scrollIntoView({block:'start'});
 }
});
doc.getElementById('pwaSaveDialog').querySelector('form').addEventListener('submit',event=>{
 event.preventDefault();
 const name=doc.getElementById('pwaSaveName').value.trim();
 if(!name)return;
 const s=api.getSnapshot(),prompt=api.getPrompt();
 if(!prompt||prompt.length>24000||data.saved.length>=LIMIT_SAVED)return;
 if(store(state=>state.saved.push({id:id(),name:name.slice(0,80),ai:s.ai,service:s.service,prompt,time:Date.now()}))){
  closeDialog('pwaSaveDialog');notice('Exact request saved in this browser.');navigate('crate');
 }
});
doc.querySelectorAll('.pwa-dialog').forEach(d=>d.addEventListener('close',()=>doc.body.classList.remove('pwa-modal-open')));
doc.querySelectorAll('.pwa-dialog').forEach(d=>d.addEventListener('cancel',()=>doc.body.classList.remove('pwa-modal-open')));
doc.addEventListener('click',event=>{
 if(event.target.closest('[data-pwa-tab],[data-pwa-action]'))return;
 const a=event.target.closest('a[href]');if(!a||event.defaultPrevented)return;
 const path=new URL(a.href,location.href).pathname;
 if(path==='/setup/'&&screen==='jukebox'){/* Full browser Manual remains available. */return}
});
window.addEventListener('ghg-pwa-render',paint);
paint();
})();