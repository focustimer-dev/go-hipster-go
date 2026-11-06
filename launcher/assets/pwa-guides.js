/* Browser-only Manual: same guide taxonomy as Android 0.9.56.
   No native bridges, downloaded videos, or claims of AI-side actions. */
(function(){
'use strict';
const doc=document;
if(!doc.body.classList.contains('pwa-workspace') || window.HipsterLab)return;
const manual=doc.getElementById('pwaManual');
if(!manual)return;
const guides=[
 {id:'overview',group:'setup',title:'Overview',intro:'Choose your AI and music service, then verify the tools before making a playlist.',steps:['Choose ChatGPT, Gemini, Claude or Other AI in the Jukebox. Pick your music service there too.','Copy the setup check below. Paste it into the chosen AI and send it.','Look for confirmation that the skill or app is installed and the music tools can create playlists. A search result alone is not confirmation.'],action:'copy-setup',label:'COPY SETUP CHECK'},
 {id:'chatgpt',group:'setup',title:'ChatGPT',intro:'Set up ChatGPT with Spotify or your selected music service.',steps:['In ChatGPT, open Settings → Apps. Connect the Go, Hipster, Go! app and your chosen music service, where offered.','Choose the pair in Jukebox and copy the setup check. Paste and send it in the conversation where you will make music.','Confirm the curation app is available, and separately verify music search and playlist-writing permissions. Tool access may differ by account.'],action:'copy-setup',label:'COPY SETUP CHECK'},
 {id:'gemini',group:'setup',title:'Gemini',intro:'Gemini uses the saved Go, Hipster, Go! Skill and YouTube Music when their tools are available.',steps:['Select Gemini and YouTube Music in Jukebox.','Install or update the persistent Skill through Gemini’s supported skill setup, then copy and send the setup check.','Confirm both the saved Skill and the available YouTube Music actions before making the playlist. Reading an instruction link is not the same as installing a Skill.'],action:'copy-setup',label:'COPY SETUP CHECK'},
 {id:'claude',group:'setup',title:'Claude',intro:'Use Claude’s supported Skill or plugin setup, then verify music tools.',steps:['Choose Claude and your music service in Jukebox.','Load the appropriate Go, Hipster, Go! package through Claude’s supported installation route. A Skill ZIP and Plugin ZIP are not interchangeable.','Copy and send the setup check. Verify music search, playlist creation and track addition, not just playback.'],action:'copy-setup',label:'COPY SETUP CHECK'},
 {id:'other',group:'setup',title:'Other AI',intro:'Use your AI’s documented way to load instructions.',steps:['Choose Other AI in Jukebox and load the canonical skill through a supported setup route.','Copy and send the setup check, and verify what is installed and whether it persists.','If the AI cannot save playlists, keep its verified tracklist and add it to your music service yourself.'],action:'copy-setup',label:'COPY SETUP CHECK'},
 {id:'resources',group:'setup',title:'More Resources',intro:'Install guides and current skill packages live in the public release.',steps:['Open the latest GitHub release to find current ChatGPT, Gemini and Claude packages.','Use the canonical skill file when your AI supports a prompt-based install.','Browser settings are separate from your installed Android app; updating this page will not update a Skill already installed in another AI.'],url:'https://github.com/focustimer-dev/go-hipster-go/releases/latest',label:'OPEN LATEST RELEASE'},
 {id:'normal',group:'use',title:'Normal GO',intro:'No inspiration required. You can begin directly in the Jukebox.',steps:['Leave Your Crate inspiration empty. Pick a mood, pace or region, if you like.','Press GO to prepare your request. In the browser, copy the request and open your AI, then paste and send.','Listen to the result, review and refine it before saving anything.'],action:'jukebox',label:'OPEN JUKEBOX'},
 {id:'inspiration',group:'use',title:'Inspiration',intro:'Start with an idea, song or artist, then shape the request.',steps:['In Your Crate, tap ADD to enter a musical idea or a link. You can also review and remove the active reference from Jukebox.','Choose Use in Jukebox. Moods, pace and regions remain independent choices.','Press GO. Your inspiration appears as a reference in the exact request, not as instructions to the AI.'],action:'crate',label:'OPEN YOUR CRATE'},
 {id:'review',group:'use',title:'Review & Publish',intro:'A finished playlist should be checked before it is saved.',steps:['Stay in the same AI conversation that produced the playlist. Ask for go de-cheese to examine repetition, obvious picks and drift from your original request.','Review any proposed changes and approve only the edits you want.','For Gemini with a working YouTube Music save action, send Publish and verify the actual saved playlist. Other AI/music combinations must use their available save flow; a link alone is not proof of saving.'],copy:'go de-cheese',label:'COPY DE-CHEESE'},
 {id:'artwork',group:'use',title:'Cover Art',intro:'Finish the sleeve after the playlist has actually been saved.',steps:['If you requested cover art, download the generated image.','Open the saved playlist in your music service and find its artwork-edit control, if offered.','Choose the image and save. YouTube Music controls can vary by account or device; try its desktop site when the mobile control is absent.'],url:'https://music.youtube.com/',label:'OPEN YOUTUBE MUSIC'}
];
const byId=new Map(guides.map(g=>[g.id,g]));
let selected='overview',category='setup';
manual.innerHTML=[
 '<h1 class="pwa-visually-hidden">The Manual</h1>',
 '<div class="pwa-guide-nav"><details id="pwaGuidePicker" class="pwa-guide-picker">',
 '<summary aria-label="Choose a Manual guide"><span class="pwa-guide-icon" aria-hidden="true">▣</span><span class="pwa-guide-current"><small id="pwaGuideCategory">Setup</small><strong id="pwaGuideTitle">Overview</strong></span><span class="pwa-guide-eject" aria-hidden="true">⌃</span></summary>',
 '<div class="pwa-guide-shelf"><div class="pwa-guide-tabs" role="tablist" aria-label="Guide category">',
 '<button type="button" role="tab" data-pwa-guide-group="setup" aria-selected="true">Setup</button>',
 '<button type="button" role="tab" data-pwa-guide-group="use" aria-selected="false">Using the App</button></div>',
 '<nav id="pwaGuideLinks" class="pwa-guide-links" aria-label="Manual guides"></nav></div></details></div>',
 '<article id="pwaGuideContent" class="pwa-guide-content" aria-live="polite"></article>',
 '<section class="pwa-guide-services"><h2>YOUR SERVICES</h2><p id="pwaServicePair"></p>',
 '<button type="button" class="pwa-wide" data-pwa-action="services">CHANGE AI &amp; MUSIC</button>',
 '<button type="button" class="pwa-wide" data-pwa-action="copy-setup">COPY SETUP CHECK</button>',
 '<p id="pwaSetupStatus" role="status"></p>',
 '<details id="pwaSetupFallback" hidden><summary>View setup check / copy manually</summary><textarea id="pwaSetupText" aria-label="Setup check" readonly></textarea></details></section>',
 '<p class="pwa-local-note">PWA GUIDE · Browser actions copy or navigate only. Nothing is sent to your AI automatically.</p>',
 '<a class="pwa-wide" href="/setup/">OPEN FULL BROWSER INSTALL MANUAL</a>'
].join('');
const picker=doc.getElementById('pwaGuidePicker'),links=doc.getElementById('pwaGuideLinks'),content=doc.getElementById('pwaGuideContent');
function element(tag,cls,value){
 const n=doc.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n;
}
function renderLinks(){
 const selectedCategory=category;
 manual.querySelectorAll('[data-pwa-guide-group]').forEach(b=>{
  const active=b.dataset.pwaGuideGroup===selectedCategory;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;
 });
 links.replaceChildren();
 for(const g of guides.filter(g=>g.group===selectedCategory)){
  const b=element('button','pwa-guide-link',g.title);b.type='button';b.dataset.pwaGuide=g.id;
  if(g.id===selected)b.setAttribute('aria-current','page');
  links.append(b);
 }
}
function renderGuide(){
 const g=byId.get(selected);
 doc.getElementById('pwaGuideCategory').textContent=g.group==='use'?'Using the App':'Setup';
 doc.getElementById('pwaGuideTitle').textContent=g.title;
 content.replaceChildren();
 content.append(element('h2','',g.title),element('p','pwa-guide-intro',g.intro));
 const list=element('ol','pwa-guide-steps');
 for(const step of g.steps)list.append(element('li','',step));
 content.append(list);
 if(g.action){
  const b=element('button','pwa-wide',g.label);b.type='button';
  b.dataset.pwaAction=g.action==='jukebox'||g.action==='crate'?'pwa-guide-'+g.action:g.action;
  content.append(b);
 }else if(g.copy){
  const b=element('button','pwa-wide',g.label);b.type='button';b.dataset.pwaGuideCopy=g.copy;content.append(b);
 }else if(g.url){
  const a=element('a','pwa-wide',g.label);a.href=g.url;a.target='_blank';a.rel='noopener noreferrer';content.append(a);
 }
 renderLinks();
}
function choose(id){
 if(!byId.has(id))return;
 selected=id;category=byId.get(id).group;picker.open=false;renderGuide();
 content.scrollIntoView({block:'nearest',behavior:'instant'});
}
manual.addEventListener('click',async event=>{
 const tab=event.target.closest('[data-pwa-guide-group]');
 if(tab){category=tab.dataset.pwaGuideGroup;renderLinks();return}
 const guide=event.target.closest('[data-pwa-guide]');
 if(guide){choose(guide.dataset.pwaGuide);return}
 const copy=event.target.closest('[data-pwa-guide-copy]');
 if(copy){
  const ok=await window.HipsterPWABridge.copy(copy.dataset.pwaGuideCopy);
  copy.textContent=ok?'COPIED · PASTE IN YOUR AI':'COPY UNAVAILABLE · SELECT TEXT';
  if(!ok){const fallback=element('code','pwa-guide-copy-fallback',copy.dataset.pwaGuideCopy);copy.after(fallback)}
 }
 const action=event.target.closest('[data-pwa-action^="pwa-guide-"]');
 if(action){
  const tabName=action.dataset.pwaAction.slice('pwa-guide-'.length);
  const rail=doc.querySelector('[data-pwa-tab="'+tabName+'"]');
  if(rail)rail.click();
 }
});
manual.addEventListener('keydown',event=>{
 const tab=event.target.closest('[data-pwa-guide-group]');
 if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const next=tab.dataset.pwaGuideGroup==='setup'?'use':'setup';
 category=event.key==='Home'?'setup':event.key==='End'?'use':next;
 renderLinks();manual.querySelector('[data-pwa-guide-group="'+category+'"]').focus();
});
renderGuide();
})();
