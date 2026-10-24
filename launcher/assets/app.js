/* HIPSTER GO: user-selectable crate digging, no imaginary music writers. */
(function(){
"use strict";
const doc=document,body=doc.body;
const defaultService={chatgpt:"spotify",gemini:"youtube",claude:"apple"};
const aiNames={chatgpt:"ChatGPT",gemini:"Gemini",claude:"Claude"};
const serviceNames={spotify:"Spotify",youtube:"YouTube Music",apple:"Apple Music"};
const destinations={chatgpt:"https://chatgpt.com/",gemini:"https://gemini.google.com/app",claude:"https://claude.ai/"};
const geminiIntent="intent://gemini.google.com/app#Intent;scheme=https;package=com.google.android.apps.bard;S.browser_fallback_url=https%3A%2F%2Fgemini.google.com%2Fapp;end";
let copiedPrompt=null;
const tempoNames={slow:"Slow",relaxed:"Relaxed",moderate:"Mid-tempo",brisk:"Brisk",fast:"Fast"};
const tempoSteps=Object.keys(tempoNames);
const moods=new Set(["go","happy","angry","sad","weird","criminal"]);
function stored(key){try{return localStorage.getItem(key)}catch(e){return null}}
function store(key,v){try{localStorage.setItem(key,v)}catch(e){}}
function status(message){const e=doc.getElementById("copyStatus");if(e)e.textContent=message}
async function copyText(text){
 try{await navigator.clipboard.writeText(text);return true}
 catch(e){
  const t=doc.createElement("textarea");t.value=text;t.style.cssText="position:fixed;left:-9999px;opacity:0";doc.body.appendChild(t);t.select();
  let ok=false;try{ok=doc.execCommand("copy")}catch(err){}t.remove();return ok;
 }
}
const repo="https://github.com/focustimer-dev/go-hipster-go";
const releases=repo+"/releases/latest/download/";
const resourceInfo={
 chatgpt:[{name:"Go, Hipster, Go! source",url:repo}],
 gemini:[{name:"Gemini Skill ZIP",url:releases+"go-hipster-go-gemini-app-skill.zip"},{name:"Gemini installation guide",url:repo+"/blob/main/adapters/gemini/README.md"}],
 claude:[{name:"Claude Skill ZIP",url:releases+"go-hipster-go-claude-skill.zip"},{name:"Claude Plugin ZIP",url:releases+"go-hipster-go-claude-plugin.zip"},{name:"Which one? Claude guide",url:repo+"/blob/main/adapters/claude/README.md"}]
};
function routeInfo(ai,service){
 if(ai==="chatgpt"&&service==="spotify")return {tone:"ready",message:"ChatGPT + Spotify: can create a playlist when both apps are selected and playlist tools are available. Choose them in your conversation.",note:"You still need to select and authorize both apps in ChatGPT; mentioning them in text alone may not activate them."};
 if(ai==="gemini"&&service==="youtube")return {tone:"ready",message:"Gemini + YouTube Music: GO curates and attempts one playable playlist.",note:"If the connected app cannot create it, the Skill keeps the verified crate and reports what failed. Provider substitutions are never passed off as exact matches."};
 if(ai==="gemini"&&service==="spotify")return {tone:"warn",message:"Gemini + Spotify: search and playback work on supported mobile accounts, but Google's Spotify connection cannot create playlists.",note:"You can still curate an exact text tracklist and play/search Spotify; don't expect a new saved Spotify playlist."};
 if(ai==="claude"&&service==="spotify")return {tone:"ready",message:"Claude + Spotify: connected discovery works; prompted playlists are a Premium feature and provider save behavior can vary.",note:"Enable Spotify in Claude's connectors and verify whether the available writer can actually create/save the playlist."};
 if(ai==="claude"&&service==="apple")return {tone:"warn",message:"Claude + Apple Music: requires an Apple Music MCP connector with playlist-writing tools.",note:"Use a compatible local connector on Desktop or a hosted connector for web/mobile. Run the setup check to verify track search and playlist creation."};
 if(ai==="chatgpt"&&service==="apple")return {tone:"ready",message:"ChatGPT + Apple Music: build a playlist in chat, then use the app’s save control. Saving to your library requires an Apple Music subscription.",note:"Search and playlist generation do not require a subscription. If shown, tap Create playlist in Apple Music to save. Ready to save is not the same as saved; library/history access and read-back verification may be unavailable."};
 return {tone:"warn",message:aiNames[ai]+" + "+serviceNames[service]+": playlist-writing support isn't confirmed for this pairing.",note:"The skill can still curate a verified text playlist; publish only if the AI exposes a real authorized writer."};
}
function setupPrompt(ai,service){
 const name=aiNames[ai],target=serviceNames[service];
 const intro=ai==="chatgpt"?"In ChatGPT, check for the Go, Hipster, Go! plugin/app.":ai==="gemini"?"IMPORTANT: Before pasting this installation request, choose Task mode beneath the Gemini prompt box. In Gemini Task mode, check for the installed Go, Hipster, Go! Skill (not a Gem).":"In Claude, check for the Go, Hipster, Go! skill or plugin.";
 const install=ai==="gemini"?"Use Task mode for this one-time repository installation; do not schedule a recurring task. Install or refresh the Gemini-specific five-file Skill from https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-gemini-app-skill.zip; do not substitute the shared root SKILL.md, whose defaults include other platforms. If the Task agent cannot persist a Skill, tell me to open Gemini in a desktop or mobile WEB BROWSER at gemini.google.com, then Customize → Skills → Create → Upload the latest five-file ZIP. Do not direct me to upload the ZIP inside the native Gemini app.":ai==="claude"?"If missing, identify whether I need Claude's Skills ZIP or Plugins ZIP; they are different.":"If missing, use the available app/skill installation flow or show how to install from the project's GitHub repository.";
 return "FIRST-TIME SETUP CHECK for "+name+" + "+target+".\n"+intro+" "+install+" Source: "+repo+(ai==="gemini"?"\nThe Gemini-native source is https://github.com/focustimer-dev/go-hipster-go/blob/main/adapters/gemini/GEM_KNOWLEDGE.md (skill plus filtered references); the release ZIP above is the authoritative five-file install. Read or install THAT Gemini version, not the generic root SKILL.md. Use only actual Gemini Skills capabilities. Verify the loaded skill explicitly reports version 3.6.3 and whether the installation persists into a new conversation. If repository loading only reads instructions but cannot install a persistent Skill, be clear and offer the latest Gemini ZIP upload instead. Do not report installation complete just because the URL was opened.":"")+
 (ai==="chatgpt"&&service==="apple"?"\nConnect Apple Music through ChatGPT Settings → Apps, then select both Apple Music and Go, Hipster, Go! in this conversation. Search and playlist generation do not require an Apple Music subscription; saving to the library does. Recognize the app’s playlist widget and user-operated save control as a supported path, even without a direct playlist-writing tool. Explain Create playlist in Apple Music when that control is offered. Do not require a subscription just to finish discovery setup or assume access to my library or listening history.":"")+
 (ai==="claude"&&service==="apple"?"\nApple Music requires a compatible MCP connector: local for Desktop or hosted for web/mobile. Check which Claude app I use and help me connect it if missing. Verify catalog track search, playlist creation and adding tracks; library-only search may not find new recordings.":"")+
 "\nIf the skill is available, run its setup for "+target+", guide me through connecting or selecting that music service, and CHECK whether playlist creation and adding tracks are actually supported—not just search/playback. Tell me the smallest action needed to finish setup. If everything is already ready, say so and tell me to run go. Do NOT generate a new playlist during this setup check, claim a playlist was saved, or ask me to paste credentials into chat.";
}
const universalPrompt="If using Gemini, choose Task mode beneath the input BEFORE sending this one-time installation request (do not schedule a recurring task). Install the official five-file Gemini skill ZIP at "+releases+"go-hipster-go-gemini-app-skill.zip; GitHub's "+repo+"/blob/main/adapters/gemini/GEM_KNOWLEDGE.md is the readable Gemini-specific mirror. Do not use the generic root SKILL.md. Install it using your supported Skill mechanism and confirm the loaded version is 3.6.3 and whether it persists across Gemini conversations. If reading GitHub does not install it, say so and offer the current Gemini Skill ZIP at "+releases+"go-hipster-go-gemini-app-skill.zip. Upload ZIPs only through Gemini WEB or MOBILE WEB at gemini.google.com, not the native mobile app. Then run setup; do not create a playlist or assume a writer exists.";
function goCommand(ai,service,mood){
 const go=mood==="go"?"go":"go "+mood;
 if(ai==="chatgpt"&&service==="spotify")return "@Go, Hipster, Go! @Spotify "+go;
 if(ai==="chatgpt"&&service==="apple")return "@Go, Hipster, Go! @Apple Music "+go;
 if(ai==="gemini"&&service==="youtube")return "Use Go, Hipster, Go!: "+go+".";
 if(ai==="gemini"&&service==="spotify")return "@go-hipster-go "+go+" @Spotify";
 if(ai==="claude")return "Use Go, Hipster, Go!: "+go+". Preferred music service: "+serviceNames[service]+".";
 return "@Go, Hipster, Go! "+go+" — destination "+serviceNames[service];
}
const freshCrateLenses=["Rhythm first: asymmetrical hand-percussion accents, interlocking guitar patterns and a convincing pocket.", "Voice first: intimate or unusual vocal phrasing against restrained, textural accompaniment.", "Production first: dub-space, spring or tape echo and spacious low-end where actually documented.", "Motion first: restless post-punk-style grooves connected to rhythmically surprising regional recordings.", "Texture first: wiry organ or electric-key timbres meeting guitar-led folk or soundtrack arrangements.", "Contrast first: brittle drum machines beside warm live bass or hand-played rhythms.", "Arrangement first: call-and-response, shifting ensemble layers and accumulating tension.", "Atmosphere first: dreamy vocal harmonies or modal drones with a clear rhythmic through-line.", "Beat first: clipped syncopation, early sample collage or hypnotic repetition across different eras.", "Melody first: bittersweet melodic turns carried by unexpectedly propulsive backing.", "Timbre first: fuzzed or tremulous guitar against smooth keys or airy instrumental colors.", "Structure first: long-form builds, sudden negative space and patiently evolving motifs.", "Singeli: investigate tanzanian electronic dance; investigate compact rapid rhythmic turns.", "Electro Acholi / acholitronix: investigate northern ugandan electronic dance routes; distinguish from other ugandan scenes.", "Balani show / electro balani: investigate malian electronic dance; investigate percussion layering.", "Shangaan electro: investigate south african electronic dance; distinguish from older bubblegum.", "Kadodi: investigate research credited percussion ensembles and separately documented electronic adaptations.", "Jaglara: investigate sudanese electronic dance recordings; verify local provenance and arrangement.", "Funaná: investigate cabo verde; investigate accordion and scraped-percussion interaction.", "Rebita: investigate angolan dance repertoire and archival band recordings.", "Maloya: investigate réunion; preserve song/dance and historical context.", "Sega tipik: investigate mauritian tradition; distinguish from other island sega practices.", "Sega tambour of Rodrigues: investigate rodrigues repertoire; verify performers and exact recording.", "Sega tambour Chagos: investigate chagossian repertoire; preserve community context.", "Gwoka: investigate guadeloupe song, dance and percussion tradition.", "Somali diaspora digital recordings: investigate 1990s saudi-based somali recordings documented by 808 xamar.", "Djibouti broadcast ensembles: investigate rtd archival repertoire; do not assume all performers share one origin.", "Beja electric music: investigate research documented beja recordings rather than generic desert-blues tags.", "Uzbek disco: investigate soviet central asian archival pop route; verify actual language and date.", "Tajik folktronica: investigate archival descriptor to investigate, not a claim about all tajik music.", "Uyghur rock: investigate keep distinct from other central asian languages and scenes.", "Tatar jazz: investigate investigate documented arrangements and performer credits.", "Libyan reggae: investigate tape and band recordings distinct from jamaican originals.", "Libyan cassette pop: investigate research beyond the familiar reissue lead singles.", "Sudanese tape-era song: investigate vocal and band recordings; distinguish from contemporary jaglara.", "Bourj Hammoud recordings: investigate a localized archival route, not a formal genre label.", "Cameroonian bikutsi: investigate investigate guitar/percussion relationships; distinguish from makossa.", "Gandjal: investigate research the documented cameroonian golden sounds repertoire.", "Afro-Colombian champeta crossings: investigate trace actual musical exchanges and recordings, not generic fusion.", "Palenque ensemble traditions: investigate research credited local ensembles separately from electronic champeta.", "Pará dance archives: investigate explore the documented jambú repertoire; identify the actual style per track.", "Jaipongan: investigate west javanese/sundanese dance-music route; distinguish from keroncong.", "Keroncong: investigate indonesian song tradition; investigate small-ensemble texture.", "Dangdut: investigate investigate overlooked regional recordings, not just famous pop hits.", "Thai shadow music: investigate electric instrumental archival route; do not equate with all thai psych.", "South Asian steel-guitar film interpretations: investigate instrumental arrangement route; verify original film and performer.", "Albanian iso-polyphony: investigate investigate drone and interweaving voices.", "Corsican cantu in paghjella: investigate distinguish secular/liturgical practice and concert adaptation.", "Sardinian canto a tenore: investigate multipart pastoral singing; preserve context.", "Lithuanian sutartinės: investigate multipart song tradition; investigate interlocking entrances.", "Shashmaqom: investigate modal art-music route; use a suitable credited recording or movement.", "Morna: investigate cabo verde song tradition; assess each song rather than assigning automatic sadness.", "Sevdalinka: investigate traditional urban song; verify text before describing its narrative.", "Indonesian homemade-instrument experimentation: investigate research extended voice and built instruments without treating the whole region as one genre.", "Regional radio collage: investigate montage route; reject falsely attributed standalone songs.", "Ceremonial street-recording archives: investigate use only suitable credited material with its context intact."];
let freshCrateLens="";
// Persist only cue IDs. Exhaust a shuffled pool before recycling it.
function nextDiscoveryCue(values,key){
 let used=[];
 try{const saved=JSON.parse(stored(key)||"[]");if(Array.isArray(saved))used=[...new Set(saved.filter(n=>Number.isInteger(n)&&n>=0&&n<values.length))]}catch(e){}
 if(used.length>=values.length)used=used.slice(-1);
 const available=values.map((_,i)=>i).filter(i=>!used.includes(i));
 let pick=0;
 if(typeof crypto!=="undefined"&&typeof crypto.getRandomValues==="function"){
  const n=new Uint32Array(1);crypto.getRandomValues(n);pick=n[0]%available.length;
 }
 const chosen=available[pick];store(key,JSON.stringify([...used,chosen]));return values[chosen];
}
function nextFreshCrateLens(){return nextDiscoveryCue(freshCrateLenses,"ghg-crate-routes-v2")}
const moodInterpretations={"happy":["communal celebration","mischievous play","quiet private contentment","relief after hardship","romantic buoyancy","ecstatic release"],"angry":["cold contempt","righteous protest","simmering resentment","betrayed intimacy","defiant solidarity","explosive catharsis"],"sad":["homesickness","grief","resignation","heartbreak","lonely urban drift","bittersweet acceptance"],"weird":["unstable tuning","interlocking or asymmetric time","surreal storytelling","homemade sound sources","radically edited form","uncanny restraint"],"criminal":["heists and criminal ingenuity","smuggling routes","fugitives and evasion","betrayal inside criminal networks","prison escapes","underworld codes and loyalty","criminal bravado and its consequences"]};
let moodAngle="";
function moodDiscoveryBrief(mood){
 if(!moodInterpretations[mood])return "";
 return moodAngle?"\nMood angle: "+moodAngle+". Optional thread only; vary subjects and regions across the set.":"";
}

/* Real entropy from independently combined creative cues, not a hard-coded artist roster.
   Store only recent cue IDs; no music history or account data is recorded. */
const crateSparkWords=[
 ["papery handclaps","elastic low end","hollow percussion","unsteady guitar","dubbed-out space","wiry organ","hushed harmonies","brittle synths","rough-edged strings","shifting drum accents"],
 ["at the night ferry","under an empty arcade","beneath rain-streaked windows","past a deserted ballroom","through a late-night radio","inside a faded cinema","on a slow mountain bus","after the last dance","beside an old tape machine","at a half-lit market"],
 ["longing with momentum","tension that never quite breaks","playful rhythmic friction","melodies that take a wrong turn","a groove that keeps changing shape","warmth in an unlikely place","subtle call-and-response","an eerie but inviting pulse","room for sudden silence","voices just out of alignment"]
];
let crateSparkPhrase="";
function nextCrateSparkPhrase(){
 const key="ghg-crate-sparks-v1",size=1000;
 let recent=[];
 try{const saved=JSON.parse(stored(key)||"[]");if(Array.isArray(saved))recent=saved.filter(n=>Number.isInteger(n)&&n>=0&&n<size).slice(0,3)}catch(e){}
 const options=Array.from({length:size},(_,i)=>i).filter(i=>!recent.includes(i));
 let pick;
 if(typeof crypto!=="undefined"&&typeof crypto.getRandomValues==="function"){
  const a=new Uint32Array(1);crypto.getRandomValues(a);pick=options[a[0]%options.length];
 }else{
  const n=Number(stored("ghg-crate-spark-cycle-v1"))||0;
  pick=options[Math.abs(Math.trunc(n))%options.length];
  store("ghg-crate-spark-cycle-v1",String(n+1));
 }
 store(key,JSON.stringify([pick,...recent].slice(0,3)));
 return crateSparkWords[0][pick%10]+" / "+crateSparkWords[1][Math.floor(pick/10)%10]+" / "+crateSparkWords[2][Math.floor(pick/100)%10];
}
// The skill owns curation policy; GO sends only current creative inputs and service.
function goPrompt(ai,service,mood){
 const parts=[goCommand(ai,service,mood),"Curate 12 verified deep cuts using the installed skill; sequence for audible cohesion."];
 if(mood==="criminal")parts.push("Criminal: explicit song-level crime narratives; strongly prefer non-English vocals.");
 if(crateSelected.size)parts.push(crateRegionPrompt());
 const brief=moodDiscoveryBrief(mood);if(brief)parts.push(brief.trim());
 if(tempo)parts.push("Tempo preference: "+tempoNames[tempo]+".");
 if(freshCrateLens)parts.push("Fresh-crate discovery lens: "+freshCrateLens);
 if(crateSparkPhrase)parts.push("Random crate spark: "+crateSparkPhrase+".");
 if(ai==="gemini"&&service==="youtube")parts.push("Service: YouTube Music. Create one playlist if the connected app permits; report what actually happened.");
 else if(ai==="chatgpt"&&service==="spotify")parts.push("Resolve exact Spotify tracks, publish if authorized; verify saved count and order when readable.");
 else if(ai==="chatgpt"&&service==="apple")parts.push("Use the connected Apple Music playlist widget and Create playlist in Apple Music save control when offered; distinguish ready to save from saved.");
 else if(ai==="gemini"&&service==="spotify")parts.push("Gemini Spotify supports search/playback, not playlist creation; provide the verified ordered crate.");
 else parts.push("Service: "+serviceNames[service]+". Publish only with an authorized writer; otherwise preserve the verified crate.");
 return parts.join("\n");
}
const crateRegions=[{"id":"us-west","label":"US West","continent":"americas-north"},{"id":"us-east","label":"US East","continent":"americas-north"},{"id":"canada-west","label":"Canada West","continent":"americas-north"},{"id":"canada-east","label":"Canada East","continent":"americas-north"},{"id":"mexico","label":"Mexico","continent":"americas-north"},{"id":"central-america","label":"Central America","continent":"americas-north"},{"id":"caribbean","label":"Caribbean","continent":"americas-north"},{"id":"northern-south-america","label":"Northern South America","continent":"americas-south"},{"id":"southern-south-america","label":"Southern South America","continent":"americas-south"},{"id":"atlantic-europe","label":"Atlantic & Western Europe","continent":"europe"},{"id":"mediterranean-europe","label":"Mediterranean & Balkans","continent":"europe"},{"id":"northern-europe","label":"Northern Europe","continent":"europe"},{"id":"eastern-europe","label":"Eastern Europe","continent":"europe"},{"id":"north-africa","label":"North Africa","continent":"africa"},{"id":"west-africa","label":"West Africa","continent":"africa"},{"id":"east-africa","label":"East Africa","continent":"africa"},{"id":"central-southern-africa","label":"Central & Southern Africa","continent":"africa"},{"id":"middle-east","label":"Middle East & Caucasus","continent":"asia"},{"id":"central-asia","label":"Central Asia","continent":"asia"},{"id":"south-asia","label":"South Asia","continent":"asia"},{"id":"east-asia","label":"East Asia","continent":"asia"},{"id":"southeast-asia","label":"Southeast Asia","continent":"asia"},{"id":"northern-asia","label":"Northern Asia","continent":"asia"},{"id":"oceania","label":"Oceania","continent":"oceania"}];
const crateContinents=[{"id":"americas-north","label":"N. America"},{"id":"americas-south","label":"S. America"},{"id":"europe","label":"Europe"},{"id":"africa","label":"Africa"},{"id":"asia","label":"Asia"},{"id":"oceania","label":"Oceania"}];
const atlasViews={"world":[0,0,720,372],"americas-north":[7,16,302,220],"americas-south":[162,186,180,181],"europe":[290,3,222,199],"africa":[304,128,190,231],"asia":[408,2,312,280],"oceania":[551,203,189,169]};
const atlasNames={"americas-north":"N. America","americas-south":"S. America","europe":"Europe","africa":"Africa","asia":"Asia","oceania":"Oceania"};
let atlasFocus=null, atlasZoomFrame=0;
let atlasUserNavigated=false, atlasTouchGesture=null, atlasSuppressTapUntil=0;
let lastCrateStamp=null;
const atlasStampNodes=new Map();
let atlasNavigationFrame=0,atlasPendingView=null;
const crateStorageKey="ghg-crate-map-regions-v1";
const validCrateRegions=new Set(crateRegions.map(r=>r.id));
function readCrateRegions(){
 try{
  const raw=JSON.parse(stored(crateStorageKey)||"[]");
  if(!Array.isArray(raw))return new Set();
  const selected=new Set();
  const migration={"north-america":["us-west","us-east","canada-west","canada-east"],"mexico-central":["mexico","central-america"]};
  for(const id of raw){
   const children=migration[id]||[id];
   for(const child of children)if(validCrateRegions.has(child))selected.add(child);
  }
  return selected;
 }catch(e){return new Set()}
}
let crateSelected=readCrateRegions();
function crateRegionPrompt(){
 if(!crateSelected.size)return "";
 const all=[];
 for(const group of crateContinents){
  const members=crateRegions.filter(r=>r.continent===group.id);
  if(group.id!=="americas-north"&&members.every(r=>crateSelected.has(r.id))){all.push(group.label);continue}
  for(const r of members)if(crateSelected.has(r.id))all.push(r.label);
 }
 return "Regional exploration: "+all.join(", ")+". Explore these scenes first, not as track quotas; other cultures can bridge the sound.";
}
function atlasBoxText(a){return a.map(v=>Math.round(v*10)/10).join(" ")}
function animateAtlasView(view){
 flushAtlasNavigation();
 const map=doc.getElementById("crateAtlasMap");if(!map)return;
 const goal=atlasViews[view||"world"]||atlasViews.world,raw=map.getAttribute("viewBox")||"0 0 720 372";
 const from=raw.split(/\s+/).map(Number);
 if(atlasZoomFrame&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(atlasZoomFrame);
 const reduced=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(typeof requestAnimationFrame!=="function"||reduced||from.length!==4||from.some(n=>!Number.isFinite(n))){map.setAttribute("viewBox",atlasBoxText(goal));return;}
 let started=null;
 const frame=time=>{
  if(started===null)started=time;
  const t=Math.min(1,(time-started)/300),e=1-Math.pow(1-t,3);
  map.setAttribute("viewBox",atlasBoxText(goal.map((v,i)=>from[i]+(v-from[i])*e)));
  if(t<1)atlasZoomFrame=requestAnimationFrame(frame);else atlasZoomFrame=0;
 };
 atlasZoomFrame=requestAnimationFrame(frame);
}
function focusCrateContinent(id){
 atlasFocus=id===atlasFocus?null:id;
 atlasUserNavigated=false;
 renderCrateMap();animateAtlasView(atlasFocus);
}
function toggleCrateRegion(id){
 if(!validCrateRegions.has(id))return;
 const added=!crateSelected.has(id);
 if(added)crateSelected.add(id);else crateSelected.delete(id);
 lastCrateStamp=added?id:null;
 updateCrateMap();
}
const crateStampNames={"us-west":"US W","us-east":"US E","canada-west":"CAN W","canada-east":"CAN E","mexico":"MEX","central-america":"CENT AM","caribbean":"CARIB","northern-south-america":"N S AM","southern-south-america":"S S AM","atlantic-europe":"W EUR","mediterranean-europe":"MED / BALK","northern-europe":"N EUR","eastern-europe":"E EUR","north-africa":"N AFR","west-africa":"W AFR","east-africa":"E AFR","central-southern-africa":"C / S AFR","middle-east":"MID EAST","central-asia":"C ASIA","south-asia":"S ASIA","east-asia":"E ASIA","southeast-asia":"SE ASIA","northern-asia":"N ASIA","oceania":"OCEANIA"};
function renderCrateMap(){
 const focused=Boolean(atlasFocus);
 doc.querySelectorAll("[data-crate-region]").forEach(b=>{
  b.hidden=!focused||b.dataset.continent!==atlasFocus;
  b.setAttribute("aria-pressed",String(crateSelected.has(b.dataset.crateRegion)));
 });
 doc.querySelectorAll("[data-crate-continent]").forEach(b=>b.setAttribute("aria-pressed",String(atlasFocus===b.dataset.crateContinent)));
 doc.querySelectorAll("[data-atlas-zone]").forEach(z=>z.setAttribute("data-selected",String(crateSelected.has(z.dataset.atlasZone))));
 doc.querySelectorAll("[data-atlas-country]").forEach(path=>{
  path.setAttribute("data-inked",String(crateSelected.has(path.dataset.atlasRegion)));
 });
 const st=doc.getElementById("crateGeoStatus");
 const selectionStatus=crateSelected.size?crateSelected.size+" region"+(crateSelected.size===1?"":"s")+" selected. Tap a stamp to remove a region.":"No regions selected. All areas are available.";
 if(st&&st.textContent!==selectionStatus)st.textContent=selectionStatus;
 renderAtlasNavigation();
 renderCrateStamps();
}
function renderAtlasNavigation(){
 const focused=Boolean(atlasFocus),panel=doc.getElementById("crateGeo");
 if(panel)panel.setAttribute("data-focus",String(focused||atlasUserNavigated));
 const loc=doc.getElementById("atlasLocator");
 if(loc)loc.textContent=focused?"LISTENING MAP / "+atlasNames[atlasFocus]:"LISTENING MAP · 24 REGIONS";
 const home=doc.getElementById("atlasHome");if(home)home.hidden=!(focused||atlasUserNavigated);
 const hint=doc.getElementById("atlasInstruction");
 if(hint){
  const desktop=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(pointer: fine)").matches;
  const action=focused?"TAP TO INK / UNINK":"TAP LAND TO EXPLORE";
  hint.textContent=action+(desktop?" · SHIFT + SCROLL TO PAN · PINCH TO ZOOM":" · TWO FINGERS TO PAN / PINCH");
 }
}
function renderCrateStamps(){
 const passport=doc.getElementById("atlasPassport");if(passport)passport.hidden=!crateSelected.size;
 const holder=doc.getElementById("atlasStamps");
 if(holder){
  const activeId=doc.activeElement?.dataset?.crateStampRegion;
  const previousIds=Array.from(holder.children,node=>node.dataset.crateStampRegion);
  for(const [id,node] of atlasStampNodes){
   if(!crateSelected.has(id)){node.remove();atlasStampNodes.delete(id)}
  }
  let index=0;
  for(const reg of crateRegions){
   if(!crateSelected.has(reg.id))continue;
   let stamp=atlasStampNodes.get(reg.id);
   if(!stamp){
    stamp=doc.createElement("button");stamp.type="button";
    stamp.dataset.crateStampRegion=reg.id;
    stamp.className="crate-stamp";
    stamp.setAttribute("aria-label","Remove "+reg.label+" from listening regions");
    stamp.setAttribute("title",reg.label+" — tap to remove");
    const strong=doc.createElement("strong");strong.textContent=crateStampNames[reg.id]||reg.label;
    const x=doc.createElement("span");x.className="crate-stamp-x";x.setAttribute("aria-hidden","true");x.textContent="×";
    stamp.append(strong,x);stamp.addEventListener("click",()=>toggleCrateRegion(reg.id));
    atlasStampNodes.set(reg.id,stamp);
   }
   stamp.classList.toggle("is-new",reg.id===lastCrateStamp);
   if(holder.children[index]!==stamp)holder.insertBefore(stamp,holder.children[index]||null);
   index++;
  }
  if(activeId&&!crateSelected.has(activeId)){
   const remaining=crateRegions.filter(reg=>crateSelected.has(reg.id));
   const next=remaining[Math.min(previousIds.indexOf(activeId),remaining.length-1)];
   const target=next?atlasStampNodes.get(next.id):doc.getElementById("atlasNamedRegions");
   if(target){const summary=next?target:target.querySelector("summary");if(summary)summary.focus({preventScroll:true})}
  }
 }
 lastCrateStamp=null;
}
function updateCrateMap(){
 store(crateStorageKey,JSON.stringify([...crateSelected]));
 copiedPrompt=null;selectionChanged();
}
const params=new URLSearchParams(location.search);
const isLegacyGemini=location.pathname.startsWith("/gemini/");
let ai=(params.get("ai")||(isLegacyGemini?"gemini":stored("hmg-ai"))||"chatgpt").toLowerCase();
if(!defaultService[ai])ai="chatgpt";
let service=(params.get("service")||(isLegacyGemini?"youtube":stored("hmg-service"))||defaultService[ai]).toLowerCase();
if(!serviceNames[service])service=defaultService[ai];
let mood=(params.get("mood")||"go").toLowerCase();if(!moods.has(mood))mood="go";
let tempo=params.get("tempo")||"";if(!Object.hasOwn(tempoNames,tempo))tempo="";
// One GO is the complete curation and authorized publishing request.
function updateHandoff(){
 const ready=copiedPrompt===goPrompt(ai,service,mood);
 const button=doc.getElementById("goButton");
 const state=button&&button.disabled?"copying":ready?"copied":"idle";
 if(button)button.setAttribute("data-copy-state",state);
 const receipt=doc.getElementById("promptReceipt"),mark=doc.getElementById("receiptCopy");
 if(receipt)receipt.setAttribute("data-copy-state",state);
 if(mark)mark.textContent=state==="copied"?"COPIED TO CLIPBOARD":state==="copying"?"COPYING…":"REQUEST DRAFT";
 for(const id of ["openAi","browserAi"]){const a=doc.getElementById(id);if(a)a.setAttribute("aria-disabled",String(!ready))}
 const a=doc.getElementById("openAi");if(a)a.textContent=ready?"NEXT: OPEN "+aiNames[ai].toUpperCase():"COPY WITH GO FIRST";
}
function selectionChanged(){
 moodAngle="";
 render();
 if(body.dataset.page==="launch")status("Prompt changed. Press GO to copy the current selection.");
 else status("Selection updated. Copy the setup check above.");
 const tip=doc.getElementById("setupTipStatus");if(tip)tip.textContent="";
}
function renderSelections(){
 doc.querySelectorAll("[data-ai]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ai===ai)));
 doc.querySelectorAll("[data-service]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.service===service)));
 const pair=doc.getElementById("dealerPair");if(pair)pair.textContent=aiNames[ai]+" · "+serviceNames[service];
 const info=routeInfo(ai,service),r=doc.getElementById("routeStatus");
 if(r){const span=r.querySelector("span");if(span)span.textContent=info.message;r.classList.toggle("warn",info.tone==="warn")}
 const setupText=doc.getElementById("setupPromptText");if(setupText)setupText.textContent=setupPrompt(ai,service);
 const setupCopy=doc.getElementById("stripSetupPrompt");if(setupCopy)setupCopy.textContent="COPY SETUP · "+aiNames[ai]+" + "+serviceNames[service];
 const setupOpen=doc.getElementById("openSetupAi");if(setupOpen){setupOpen.href=destinations[ai];setupOpen.textContent="OPEN "+aiNames[ai].toUpperCase()}
 store("hmg-ai",ai);store("hmg-service",service);
}
function setupLinks(parent,items){
 parent.replaceChildren();
 for(const item of items){const a=doc.createElement("a");a.className="resource";a.href=item.url;a.target="_blank";a.rel="noopener";a.textContent="↗ "+item.name;parent.append(a)}
}
function renderSetup(){
 renderSelections();
 const q=routeInfo(ai,service);
 const intro=doc.getElementById("recipeIntro"),steps=doc.getElementById("recipeSteps"),links=doc.getElementById("recipeResources");
 if(!intro||!steps||!links)return;
 intro.textContent="YOUR MIX: "+aiNames[ai]+" × "+serviceNames[service]+". Copy the check, then paste and send it in your AI. It will check what’s missing. Already set up? Back to the Jukebox. We won’t make a ceremony of it.";
 let install="",connection="";
 if(ai==="chatgpt")install="In ChatGPT, select Go, Hipster, Go!. If missing, install/load it using the project source or app directory.";
 else if(ai==="gemini")install="In Gemini, choose Task mode beneath the prompt box, then paste and send the setup check. Ask it to install the Gemini-specific Skill from the latest release. This is a one-time installation task, not a recurring task.";
 else install="In Claude Customize, install Go, Hipster, Go!. Use the Skill ZIP for Skills, or the Plugin ZIP for Plugins; they are not interchangeable.";
 if(service==="spotify"&&ai==="gemini")connection="On Gemini mobile, link Spotify if offered. Google's connected app supports search/play, not playlist creation.";
 else if(service==="spotify"&&ai==="claude")connection="Connect Spotify in Claude. Premium is required for personalized prompted playlists; inspect whether saving is supported here.";
 else if(service==="spotify")connection="In ChatGPT, connect and select Spotify in the same conversation as Go, Hipster, Go!.";
 else if(service==="youtube"&&ai==="gemini")connection="Connect YouTube Music if available. Plain GO curates and attempts one playlist; if no writer is accessible, the Skill should return the crate and explain what failed.";
 else if(service==="apple"&&ai==="claude")connection="Connect an Apple Music MCP connector compatible with your Claude app: local on Desktop, hosted for web/mobile. Verify it can find recordings, create playlists and add tracks.";
 else if(service==="apple"&&ai==="chatgpt")connection="In ChatGPT Settings → Apps, connect Apple Music and select it alongside Go, Hipster, Go! in your conversation. Search and playlist generation do not require a subscription. Saving the result to your library requires an Apple Music subscription.";
 else connection="Check whether "+serviceNames[service]+" is available as a connected writer in "+aiNames[ai]+". If not, use a text playlist instead.";
 let fallback="Use the selected platform’s download links below and its installation instructions. Keep the setup check handy.";
 if(ai==="gemini"){
  fallback="Open Gemini desktop or mobile WEB → Customize → Skills → Create → Upload. Use the Gemini Skill ZIP below. The native Gemini app does not offer ZIP upload.";
 }else if(ai==="claude")fallback="Match the download to the uploader: Skill ZIP for Skills, Plugin ZIP for Plugins. The labels are doing useful work here.";
 const confirmation=ai==="gemini"?"Check that v3.6.3 is installed as a persistent Skill in a new conversation. Reading the files once does not count. Then return to the Jukebox and press GO.":"Run the setup check above. When your AI confirms the skill and music connection are ready, return to the Jukebox and press GO.";
 const stepsText=["Try this: "+install,"If it fails: "+fallback,"Connect your music: "+connection,"Confirm it worked: "+confirmation];
 if(ai==="chatgpt"&&service==="apple")stepsText.push("After GO, use Create playlist in Apple Music if the playlist widget offers it. Until you complete that save step, the playlist is ready to save, not saved.");
 steps.replaceChildren();for(const text of stepsText){const li=doc.createElement("li");li.textContent=text;steps.append(li)}
 setupLinks(links,resourceInfo[ai]);
 const caveat=doc.getElementById("recipeCaveat");if(caveat)caveat.textContent=q.note;
 const setupReady=copiedPrompt===setupPrompt(ai,service);
 const copyButton=doc.getElementById("copyTailoredSetup");if(copyButton){copyButton.setAttribute("data-copy-state",copyButton.disabled?"copying":setupReady?"copied":"idle");copyButton.textContent=copyButton.disabled?"COPYING…":setupReady?"COPIED — COPY AGAIN":"COPY MY SETUP PROMPT"}
 const target=doc.getElementById("openSelectedAi");if(target){target.href=destinations[ai];target.textContent=(setupReady?"NEXT: OPEN ":"OPEN ")+aiNames[ai].toUpperCase();target.setAttribute("data-copy-ready",String(setupReady))}
 const tryFirst=doc.getElementById("trySetupPrompt");if(tryFirst)tryFirst.dataset.readyPair=ai+":"+service;
}
function renderLaunch(){
 renderSelections();
 renderCrateMap();
 const slider=doc.getElementById("tempoSlider"),tempoValue=doc.getElementById("tempoValue"),anyTempo=doc.getElementById("anyTempo");
 if(slider){slider.value=tempo?tempoSteps.indexOf(tempo)+1:3;slider.setAttribute("aria-valuetext",tempo?tempoNames[tempo]:"Any tempo — no pace preference")}
 const tempoControl=doc.getElementById("tempoControl");if(tempoControl)tempoControl.setAttribute("data-tempo",tempo||"any");
 if(tempoValue)tempoValue.textContent=tempo?tempoNames[tempo]:"Any tempo";
 const tempoSummary=doc.getElementById("tempoSummary");if(tempoSummary)tempoSummary.textContent=tempo?tempoNames[tempo]:"Any tempo";
 const tempoHelp=doc.getElementById("tempoHelp");if(tempoHelp)tempoHelp.textContent=tempo?"Move the fader or choose Any tempo to clear this preference. Your mood stays selected.":"Any is on. Move the fader to choose a pace.";
 if(anyTempo)anyTempo.setAttribute("aria-pressed",String(!tempo));
 doc.querySelectorAll("[data-mood]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mood===mood)));
 const clerkNotes={happy:"Optimism. An ambitious brief.",angry:"For when everyone else is obviously the problem.",sad:"Melancholy. Filed under essential listening.",weird:"The neighbors may have questions."};
 const moodHelp=doc.getElementById("moodHelp");if(moodHelp)moodHelp.textContent=mood==="criminal"?"Songs about crime. Artist reputations are not evidence. Tap Criminal again to clear.":mood==="go"?"No mood? We’ll use our judgment.":mood[0].toUpperCase()+mood.slice(1)+" selected. "+clerkNotes[mood]+" Tap it again to clear.";
 const e={prompt:doc.getElementById("prompt"),mood:doc.getElementById("moodName"),code:doc.getElementById("receiptCode"),open:doc.getElementById("openAi"),browser:doc.getElementById("browserAi")};
 if(!e.prompt)return;
 e.prompt.textContent=goPrompt(ai,service,mood);
 e.mood.textContent=mood==="go"?"SURPRISE":mood.toUpperCase();
 e.code.textContent=(ai==="chatgpt"?"CG":ai==="gemini"?"GM":"CL")+"-"+mood.slice(0,3).toUpperCase()+"-01";
 e.open.href=ai==="gemini"?geminiIntent:destinations[ai];e.open.textContent="↗ OPEN "+aiNames[ai].toUpperCase();
 const summary=doc.getElementById("receiptSummary");if(summary)summary.textContent=aiNames[ai]+" · "+serviceNames[service]+" · "+(mood==="go"?"Surprise":mood[0].toUpperCase()+mood.slice(1))+(tempo?" · "+tempoNames[tempo]:"")+" · 12 tracks";
 const hint=doc.getElementById("goHint");if(hint)hint.textContent="Copy "+(mood==="go"?"surprise":mood)+" prompt · 12 tracks";
 const goButton=doc.getElementById("goButton");if(goButton)goButton.setAttribute("aria-label","GO! Copy "+(mood==="go"?"surprise":mood)+" playlist prompt");
 const manual=doc.getElementById("manualOpenAi");if(manual){manual.href=destinations[ai];manual.textContent="I COPIED IT MANUALLY — OPEN "+aiNames[ai].toUpperCase()}
 updateHandoff();
 e.browser.hidden=ai!=="gemini";e.browser.href=destinations[ai];e.browser.textContent="open "+aiNames[ai]+" in browser";
 const u=new URL(location.href);u.searchParams.set("ai",ai);u.searchParams.set("service",service);
 if(mood==="go")u.searchParams.delete("mood");else u.searchParams.set("mood",mood);
 if(tempo)u.searchParams.set("tempo",tempo);else u.searchParams.delete("tempo");
 u.searchParams.delete("mode");
 history.replaceState(null,"",u.pathname+u.search);
}
function render(){if(body.dataset.page==="launch")renderLaunch();else renderSetup()}
doc.querySelectorAll("[data-ai]").forEach(b=>b.addEventListener("click",()=>{
 ai=b.dataset.ai;copiedPrompt=null;selectionChanged();
}));
doc.querySelectorAll("[data-service]").forEach(b=>b.addEventListener("click",()=>{
 service=b.dataset.service;copiedPrompt=null;selectionChanged();
}));
doc.querySelectorAll("[data-setup]").forEach(b=>b.addEventListener("click",async()=>{
 copiedPrompt=null;if(body.dataset.page==="setup")renderSetup();
 const prompt=b.dataset.setup==="universal"?universalPrompt:setupPrompt(ai,service);
 status(await copyText(prompt)?"Installation prompt copied. Paste into your chosen AI.":"Clipboard blocked; please copy the instructions manually.");
}));
async function copyFirstSetup(){
 copiedPrompt=null;if(body.dataset.page==="launch")updateHandoff();
 const ok=await copyText(setupPrompt(ai,service));
 const details=doc.getElementById("setupPromptDetails");if(!ok&&details)details.open=true;
 const msg=ok?"Setup check copied for "+aiNames[ai]+" + "+serviceNames[service]+". Open that AI, paste and send.":"Clipboard unavailable. Copy the setup prompt shown below, then open your AI.";
 const tip=doc.getElementById("setupTipStatus"),setupTip=doc.getElementById("setupTryStatus");
 if(tip)tip.textContent=msg;
 if(setupTip)setupTip.textContent=msg;
 if(body.dataset.page!=="launch")status(msg);
 else status("Setup check selected. For a playlist, press GO to copy your music prompt.");
}
for(const id of ["quickSetupPrompt","stripSetupPrompt","trySetupPrompt"]){
 const b=doc.getElementById(id);if(b)b.addEventListener("click",copyFirstSetup);
}
const copyTailored=doc.getElementById("copyTailoredSetup");
if(copyTailored)copyTailored.addEventListener("click",async()=>{
 if(copyTailored.disabled)return;
 const prompt=setupPrompt(ai,service);copiedPrompt=null;copyTailored.disabled=true;copyTailored.setAttribute("aria-busy","true");renderSetup();status("Copying your setup prompt…");
 const ok=await copyText(prompt);
 copyTailored.disabled=false;copyTailored.setAttribute("aria-busy","false");copiedPrompt=ok?prompt:null;renderSetup();
 if(prompt!==setupPrompt(ai,service)){status("Selection changed while copying. Copy the current setup prompt again.");return}
 if(ok)status("Copied. Open "+aiNames[ai]+", paste and send your setup check.");
 else{const details=doc.getElementById("setupPromptDetails");if(details)details.open=true;status("Clipboard unavailable. Copy the setup prompt below, then open your AI.")}
});
if(body.dataset.page!=="launch"){render();return}
// Keep the existing dismissal key so returning visitors are not asked again.
const welcome=doc.getElementById("welcomeSetup");
if(welcome){
 welcome.hidden=Boolean(stored("hmg-setup-first-tip-dismissed-v3"));
 const close=doc.getElementById("dismissWelcome");
 if(close)close.addEventListener("click",()=>{
  welcome.hidden=true;store("hmg-setup-first-tip-dismissed-v3","yes");
  const next=doc.getElementById("aiLabel");if(next)next.focus();
 });
}
async function copyGo(){
 const button=doc.getElementById("goButton");
 if(button&&button.disabled)return;
 // Each GO explores a different lane; preview and copied request stay identical.
 moodAngle=moodInterpretations[mood]?nextDiscoveryCue(moodInterpretations[mood],"ghg-mood-angles-v1-"+mood):"";freshCrateLens=nextFreshCrateLens();crateSparkPhrase=nextCrateSparkPhrase();renderLaunch();
 const prompt=goPrompt(ai,service,mood);
 if(button){button.disabled=true;button.setAttribute("aria-busy","true");button.setAttribute("data-copy-state","copying")}
 copiedPrompt=null;updateHandoff();
 status("Copying your prompt…");
 const ok=await copyText(prompt);
 if(button){button.disabled=false;button.setAttribute("aria-busy","false")}
 copiedPrompt=ok?prompt:null;updateHandoff();
 if(prompt!==goPrompt(ai,service,mood)){status("Selection changed while copying. Press GO again for the current prompt.");return}
 if(ok)store("ghg-jukebox-used-v1","yes");
 if(ok)status(ai==="gemini"&&service==="youtube"?"GO copied. Open Gemini and select Go, Hipster, Go!. It should curate the crate and attempt one YouTube Music playlist; check the actual result.":"Copied. Open "+aiNames[ai]+", paste and send. Select your skill and music app if needed. The clerk has finished the paperwork.");
 else{const details=doc.getElementById("promptDetails");if(details)details.open=true;status("Clipboard blocked. Copy the full prompt in the receipt below, then use its manual Open link.")}
}
doc.querySelectorAll("[data-mood]").forEach(b=>b.addEventListener("click",()=>{
 mood=mood===b.dataset.mood?"go":b.dataset.mood;copiedPrompt=null;selectionChanged();
}));
doc.querySelectorAll("[data-crate-region]").forEach(b=>{
 b.addEventListener("click",()=>toggleCrateRegion(b.dataset.crateRegion));
});

/* Direct map manipulation: two fingertips move/pinch the atlas; a single finger
   still scrolls the Jukebox. Desktop trackpads can scroll/pinch inside the map. */
function atlasView(){const map=doc.getElementById("crateAtlasMap");return (map?.getAttribute("viewBox")||"0 0 720 372").trim().split(/\s+/).map(Number)}
function flushAtlasNavigation(){
 if(atlasNavigationFrame&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(atlasNavigationFrame);
 atlasNavigationFrame=0;
 if(atlasPendingView){doc.getElementById("crateAtlasMap")?.setAttribute("viewBox",atlasBoxText(atlasPendingView));atlasPendingView=null}
}
function queueAtlasNavigation(view){
 atlasPendingView=view;
 if(typeof requestAnimationFrame!=="function"){flushAtlasNavigation();return}
 if(!atlasNavigationFrame)atlasNavigationFrame=requestAnimationFrame(()=>{
  atlasNavigationFrame=0;
  if(atlasPendingView){doc.getElementById("crateAtlasMap")?.setAttribute("viewBox",atlasBoxText(atlasPendingView));atlasPendingView=null}
 });
}
function atlasGesturePoints(touches){
 const a=touches[0],b=touches[1];
 return {x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2,
         distance:Math.max(1,Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY))}
}
function atlasScreenAnchor(map,view,x,y,rect){
 const scale=Math.min(rect.width/view[2],rect.height/view[3]);
 const marginX=(rect.width-view[2]*scale)/2,marginY=(rect.height-view[3]*scale)/2;
 return [view[0]+(x-rect.left-marginX)/scale,view[1]+(y-rect.top-marginY)/scale];
}
function atlasConstrain(view){
 const [x,y,w,h]=view;
 return [Math.min(720-w+12,Math.max(-12,x)),Math.min(372-h+12,Math.max(-12,y)),w,h];
}
function atlasViewForGesture(base,anchor,screen,rect,zoom){
 const ratio=Math.max(Math.max(48/base[2],40/base[3]),Math.min(Math.min(720/base[2],372/base[3]),zoom));
 const width=base[2]*ratio,height=base[3]*ratio;
 const scale=Math.min(rect.width/width,rect.height/height);
 const padX=(rect.width-width*scale)/2,padY=(rect.height-height*scale)/2;
 return atlasConstrain([anchor[0]-(screen.x-rect.left-padX)/scale,anchor[1]-(screen.y-rect.top-padY)/scale,width,height]);
}
function atlasBindGestures(){
 const map=doc.getElementById("crateAtlasMap");if(!map)return;
 const stopZoom=()=>{
  if(atlasZoomFrame&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(atlasZoomFrame);
  atlasZoomFrame=0;
 };
 // Freeze the geometry under a new press, rather than moving the target
 // between pointer-down and click while a continent zoom is still running.
 map.addEventListener("pointerdown",()=>{stopZoom();flushAtlasNavigation()});
 map.addEventListener("touchstart",event=>{
  if(event.touches.length===1&&!atlasTouchGesture){
   stopZoom();flushAtlasNavigation();atlasSuppressTapUntil=0;
   return;
  }
  if(event.touches.length!==2){if(event.touches.length>2)atlasTouchGesture=null;return;}
  flushAtlasNavigation();
  const view=atlasView(),screen=atlasGesturePoints(event.touches),rect=map.getBoundingClientRect();
  if(atlasZoomFrame&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(atlasZoomFrame);
  atlasZoomFrame=0;
  atlasTouchGesture={view,anchor:atlasScreenAnchor(map,view,screen.x,screen.y,rect),distance:screen.distance,rect};
  atlasSuppressTapUntil=Date.now()+700;
 },{passive:true});
 map.addEventListener("touchmove",event=>{
  if(!atlasTouchGesture||event.touches.length!==2)return;
  if(event.cancelable)event.preventDefault();
  const screen=atlasGesturePoints(event.touches),s=atlasTouchGesture;
  const view=atlasViewForGesture(s.view,s.anchor,screen,s.rect,s.distance/screen.distance);
  queueAtlasNavigation(view);
  atlasUserNavigated=true;
  atlasSuppressTapUntil=Date.now()+700;
 },{passive:false});
 const end=event=>{
  if(!atlasTouchGesture||event.touches.length>=2)return;
  atlasTouchGesture=null;atlasSuppressTapUntil=Date.now()+700;
  flushAtlasNavigation();renderAtlasNavigation();
 };
 map.addEventListener("touchend",end,{passive:true});
 map.addEventListener("touchcancel",end,{passive:true});
 map.addEventListener("wheel",event=>{
  // Ordinary wheel/trackpad scrolling belongs to the page. Deliberate modifiers
  // pan the map (Shift) or zoom it (trackpad pinch / Ctrl / Command).
  if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey)return;
  if(event.cancelable)event.preventDefault();
  if(atlasZoomFrame&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(atlasZoomFrame);
  atlasZoomFrame=0;
  const view=atlasPendingView||atlasView(),rect=map.getBoundingClientRect();
  const center={x:event.clientX,y:event.clientY};
  const anchor=atlasScreenAnchor(map,view,center.x,center.y,rect);
  let result;
  if(event.ctrlKey||event.metaKey){
   const factor=Math.exp(Math.max(-100,Math.min(100,event.deltaY))*.008);
   result=atlasViewForGesture(view,anchor,center,rect,factor);
  }else{
   const scale=Math.min(rect.width/view[2],rect.height/view[3]);
   const unit=event.deltaMode===1?16:event.deltaMode===2?rect.height:1;
   result=atlasConstrain([view[0]+event.deltaX*unit/scale,view[1]+event.deltaY*unit/scale,view[2],view[3]]);
  }
  queueAtlasNavigation(result);
  if(!atlasUserNavigated){atlasUserNavigated=true;renderAtlasNavigation()}
  atlasSuppressTapUntil=Date.now()+500;
 },{passive:false});
}

atlasBindGestures();
doc.querySelectorAll("[data-atlas-country]").forEach(path=>{
 path.addEventListener("click",()=>{
  if(atlasTouchGesture||Date.now()<atlasSuppressTapUntil)return;
  const cont=path.dataset.atlasContinent;
  if(!atlasFocus){focusCrateContinent(cont);return}
  // Panning/pinching changes which land is visible, not which land may be
  // selected. A tap on another continent uses its actual painted hit path
  // and updates the named controls without moving the map away from the tap.
  if(validCrateRegions.has(path.dataset.atlasRegion)){
   atlasFocus=cont;
   toggleCrateRegion(path.dataset.atlasRegion);
  }
 });
});
doc.querySelectorAll("[data-crate-continent]").forEach(b=>b.addEventListener("click",()=>focusCrateContinent(b.dataset.crateContinent)));
const atlasHome=doc.getElementById("atlasHome");if(atlasHome)atlasHome.addEventListener("click",()=>{atlasFocus=null;atlasUserNavigated=false;renderCrateMap();animateAtlasView(null)});
const crateClear=doc.getElementById("crateGeoClear");if(crateClear)crateClear.addEventListener("click",()=>{crateSelected.clear();lastCrateStamp=null;updateCrateMap()});
const tempoSlider=doc.getElementById("tempoSlider");
function selectTempo(){tempo=tempoSteps[Number(tempoSlider.value)-1]||"";copiedPrompt=null;selectionChanged()}
if(tempoSlider){
 tempoSlider.addEventListener("input",selectTempo);
 // Pointer and keyboard selection use the same six positions, including Any.
 tempoSlider.addEventListener("pointerup",()=>{if(!tempo)selectTempo()});
 tempoSlider.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();selectTempo()}});
}
const anyTempo=doc.getElementById("anyTempo");
if(anyTempo)anyTempo.addEventListener("click",()=>{tempo="";copiedPrompt=null;selectionChanged()});
const go=doc.getElementById("goButton");if(go)go.addEventListener("click",copyGo);
for(const id of ["openAi","browserAi"]){const a=doc.getElementById(id);if(a)a.addEventListener("click",event=>{
 if(copiedPrompt!==goPrompt(ai,service,mood)){event.preventDefault();status("Press GO to copy the current prompt before opening your AI.")}
})}
const share=doc.getElementById("shareButton");if(share)share.addEventListener("click",async()=>{
 if(!navigator.share){status("No share sheet available. Copy the prompt instead.");return}
 try{await navigator.share({text:goPrompt(ai,service,mood)})}catch(e){if(e.name!=="AbortError")status("Share failed. Copy the prompt instead.")}
});
render();
})();
