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
 if(ai==="chatgpt"&&service==="spotify")return {tone:"ready",message:"ChatGPT + Spotify: playlist creation and exact-track insertion can work when both apps and their writer actions are available.",note:"You still need to select and authorize both apps in ChatGPT; mentioning them in text alone may not activate them."};
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
 const install=ai==="gemini"?"Use Task mode for this one-time repository installation; do not schedule a recurring task. Try the current main SKILL.md and all four referenced files. If the Task agent cannot persist a Skill, tell me to open Gemini in a desktop or mobile WEB BROWSER at gemini.google.com, then Customize → Skills → Create → Upload the latest five-file ZIP. Do not direct me to upload the ZIP inside the native Gemini app.":ai==="claude"?"If missing, identify whether I need Claude's Skills ZIP or Plugins ZIP; they are different.":"If missing, use the available app/skill installation flow or show how to install from the project's GitHub repository.";
 return "FIRST-TIME SETUP CHECK for "+name+" + "+target+".\n"+intro+" "+install+" Source: "+repo+(ai==="gemini"?"\nRead https://github.com/focustimer-dev/go-hipster-go/blob/main/SKILL.md and its four references. Install the current version using actual Gemini Skills capabilities. Verify the loaded skill explicitly reports version 3.6.0 and whether the installation persists into a new conversation. If repository loading only reads instructions but cannot install a persistent Skill, be clear and offer the latest Gemini ZIP upload instead. Do not report installation complete just because the URL was opened.":"")+
 (ai==="chatgpt"&&service==="apple"?"\nConnect Apple Music through ChatGPT Settings → Apps, then select both Apple Music and Go, Hipster, Go! in this conversation. Search and playlist generation do not require an Apple Music subscription; saving to the library does. Recognize the app’s playlist widget and user-operated save control as a supported path, even without a direct playlist-writing tool. Explain Create playlist in Apple Music when that control is offered. Do not require a subscription just to finish discovery setup or assume access to my library or listening history.":"")+
 (ai==="claude"&&service==="apple"?"\nApple Music requires a compatible MCP connector: local for Desktop or hosted for web/mobile. Check which Claude app I use and help me connect it if missing. Verify catalog track search, playlist creation and adding tracks; library-only search may not find new recordings.":"")+
 "\nIf the skill is available, run its setup for "+target+", guide me through connecting or selecting that music service, and CHECK whether playlist creation and adding tracks are actually supported—not just search/playback. Tell me the smallest action needed to finish setup. If everything is already ready, say so and tell me to run go. Do NOT generate a new playlist during this setup check, claim a playlist was saved, or ask me to paste credentials into chat.";
}
const universalPrompt="If using Gemini, choose Task mode beneath the input BEFORE sending this one-time installation request (do not schedule a recurring task). Load Go, Hipster, Go! from "+repo+"/blob/main/SKILL.md and all four referenced music documents. Install it using your supported Skill mechanism and confirm the loaded version is 3.6.0 and whether it persists across Gemini conversations. If reading GitHub does not install it, say so and offer the current Gemini Skill ZIP at "+releases+"go-hipster-go-gemini-app-skill.zip. Upload ZIPs only through Gemini WEB or MOBILE WEB at gemini.google.com, not the native mobile app. Then run setup; do not create a playlist or assume a writer exists.";
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
const moodInterpretations={"happy": ["communal celebration", "mischievous play", "quiet private contentment", "relief after hardship", "romantic buoyancy", "ecstatic release"], "angry": ["cold contempt", "righteous protest", "simmering resentment", "betrayed intimacy", "defiant solidarity", "explosive catharsis"], "sad": ["homesickness", "grief", "resignation", "heartbreak", "lonely urban drift", "bittersweet acceptance"], "weird": ["unstable tuning", "interlocking or asymmetric time", "surreal storytelling", "homemade sound sources", "radically edited form", "uncanny restraint"]};
let moodAngle="";
function moodDiscoveryBrief(mood){
 if(!moodInterpretations[mood])return "";
 return "\n\nMood range: "+moodInterpretations[mood].join("; ")+". "+(moodAngle?"This run’s interpretation: "+moodAngle+". ":"")+"Use the skill’s expanded category index and audible mechanisms. Explore beyond its example artists and familiar compilation staples. Mood is independent of tempo; an unfamiliar language is not itself weird. Avoid recordings from the last up to three visible playlists and prefer different artists, source compilations and dominant scenes; do not claim history access when unavailable. Choose a coherent set, not a genre quota.";
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
const thesis="Curate 12 verified deep-cut recordings around a cohesive sonic thesis. Explore surprising links across scenes, eras, rhythm, voice, production and instrumentation. Keep the transitions listenable, not just clever. Avoid recycled example-artist lists and never invent track matches.";
const criminalBrief="Criminal mood: Build a cohesive playlist of lesser-known criminal and gangster anthems, strongly preferring non-English vocals. Explore narcocorridos; Sicilian mafia songs; Calabrian canti di malavita and the documented 'Ndrangheta repertoire; Russian blatnaya pesnya/blatnyak (thieves' songs, not Russian chanson indiscriminately); crime-focused Brazilian funk proibidao; Greek underworld rebetiko/hasiklidika; gunman-focused early Jamaican dancehall; and relevant scenes across the Caribbean, Africa and Latin America. These are discovery routes, not quotas or a mandatory itinerary. Occasionally use Jamaican Patois dancehall as a more English-accessible change of pace within the strong non-English preference; respect Patois as a distinct language variety and do not assume every listener understands it. Broaden the narratives to heists, smuggling, fugitives, criminal betrayal, prison escapes and criminal codes. Songs may boast, confess, mourn or tell a story; avoid twelve interchangeable tough-guy declarations. Every song must openly concern criminal activity in its lyrics or narrative; a menacing sound, an artist's reputation, imprisonment alone or a place of origin is not enough. Do not treat all baile funk, rebetiko, Russian chanson or tracks on a gunman-named riddim as crime songs. Verify the theme from reliable lyrics or credible song-level sources; skip uncertain matches and do not invent translations. Give a brief English explanation of each song's criminal subject. Favor deep cuts over obvious staples, with no fixed artist roster. Sequence for musical cohesion and breathing room rather than a genre checklist. This theme takes precedence over random discovery lenses and crate sparks; honor the selected tempo.";
function goPrompt(ai,service,mood){
 const moodBrief=mood==="criminal"?"\n\n"+criminalBrief:moodDiscoveryBrief(mood);
 if(ai==="gemini"&&service==="youtube"){
  // Gemini's installed Skill owns the workflow. Only session choices belong in GO.
  return goCommand(ai,service,mood)+"\nService: YouTube Music. Create one playlist if the connected app permits; report what actually happened."+moodBrief+
   (tempo?"\nTempo: "+tempoNames[tempo]+".":"")+
   (freshCrateLens?"\nDiscovery lens: "+freshCrateLens:"")+
   (crateSparkPhrase?"\nCrate spark: "+crateSparkPhrase:"");
 }
 let handoff;
 if(ai==="chatgpt"&&service==="spotify")handoff="Resolve exact Spotify track versions and publish in the chosen order if an authorized writer is exposed. Read back the saved count/order if possible.";
 else if(ai==="chatgpt"&&service==="apple")handoff="Use the connected Apple Music app to resolve these exact recordings and build its playlist widget in the chosen order. If it provides a save control, tell me to tap Create playlist in Apple Music (or the actual label shown). Search and playlist generation do not require a subscription; saving to my library requires an Apple Music subscription. Do not fall back to text merely because no direct playlist writer is exposed when the app can build a saveable widget. If an authorized direct save action is available, use it. Report ready to save until a tool result or user confirmation establishes it was saved; distinguish user-confirmed saving from independent verification. Do not assume library/history access or invent saved count/order verification. If neither widget creation nor a writer is available, keep the verified ordered tracklist and explain the specific blocker.";
 else if(ai==="gemini"&&service==="spotify")handoff="Gemini's Spotify connected app does not create playlists. Give me a verified ordered tracklist, and use Spotify only for supported search/playback.";
 else handoff="Target "+serviceNames[service]+", but only write if this AI actually exposes a connected, authorized playlist writer. Otherwise give the verified ordered tracklist; don't claim it was saved.";
 return goCommand(ai,service,mood)+"\n\n"+thesis+moodBrief+(freshCrateLens?"\n\nFresh-crate discovery lens: "+freshCrateLens+" Treat this as a search route, not a forced genre or an artist list. Prefer recordings absent from recent visible playlists; keep the requested mood and sonic cohesion.":"")+(crateSparkPhrase?"\n\nRandom crate spark: "+crateSparkPhrase+". Use this as a loose metaphor for musical discovery, NOT as a track title, factual instrument claim or rigid requirement. Find independently verified recordings; respect my mood and tempo.":"")+(tempo?"\n\nTempo preference: "+tempoNames[tempo]+". Favor recordings with this perceived pace while respecting the selected mood. Treat this as a curation preference, not a verified BPM filter; do not invent BPM values.":"")+"\n\n"+handoff;
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
 if(button)button.setAttribute("data-copy-state",button.disabled?"copying":ready?"copied":"idle");
 for(const id of ["openAi","browserAi"]){const a=doc.getElementById(id);if(a)a.setAttribute("aria-disabled",String(!ready))}
 const a=doc.getElementById("openAi");if(a)a.textContent=ready?"NEXT: OPEN "+aiNames[ai].toUpperCase():"COPY WITH GO FIRST";
}
function selectionChanged(){
 moodAngle="";
 render();
 if(body.dataset.page==="launch")status("Prompt changed. Press GO to copy the current selection.");
 else status("Selection updated. Copy your tailored setup check below.");
 const tip=doc.getElementById("setupTipStatus");if(tip)tip.textContent="";
}
function renderSelections(){
 doc.querySelectorAll("[data-ai]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ai===ai)));
 doc.querySelectorAll("[data-service]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.service===service)));
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
 intro.textContent="YOUR MIX: "+aiNames[ai]+" × "+serviceNames[service]+". The check will identify anything missing. Already connected? It should tell you to run GO.";
 let install="",connection="";
 if(ai==="chatgpt")install="In ChatGPT, select Go, Hipster, Go!. If missing, install/load it using the project source or app directory.";
 else if(ai==="gemini")install="For a repository install, choose Task mode beneath the Gemini prompt box before pasting the setup check. Ask it to install the current main Skill; this is a one-time task, not a scheduled task. If it only reads GitHub or cannot persist the Skill, use Gemini WEB or MOBILE WEB (gemini.google.com) → Customize → Skills → Create → Upload the five-file ZIP. ZIP upload is not available in the native app. Verify v3.6.0 was installed.";
 else install="In Claude Customize, install Go, Hipster, Go!. Use the Skill ZIP for Skills, or the Plugin ZIP for Plugins; they are not interchangeable.";
 if(service==="spotify"&&ai==="gemini")connection="On Gemini mobile, link Spotify if offered. Google's connected app supports search/play, not playlist creation.";
 else if(service==="spotify"&&ai==="claude")connection="Connect Spotify in Claude. Premium is required for personalized prompted playlists; inspect whether saving is supported here.";
 else if(service==="spotify")connection="In ChatGPT, connect and select Spotify in the same conversation as Go, Hipster, Go!.";
 else if(service==="youtube"&&ai==="gemini")connection="Connect YouTube Music if available. Plain GO curates and attempts one playlist; if no writer is accessible, the Skill should return the crate and explain what failed.";
 else if(service==="apple"&&ai==="claude")connection="Connect an Apple Music MCP connector compatible with your Claude app: local on Desktop, hosted for web/mobile. Verify it can find recordings, create playlists and add tracks.";
 else if(service==="apple"&&ai==="chatgpt")connection="In ChatGPT Settings → Apps, connect Apple Music and select it alongside Go, Hipster, Go! in your conversation. Search and playlist generation do not require a subscription. Saving the result to your library requires an Apple Music subscription.";
 else connection="Check whether "+serviceNames[service]+" is available as a connected writer in "+aiNames[ai]+". If not, use a text playlist instead.";
 const stepsText=[install,connection,"Copy the tailored setup prompt to verify the connection. When your AI confirms everything is ready, go back to the Jukebox and press GO."];
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
 const slider=doc.getElementById("tempoSlider"),tempoValue=doc.getElementById("tempoValue"),anyTempo=doc.getElementById("anyTempo");
 if(slider){slider.value=tempo?tempoSteps.indexOf(tempo)+1:3;slider.setAttribute("aria-valuetext",tempo?tempoNames[tempo]:"Any tempo — move to choose a pace")}
 const tempoControl=doc.getElementById("tempoControl");if(tempoControl)tempoControl.setAttribute("data-tempo",tempo||"any");
 if(tempoValue)tempoValue.textContent=tempo?tempoNames[tempo]:"Any tempo";
 if(anyTempo)anyTempo.setAttribute("aria-pressed",String(!tempo));
 doc.querySelectorAll("[data-mood]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mood===mood)));
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
 if(ok)status(ai==="gemini"&&service==="youtube"?"GO copied. Open Gemini and select Go, Hipster, Go!. It should curate the crate and attempt one YouTube Music playlist; check the actual result.":"Copied. Open "+aiNames[ai]+", paste and send. Select your skill and music app if needed.");
 else{const details=doc.getElementById("promptDetails");if(details)details.open=true;status("Clipboard blocked. Copy the full prompt in the receipt below, then use its manual Open link.")}
}
doc.querySelectorAll("[data-mood]").forEach(b=>b.addEventListener("click",()=>{
 mood=mood===b.dataset.mood?"go":b.dataset.mood;copiedPrompt=null;selectionChanged();
}));
const tempoSlider=doc.getElementById("tempoSlider");
function selectTempo(){tempo=tempoSteps[Number(tempoSlider.value)-1]||"";copiedPrompt=null;selectionChanged()}
if(tempoSlider){
 tempoSlider.addEventListener("input",selectTempo);
 // A tap on the parked center cap also chooses Mid-tempo from bypass.
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