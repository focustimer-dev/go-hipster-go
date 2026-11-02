




(()=>{
const root=document.getElementById('firstCrateSetup');if(!root)return;const $=id=>root.querySelector('#fc-'+id);
const servicePanel=$('services');let installNotice='';
const key='hmg-first-crate-v1';let stage='welcome',paused=false,completed=false,help=false,notice='',copySerial=0,confirmedPairs={};
const repo='https://github.com/focustimer-dev/go-hipster-go';
const release=repo+'/releases/latest/download/';
let claudeRoute='';
function guideLink(label,url){return `<a class="install-link" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`}
function installRequest(){
 const a=$('ai').value;
 if(a==='Other')return `Load Go, Hipster, Go! from GitHub: ${repo}. Read SKILL.md and the linked references needed for this request. Use this AI's supported loading or installation method; do not invent settings or tools. Confirm what loaded and whether it persists beyond this chat. Reading a URL is not installation. If you cannot read the repository, ask me to upload the needed files and identify exactly which ones; do not pretend to have loaded them. My preferred music service is ${$('service').value}. Check which music tools are actually available and authorized; do not claim a connection or saved playlist without evidence. If you cannot save the skill, explain that it is available only in this chat and must be loaded again in a new one. Do not create a playlist during setup.`;
 if(a==='ChatGPT')return `Use Plugin Creator to create my personal Go, Hipster, Go! plugin from ${repo}. Read plugin.json and skills/. Preserve the existing skill and setup instructions. Confirm the plugin was created and how to install/select it. Do not create a playlist. If Plugin Creator is unavailable, show the Project fallback in adapters/chatgpt/README.md.`;
 if(a==='Gemini')return `Create and save a persistent go-hipster-go Skill from ${repo}/raw/refs/heads/main/adapters/gemini/SKILL.md. Preserve the complete small entry and its absolute reference links. Do not preload its references or start a task. Confirm it appears in Customize → Skills and is selectable in a new chat. Reading a URL is not installation. If you cannot save it, explain how to upload the complete Gemini Skill ZIP through Gemini web. Do not create a playlist.`;
 return `Help me install Go, Hipster, Go! from ${repo}. My upload screen is ${claudeRoute==='plugins'?'Customize → Plugins':claudeRoute==='skills'?'Customize → Skills':'not yet identified'}. Read adapters/claude/README.md. Give only the matching package after identifying the uploader, and confirm whether installation succeeds. Do not create a playlist.`;
}
function connectionInstructions(){
 const a=$('ai').value,s=$('service').value;
 if(a==='Other')return `Look for <strong>${esc(s)}</strong> in your AI’s apps or connections, if offered. Follow its sign-in steps. If playlist creation isn’t supported, you can still get recommendations; they won’t be saved automatically.`;
 if(a==='ChatGPT')return `In ChatGPT’s Apps or Plugins area, connect <strong>${esc(s)}</strong> if available. In your music chat, select both <strong>Go, Hipster, Go!</strong> and <strong>${esc(s)}</strong>. The connection check will ask which tools are available.`+(s==='Apple Music'?' Apple Music saving requires a subscription; searching and generating a playlist do not.':'');
 if(a==='Gemini'&&s==='YouTube Music')return 'In Gemini’s connected-app settings, enable YouTube Music if available. In your music chat, select your saved skill. Type <strong>@</strong> and select <strong>YouTube Music</strong> from the picker.';
 if(a==='Gemini')return `<strong>${esc(s)} playlist saving is not confirmed for this pairing.</strong> Keep this choice for recommendations and let the check report available tools, or choose YouTube Music for Gemini. Nothing will silently switch your music service.`;
 if(s==='Spotify')return 'In Claude’s connector settings, add Spotify and authorize it. Personalized playlist generation requires Spotify Premium; discovery may still work without it. The check will ask which tools this chat can use.';
 if(s==='Apple Music')return 'Claude needs a compatible Apple Music MCP connector for your device. A local computer connector may not work on your phone. This app supplies neither that connector nor its credentials; the check must confirm actual search and playlist-writing tools.';
 return 'YouTube Music playlist writing is not confirmed for this Claude pairing. The setup check must report which tools are available. You can keep it for recommendations, or change to a supported service.';
}
function installationGuide(){
 const a=$('ai').value;
 let first='';
 if(a==='Other')first=`<strong>Load the skill in your AI.</strong><p>Open a new chat in your AI. Copy this installation request, paste it there, and send it.</p>${action('COPY GENERIC INSTALL REQUEST','install-copy')}${installFeedback()}<details><summary>View install prompt / copy manually</summary>${manualInstall()}</details><p>Follow the AI’s instructions. Ask whether the skill is saved or works only in this chat. If it’s chat-only, reload the prompt when starting another chat.</p><p>If it cannot read GitHub, ask which files to upload. ${guideLink('Open the skill source',repo+'/blob/main/SKILL.md')} and download the files it requests. A pasted link alone does not install the skill.</p>`;
 if(a==='ChatGPT')first=`<strong>Add Go, Hipster, Go! to ChatGPT.</strong><p>In ChatGPT’s Plugins area, add <strong>Plugin Creator</strong>. Start a chat with it, paste the installation request below, and follow its instructions to create and install your personal plugin.</p>${action('COPY INSTALLATION REQUEST','install-copy')}${installFeedback()}<details><summary>View installation request / copy manually</summary><textarea readonly aria-label="Installation request">${esc(installRequest())}</textarea></details><details><summary>No Plugins? Use a ChatGPT Project</summary><ol class="fallback-steps"><li>Create a Project named Go, Hipster, Go!.</li><li>Put ${guideLink('Project instructions',repo+'/blob/main/adapters/chatgpt/PROJECT_INSTRUCTIONS.md')} in its Project instructions.</li><li>Download ${guideLink('the knowledge file',repo+'/raw/refs/heads/main/adapters/chatgpt/CHATGPT_KNOWLEDGE.md')} and upload it to that Project.</li><li>Start future music chats inside that Project.</li></ol></details>`;
 if(a==='Gemini')first=`<strong>Install the Gemini Skill.</strong><p>Open Gemini in a <strong>web browser</strong>. Download the ZIP below. Go to <strong>Customize → Skills → Create → Upload</strong> (or Replace), upload it, and save. Confirm Go, Hipster, Go! is available in a new chat.</p>${guideLink('DOWNLOAD GEMINI SKILL ZIP',release+'go-hipster-go-gemini-app-skill.zip')}<details><summary>Prefer asking Gemini to install it?</summary><p>Saving must be supported in your account. A GitHub page read alone is not an installation.</p>${action('COPY INSTALLATION REQUEST','install-copy')}${installFeedback()}${manualInstall()}</details>`;
 if(a==='Claude')first=`<strong>Choose the Claude uploader you’re using.</strong><p>Open <strong>Customize</strong> in Claude. Which upload screen do you see? These packages are different.</p><div class="uploader-choices"><button type="button" data-action="claude-skills" aria-pressed="${claudeRoute==='skills'}">SKILLS</button><button type="button" data-action="claude-plugins" aria-pressed="${claudeRoute==='plugins'}">PLUGINS</button></div>${claudeRoute?`<p>Download the <strong>Claude ${claudeRoute==='skills'?'Skill':'Plugin'} ZIP</strong>, upload it on <strong>Customize → ${claudeRoute==='skills'?'Skills':'Plugins'}</strong>, then enable it. ${claudeRoute==='skills'?'Enable code execution if Claude’s custom Skills controls require it.':''}</p>${guideLink('DOWNLOAD CLAUDE '+(claudeRoute==='skills'?'SKILL':'PLUGIN')+' ZIP',release+'go-hipster-go-claude-'+(claudeRoute==='skills'?'skill':'plugin')+'.zip')}`:'<p class="note">Choose a screen above to get the matching download. If neither is available, use the platform guide below.</p>'}`;
 const path=a==='ChatGPT'?'chatgpt/PLUGIN_INSTALL.md':a==='Gemini'?'gemini/README.md':'claude/README.md';
 return `<p class="install-intro">Install the skill, then connect your music service.</p>${action('Already installed? Check connection','check',true)}<ol class="install-steps"><li>${first}</li><li><strong>${a==='Other'?'Check '+esc($('service').value)+' support.':'Connect '+esc($('service').value)+'.'}</strong><p>${connectionInstructions()}</p>${a==='Gemini'&&$('service').value!=='YouTube Music'?action('USE YOUTUBE MUSIC INSTEAD','use-youtube',true):''}</li></ol>${action('NEXT: CONNECTION CHECK','check')}<div class="secondary-row">${action('Change my setup','choose',true)}${action('Finish later','pause',true)}</div>${guideLink(a==='Other'?'Generic installation guide':'Full '+esc(a)+' installation guide',a==='Other'?repo+'#installation-when-the-easy-way-needs-help':repo+'/blob/main/adapters/'+path)}<p class="note">Menus vary by account. Your AI checks the connection; this app remembers your confirmation.</p>`;
}
function installFeedback(){return `<p class="status" role="status">${esc(installNotice)}</p>`}
function manualInstall(){return `<textarea readonly aria-label="Installation request">${esc(installRequest())}</textarea>`}

function pairingKey(){return JSON.stringify([$('ai').value,$('service').value])}
function hasConfirmation(){return confirmedPairs[pairingKey()]===true}
const stages=['welcome','choose','install','check','copied','away','return'];
const aiKeys={ChatGPT:'chatgpt',Gemini:'gemini',Claude:'claude',Other:'other'},serviceKeys={Spotify:'spotify','YouTube Music':'youtube','Apple Music':'apple'};
const initial=window.HipsterSetup.getPair();$('ai').value=Object.keys(aiKeys).find(k=>aiKeys[k]===initial.ai)||'ChatGPT';$('service').value=Object.keys(serviceKeys).find(k=>serviceKeys[k]===initial.service)||'Spotify';
try{const s=JSON.parse(localStorage.getItem(key)||'null');if(s){const samePair=s.ai===$('ai').value&&s.service===$('service').value;stage=stages.includes(s.stage)?s.stage:'welcome';paused=!!s.paused;confirmedPairs=s.confirmedPairs&&typeof s.confirmedPairs==='object'&&!Array.isArray(s.confirmedPairs)?s.confirmedPairs:{};if(s.completed&&samePair)confirmedPairs[pairingKey()]=true;completed=!!s.completed&&hasConfirmation();help=!!s.help;claudeRoute=s.claudeRoute||'';if(stage==='away')stage='return';if(stage==='copied')stage='check';if(!samePair){stage='choose';paused=false;help=false;completed=hasConfirmation()}}}catch{}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const aiName=()=>$('ai').value==='Other'?'your AI':$('ai').value;
const pair=()=>($('ai').value==='Other'?'Other AI':$('ai').value)+' + '+$('service').value;
const setup=()=>`Check Go, Hipster, Go! setup for ${pair()}. Confirm whether the skill is installed and whether the connected music service can actually create playlists. Explain the smallest next step if anything is missing. Do not generate a playlist or claim a connection without evidence.`;
const action=(label,id,secondary=false)=>`<button type="button" class="${secondary?'text-action':'primary'}" data-action="${id}">${label}</button>`;
function persist(){try{localStorage.setItem(key,JSON.stringify({stage,paused,completed,confirmedPairs,help,claudeRoute,ai:$('ai').value,service:$('service').value}))}catch{}}
function focusAction(name){root.querySelector(`[data-action="${name}"]`)?.focus()}
function pause(){if(completed&&!help)return;paused=true;help=false;render();focusAction('resume')}
function resume(){paused=false;completed=false;help=false;if(stage==='away')stage='return';render();if(stage==='choose')$('ai').focus();else $('ticket').querySelector('[data-action]:not([data-action="pause"]):not([data-action="previous"])')?.focus()}
function previousStage(current){return ({choose:'welcome',install:'choose',check:'install',copied:'check',away:'check',return:'check'})[current]||null}
function backLabel(){if(help)return 'Back to setup';return ({choose:'Back to the welcome',install:'Back to AI and music choices',check:'Back to installation steps',copied:'Back to the connection check',away:'Back to the connection check',return:'Back to the connection check'})[stage]||'Back'}
function goBack(){
 copySerial++;notice='';installNotice='';paused=false;
 if(help){help=false;if(stage==='copied'||stage==='away')stage='check'}else{const previous=previousStage(stage);if(!previous)return;stage=previous;completed=false}
 render();
 if(completed)return;
 if(stage==='choose')$('ai').focus();else $('ticket').querySelector('[data-action]:not([data-action="pause"]):not([data-action="previous"])')?.focus();
}
function setupHelp(){return `<p>What’s getting in the way?</p><div class="setup-help"><details><summary>Skill not installed</summary><p>Use the installation steps for ${esc(aiName())}. Then ask the AI to confirm that Go, Hipster, Go! is loaded.</p>${action('SHOW MY INSTALLATION STEPS','install',true)}</details><details><summary>Music service won’t connect</summary><p>Open your AI’s apps or connection settings and reconnect ${esc($('service').value)}. Complete sign-in there, then run the connection check again. If it isn’t offered, change your pairing.</p>${action('CHANGE MY SETUP','choose',true)}</details><details><summary>Can’t save playlists</summary><p>Ask your AI which playlist-writing tools are available for ${esc($('service').value)}. If none are available, you can still get a track list and add it yourself, or choose another pairing.</p>${action('CONTINUE WITH RECOMMENDATIONS','recommendations',true)}</details></div>${action('BACK TO MY SETUP','resume')}<div class="secondary-row">${action('Run a fresh connection check','check',true)}${action('Finish later','pause',true)}</div>`}
function confirmSetup(){return `<div class="confirm-setup"><strong>Already checked in your AI?</strong><p>Once it confirms the skill is loaded and your music service is ready, finish here.</p><button type="button" class="confirm-ready" data-action="ready">MY AI CONFIRMED — I’M READY</button><p class="note">Saved on this device as your confirmation.</p></div>`}
function manualText(){return `<details><summary>View connection check / copy manually</summary><textarea readonly aria-label="Connection check">${esc(setup())}</textarea></details>`}
function render(){
 $('options-holder').append(servicePanel);const ticket=$('ticket');ticket.hidden=completed&&!help;ticket.classList.toggle('is-paused',paused&&!help&&!completed);

 if(completed&&!help){ticket.innerHTML='';$('current-setup').hidden=false;$('current-setup').innerHTML=`<span class="setup-confirmed"><span class="ink-stamp">ALL SET</span><span class="confirmed-pair">${esc(pair())}<small>Setup confirmed by you · Pick your sound.</small></span></span>${action('Change setup','choose',true)}`;persist();return}
 $('current-setup').hidden=true;
 if(paused&&!help){
  const labels={choose:'Choose your AI and music service',install:'Continue your installation steps',welcome:'Start when you’re ready',check:'Copy your connection check',copied:'Next: open your AI',away:'Next: confirm how setup went',return:'Next: confirm how setup went'};
  ticket.innerHTML=`<div class="resume-copy"><strong>SETUP UNFINISHED</strong><span>${esc(pair())}</span><small>${labels[stage]}</small></div><button type="button" class="resume-action" data-action="resume">CONTINUE</button>`;persist();return;
 }
 const heads={choose:'WHAT’S YOUR SETUP?',install:'YOUR INSTALLATION GUIDE',welcome:'FIRST TIME HERE?',check:'CHECK YOUR CONNECTION',copied:'COPIED. NEXT STOP:',return:'READY FOR THE GOOD STUFF?'};
 const steps={choose:'SETUP · 1 OF 3',install:'SETUP · 2 OF 3',welcome:'YOUR FIRST CRATE',check:'SETUP · 3 OF 3',copied:'FINISH IN YOUR AI',return:'BACK AT THE COUNTER'};
 let body='';
 if(help)body=setupHelp();
 else if(stage==='welcome')body=`<p>Pick the sound. Your AI digs up the records and builds the playlist through your connected music service.</p>${action('CHECK MY SETUP','choose')}<div class="secondary-row">${action('I’m already set up','choose',true)}${action('Explore first','pause',true)}</div>`;
 else if(stage==='choose')body=`<p>Which AI and music service will you use? <strong>You can change these later.</strong></p><div id="fc-service-slot"></div><p class="pair-advice">${$('ai').value==='Gemini'?'YouTube Music is the recommended pairing for Gemini.':$('ai').value==='ChatGPT'?'ChatGPT + Spotify is our suggested starting point.':$('ai').value==='Other'?'We’ll give you a generic install prompt. Your AI must confirm what it can load and save.':'Pick the service you actually use; we’ll spell out its connection requirements.'}</p>${hasConfirmation()?'<p class="saved-confirmation">You already confirmed this pairing on this device.</p>'+action('USE CONFIRMED SETUP','restore'):action('SHOW SETUP STEPS','install')}<div class="secondary-row">${action('Finish later','pause',true)}</div><p class="note">These are preferences. Choosing a service doesn’t connect an account.</p>`;
 else if(stage==='install')body=installationGuide();
 else if(stage==='check')body=`<p>This checks the music skill and connection. It won’t create a playlist.</p>${action('COPY CONNECTION CHECK','copy')}<p class="status" role="status">${esc(notice)}</p>${notice.startsWith('Clipboard')?action('I’ve copied it manually','copied',true):''}${confirmSetup()}${manualText()}<div class="secondary-row">${action('Need help?','help',true)}${action('Finish later','pause',true)}</div>`;
 else if(stage==='copied')body=`<p>Open ${esc(aiName())}, paste the connection check and send it. Return when it confirms readiness.</p><p class="clerk-aside">Yes, you still have to press Send.</p>${$('ai').value==='Other'?'<p>Open your chosen AI, paste the check and send it.</p>':`<a class="primary" href="${({ChatGPT:'https://chatgpt.com/',Gemini:'https://gemini.google.com/app',Claude:'https://claude.ai/'})[$('ai').value]}" target="_blank" rel="noopener noreferrer">OPEN ${esc(aiName().toUpperCase())}</a>`}${confirmSetup()}${manualText()}<div class="secondary-row">${action('Need help?','help',true)}${action('Finish later','pause',true)}</div>`;

 else if(stage==='return')body=`<p>Did your AI confirm the setup is ready?</p>${action('MY AI CONFIRMED — I’M READY','ready')}<div class="secondary-row">${action('I need help','help',true)}${action('Finish later','pause',true)}</div><p class="note">This records your confirmation. Returning alone doesn’t confirm a connection.</p>`;
 ticket.innerHTML=`<div class="ticket-top"><div class="ticket-navigation">${help||previousStage(stage)?`<button type="button" class="setup-back" data-action="previous" aria-label="${backLabel()}">BACK</button>`:''}<span class="ticket-step">${help?'THE MANUAL':steps[stage]}</span></div><button type="button" class="close-setup" data-action="pause" aria-label="Close setup and keep my progress">CLOSE</button></div><p class="setup-pair">${stage==='welcome'?'Suggested: ':''}${esc(pair())}</p><h2>${help?'LET’S GET YOU UNSTUCK':heads[stage]}</h2>${body}${!help&&stage==='welcome'?'<div class="clerk-signoff"><p>A little paperwork.<br>A lot of opinions.</p><span class="ink-stamp" aria-hidden="true">ADMIT ONE</span></div>':''}`;if(stage==='choose'&&!help)$('service-slot').append(servicePanel);const current=$('current-setup');current.hidden=stage==='welcome'||stage==='choose'||!completed;current.innerHTML=completed?`<span class="setup-confirmed"><span class="ink-stamp">ALL SET</span><span class="confirmed-pair">${esc(pair())}<small>Setup confirmed by you · Pick your sound.</small></span></span>${action('Change setup','choose',true)}`:'';persist();
}
async function copy(text){if(!navigator.clipboard?.writeText)return false;try{await navigator.clipboard.writeText(text);return true}catch{return false}}
root.addEventListener('click',async e=>{
 const button=e.target.closest('[data-action]');if(!button)return;const a=button.dataset.action;
 if(a==='install-copy'){const text=installRequest(),serial=++copySerial;button.disabled=true;const ok=await copy(text);if(serial!==copySerial)return;installNotice=ok?'Installation request copied. Open your AI, paste it and send.':'Clipboard unavailable. Open the installation request below and copy it manually.';render();if(!paused&&!help)focusAction('install-copy');if(!ok){for(const d of $('ticket').querySelectorAll('details'))if(d.querySelector('textarea[aria-label="Installation request"]'))d.open=true}return}
 if(a==='claude-skills'||a==='claude-plugins'){claudeRoute=a==='claude-skills'?'skills':'plugins';installNotice='';render();return}
 if(a==='use-youtube'){$('service').value='YouTube Music';syncPair();copySerial++;installNotice='';render();return}
 if(a==='previous'){goBack();return}
 if(a==='pause'){pause();return}
 if(a==='resume'){resume();return}
 if(a==='restore'&&!hasConfirmation())return;
 if(a==='ready'||a==='restore'){copySerial++;confirmedPairs[pairingKey()]=true;completed=true;paused=false;help=false;render();document.querySelector('[data-mood]').focus();document.querySelector('[data-mood]').scrollIntoView({block:'nearest'});return}
 if(a==='help'){help=true;paused=false;render();$('ticket').querySelector('[data-action]:not([data-action="pause"]):not([data-action="previous"])')?.focus();return}
 if(a==='copy'){
  const serial=++copySerial,snapshot=setup();button.disabled=true;const ok=await copy(snapshot);if(serial!==copySerial||snapshot!==setup())return;
  stage=ok?'copied':'check';notice=ok?'':'Clipboard unavailable. Copy the check below, then continue.';render();
  if(!ok&&!paused&&!help){const d=$('ticket').querySelector('details');d.open=true;d.querySelector('textarea').select()}return;
 }
 if(a==='recommendations'){copySerial++;help=false;completed=false;paused=true;render();document.querySelector('[data-mood]').focus();return}
 if(a==='copied'){copySerial++;stage='copied';notice='';help=false;render();return}
 if(['choose','install','check','away','return'].includes(a)){copySerial++;stage=a;paused=false;completed=false;help=false;notice='';render();if(stage==='choose')$('ai').focus();else $('ticket').querySelector('[data-action]:not([data-action="pause"]):not([data-action="previous"])')?.focus()}
});
for(const id of ['ai','service'])$(id).addEventListener('change',()=>{copySerial++;stage='choose';paused=false;completed=false;help=false;notice='';installNotice='';claudeRoute='';syncPair();render()});
root.addEventListener('keydown',e=>{if(e.key==='Escape'&&(!completed||help)&&!paused){e.preventDefault();pause()}});
function syncPair(){window.HipsterSetup.setPair({ai:aiKeys[$('ai').value],service:serviceKeys[$('service').value]})}
document.addEventListener('hipster-pair-changed',e=>{
 const nextAi=Object.keys(aiKeys).find(k=>aiKeys[k]===e.detail.ai),nextService=Object.keys(serviceKeys).find(k=>serviceKeys[k]===e.detail.service);
 if(!nextAi||!nextService||nextAi===$('ai').value&&nextService===$('service').value)return;
 $('ai').value=nextAi;$('service').value=nextService;copySerial++;notice='';installNotice='';help=false;paused=false;completed=hasConfirmation();stage=completed?'return':'choose';render();
});
root.addEventListener('toggle',e=>{if(e.target.matches('.setup-help details')&&e.target.open)for(const d of root.querySelectorAll('.setup-help details'))if(d!==e.target)d.open=false},true);
try{if(!localStorage.getItem(key)&&localStorage.getItem('hmg-setup-first-tip-dismissed-v3'))paused=true}catch{}
render();
})();
