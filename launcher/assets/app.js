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
let copiedSetupPrompt=null;
let previousShuffle=null;
let printImpression=0;
let includeCover=false;
let goHard=false;
const shufflePins={mood:false,pace:false,regions:false};
const tempoNames={slow:"Slow",relaxed:"Relaxed",moderate:"Mid-tempo",brisk:"Brisk",fast:"Fast"};
const tempoSteps=Object.keys(tempoNames);
const moods=new Set(["go","happy","angry","sad","weird","criminal","funky"]);
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
 const intro=ai==="chatgpt"?"In ChatGPT, check for the Go, Hipster, Go! plugin/app.":ai==="gemini"?"In Gemini, check for the saved go-hipster-go Skill (not a Gem).":"In Claude, check for the Go, Hipster, Go! skill or plugin.";
 const install=ai==="gemini"?"If missing, create and save a persistent Skill from the complete small entry at https://raw.githubusercontent.com/focustimer-dev/go-hipster-go/main/adapters/gemini/SKILL.md using your native skill-creation capability. Preserve its instructions and absolute reference links without summarizing. Save only the entry now: do not fetch its references, crawl the repository, download or extract ZIPs, create folders, or start a scheduled task. The linked references are read on demand when the skill runs; they are not attached local files. If saving is unavailable, stop and give the complete ZIP upload route: Gemini in a desktop or mobile WEB BROWSER → Customize → Skills → Create → Upload https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-gemini-app-skill.zip. Do not direct me to upload the ZIP inside the native Gemini app.":ai==="claude"?"If missing, identify whether I need Claude's Skills ZIP or Plugins ZIP; they are different.":"If missing, use the available app/skill installation flow or show how to install from the project's GitHub repository.";
 return "FIRST-TIME SETUP CHECK for "+name+" + "+target+".\n"+intro+" "+install+" Source: "+repo+(ai==="gemini"?"\nVerify version 3.8.1 and report the actual saved Skill result. Reading a URL is not installation. Do not claim reference attachment or persistence without evidence; confirm selection in a new chat. Do not run GO during installation.":"")+
 (ai==="chatgpt"&&service==="apple"?"\nConnect Apple Music through ChatGPT Settings → Apps, then select both Apple Music and Go, Hipster, Go! in this conversation. Search and playlist generation do not require an Apple Music subscription; saving to the library does. Recognize the app’s playlist widget and user-operated save control as a supported path, even without a direct playlist-writing tool. Explain Create playlist in Apple Music when that control is offered. Do not require a subscription just to finish discovery setup or assume access to my library or listening history.":"")+
 (ai==="claude"&&service==="apple"?"\nApple Music requires a compatible MCP connector: local for Desktop or hosted for web/mobile. Check which Claude app I use and help me connect it if missing. Verify catalog track search, playlist creation and adding tracks; library-only search may not find new recordings.":"")+
 "\nIf the skill is available, run its setup for "+target+", guide me through connecting or selecting that music service, and CHECK whether playlist creation and adding tracks are actually supported—not just search/playback. Tell me the smallest action needed to finish setup. If everything is already ready, say so and tell me to run go. Do NOT generate a new playlist during this setup check, claim a playlist was saved, or ask me to paste credentials into chat.";
}
const universalPrompt=setupPrompt("gemini","youtube");
function goCommand(ai,service,mood){
 const antarctica=crateSelected.has("antarctica");
 const go=(antarctica?"go antarctica"+(mood==="go"?"":" "+mood):mood==="go"?"go":"go "+mood)+(goHard?" hard":"");
 // Text mentions express routing intent; the host may require selecting suggestions.
 const musicMention=serviceNames[service];
 return "@go-hipster-go @"+musicMention+" "+go;
}
// DISCOVERY_CATALOG_BEGIN
const discoveryLensCatalog=[{"id":"legacy-00","regions":[],"kind":"musical-lens","text":"Rhythm first: asymmetrical hand-percussion accents, interlocking guitar patterns and a convincing pocket.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-01","regions":[],"kind":"musical-lens","text":"Voice first: intimate or unusual vocal phrasing against restrained, textural accompaniment.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-02","regions":[],"kind":"musical-lens","text":"Production first: dub-space, spring or tape echo and spacious low-end where actually documented.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-03","regions":[],"kind":"musical-lens","text":"Motion first: restless post-punk-style grooves connected to rhythmically surprising regional recordings.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-04","regions":[],"kind":"musical-lens","text":"Texture first: wiry organ or electric-key timbres meeting guitar-led folk or soundtrack arrangements.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-05","regions":[],"kind":"musical-lens","text":"Contrast first: brittle drum machines beside warm live bass or hand-played rhythms.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-06","regions":[],"kind":"musical-lens","text":"Arrangement first: call-and-response, shifting ensemble layers and accumulating tension.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-07","regions":[],"kind":"musical-lens","text":"Atmosphere first: dreamy vocal harmonies or modal drones with a clear rhythmic through-line.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-08","regions":[],"kind":"musical-lens","text":"Beat first: clipped syncopation, early sample collage or hypnotic repetition across different eras.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-09","regions":[],"kind":"musical-lens","text":"Melody first: bittersweet melodic turns carried by unexpectedly propulsive backing.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-10","regions":[],"kind":"musical-lens","text":"Timbre first: fuzzed or tremulous guitar against smooth keys or airy instrumental colors.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-11","regions":[],"kind":"musical-lens","text":"Structure first: long-form builds, sudden negative space and patiently evolving motifs.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-12","regions":["east-africa"],"kind":"research-route","text":"Singeli: investigate tanzanian electronic dance; investigate compact rapid rhythmic turns.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-13","regions":["east-africa"],"kind":"research-route","text":"Electro Acholi / acholitronix: investigate northern ugandan electronic dance routes; distinguish from other ugandan scenes.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-14","regions":["west-africa"],"kind":"research-route","text":"Balani show / electro balani: investigate malian electronic dance; investigate percussion layering.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-15","regions":["central-southern-africa"],"kind":"research-route","text":"Shangaan electro: investigate south african electronic dance; distinguish from older bubblegum.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-16","regions":["east-africa"],"kind":"research-route","text":"Kadodi: investigate research credited percussion ensembles and separately documented electronic adaptations.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-17","regions":["east-africa"],"kind":"research-route","text":"Jaglara: investigate sudanese electronic dance recordings; verify local provenance and arrangement.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-18","regions":["west-africa"],"kind":"research-route","text":"Funaná: investigate cabo verde; investigate accordion and scraped-percussion interaction.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-19","regions":["central-southern-africa"],"kind":"research-route","text":"Rebita: investigate angolan dance repertoire and archival band recordings.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-20","regions":["east-africa"],"kind":"research-route","text":"Maloya: investigate réunion; preserve song/dance and historical context.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-21","regions":["east-africa"],"kind":"research-route","text":"Sega tipik: investigate mauritian tradition; distinguish from other island sega practices.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-22","regions":["east-africa"],"kind":"research-route","text":"Sega tambour of Rodrigues: investigate rodrigues repertoire; verify performers and exact recording.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-23","regions":["east-africa"],"kind":"research-route","text":"Sega tambour Chagos: investigate chagossian repertoire; preserve community context.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-24","regions":["caribbean"],"kind":"research-route","text":"Gwoka: investigate guadeloupe song, dance and percussion tradition.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-25","regions":["middle-east"],"kind":"research-route","text":"Somali diaspora digital recordings: investigate 1990s saudi-based somali recordings documented by 808 xamar.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-26","regions":["east-africa"],"kind":"research-route","text":"Djibouti broadcast ensembles: investigate rtd archival repertoire; do not assume all performers share one origin.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-27","regions":["east-africa"],"kind":"research-route","text":"Beja electric music: investigate research documented beja recordings rather than generic desert-blues tags.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-28","regions":["central-asia"],"kind":"research-route","text":"Uzbek disco: investigate soviet central asian archival pop route; verify actual language and date.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-29","regions":["central-asia"],"kind":"research-route","text":"Tajik folktronica: investigate archival descriptor to investigate, not a claim about all tajik music.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-30","regions":["east-asia"],"kind":"research-route","text":"Uyghur rock: investigate keep distinct from other central asian languages and scenes.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-31","regions":["northern-asia"],"kind":"research-route","text":"Tatar jazz: investigate investigate documented arrangements and performer credits.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-32","regions":["north-africa"],"kind":"research-route","text":"Libyan reggae: investigate tape and band recordings distinct from jamaican originals.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-33","regions":["north-africa"],"kind":"research-route","text":"Libyan cassette pop: investigate research beyond the familiar reissue lead singles.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-34","regions":["east-africa"],"kind":"research-route","text":"Sudanese tape-era song: investigate vocal and band recordings; distinguish from contemporary jaglara.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-35","regions":["middle-east"],"kind":"research-route","text":"Bourj Hammoud recordings: investigate a localized archival route, not a formal genre label.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-36","regions":["central-southern-africa"],"kind":"research-route","text":"Cameroonian bikutsi: investigate investigate guitar/percussion relationships; distinguish from makossa.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-37","regions":["central-southern-africa"],"kind":"research-route","text":"Gandjal: investigate research the documented cameroonian golden sounds repertoire.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-38","regions":["northern-south-america"],"kind":"research-route","text":"Afro-Colombian champeta crossings: investigate trace actual musical exchanges and recordings, not generic fusion.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-39","regions":["northern-south-america"],"kind":"research-route","text":"Palenque ensemble traditions: investigate research credited local ensembles separately from electronic champeta.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-40","regions":["southern-south-america"],"kind":"research-route","text":"Pará dance archives: investigate explore the documented jambú repertoire; identify the actual style per track.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-41","regions":["southeast-asia"],"kind":"research-route","text":"Jaipongan: investigate west javanese/sundanese dance-music route; distinguish from keroncong.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-42","regions":["southeast-asia"],"kind":"research-route","text":"Keroncong: investigate indonesian song tradition; investigate small-ensemble texture.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-43","regions":["southeast-asia"],"kind":"research-route","text":"Dangdut: investigate investigate overlooked regional recordings, not just famous pop hits.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-44","regions":["southeast-asia"],"kind":"research-route","text":"Thai shadow music: investigate electric instrumental archival route; do not equate with all thai psych.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-45","regions":["south-asia"],"kind":"research-route","text":"South Asian steel-guitar film interpretations: investigate instrumental arrangement route; verify original film and performer.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-46","regions":["mediterranean-europe"],"kind":"research-route","text":"Albanian iso-polyphony: investigate investigate drone and interweaving voices.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-47","regions":["mediterranean-europe"],"kind":"research-route","text":"Corsican cantu in paghjella: investigate distinguish secular/liturgical practice and concert adaptation.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-48","regions":["mediterranean-europe"],"kind":"research-route","text":"Sardinian canto a tenore: investigate multipart pastoral singing; preserve context.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-49","regions":["northern-europe"],"kind":"research-route","text":"Lithuanian sutartinės: investigate multipart song tradition; investigate interlocking entrances.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-50","regions":["central-asia"],"kind":"research-route","text":"Shashmaqom: investigate modal art-music route; use a suitable credited recording or movement.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-51","regions":["west-africa"],"kind":"research-route","text":"Morna: investigate cabo verde song tradition; assess each song rather than assigning automatic sadness.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-52","regions":["mediterranean-europe"],"kind":"research-route","text":"Sevdalinka: investigate traditional urban song; verify text before describing its narrative.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-53","regions":["southeast-asia"],"kind":"research-route","text":"Indonesian homemade-instrument experimentation: investigate research extended voice and built instruments without treating the whole region as one genre.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-54","regions":[],"kind":"musical-lens","text":"Regional radio collage: investigate montage route; reject falsely attributed standalone songs.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"legacy-55","regions":[],"kind":"musical-lens","text":"Ceremonial street-recording archives: investigate use only suitable credited material with its context intact.","basis":"Existing global-scenes and sonic-taxonomy research map; verify individual recordings."},{"id":"us-east-sacred-steel","regions":["us-east"],"kind":"research-route","text":"Sacred Steel: research credited Florida church and live recordings; listen for expressive lead phrasing rather than default showcase tracks.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-go-go","regions":["us-east"],"kind":"research-route","text":"D.C. go-go: investigate overlooked local releases and credited live sets with percussion interplay; avoid introductory hits.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-baltimore-club","regions":["us-east"],"kind":"research-route","text":"Baltimore club: research local producer catalogs and unusual vocal edits; favor a distinctive rhythmic idea over familiar crossover staples.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-jersey-club","regions":["us-east"],"kind":"research-route","text":"Jersey club: investigate overlooked local releases and inventive rhythmic arrangements, not the same viral vocal samples.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-miami-bass","regions":["us-east"],"kind":"research-route","text":"Miami bass: investigate overlooked regional singles and electro arrangements; a recognizable bass sound alone is not a reason to select a track.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-florida-breaks","regions":["us-east"],"kind":"research-route","text":"Florida breaks: research credited Orlando and Tampa releases with unusual break construction; avoid generic compilation filler.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-no-wave","regions":["us-east"],"kind":"research-route","text":"New York no wave: look beyond the standard survey tracks for a convincing relationship between dissonance, rhythm and voice.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-freestyle","regions":["us-east"],"kind":"research-route","text":"New York Latin freestyle: research overlooked singles and unusual arrangements; welcome a strong hook without defaulting to radio staples.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-detroit-techno","regions":["us-east"],"kind":"research-route","text":"Detroit techno: investigate less-circulated local releases with distinctive rhythmic or textural development; verify recording and scene provenance.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-ghettotech","regions":["us-east"],"kind":"research-route","text":"Detroit ghettotech: research credited local releases with specific rhythmic personality; do not substitute generic fast club music.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-chicago-acid","regions":["us-east"],"kind":"research-route","text":"Chicago acid house: look for overlooked releases with evolving arrangements, not a famous bassline or a genre demonstration.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-footwork","regions":["us-east"],"kind":"research-route","text":"Chicago footwork and juke: investigate overlooked local recordings with compelling rhythmic tension; distinguish the routes rather than treating them as interchangeable.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-memphis-cassette","regions":["us-east"],"kind":"research-route","text":"Memphis cassette rap: research credited original recordings and versions beyond the recurring compilation picks; distinguish them from later phonk revivals.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-piedmont","regions":["us-east"],"kind":"research-route","text":"Piedmont blues: investigate less-familiar credited performances where guitar counterpoint and vocal phrasing earn the selection.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-swamp-pop","regions":["us-east"],"kind":"research-route","text":"Louisiana swamp pop: research overlooked regional releases with distinctive phrasing or arrangements; do not rely on nostalgic atmosphere alone.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-east-shape-note","regions":["us-east"],"kind":"research-route","text":"Shape-note singing: investigate suitable credited ensemble recordings; preserve communal and sacred context, and do not use tradition as novelty.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-waila","regions":["us-west"],"kind":"research-route","text":"Waila: research credited southern Arizona social-dance recordings; preserve community context and select for the actual ensemble interplay.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-conjunto","regions":["us-west"],"kind":"research-route","text":"South Texas conjunto: investigate overlooked credited recordings with distinctive ensemble phrasing; distinguish conjunto from the wider Tejano umbrella.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-electro-hop","regions":["us-west"],"kind":"research-route","text":"West Coast electro-hop: investigate overlooked Los Angeles releases with distinctive drum programming and vocal arrangements; avoid signature-track defaults.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-chicano-soul","regions":["us-west"],"kind":"research-route","text":"Chicano and lowrider soul: research verified West Coast recordings and overlooked local releases; familiar sweetness must come with distinctive performance or arrangement.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-paisley","regions":["us-west"],"kind":"research-route","text":"Paisley Underground: research lesser-circulated Los Angeles recordings with unusual guitar or vocal interplay; skip the standard scene introductions.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-deathrock","regions":["us-west"],"kind":"research-route","text":"Los Angeles deathrock: investigate overlooked credited releases where atmosphere and songcraft work together; costume and obscurity are not sufficient.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-hyphy","regions":["us-west"],"kind":"research-route","text":"Bay Area hyphy: research overlooked local releases with distinctive rhythmic energy; avoid the predictable crossover anthems.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-mobb","regions":["us-west"],"kind":"research-route","text":"Bay Area mobb music: investigate credited regional recordings beyond the standard touchstones; verify lyrical subject independently for Criminal.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-jerkin","regions":["us-west"],"kind":"research-route","text":"Los Angeles jerkin: research credited local releases with inventive sparse arrangements; do not default to viral signature songs.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-la-beats","regions":["us-west"],"kind":"research-route","text":"Los Angeles beat scene: investigate overlooked producer catalogs and distinctive rhythmic development; avoid anonymous study-playlist instrumentals.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-portland-tape","regions":["us-west"],"kind":"research-route","text":"Portland tape-pop archives: research credited local home-recorded releases with strong melodic or production ideas; this is a research route, not a formal genre.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-olympia-diy","regions":["us-west"],"kind":"research-route","text":"Olympia DIY pop: research overlooked local releases with committed performances and memorable melodic choices; lo-fi sound alone is not quality.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-western-swing","regions":["us-west"],"kind":"research-route","text":"Western swing: research overlooked Texas and Oklahoma recordings with striking ensemble exchanges; verify provenance rather than assuming any swing-country record fits.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-private-country","regions":["us-west"],"kind":"research-route","text":"Western private-press country: investigate verified local releases with unusual songwriting or arrangements; private pressing is a research route, not a quality certificate.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-desert-rock","regions":["us-west"],"kind":"research-route","text":"Palm Desert rock: research overlooked locally connected recordings with distinctive groove and arrangement; avoid the standard festival headliners.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"us-west-slack-key","regions":["us-west"],"kind":"research-route","text":"Hawaiian slack-key guitar: investigate suitable credited performances with distinctive phrasing; preserve context rather than using the tradition as ambient scenery.","basis":"User East/West survey, reviewed as research leads; verify scene, release and track suitability before selection."},{"id":"review-hawaiian-falsetto","regions":["oceania","us-west"],"kind":"research-route","text":"Hawaiian falsetto: explore credited leo kiʻekiʻe performances for distinctive vocal phrasing; verify the recording and fit rather than defaulting to familiar Hawaiian hits.","basis":"Source supports the vocal practice, not a fixed tempo or lyrical theme.","source_entries":["oceania:add-21"],"evidence_urls":["https://folkways.si.edu/na-leo-hawaii/music/article/smithsonian"],"review_status":"route-supported-recordings-unverified"},{"id":"review-hawaiian-himeni","regions":["oceania","us-west"],"kind":"research-route","text":"Hawaiian hīmeni: investigate documented Hawaiian-language hymn performances when the requested mood and context fit; do not assume sacred repertoire is generic atmosphere.","basis":"Source supports Hawaiian-language hymn practice; no universal mood assignment.","source_entries":["oceania:add-23"],"evidence_urls":["https://folkways.si.edu/na-leo-hawaii/music/article/smithsonian"],"review_status":"route-supported-recordings-unverified"},{"id":"review-costa-rica-cimarrona","regions":["central-america"],"kind":"research-route","text":"Costa Rican cimarrona ensembles: research credited local groups and distinctive arrangements; establish the actual instrumentation, pace and recording availability before selecting.","basis":"Cultural directory establishes a local ensemble and locality, not every imported sonic claim.","source_entries":["central-america:add-33"],"evidence_urls":["https://si.cultura.cr/agrupaciones-y-organizaciones/cimarrona-los-guilas"],"review_status":"route-supported-recordings-unverified"},{"id":"review-belize-garifuna-guitar","regions":["central-america"],"kind":"research-route","text":"Belizean Garifuna guitar-song routes: investigate credited paranda recordings and their vocal phrasing; distinguish listening songs from dance or ritual repertoires and verify every selection.","basis":"Catalog documents paranda examples and guitar/voice material; verify the individual arrangement.","source_entries":["central-america:03"],"evidence_urls":["https://folkways.si.edu/traditional-music-of-the-garifuna-of-belize/american-indian-world/album/smithsonian"],"review_status":"route-supported-recordings-unverified"},{"id":"review-cameroon-mvet","regions":["central-southern-africa"],"kind":"research-route","text":"Cameroonian Bulu mvet storytelling: research documented voice-and-string performances and their arrangement; preserve performance context and verify the text before assigning narrative themes.","basis":"Catalog establishes Bulu storyteller and mvet context; not song-level crime evidence.","source_entries":["central-africa:add-08"],"evidence_urls":["https://folkways.si.edu/bulu-songs-from-the-cameroons/world/music/album/smithsonian"],"review_status":"route-supported-recordings-unverified"},{"id":"review-chad-balafon","regions":["central-southern-africa"],"kind":"research-route","text":"Chadian balafon ensembles: investigate documented interlocking melodic performances; verify credited locality, recording and perceived pace instead of treating archival music as automatically strange.","basis":"Catalog supports balafon ensemble and interwoven figures, not all Chad recordings or fixed meters.","source_entries":["central-africa:add-35"],"evidence_urls":["https://folkways.si.edu/music-of-chad/islamica-world/album/smithsonian"],"review_status":"route-supported-recordings-unverified"},{"id":"review-namibia-oviritje","regions":["central-southern-africa"],"kind":"research-route","text":"Namibian Oviritje: investigate credited local releases beyond the most familiar names; establish each recording’s audible character and tempo rather than inferring them from an award category.","basis":"Awards source supports the named category only; imported instrumental details remain unverified.","source_entries":["southern-africa:add-32"],"evidence_urls":["https://www.nama.com.na/entry-categories/best-oviritje-album"],"review_status":"route-supported-recordings-unverified"},{"id":"review-namibia-shambo","regions":["central-southern-africa"],"kind":"research-route","text":"Namibian Shambo: research documented local artists and releases, then verify the actual groove, voice and mood fit; the category name is a search route, not a sonic guarantee.","basis":"Awards inventory supports the category; label notes document a specific Shambo-derived Namibian electronic collaboration. Verify each recording, pace and mood independently.","source_entries":["southern-africa:add-33"],"evidence_urls":["https://www.nama.com.na/faq","https://brothersisterrecords.bandcamp.com/album/one-joe-ep"],"review_status":"route-supported-recordings-unverified"}];
const freshCrateLenses=discoveryLensCatalog.map(lens=>lens.text);
// DISCOVERY_CATALOG_END
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
function eligibleDiscoveryLenses(){
 return discoveryLensCatalog.filter(lens=>!crateSelected.size||!lens.regions.length||lens.regions.some(region=>crateSelected.has(region)));
}
function nextFreshCrateLens(){
 const eligible=eligibleDiscoveryLenses();
 const scope=crateSelected.size?[...crateSelected].sort().join(","):"worldwide";
 return nextDiscoveryCue(eligible.map(lens=>lens.text),"ghg-crate-routes-v2-regional-v1-"+scope);
}
const moodInterpretations={"happy":["communal celebration","mischievous play","quiet private contentment","relief after hardship","romantic buoyancy","ecstatic release"],"angry":["cold contempt","righteous protest","simmering resentment","betrayed intimacy","defiant solidarity","explosive catharsis"],"sad":["homesickness","grief","resignation","heartbreak","lonely urban drift","bittersweet acceptance"],"weird":["unstable tuning","interlocking or asymmetric time","surreal storytelling","homemade sound sources","radically edited form","uncanny restraint"],"criminal":["heists and criminal ingenuity","smuggling routes","fugitives and evasion","betrayal inside criminal networks","prison escapes","underworld codes and loyalty","criminal bravado and its consequences"]};
let moodAngle="";
const moodLabel=mood=>mood==="funky"?"The Funk":mood==="go"?"Surprise":mood[0].toUpperCase()+mood.slice(1);
moodInterpretations.funky=["unhurried pocket","springy rhythmic tension","interlocking ensemble parts","sparse displaced accents","propulsive electronic interplay","rhythmic call and response"];
function moodDiscoveryBrief(mood){
 if(!moodInterpretations[mood])return "";
 return moodAngle?"\nMood angle: "+moodAngle+".":"";
}

/* Independently rotated musical functions; storage holds cue indices only. */
// MOOD_SPARK_BANK_BEGIN
const moodSparkBank={"happy":["celebration with unresolved harmony","quiet pleasure over restless detail","playful phrases with a serious pulse","relief arriving one layer at a time","a restrained opening that learns to dance","rough voices carrying a buoyant melody","a bright refrain above a heavy foundation","communal answers to a solitary voice","joy held just below the surface","a loose ensemble finding its centre","tenderness with rhythmic mischief","a small motif growing into shared release","laughter suggested by instrumental replies","a light melody over stubborn repetition","warmth interrupted by surprising silences","a simple refrain with intricate surroundings","euphoria carried by accumulating voices","a graceful line over unruly accents","a celebratory rhythm with bittersweet chords","contentment without losing forward motion"],"angry":["soft vocals against punishing accents","tension building without speeding up","cold restraint with sudden eruptions","an insistent figure refusing resolution","a calm surface with abrasive interruptions","clipped phrases against sustained pressure","a collective refrain answering a lone voice","friction gathering beneath a steady pulse","a melody straining against its accompaniment","sharp attacks followed by uncomfortable space","an intimate voice growing harder to ignore","controlled repetition pushed toward rupture","dense passages breaking into exposed voices","a heavy foundation beneath restless detail","a withheld release that finally arrives","brittle harmonies over grounded percussion","a quiet threat carried by rhythmic insistence","a graceful phrase repeatedly interrupted","raw vocal grain against precise accompaniment","defiance through unison and repetition"],"sad":["a buoyant rhythm carrying unresolved harmony","a close voice against indifferent motion","a melody reaching upward and falling back","warm timbres around a bare arrangement","a refrain returning with something missing","busy accompaniment beneath a withdrawn voice","a graceful pulse with hesitant entrances","a bright register over a descending line","distance growing between answering phrases","a dance rhythm with no harmonic release","layers disappearing rather than building","a fragile lead held by a steady ensemble","yearning stretched across repeated figures","restrained delivery with widening harmonies","a melody continuing after the rhythm drops out","a shared refrain that ends in a single voice","small ornaments against an unchanging ground","tender phrasing against rough textures","a full arrangement thinning to resonance","forward motion with a lingering final phrase"],"weird":["a familiar pulse with an unfamiliar centre","phrases of unequal lengths finding a meeting point","a melody changing shape on every return","tuning friction inside a gentle arrangement","silence interrupting an otherwise regular form","a foreground detail becoming the main structure","voices behaving like percussion","a repeating pattern gradually losing a note","a stable bass beneath unstable upper lines","an acoustic gesture answered by an altered copy","a refrain arriving where a verse should be","tiny edits disturbing a patient surface","a graceful melody with awkward shadows","dense detail suddenly revealing empty space","a rhythm implied before it is played","a held tone changing colour rather than pitch","a looping figure that slips against itself","an ordinary sound taking an unexpected musical role","a convincing groove with one misplaced accent","a tidy form unraveling at its edges"],"criminal":["an unhurried pulse beneath urgent narration","a smooth surface interrupted by sharp accents","a refrain tightening around the narrator","a sparse opening gathering pressure","boastful delivery against uneasy harmony","a steady accompaniment beneath a changing account","a confident entrance ending in exposed silence","narrative verses interrupted by collective replies","a recurring figure suggesting consequences","intimate narration against a distant ensemble","a bright melody shadowed by a darker register","controlled delivery over restless percussion","a refrain returning with altered emphasis","brief instrumental replies between narrative phrases","an even pulse beneath escalating tension","a spacious arrangement closing around the voice","a polished surface with audible rough edges","a repeating accompaniment refusing release","a solitary voice giving way to a crowd","a final verse stripped of its earlier swagger"],"funky":["bass anticipating the downbeat","clipped guitar answering rolling percussion","a spacious pocket with displaced accents","interlocking parts leaving room for the voice","a low ostinato against restless hand drums","offbeat chords over a patient foundation","a refrain riding behind the beat","short horn replies inside a steady groove","percussion trading accents with the bass","a lean rhythm growing through ensemble interplay","a repeating figure with elastic phrasing","rhythmic voices answering a sparse accompaniment","a keyboard pulse interrupted by guitar stabs","a grounded beat with springy upper lines","a relaxed phrase over tightly woven percussion","electronic bass conversing with dry drum accents","tiny silences making the next entrance count","a dance-band groove thinning to bass and drums","an insistent pattern opening into collective replies","a propulsive pocket beneath bittersweet harmony"]};
const seedCueBank={"rhythm":[{"text":"interlocking accents","pace":"any"},{"text":"a pulse with missing footsteps","pace":"any"},{"text":"drums answering the melody","pace":"any"},{"text":"a rhythm leaning behind the beat","pace":"any"},{"text":"offbeats pulling against the downbeat","pace":"any"},{"text":"percussion leaving the centre open","pace":"any"},{"text":"a repeating figure changing its emphasis","pace":"any"},{"text":"bass and drums taking different paths","pace":"any"},{"text":"handclaps cutting across the pulse","pace":"any"},{"text":"phrases spilling over the bar line","pace":"any"},{"text":"a patient pulse with restless details","pace":"slow"},{"text":"widely spaced beats with busy ornaments","pace":"slow"},{"text":"a slow tread with sharp syncopation","pace":"slow"},{"text":"a loping rhythm with sudden gaps","pace":"slow"},{"text":"a quick pulse with room to breathe","pace":"fast"},{"text":"racing accents around a steady centre","pace":"fast"},{"text":"brisk footsteps interrupted by silence","pace":"fast"},{"text":"rapid figures trading places","pace":"fast"},{"text":"a melody doing the percussion’s work","pace":"any"},{"text":"a pulse emerging from overlapping loops","pace":"any"},{"text":"short phrases answering long ones","pace":"any"},{"text":"a rhythm gathering extra layers","pace":"any"},{"text":"a steady ground beneath uneven phrases","pace":"any"},{"text":"an insistent pulse that keeps shedding notes","pace":"any"}],"texture":["a close voice in a distant room","dry attacks trailing long shadows","soft edges around a hard centre","a melody fraying into overtones","breath and grain left in the foreground","bright notes against a dark sustained bed","small sounds filling a wide space","a rough surface around a clear melody","plucked notes leaving long empty spaces","voices passing a phrase between them","a low register carrying a fragile upper line","sharp transients beneath blurred harmonies","unison lines slowly separating","a thin melody above a crowded floor","resonance hanging after each strike","contrasting registers refusing to blend","a warm centre with brittle edges","brief ornaments interrupting held notes","a voice half hidden inside the ensemble","acoustic grain beside clean electronic tones","a melody answered by wordless voices","dense detail with no dominant soloist","exposed vocals against restless accompaniment","a narrow sound opening into a wide room"]};
// MOOD_SPARK_BANK_END
let crateSparkPhrase="";
function compatibleSpark(cue){
 const pace=cue.pace||"any";
 if(["slow","relaxed"].includes(tempo))return pace!=="fast";
 if(["brisk","fast"].includes(tempo))return pace!=="slow";
 return true;
}
function nextCrateSparkPhrase(){
 const rhythm=nextDiscoveryCue(seedCueBank.rhythm.filter(compatibleSpark).map(c=>c.text),"ghg-seeds-v3-rhythm-"+(tempo||"any"));
 const texture=nextDiscoveryCue(seedCueBank.texture,"ghg-seeds-v3-texture");
 const tensions=moodSparkBank[mood]||Object.values(moodSparkBank).flat();
 const tension=nextDiscoveryCue(tensions,"ghg-seeds-v3-tension-"+(mood||"any"));
 return rhythm+" / "+texture+" / "+tension;
}
// The skill owns curation policy; GO sends only current creative inputs and service.
function goPrompt(ai,service,mood){
 const parts=[goCommand(ai,service,mood)];
 if(goHard)parts.push("Curation mode: GO HARD. Use the skill\u0027s Deep Crate Protocol.");
 if(crateSelected.size)parts.push(crateRegionPrompt());
 const brief=moodDiscoveryBrief(mood);if(brief)parts.push(brief.trim());
 if(tempo)parts.push("Tempo preference: "+tempoNames[tempo]+".");
 if(crateSparkPhrase)parts.push("Seed: "+crateSparkPhrase+".");
 parts.push("Service: "+serviceNames[service]+".");
 if(includeCover)parts.push("Cover art: yes. Use the skill\u0027s cover-art workflow.");
 return parts.join("\n");
}

const crateRegions=[{"id":"us-west","label":"US West","continent":"americas-north"},{"id":"us-east","label":"US East","continent":"americas-north"},{"id":"canada-west","label":"Canada West","continent":"americas-north"},{"id":"canada-east","label":"Canada East","continent":"americas-north"},{"id":"mexico","label":"Mexico","continent":"americas-north"},{"id":"central-america","label":"Central America","continent":"americas-north"},{"id":"caribbean","label":"Caribbean","continent":"americas-north"},{"id":"northern-south-america","label":"Northern South America","continent":"americas-south"},{"id":"southern-south-america","label":"Southern South America","continent":"americas-south"},{"id":"atlantic-europe","label":"Atlantic & Western Europe","continent":"europe"},{"id":"mediterranean-europe","label":"Mediterranean & Balkans","continent":"europe"},{"id":"northern-europe","label":"Northern Europe","continent":"europe"},{"id":"eastern-europe","label":"Eastern Europe","continent":"europe"},{"id":"north-africa","label":"North Africa","continent":"africa"},{"id":"west-africa","label":"West Africa","continent":"africa"},{"id":"east-africa","label":"East Africa","continent":"africa"},{"id":"central-southern-africa","label":"Central & Southern Africa","continent":"africa"},{"id":"middle-east","label":"Middle East & Caucasus","continent":"asia"},{"id":"central-asia","label":"Central Asia","continent":"asia"},{"id":"south-asia","label":"South Asia","continent":"asia"},{"id":"east-asia","label":"East Asia","continent":"asia"},{"id":"southeast-asia","label":"Southeast Asia","continent":"asia"},{"id":"northern-asia","label":"Northern Asia","continent":"asia"},{"id":"oceania","label":"Oceania","continent":"oceania"},{"id":"antarctica","label":"Antarctica","continent":"antarctica"}];
// Live ticket shorthand: abbreviations remain legible on a narrow phone.
const ticketAiCodes={chatgpt:"GPT",gemini:"GEM",claude:"CLD"};
const ticketServiceCodes={spotify:"SPOT",youtube:"YTM",apple:"APPLE"};
const ticketMoodCodes={go:"SURP",happy:"HAPPY",angry:"ANGRY",sad:"SAD",weird:"WEIRD",criminal:"CRIME",funky:"FUNK"};
const ticketTempoCodes={slow:"SLOW",relaxed:"RELAX",moderate:"MID",brisk:"BRISK",fast:"FAST"};
const ticketRegionCodes={
 "us-west":"US-W","us-east":"US-E","canada-west":"CAN-W","canada-east":"CAN-E",
 "mexico":"MEX","central-america":"C.AM","caribbean":"CARIB",
 "northern-south-america":"N.SA","southern-south-america":"S.SA",
 "atlantic-europe":"W.EUR","mediterranean-europe":"MED.EUR","northern-europe":"N.EUR","eastern-europe":"E.EUR",
 "north-africa":"N.AFR","west-africa":"W.AFR","east-africa":"E.AFR","central-southern-africa":"C/S.AFR",
 "middle-east":"M.EAST","central-asia":"C.AS","south-asia":"S.AS","east-asia":"E.AS",
 "southeast-asia":"SE.AS","northern-asia":"N.AS","oceania":"OCE","antarctica":"ANTARCTICA"
};
function shortTicketRegions(){
 const active=crateRegions.filter(r=>crateSelected.has(r.id));
 if(!active.length)return "WORLD";
 // Explicit Antarctica is never disguised behind the +N suffix.
 active.sort((a,b)=>a.id==="antarctica"?-1:b.id==="antarctica"?1:0);
 return active.slice(0,2).map(r=>ticketRegionCodes[r.id]||r.label).join(" / ")+(active.length>2?" +"+(active.length-2):"");
}
const crateContinents=[{"id":"americas-north","label":"N. America"},{"id":"americas-south","label":"S. America"},{"id":"europe","label":"Europe"},{"id":"africa","label":"Africa"},{"id":"asia","label":"Asia"},{"id":"oceania","label":"Oceania"},{"id":"antarctica","label":"Antarctica"}];
const atlasViews={"world":[0,0,720,372],"americas-north":[40,18,300,190],"americas-south":[165,132,183,222],"europe":[296,20,204,175],"africa":[310,83,210,245],"asia":[415,20,267,255],"oceania":[545,165,175,190],"antarctica":[180,186,360,186]};
// Robinson focus boxes use projected geography, not the old Mercator extents.
const atlasRobinsonViews={world:[0,0,720,372],"americas-north":[48,18,312,174],"americas-south":[192,145,120,172],europe:[298,30,174,100],africa:[312,94,180,208],asia:[403,25,240,198],oceania:[555,179,145,117],antarctica:[180,186,360,186]};
const atlasLandAnchors=[];
const atlasRegionShapes=[];
function warmAtlasArtwork(){
 const image=doc.getElementById("chart-engravings");
 if(image?.dataset?.src&&!image.getAttribute("href"))image.setAttribute("href",image.dataset.src);
}
function atlasDetailsForView(map,view){
 const width=Number(view.trim().split(/\s+/)[2]);
 // A small dead band prevents flicker while pinching around the reveal point.
 const threshold=map.getAttribute("data-details")==="true"?2.05:2.3;
 if(720/width>=1.5)warmAtlasArtwork();
 const visible=720/width>=threshold;
 map.setAttribute("data-details",String(visible));
 map._atlasSecretsSync?.(visible);
}
// Robinson rays follow the geography camera but remain underneath its
// opaque ocean. The ocean masks rays at the CURRENT map edge while panning.
// Never use a fixed cutout or hide rays during drag/pinch: both leave gaps.
const atlasRadialField=typeof doc.querySelector==="function"?doc.querySelector(".atlas-radial-field"):null;
const atlasRadialMap=doc.getElementById("crateAtlasMap");
if(atlasRadialField&&atlasRadialMap){
 const syncRadialBackdrop=()=>{
  const view=atlasRadialMap.getAttribute("viewBox");
  if(view){atlasRadialField.setAttribute("viewBox",view);atlasDetailsForView(atlasRadialMap,view)}
 };
 if(typeof MutationObserver==="function"){
  new MutationObserver(syncRadialBackdrop).observe(atlasRadialMap,{attributes:true,attributeFilter:["viewBox"]});
 }
 syncRadialBackdrop();
}
const atlasNames={"americas-north":"N. America","americas-south":"S. America","europe":"Europe","africa":"Africa","asia":"Asia","oceania":"Oceania","antarctica":"Antarctica"};
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
 return "Regional exploration: "+all.join(", ")+".";
}
function atlasBoxText(a){return a.map(v=>Math.round(v*10)/10).join(" ")}
function animateAtlasView(view){
 flushAtlasNavigation();
 const map=doc.getElementById("crateAtlasMap");if(!map)return;
 const views=map.classList?.contains?.("crate-robinson")?atlasRobinsonViews:atlasViews;
 const goal=atlasConstrain(Array.isArray(view)?view:(views[view||"world"]||views.world)),raw=map.getAttribute("viewBox")||"0 0 720 372";
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
// Fit the selected painted geography; tiny offshore fragments must not
// pull a mainland selection to the opposite edge of the Robinson plate.
function atlasSelectedView(shapes,selected){
 const visible=[];
 for(const id of selected){
  const parts=shapes.filter(p=>p.id===id),largest=Math.max(0,...parts.map(p=>p.area));
  visible.push(...parts.filter(p=>p.area>=Math.max(.05,largest*.005)));
 }
 if(!visible.length)return null;
 const left=Math.min(...visible.map(p=>p.x)),top=Math.min(...visible.map(p=>p.y));
 const right=Math.max(...visible.map(p=>p.x+p.w)),bottom=Math.max(...visible.map(p=>p.y+p.h));
 const pad=Math.max(10,(right-left)*.12,(bottom-top)*.12);
 const box=atlasNormalize([left-pad,top-pad,right-left+2*pad,bottom-top+2*pad]);
 if(box[2]<160){const cx=box[0]+box[2]/2,cy=box[1]+box[3]/2;return [cx-80,cy-160*372/720/2,160,160*372/720]}
 return box;
}
function frameSelectedAtlas(){
 if(!atlasRegionShapes.length)return; // Manual/setup and test environments may lack painted paths.
 const view=crateSelected.size===1&&crateSelected.has("antarctica")?atlasRobinsonViews.antarctica:crateSelected.size?atlasSelectedView(atlasRegionShapes,crateSelected):null;
 atlasUserNavigated=Boolean(view);
 if(!crateSelected.size){atlasFocus=null;renderCrateMap()}else renderAtlasNavigation();
 animateAtlasView(view||null);
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
const crateStampNames={"us-west":"US W","us-east":"US E","canada-west":"CAN W","canada-east":"CAN E","mexico":"MEX","central-america":"CENT AM","caribbean":"CARIB","northern-south-america":"N S AM","southern-south-america":"S S AM","atlantic-europe":"W EUR","mediterranean-europe":"MED / BALK","northern-europe":"N EUR","eastern-europe":"E EUR","north-africa":"N AFR","west-africa":"W AFR","east-africa":"E AFR","central-southern-africa":"C / S AFR","middle-east":"MID EAST","central-asia":"C ASIA","south-asia":"S ASIA","east-asia":"E ASIA","southeast-asia":"SE ASIA","northern-asia":"N ASIA","oceania":"OCEANIA","antarctica":"ANTARCTICA"};
function renderCrateMap(){
 const focused=Boolean(atlasFocus);
 doc.querySelectorAll("[data-crate-region]").forEach(b=>{
  b.hidden=!focused||b.dataset.continent!==atlasFocus;
  b.setAttribute("aria-pressed",String(crateSelected.has(b.dataset.crateRegion)));
 });
 doc.querySelectorAll("[data-crate-continent]").forEach(b=>b.setAttribute("aria-pressed",String(atlasFocus===b.dataset.crateContinent)));
 doc.querySelectorAll("[data-atlas-zone]").forEach(z=>{
  z.setAttribute("data-selected",String(crateSelected.has(z.dataset.atlasZone)));
  z.setAttribute("data-press",String(z.dataset.atlasZone===lastCrateStamp));
 });
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
 if(loc){
  const place=focused?atlasNames[atlasFocus]:"WHOLE WORLD";
  loc.textContent=place+" / "+(crateSelected.size?crateSelected.size+" STAMP"+(crateSelected.size===1?"":"S"):"OPEN CRATE");
 }
 const home=doc.getElementById("atlasHome");if(home)home.hidden=!(focused||atlasUserNavigated);
 const hint=doc.getElementById("atlasInstruction");
 if(hint){
  const desktop=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(pointer: fine)").matches;
  const action=focused?"TAP TO INK / UNINK":"TAP LAND TO EXPLORE";
  hint.textContent=action+(desktop?" · SHIFT + SCROLL TO PAN · PINCH TO ZOOM":" · DRAG TO PAN · TWO FINGERS TO ZOOM");
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
 copiedPrompt=null;selectionChanged();frameSelectedAtlas();
}
const params=new URLSearchParams(location.search);
includeCover=params.get("cover")==="1";
goHard=params.get("hard")==="1";
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
 if(mark){mark.hidden=state==="idle";mark.textContent=state==="copied"?"COPIED TO CLIPBOARD":state==="copying"?"COPYING…":"";}
 for(const id of ["openAi","browserAi"]){const a=doc.getElementById(id);if(a)a.setAttribute("aria-disabled",String(!ready))}
 const a=doc.getElementById("openAi");if(a)a.textContent=ready?"NEXT: OPEN "+aiNames[ai].toUpperCase():"COPY WITH GO FIRST";
 const guide=doc.getElementById("handoffGuidance"),heading=doc.getElementById("handoffTitle"),instructions=doc.getElementById("handoffInstruction");
 if(guide)guide.hidden=!ready;
 if(heading)heading.textContent="COPIED. NOW OPEN "+aiNames[ai].toUpperCase()+".";
 if(instructions)instructions.textContent=ai==="chatgpt"?"Paste and send. Select Go, Hipster, Go! and "+serviceNames[service]+" in your chat if needed. The playlist isn't saved yet.":ai==="gemini"?"Paste and send. Select the saved Go, Hipster, Go! skill and "+serviceNames[service]+" if needed. Check whether the playlist was created.":"Paste and send. Enable Go, Hipster, Go! and "+serviceNames[service]+" if needed. Check the playlist result in your AI.";
}
function selectionChanged(preserveShuffle=false){
 if(!preserveShuffle){previousShuffle=null;const result=doc.getElementById("shuffleResult");if(result)result.textContent="";}
 moodAngle="";freshCrateLens="";crateSparkPhrase="";
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
 const setupReady=copiedSetupPrompt===setupPrompt(ai,service);
 const pairDescription=doc.getElementById("onboardingPair");if(pairDescription)pairDescription.textContent=aiNames[ai]+" + "+serviceNames[service];
 const setupCopy=doc.getElementById("stripSetupPrompt");if(setupCopy)setupCopy.textContent=setupReady?"COPY SETUP CHECK AGAIN":"COPY SETUP CHECK";
 const setupOpen=doc.getElementById("openSetupAi");if(setupOpen){setupOpen.href=destinations[ai];setupOpen.textContent=setupReady?"OPEN "+aiNames[ai].toUpperCase():"COPY THE CHECK FIRST";setupOpen.setAttribute("aria-disabled",String(!setupReady))}
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
 else if(ai==="gemini")install="In Gemini, paste the setup check to save the small entry skill. References load when needed; use the complete ZIP in Gemini web if saving is unavailable.";
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
  fallback="In Gemini web, open Customize → Skills → Create → Upload and use the Gemini Skill ZIP below. Use a desktop or mobile browser if the native app has no upload control.";
 }else if(ai==="claude")fallback="Match the download to the uploader: Skill ZIP for Skills, Plugin ZIP for Plugins. The labels are doing useful work here.";
 const confirmation=ai==="gemini"?"In a new conversation, confirm the latest release is available as a saved Skill. Reading the files once is not installation. Then return to the Jukebox and press GO.":"Run the setup check above. When your AI confirms the skill and music connection are ready, return to the Jukebox and press GO.";
 const stepsText=[["Install the skill",install],["If installation fails",fallback],["Connect your music",connection],["Check you’re ready",confirmation]];
 if(ai==="chatgpt"&&service==="apple")stepsText.push(["Save after GO","Use Create playlist in Apple Music if the playlist widget offers it. Until you complete that step, the playlist is ready to save, not saved."]);
 steps.replaceChildren();for(const [title,text] of stepsText){const li=doc.createElement("li"),heading=doc.createElement("strong"),body=doc.createElement("p");heading.className="recipe-step-title";heading.textContent=title;body.textContent=text;li.append(heading,body);steps.append(li)}
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
 renderShufflePins();
 const undo=doc.getElementById("undoShuffle");if(undo)undo.hidden=!previousShuffle;
 const slider=doc.getElementById("tempoSlider"),tempoValue=doc.getElementById("tempoValue"),anyTempo=doc.getElementById("anyTempo");
 if(slider){slider.value=tempo?tempoSteps.indexOf(tempo)+1:3;slider.setAttribute("aria-valuetext",tempo?tempoNames[tempo]:"Any tempo — no pace preference")}
 const tempoControl=doc.getElementById("tempoControl");if(tempoControl)tempoControl.setAttribute("data-tempo",tempo||"any");
 if(tempoValue)tempoValue.textContent=tempo?tempoNames[tempo]:"Any tempo";
 const tempoSummary=doc.getElementById("tempoSummary");if(tempoSummary)tempoSummary.textContent=tempo?tempoNames[tempo]:"Any tempo";
 const tempoHelp=doc.getElementById("tempoHelp");if(tempoHelp)tempoHelp.textContent=tempo?tempoNames[tempo]+" pace. Choose Any to clear it.":"Any pace. The clerk can cope. Move the slider to choose.";
 if(anyTempo)anyTempo.setAttribute("aria-pressed",String(!tempo));
 doc.querySelectorAll("[data-mood]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mood===mood)));
 const clerkNotes={happy:"Optimism. An ambitious brief.",angry:"For when everyone else is obviously the problem.",sad:"Melancholy. Filed under essential listening.",weird:"The neighbors may have questions.",funky:"The pocket has diplomatic immunity."};
 const moodHelp=doc.getElementById("moodHelp");if(moodHelp)moodHelp.textContent=mood==="criminal"?"Songs about crime. Artist reputations are not evidence.":mood==="go"?"No mood? We’ll use our judgment.":moodLabel(mood)+" selected. "+clerkNotes[mood];
 const e={prompt:doc.getElementById("prompt"),mood:doc.getElementById("moodName"),code:doc.getElementById("receiptCode"),open:doc.getElementById("openAi"),browser:doc.getElementById("browserAi")};
 if(!e.prompt)return;
 e.prompt.textContent=goPrompt(ai,service,mood);
 e.mood.textContent=moodLabel(mood).toUpperCase();
 e.code.textContent=(ai==="chatgpt"?"CG":ai==="gemini"?"GM":"CL")+"-"+mood.slice(0,3).toUpperCase()+"-01";
 e.open.href=ai==="gemini"?geminiIntent:destinations[ai];e.open.textContent="↗ OPEN "+aiNames[ai].toUpperCase();
 const summary=doc.getElementById("receiptSummary");if(summary)summary.textContent=aiNames[ai]+" · "+serviceNames[service]+" · "+moodLabel(mood)+(tempo?" · "+tempoNames[tempo]:"")+" · 12 tracks"+(includeCover?" · cover art":"")+(goHard?" · deep crate":"");
 const regions=doc.getElementById("receiptRegions");if(regions)regions.textContent="CRATES / "+(crateSelected.size?crateRegions.filter(r=>crateSelected.has(r.id)).map(r=>r.label).join(" · "):"Worldwide");
 const ticketShort=doc.getElementById("selectionTicketShort");
 if(ticketShort)ticketShort.textContent=ticketAiCodes[ai]+" › "+ticketServiceCodes[service]+" · "+ticketMoodCodes[mood]+" · "+(tempo?ticketTempoCodes[tempo]:"ANY");
 const ticketRegionShort=doc.getElementById("selectionTicketRegionShort");
 if(ticketRegionShort){
  ticketRegionShort.textContent=shortTicketRegions()+" · ART:"+(includeCover?"ON":"OFF")+" · HARD:"+(goHard?"ON":"OFF");
  ticketRegionShort.title=crateSelected.size?crateRegions.filter(r=>crateSelected.has(r.id)).map(r=>r.label).join(", "):"Worldwide";
 }
 const cover=doc.getElementById("includeCover");if(cover)cover.setAttribute("aria-pressed",String(includeCover));
 const hard=doc.getElementById("goHard");if(hard)hard.setAttribute("aria-pressed",String(goHard));
 const hint=doc.getElementById("goHint");if(hint)hint.textContent="Copy your prompt";
 const goButton=doc.getElementById("goButton");if(goButton)goButton.setAttribute("aria-label","GO! Copy "+(mood==="go"?"surprise":moodLabel(mood))+" playlist prompt");
 const manual=doc.getElementById("manualOpenAi");if(manual){manual.href=destinations[ai];manual.textContent="I COPIED IT MANUALLY — OPEN "+aiNames[ai].toUpperCase()}
 updateHandoff();
 e.browser.hidden=ai!=="gemini";e.browser.href=destinations[ai];e.browser.textContent="open "+aiNames[ai]+" in browser";
 const u=new URL(location.href);u.searchParams.set("ai",ai);u.searchParams.set("service",service);
 if(mood==="go")u.searchParams.delete("mood");else u.searchParams.set("mood",mood);
 if(tempo)u.searchParams.set("tempo",tempo);else u.searchParams.delete("tempo");
 if(includeCover)u.searchParams.set("cover","1");else u.searchParams.delete("cover");
 if(goHard)u.searchParams.set("hard","1");else u.searchParams.delete("hard");
 u.searchParams.delete("mode");
 history.replaceState(null,"",u.pathname+u.search);
}
function render(){if(body.dataset.page==="launch")renderLaunch();else renderSetup()}
doc.querySelectorAll("[data-ai]").forEach(b=>b.addEventListener("click",()=>{
 ai=b.dataset.ai;copiedPrompt=null;copiedSetupPrompt=null;selectionChanged();
}));
doc.querySelectorAll("[data-service]").forEach(b=>b.addEventListener("click",()=>{
 service=b.dataset.service;copiedPrompt=null;copiedSetupPrompt=null;selectionChanged();
}));
doc.querySelectorAll("[data-setup]").forEach(b=>b.addEventListener("click",async()=>{
 copiedPrompt=null;if(body.dataset.page==="setup")renderSetup();
 const prompt=b.dataset.setup==="universal"?universalPrompt:setupPrompt(ai,service);
 status(await copyText(prompt)?"Installation prompt copied. Paste into your chosen AI.":"Clipboard blocked; please copy the instructions manually.");
}));
async function copyFirstSetup(){
 copiedPrompt=null;if(body.dataset.page==="launch")updateHandoff();
 const requestedSetup=setupPrompt(ai,service);
 const ok=await copyText(requestedSetup);
 const currentSelection=requestedSetup===setupPrompt(ai,service);
 copiedSetupPrompt=ok&&currentSelection?requestedSetup:null;
 renderSelections();
 if(!currentSelection){const tip=doc.getElementById("setupTipStatus");if(tip)tip.textContent="Your services changed during copying. Copy the new setup check.";status("Setup changed. Copy the current check again.");return;}
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
 welcome.hidden=new URLSearchParams(location.search).get("intro")!=="1"&&Boolean(stored("hmg-setup-first-tip-dismissed-v3"));
 const journey=doc.getElementById("setupJourney"),begin=doc.getElementById("beginSetup");
 if(begin&&journey)begin.addEventListener("click",()=>{
  const show=journey.hidden;journey.hidden=!show;begin.setAttribute("aria-expanded",String(show));begin.textContent=show?"HIDE SETUP":"SET ME UP";
  if(show)doc.getElementById("stripSetupPrompt")?.focus();
 });
 function leaveSetupTicket(){
  welcome.hidden=true;store("hmg-setup-first-tip-dismissed-v3","yes");
  doc.querySelectorAll("[data-mood]")[0]?.focus();
 }
 for(const id of ["dismissWelcome","finishSetup"]){const control=doc.getElementById(id);if(control)control.addEventListener("click",leaveSetupTicket);}
 const open=doc.getElementById("openSetupAi");
 if(open)open.addEventListener("click",event=>{
  if(copiedSetupPrompt!==setupPrompt(ai,service)){event.preventDefault();const tip=doc.getElementById("setupTipStatus");if(tip)tip.textContent="Copy the current setup check before opening your AI.";doc.getElementById("stripSetupPrompt")?.focus();}
 });
}
function renderShufflePins(){
 for(const axis of Object.keys(shufflePins)){
  const pin=doc.getElementById("pin"+axis[0].toUpperCase()+axis.slice(1));
  if(pin){pin.setAttribute("aria-pressed",String(shufflePins[axis]));pin.setAttribute("aria-label",(shufflePins[axis]?"Unpin ":"Pin ")+axis+" during shuffle");}
 }
 const allPinned=Object.values(shufflePins).every(Boolean),button=doc.getElementById("shuffleCrate"),help=doc.getElementById("shuffleHelp");
 if(button){button.disabled=allPinned;button.setAttribute("aria-disabled",String(allPinned));}
 if(help)help.textContent=allPinned?"All choices pinned. Unpin one to shuffle.":"Pin choices to keep them. Shuffle changes the rest.";
}
for(const axis of Object.keys(shufflePins)){
 const pin=doc.getElementById("pin"+axis[0].toUpperCase()+axis.slice(1));
 if(pin)pin.addEventListener("click",()=>{shufflePins[axis]=!shufflePins[axis];renderShufflePins();const result=doc.getElementById("shuffleResult");if(result)result.textContent=(shufflePins[axis]?"Pinned ":"Unpinned ")+axis+".";});
}
function shuffleCrate(){
 if(Object.values(shufflePins).every(Boolean))return;
 const snapshot={mood,tempo,regions:[...crateSelected],focus:atlasFocus,navigated:atlasUserNavigated,view:atlasPendingView||atlasView(),moodAngle,crateSparkPhrase};
 if(!shufflePins.mood)mood=nextDiscoveryCue([...moods].filter(m=>m!=="go"&&m!==mood),"ghg-shuffle-mood-v1-"+mood);
 if(!shufflePins.pace)tempo=nextDiscoveryCue(tempoSteps.filter(t=>t!==tempo),"ghg-shuffle-pace-v1-"+(tempo||"any"));
 if(!shufflePins.regions){
  const shuffleRegions=crateRegions.filter(r=>r.id!=="antarctica");
  const first=nextDiscoveryCue(shuffleRegions.map(r=>r.id),"ghg-shuffle-region-v2");
  const count=nextDiscoveryCue([1,2],"ghg-shuffle-count-v1"),firstRegion=crateRegions.find(r=>r.id===first);
  crateSelected.clear();crateSelected.add(first);
  if(count===2){const others=shuffleRegions.filter(r=>r.continent!==firstRegion.continent).map(r=>r.id);crateSelected.add(nextDiscoveryCue(others,"ghg-shuffle-bridge-v2-"+firstRegion.continent))}
  atlasFocus=null;atlasUserNavigated=false;
 }
 lastCrateStamp=null;copiedPrompt=null;previousShuffle=snapshot;
 store(crateStorageKey,JSON.stringify([...crateSelected]));selectionChanged(true);if(!shufflePins.regions)frameSelectedAtlas();
 const changed=Object.keys(shufflePins).filter(k=>!shufflePins[k]),kept=Object.keys(shufflePins).filter(k=>shufflePins[k]);
 const result=doc.getElementById("shuffleResult");if(result)result.textContent="Shuffled "+changed.join(", ")+"."+(kept.length?" Kept "+kept.join(" and ")+".":"");
 const control=doc.getElementById("shuffleCrate");if(control){control.setAttribute("data-dealt","true");if(typeof control.animate==="function"&&!(typeof window!=="undefined"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches))control.animate([{transform:"translateY(0)"},{transform:"translateY(2px)"},{transform:"translateY(0)"}],{duration:240,easing:"cubic-bezier(.16,1,.3,1)"})}
 status("Crate shuffled. Review the brief, edit any choice, or undo. Press GO when ready.");
}
const shuffle=doc.getElementById("shuffleCrate");if(shuffle)shuffle.addEventListener("click",shuffleCrate);
const undoShuffle=doc.getElementById("undoShuffle");if(undoShuffle)undoShuffle.addEventListener("click",()=>{
 if(!previousShuffle)return;
 const old=previousShuffle;previousShuffle=null;mood=old.mood;tempo=old.tempo;atlasFocus=old.focus;atlasUserNavigated=old.navigated;
 crateSelected.clear();old.regions.forEach(id=>crateSelected.add(id));moodAngle=old.moodAngle;crateSparkPhrase=old.crateSparkPhrase;copiedPrompt=null;
 store(crateStorageKey,JSON.stringify([...crateSelected]));render();animateAtlasView(old.view||atlasFocus);
 const result=doc.getElementById("shuffleResult");if(result)result.textContent="Previous brief restored.";
 shuffle?.focus();status("Shuffle undone. Press GO to copy the restored brief.");
});
const hardOption=doc.getElementById("goHard");
if(hardOption)hardOption.addEventListener("click",()=>{
 goHard=!goHard;copiedPrompt=null;renderLaunch();
 status("Deeper research and sequencing "+(goHard?"enabled":"disabled")+". Press GO to copy the updated request.");
});
const coverOption=doc.getElementById("includeCover");
if(coverOption)coverOption.addEventListener("click",()=>{
 includeCover=!includeCover;copiedPrompt=null;renderLaunch();
 status("Cover art "+(includeCover?"included":"removed")+". Press GO to copy the updated request.");
});
async function copyGo(){
 const button=doc.getElementById("goButton");
 if(button&&button.disabled)return;
 // Each GO explores a different lane; preview and copied request stay identical.
 moodAngle=moodInterpretations[mood]?nextDiscoveryCue(moodInterpretations[mood],"ghg-mood-angles-v1-"+mood):"";freshCrateLens="";crateSparkPhrase=nextCrateSparkPhrase();renderLaunch();
 const prompt=goPrompt(ai,service,mood);
 if(button){button.disabled=true;button.setAttribute("aria-busy","true");button.setAttribute("data-copy-state","copying")}
 copiedPrompt=null;updateHandoff();
 status("Copying your prompt…");
 const ok=await copyText(prompt);
 if(button){button.disabled=false;button.setAttribute("aria-busy","false")}
 copiedPrompt=ok?prompt:null;updateHandoff();
 if(prompt!==goPrompt(ai,service,mood)){status("Selection changed while copying. Press GO again for the current prompt.");return}
 if(ok){store("ghg-jukebox-used-v1","yes");doc.getElementById("promptReceipt")?.setAttribute("data-impression",String(++printImpression%2));}
 if(ok)status("Copied to clipboard. Playlist creation and saving happen in your AI, not in the Jukebox.");
 else{const details=doc.getElementById("promptDetails");if(details)details.open=true;status("Clipboard blocked. Copy the full prompt in the receipt below, then use its manual Open link.")}
}
doc.querySelectorAll("[data-mood]").forEach(b=>b.addEventListener("click",()=>{
 mood=mood===b.dataset.mood?"go":b.dataset.mood;copiedPrompt=null;selectionChanged();
}));
doc.querySelectorAll("[data-crate-region]").forEach(b=>{
 b.addEventListener("click",()=>toggleCrateRegion(b.dataset.crateRegion));
});

/* Direct manipulation: one finger or mouse drags; two fingers pinch.
   Normal desktop scrolling remains with the page unless modified. */
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
 const a=touches[0],b=touches[1]||a;
 return {x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2,
         distance:Math.max(1,Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY))}
}
function atlasScreenAnchor(map,view,x,y,rect){
 const scale=Math.min(rect.width/view[2],rect.height/view[3]);
 const marginX=(rect.width-view[2]*scale)/2,marginY=(rect.height-view[3]*scale)/2;
 return [view[0]+(x-rect.left-marginX)/scale,view[1]+(y-rect.top-marginY)/scale];
}
// One camera aspect ratio avoids invisible letterboxed pan/zoom margins.
function atlasNormalize(view){
 const ratio=720/372,width=Math.max(120,Math.min(720,Math.max(view[2],view[3]*ratio)));
 const height=width/ratio;
 return [view[0]+view[2]/2-width/2,view[1]+view[3]/2-height/2,width,height];
}
function atlasCollectLand(map){
 const cached=doc.getElementById("atlasNavigationGeometry");
 if(cached){
  try{
   const data=JSON.parse(cached.textContent);
   if(data.version===1&&Array.isArray(data.anchors)&&data.anchors.length&&Array.isArray(data.shapes)&&data.shapes.length){
    atlasLandAnchors.push(...data.anchors);
    for(const [id,x,y,w,h,area] of data.shapes)atlasRegionShapes.push({id,x,y,w,h,area});
    return;
   }
  }catch(e){} // Other editions retain the geometry-derived fallback below.
 }
 if(!map.createSVGPoint)return;
 const point=map.createSVGPoint();
 const paths=Array.from(map.querySelectorAll("[data-atlas-country]"))
  .filter(p=>typeof p.isPointInFill==="function").map(p=>({path:p,box:p.getBBox()}));
 for(const {path} of paths){
  for(const part of (path.getAttribute("d")||"").match(/M[^M]+/g)||[]){
   const points=Array.from(part.matchAll(/[ML](-?[\d.]+)\s+(-?[\d.]+)/g),m=>[Number(m[1]),Number(m[2])]);
   if(points.length<3)continue;
   let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a[0]*b[1]-b[0]*a[1]}
   const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);
   atlasRegionShapes.push({id:path.dataset.atlasRegion,x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y,area:Math.abs(area)/2});
  }
 }
 // Sample the actual projected land once. Bounding boxes alone include oceans
 // between islands and cannot protect against an empty-ocean camera.
 for(let y=26;y<350;y+=12)for(let x=26;x<696;x+=12){
  point.x=x;point.y=y;
  if(paths.some(({path,box:b})=>x>=b.x&&x<=b.x+b.width&&y>=b.y&&y<=b.y+b.height&&path.isPointInFill(point)))atlasLandAnchors.push([x,y]);
 }
}
function atlasConstrain(view){
 let [x,y,w,h]=atlasNormalize(view);
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 x=clamp(x,0,720-w);y=clamp(y,0,372-h);
 // Keep sampled land inside the central 70% of the viewport. The camera can
 // cross oceans, but cannot settle with its only coastline off-screen.
 if(atlasLandAnchors.length&&w<600){
  const mx=w*.15,my=h*.15;
  let best=null,distance=Infinity;
  for(const [lx,ly] of atlasLandAnchors){
   const nx=clamp(clamp(x,lx-w+mx,lx-mx),0,720-w);
   const ny=clamp(clamp(y,ly-h+my,ly-my),0,372-h);
   const d=(nx-x)**2+(ny-y)**2;
   if(d<distance){best=[nx,ny];distance=d}
  }
  if(best)[x,y]=best;
 }
 return [x,y,w,h];
}
function atlasViewForGesture(base,anchor,screen,rect,zoom){
 const ratio=Math.max(Math.max(120/base[2],(120*372/720)/base[3]),Math.min(Math.min(720/base[2],372/base[3]),zoom));
 const width=base[2]*ratio,height=base[3]*ratio;
 const scale=Math.min(rect.width/width,rect.height/height);
 const padX=(rect.width-width*scale)/2,padY=(rect.height-height*scale)/2;
 return atlasConstrain([anchor[0]-(screen.x-rect.left-padX)/scale,anchor[1]-(screen.y-rect.top-padY)/scale,width,height]);
}
function atlasBindGestures(){
 const map=doc.getElementById("crateAtlasMap");if(!map)return;
 atlasCollectLand(map);
 atlasDetailsForView(map,map.getAttribute("viewBox")||"0 0 720 372");
 const stopZoom=()=>{
  if(atlasZoomFrame&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(atlasZoomFrame);
  atlasZoomFrame=0;
 };
 // Freeze the geometry under a new press, rather than moving the target
 // between pointer-down and click while a continent zoom is still running.
 const beginTouch=(event,continuing=false)=>{
  if(event.touches.length<1||event.touches.length>2){atlasTouchGesture=null;flushAtlasNavigation();return;}
  stopZoom();flushAtlasNavigation();
  const view=atlasView(),screen=atlasGesturePoints(event.touches),rect=map.getBoundingClientRect();
  atlasTouchGesture={view,anchor:atlasScreenAnchor(map,view,screen.x,screen.y,rect),distance:screen.distance,rect,count:event.touches.length,start:screen,moved:continuing};
  if(event.touches.length===2){if(event.cancelable)event.preventDefault();atlasSuppressTapUntil=Date.now()+700;}
  else if(!continuing)atlasSuppressTapUntil=0;
 };
 // Mouse/pen drags use the same anchor math as touch; capture only after
 // movement so an ordinary click still reaches the painted country path.
 let pointerGesture=null;
 map.addEventListener("pointerdown",(event={})=>{
  stopZoom();flushAtlasNavigation();warmAtlasArtwork();
  if(event.pointerType==="touch"||event.button!==0)return;
  const view=atlasView(),rect=map.getBoundingClientRect();
  pointerGesture={id:event.pointerId,view,rect,start:{x:event.clientX,y:event.clientY},anchor:atlasScreenAnchor(map,view,event.clientX,event.clientY,rect),moved:false};
 });
 map.addEventListener("pointermove",event=>{
  const s=pointerGesture;if(!s||s.id!==event.pointerId)return;
  const screen={x:event.clientX,y:event.clientY};
  if(!s.moved&&Math.hypot(screen.x-s.start.x,screen.y-s.start.y)<6)return;
  if(!s.moved)map.setPointerCapture(event.pointerId);
  s.moved=true;if(event.cancelable)event.preventDefault();
  queueAtlasNavigation(atlasViewForGesture(s.view,s.anchor,screen,s.rect,1));
  atlasUserNavigated=true;atlasSuppressTapUntil=Date.now()+700;
 });
 const endPointer=event=>{
  if(!pointerGesture||pointerGesture.id!==event.pointerId)return;
  if(pointerGesture.moved)atlasSuppressTapUntil=Date.now()+700;
  pointerGesture=null;flushAtlasNavigation();renderAtlasNavigation();
  if(map.hasPointerCapture?.(event.pointerId))map.releasePointerCapture(event.pointerId);
 };
 map.addEventListener("pointerup",endPointer);
 map.addEventListener("pointercancel",endPointer);
 map.addEventListener("lostpointercapture",endPointer);
 map.addEventListener("touchstart",event=>beginTouch(event),{passive:false});
 map.addEventListener("touchmove",event=>{
  const s=atlasTouchGesture;if(!s||event.touches.length!==s.count)return;
  const screen=atlasGesturePoints(event.touches);
  if(s.count===1&&!s.moved&&Math.hypot(screen.x-s.start.x,screen.y-s.start.y)<6)return;
  if(event.cancelable)event.preventDefault();
  s.moved=true;
  queueAtlasNavigation(atlasViewForGesture(s.view,s.anchor,screen,s.rect,s.count===2?s.distance/screen.distance:1));
  atlasUserNavigated=true;atlasSuppressTapUntil=Date.now()+700;
 },{passive:false});
 const endTouch=event=>{
  const s=atlasTouchGesture;if(!s)return;
  flushAtlasNavigation();
  if(s.moved||s.count===2)atlasSuppressTapUntil=Date.now()+700;
  if(event.touches.length===1)beginTouch(event,true);else atlasTouchGesture=null;
  renderAtlasNavigation();
 };
 map.addEventListener("touchend",endTouch,{passive:true});
 map.addEventListener("touchcancel",()=>{atlasTouchGesture=null;atlasSuppressTapUntil=Date.now()+700;flushAtlasNavigation();renderAtlasNavigation()},{passive:true});
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


/* ATLAS SECRETS — the original printed ships, creatures, routes and chart
   endpoints are the anchors. The geometry, zoom, and country hit paths never
   change; this optional layer only becomes interactive after close inspection. */
function installAtlasSecrets(){
 const map=doc.getElementById("crateAtlasMap");
 if(!map?.classList?.contains?.("crate-robinson")||typeof doc.createElementNS!=="function")return;
 const engraving=map.querySelector(".chart-details");
 const art=[...map.querySelectorAll(".chart-details > svg")];
 const routePath=map.querySelector(".chart-nautical-routes path");
 const endpoints=[...map.querySelectorAll(".chart-nautical-routes circle")];
 if(!engraving||art.length<3||!routePath||endpoints.length<6)return;
 // Verified origin/destination port coordinates, transformed with the *same*
 // tabulated Robinson projection as scripts/robinson_atlas.py. Intermediate
 // points are offshore waypoints, not assertions about historical shipping.
 // They steer the Atlantic route around the existing illustrated vessel.
 const routePlans=[
  {ports:"Georgetown, Guyana / Dakar, Senegal",
   waypoints:[[-58.155,6.8],[-47,21],[-35,23],[-17.45,14.69]]},
  {ports:"Rio de Janeiro, Brazil / Luanda, Angola",
   waypoints:[[-43.2,-22.9],[-28,-20],[-7,-15],[13.23,-8.82]]},
  {ports:"Mombasa, Kenya / Mumbai, India",
   waypoints:[[39.67,-4.04],[53,1],[63,11],[72.88,19.08]]}
 ];
 const robinX=[1,.9986,.9954,.99,.9822,.973,.96,.9427,.9216,.8962,.8679,.835,.7986,.7597,.7186,.6732,.6213,.5722,.5322];
 const robinY=[0,.062,.124,.186,.248,.31,.372,.434,.4958,.5571,.6176,.6769,.7346,.7903,.8435,.8936,.9394,.9761,1];
 const interpolate=(table,lat)=>{
  const a=Math.min(90,Math.abs(lat)),i=Math.min(Math.floor(a/5),17),t=(a-i*5)/5;
  return table[i]+(table[i+1]-table[i])*t;
 };
 const projectPort=([lon,lat])=>[
  360+335*(lon/180)*interpolate(robinX,lat),
  188-Math.sign(lat)*168*interpolate(robinY,lat)
 ];
 // Smooth Catmull-Rom-to-cubic line through projected marine waypoints.
 const chartPath=points=>{
  const p=points.map(projectPort),f=n=>Number(n.toFixed(1));
  let d="M"+f(p[0][0])+" "+f(p[0][1]);
  for(let i=0;i<p.length-1;i++){
   const prev=p[Math.max(0,i-1)],a=p[i],b=p[i+1],next=p[Math.min(p.length-1,i+2)];
   const c1=[a[0]+(b[0]-prev[0])/6,a[1]+(b[1]-prev[1])/6];
   const c2=[b[0]-(next[0]-a[0])/6,b[1]-(next[1]-a[1])/6];
   d+="C"+f(c1[0])+" "+f(c1[1])+" "+f(c2[0])+" "+f(c2[1])+" "+f(b[0])+" "+f(b[1]);
  }
  return d;
 };
 // The Pacific occupies both outside edges of the Robinson plate. Calculate
 // a short great-circle corridor, split precisely at the antimeridian,
 // and render two separate subpaths: never draw a false line across Eurasia.
 // This is illustrative navigation, not a live or historical vessel track.
 const greatCirclePacific=()=>{
  const rad=Math.PI/180,deg=180/Math.PI;
  const unit=([lon,lat])=>{
   const a=lon*rad,b=lat*rad;
   return [Math.cos(b)*Math.cos(a),Math.cos(b)*Math.sin(a),Math.sin(b)];
  };
  const start=unit([113.62,22.78]),end=unit([-118.20,33.77]);
  const dot=start.reduce((v,n,i)=>v+n*end[i],0);
  const angle=Math.acos(Math.max(-1,Math.min(1,dot)));
  const pointAt=t=>{
   const w1=Math.sin((1-t)*angle)/Math.sin(angle),w2=Math.sin(t*angle)/Math.sin(angle);
   const v=start.map((n,i)=>n*w1+end[i]*w2);
   return [Math.atan2(v[1],v[0])*deg,Math.atan2(v[2],Math.hypot(v[0],v[1]))*deg];
  };
  const legs=[[]];let seamLat=null,previous=null;
  for(let i=0;i<=72;i++){
   const point=pointAt(i/72);
   if(previous&&previous[0]>150&&point[0]<-150){
    const crossed=point[0]+360;
    const fraction=(180-previous[0])/(crossed-previous[0]);
    seamLat=previous[1]+fraction*(point[1]-previous[1]);
    legs[0].push([180,seamLat]);
    legs.push([[-180,seamLat]]);
   }
   legs[legs.length-1].push(point);
   previous=point;
  }
  if(legs.length!==2||!Number.isFinite(seamLat))return null;
  const fmt=n=>Number(n.toFixed(1));
  const path=legs.map(leg=>leg.map((coord,i)=>{
   const [x,y]=projectPort(coord);
   return (i?"L":"M")+fmt(x)+" "+fmt(y);
  }).join("")).join(" ");
  return {path,seamLat,origin:[113.62,22.78],destination:[-118.20,33.77]};
 };
 const pacific=greatCirclePacific();
 // Liverpool (Atlantic & Western Europe) -> Halifax (Eastern Canada) ->
 // Grand Turk (Turks and Caicos; Caribbean region).
 // Follow the Irish Sea / St George's Channel to clear Irish land.
 // Two offshore legs share the Halifax waypoint.
 // A listening itinerary, not a historical vessel or commerce claim.
 const westboundLegs=[
  [[-3.05,53.43],[-4.8,53.2],[-5.55,52.3],[-7.8,50.4],[-20,50.7],[-40,49.2],[-57,47.4],[-63.57,44.65]],
  [[-63.57,44.65],[-67,39.2],[-69.5,33.5],[-72,28.5],[-71.9,24],[-71.13,21.47]]
 ];
 const westboundPath=westboundLegs.map(chartPath).join(" ");
 const routeParts=routePlans.map(route=>chartPath(route.waypoints));
 routePath.setAttribute("d",routeParts.join(" "));
 // Keep the printed dots attached to the same, now correct, route endpoints.
 routePlans.forEach((route,i)=>{
  const start=projectPort(route.waypoints[0]),end=projectPort(route.waypoints[route.waypoints.length-1]);
  for(const [node,point] of [[endpoints[2*i],start],[endpoints[2*i+1],end]]){
   node.setAttribute("cx",point[0].toFixed(1));node.setAttribute("cy",point[1].toFixed(1));
  }
 });
 const parent=engraving.parentNode,ns="http://www.w3.org/2000/svg";
 const svg=(tag,attrs={})=>{
  const node=doc.createElementNS(ns,tag);
  for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));
  return node;
 };
 if(pacific){
  // Both halves share one discovery target. Continue at the map edge with
  // paired ink dots instead of inventing new ships or changing the projection.
  routeParts.push(pacific.path);
  const decor=svg("path",{d:pacific.path,class:"atlas-pacific-crossing"});
  routePath.parentNode.insertBefore(decor,routePath.nextSibling);
  for(const lon of [179.4,-179.4]){
   const [x,y]=projectPort([lon,pacific.seamLat]);
   routePath.parentNode.appendChild(svg("circle",{cx:x.toFixed(1),cy:y.toFixed(1),r:2.6,class:"atlas-pacific-seam"}));
  }
  for(const point of [pacific.origin,pacific.destination]){
   const [x,y]=projectPort(point);
   routePath.parentNode.appendChild(svg("circle",{cx:x.toFixed(1),cy:y.toFixed(1),r:2.1,class:"atlas-pacific-port"}));
  }
 }
 const westboundChart=svg("path",{d:westboundPath,class:"atlas-westbound-crossing"});
  routePath.parentNode.appendChild(westboundChart);
  for(const point of [westboundLegs[0][0],westboundLegs[0][4],westboundLegs[1][4]]){
   const [x,y]=projectPort(point);
   routePath.parentNode.appendChild(svg("circle",{cx:x.toFixed(1),cy:y.toFixed(1),r:2.2,class:"atlas-westbound-port"}));
  }
 const secrets=[
  {id:"atlantic-crossing",kind:"route",title:"THE ATLANTIC CROSSING",
   eyebrow:"CONTRABAND ROUTE",body:"Georgetown to Dakar. Two Atlantic coasts, interlocking guitars and voices. Follow the sound; check the sleeves.",
   regions:["northern-south-america","west-africa"],path:routeParts[0]},
  {id:"southern-passage",kind:"route",title:"A SOUTHERN DETOUR",
   eyebrow:"CONTRABAND ROUTE",body:"Rio to Luanda. Compare the pulse on each shore. A listening match, not a documented crossing.",
   regions:["southern-south-america","central-southern-africa"],path:routeParts[1]},
  {id:"indian-ocean",kind:"route",title:"THE LONG WAY ROUND",
   eyebrow:"CONTRABAND ROUTE",body:"Mombasa to Mumbai. A percussion conversation across the Indian Ocean. Let the records make the connection.",
   regions:["east-africa","south-asia"],path:routeParts[2]},
  {id:"pacific-handoff",kind:"route",title:"THE PACIFIC HANDOFF",
   eyebrow:"CONTRABAND ROUTE · DATE LINE",body:"Guangzhou to Long Beach. Off the right edge, on the left. The Date Line can't stop a good dig.",
   regions:["east-asia","us-west"],path:pacific?.path},
  {id:"westbound-manifest",kind:"route",title:"THE WESTBOUND MANIFEST",
   eyebrow:"CONTRABAND ROUTE · THREE PORTS",body:"Liverpool to Halifax to Grand Turk. Three ports, two Atlantic legs. A listening itinerary, not a ship's log.",
   regions:["atlantic-europe","canada-east","caribbean"],path:westboundPath},
  {id:"unlicensed-vessel",kind:"ship",title:"THE UNLICENSED VESSEL",
   eyebrow:"PORT AUTHORITY NOTICE",body:"Twelve records. Three doubtful dates. One alleged first pressing. The clerk wants receipts.",art:0},
  {id:"serpent",kind:"monster",title:"UNVERIFIED SIGHTING",
   eyebrow:"THE CARTOGRAPHER'S MISTAKES",body:"The locals call it prog rock. The creature objects.",art:1},
  {id:"deep-water",kind:"monster",title:"HERE BE REISSUES",
   eyebrow:"THE CARTOGRAPHER'S MISTAKES",body:"Rare pressing, average record. The chartmaker learned the hard way.",art:2},
  {id:"margin-one",kind:"marginalia",title:"A CORRECTION IN THE MARGIN",
   eyebrow:"CLERK'S ANNOTATION",body:"A listening suggestion, not a claim about anybody's birthplace. Check the sleeve.",end:1},
  {id:"margin-two",kind:"marginalia",title:"UNAUTHORIZED FOOTNOTE",
   eyebrow:"CLERK'S ANNOTATION",body:"Every map leaves something out. Check the territory before you stamp it.",end:5}
 ];
 const layer=svg("g",{class:"atlas-secrets-layer","aria-hidden":"true"});
 const hotspots=[];
 for(const secret of secrets){
  if(secret.kind==="route"&&!secret.path)continue;
  const g=svg("g",{class:"atlas-secret-hotspot","data-secret":secret.id,
   role:"button",tabindex:"-1","aria-label":"Discover: "+secret.title});
  let target;
  if(secret.path){
   const ink=svg("path",{d:secret.path,class:"atlas-secret-route-highlight"});
   g.appendChild(ink);
   target=svg("path",{d:secret.path,class:"atlas-secret-route-touch"});
  }else{
   let x,y;
   if(Number.isInteger(secret.art)){
    const a=art[secret.art];
    x=Number(a.getAttribute("x"))+Number(a.getAttribute("width"))/2;
    y=Number(a.getAttribute("y"))+Number(a.getAttribute("height"))/2;
   }else{
    const a=endpoints[secret.end];x=Number(a.getAttribute("cx"));y=Number(a.getAttribute("cy"));
   }
   target=svg("circle",{cx:x,cy:y,r:13,class:"atlas-secret-target"});
   const hint=svg("circle",{cx:x,cy:y,r:13,class:"atlas-secret-ring"});
   g.appendChild(hint);
  }
  g.appendChild(target);
  const activate=event=>{
   if(map.getAttribute("data-details")!=="true"||atlasTouchGesture||Date.now()<atlasSuppressTapUntil)return;
   event.stopPropagation();event.preventDefault();
   openAtlasSecret(secret,g,event.type==="keydown"||event.detail===0);
  };
  g.addEventListener("click",activate);
  g.addEventListener("keydown",event=>{
   if(event.key==="Enter"||event.key===" "){activate(event)}
  });
  layer.appendChild(g);hotspots.push(g);
 }
 parent.insertBefore(layer,engraving.nextSibling);
 const frame=map.closest(".crate-map-frame");
 if(!frame?.parentNode)return;
 const card=doc.createElement("section");card.id="atlasSecretCard";
 card.className="atlas-secret-card";card.hidden=true;
 card.setAttribute("aria-label","Atlas discovery");
 const heading=doc.createElement("h3");heading.id="atlasSecretTitle";heading.tabIndex=-1;
 const eyebrow=doc.createElement("span");eyebrow.className="atlas-secret-eyebrow";
 const content=doc.createElement("p");content.className="atlas-secret-body";
 const footer=doc.createElement("div");footer.className="atlas-secret-footer";
 const action=doc.createElement("button");action.type="button";action.className="atlas-secret-add";
 action.textContent="PICK THESE REGIONS";
 const close=doc.createElement("button");close.type="button";close.className="atlas-secret-close";
 close.textContent="CLOSE";
 footer.append(action,close);card.append(eyebrow,heading,content,footer);
 frame.parentNode.insertBefore(card,frame.nextSibling);
 let active=null,trigger=null;
 function closeCard(returnFocus=false){
  const previous=trigger;
  card.hidden=true;active=null;trigger=null;
  for(const hot of hotspots)hot.removeAttribute("data-active");
  if(returnFocus&&previous?.getAttribute("tabindex")==="0")previous.focus();
 }
 function openAtlasSecret(secret,node,fromKeyboard=false){
  active=secret;trigger=node;
  const firstOpen=card.hidden;
  card.dataset.kind=secret.kind;card.hidden=false;
  for(const hot of hotspots)hot.toggleAttribute("data-active",hot===node);
  eyebrow.textContent=secret.eyebrow;heading.textContent=secret.title;
  content.textContent=secret.body;
  action.hidden=!secret.regions;
  action.disabled=false;action.textContent="PICK THESE REGIONS";
  // Keep the camera and page steady when changing an already-open discovery.
  // In particular, do not steal touch focus or scroll away from another route.
  if(fromKeyboard)heading.focus({preventScroll:true});
  else if(firstOpen)card.setAttribute("aria-live","polite");
 }
 close.addEventListener("click",()=>closeCard(true));
 card.addEventListener("keydown",event=>{
  if(event.key==="Escape"){event.preventDefault();closeCard(true)}
 });
 action.addEventListener("click",()=>{
  if(!active?.regions)return;
  // Choosing a route is a replacement, never an additive stamp. The selected
  // regions are exactly the route regions; no stale manual picks remain.
  const picked=[...new Set(active.regions)].filter(id=>validCrateRegions.has(id));
  if(!picked.length)return;
  const same=crateSelected.size===picked.length&&picked.every(id=>crateSelected.has(id));
  if(!same){
   crateSelected.clear();
   for(const id of picked)crateSelected.add(id);
   lastCrateStamp=null;
   updateCrateMap();
  }
  action.textContent=same?"ALREADY PICKED":"REGIONS PICKED";
  action.disabled=true;
 });
 // The original atlas already computes data-details as its camera zooms.
 // Keep the optional art targets out of the pointer/keyboard path until then.
 map._atlasSecretsSync=visible=>{
  layer.setAttribute("aria-hidden",String(!visible));
  for(const target of hotspots)target.setAttribute("tabindex",visible?"0":"-1");
  if(!visible&&!card.hidden)closeCard();
 };
 map._atlasSecretsSync(map.getAttribute("data-details")==="true");
}
installAtlasSecrets();


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
if(crateSelected.size)frameSelectedAtlas();
// One ticket travels with the reader and docks in the printed receipt.
// No mirrored summary is painted over the paper feed or clipboard ink.
const ticket=doc.getElementById("selectionTicket");
if(ticket){
 const firstAiChoice=doc.querySelector(".service-counter .panel");
 const dock=doc.getElementById("receiptTicketDock");
 const receipt=doc.getElementById("promptReceipt");
 const details=ticket.querySelector("details");
 const site=doc.querySelector(".site");
 function updateSelectionTicketVisibility(){
  if(!firstAiChoice||!dock||!receipt||!site)return;
  // Stable threshold: moving the ticket must not move the trigger itself.
  const receiptReached=receipt.getBoundingClientRect().top<=window.innerHeight-88;
  if(receiptReached){
   if(ticket.parentElement!==dock){
    dock.appendChild(ticket);
    ticket.classList.add("is-docked");
    // File the summary closed by default; let the visitor expand it deliberately.
    // The compact receipt must not crowd the post-GO handoff below.
    details.open=false;
   }
   ticket.hidden=false;
  }else{
   if(ticket.parentElement===dock){
    doc.body.insertBefore(ticket,site);
    ticket.classList.remove("is-docked");
    details.open=false;
   }
   ticket.hidden=firstAiChoice.getBoundingClientRect().bottom>0;
   if(ticket.hidden)details.open=false;
  }
 }
 let ticketFrame=0;
 function queueSelectionTicketVisibility(){
  if(ticketFrame)return;
  ticketFrame=requestAnimationFrame(()=>{ticketFrame=0;updateSelectionTicketVisibility()});
 }
 window.addEventListener("scroll",queueSelectionTicketVisibility,{passive:true});
 window.addEventListener("resize",queueSelectionTicketVisibility,{passive:true});
 // The receipt sheet moves during the printer animation. Recheck its dock.
 doc.getElementById("promptReceipt")?.addEventListener("animationend",queueSelectionTicketVisibility);
 const edit=doc.getElementById("selectionTicketEdit");
 if(edit)edit.addEventListener("click",()=>doc.querySelector(".service-counter")?.scrollIntoView({behavior:"smooth",block:"start"}));
 updateSelectionTicketVisibility();
}
})();
