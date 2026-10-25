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
 const install=ai==="gemini"?"Use Task mode for this one-time repository installation; do not schedule a recurring task. Install or refresh the Gemini-specific complete Skill from https://github.com/focustimer-dev/go-hipster-go/releases/latest/download/go-hipster-go-gemini-app-skill.zip; do not substitute the shared root SKILL.md, whose defaults include other platforms. If the Task agent cannot persist a Skill, tell me to open Gemini in a desktop or mobile WEB BROWSER at gemini.google.com, then Customize → Skills → Create → Upload the latest complete ZIP. Do not direct me to upload the ZIP inside the native Gemini app.":ai==="claude"?"If missing, identify whether I need Claude's Skills ZIP or Plugins ZIP; they are different.":"If missing, use the available app/skill installation flow or show how to install from the project's GitHub repository.";
 return "FIRST-TIME SETUP CHECK for "+name+" + "+target+".\n"+intro+" "+install+" Source: "+repo+(ai==="gemini"?"\nThe Gemini-native source is https://github.com/focustimer-dev/go-hipster-go/blob/main/adapters/gemini/GEM_KNOWLEDGE.md (skill plus filtered references); the release ZIP above is the authoritative complete install. Read or install THAT Gemini version, not the generic root SKILL.md. Use only actual Gemini Skills capabilities. Verify the loaded skill explicitly reports version 3.7.2 and whether the installation persists into a new conversation. If repository loading only reads instructions but cannot install a persistent Skill, be clear and offer the latest Gemini ZIP upload instead. Do not report installation complete just because the URL was opened.":"")+
 (ai==="chatgpt"&&service==="apple"?"\nConnect Apple Music through ChatGPT Settings → Apps, then select both Apple Music and Go, Hipster, Go! in this conversation. Search and playlist generation do not require an Apple Music subscription; saving to the library does. Recognize the app’s playlist widget and user-operated save control as a supported path, even without a direct playlist-writing tool. Explain Create playlist in Apple Music when that control is offered. Do not require a subscription just to finish discovery setup or assume access to my library or listening history.":"")+
 (ai==="claude"&&service==="apple"?"\nApple Music requires a compatible MCP connector: local for Desktop or hosted for web/mobile. Check which Claude app I use and help me connect it if missing. Verify catalog track search, playlist creation and adding tracks; library-only search may not find new recordings.":"")+
 "\nIf the skill is available, run its setup for "+target+", guide me through connecting or selecting that music service, and CHECK whether playlist creation and adding tracks are actually supported—not just search/playback. Tell me the smallest action needed to finish setup. If everything is already ready, say so and tell me to run go. Do NOT generate a new playlist during this setup check, claim a playlist was saved, or ask me to paste credentials into chat.";
}
const universalPrompt="If using Gemini, choose Task mode beneath the input BEFORE sending this one-time installation request (do not schedule a recurring task). Install the official complete Gemini skill ZIP at "+releases+"go-hipster-go-gemini-app-skill.zip; GitHub's "+repo+"/blob/main/adapters/gemini/GEM_KNOWLEDGE.md is the readable Gemini-specific mirror. Do not use the generic root SKILL.md. Install it using your supported Skill mechanism and confirm the loaded version is 3.7.2 and whether it persists across Gemini conversations. If reading GitHub does not install it, say so and offer the current Gemini Skill ZIP at "+releases+"go-hipster-go-gemini-app-skill.zip. Upload ZIPs only through Gemini WEB or MOBILE WEB at gemini.google.com, not the native mobile app. Then run setup; do not create a playlist or assume a writer exists.";
function goCommand(ai,service,mood){
 const go=mood==="go"?"go":"go "+mood;
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
function moodDiscoveryBrief(mood){
 if(!moodInterpretations[mood])return "";
 return moodAngle?"\nMood angle: "+moodAngle+".":"";
}

/* Real entropy from independently combined creative cues, not a hard-coded artist roster.
   Store only recent cue IDs; no music history or account data is recorded. */
const crateSparkWords=[
 ["papery handclaps","elastic low end","hollow percussion","unsteady guitar","dubbed-out space","wiry organ","hushed harmonies","brittle synths","rough-edged strings","shifting drum accents"],
 ["at the night ferry","under an empty arcade","beneath rain-streaked windows","past a deserted ballroom","through a late-night radio","inside a faded cinema","on a slow mountain bus","after the last dance","beside an old tape machine","at a half-lit market"]
];
// MOOD_SPARK_BANK_BEGIN
const moodSparkBank={"sad":["Melancholic Rain Drift","Lonely Bedroom Echo","Fading Ember Grief","Empty Highway Ache","Weeping Cello Drone","Somber Winter Piano","Hollow Heart Tremor","Drowning In Reverie","Distant Fog Lament","Unsent Letters Sigh","Tearful Acoustic Strum","Bleak Horizon Solitude","Heavy Chest Sigh","Lingering Ghost Memory","Quiet Apartment Blues","Fractured Soul Waltz","Muffled Sob Texture","Gray Autumn Dusk","Wistful Midnight Drift","Slow Sinking Abyss","Bitter Farewell Chord","Pale Sunlight Melancholy","Submerged Vocal Cry","Abandoned House Creak","Softly Broken Chords","Desolate Desert Wind","Cold Rainy Window","Nostalgic Yearning Haze","Vanishing Trace Silence","Low Vibrato Weep","Forgotten Lullaby Hum","Bleeding Watercolor Tone","Solitary Bench Reflections","Velvet Shadow Gloom","Fragile Glass Heart","Deep Trench Sorrow","Twilight Separation Ache","Lingering Cold Touch","Muted Brass Mourning","Lost In Shadows","Resigned Heavy Breath","Hollow Bell Toll","Somber Minor Progression","Drifting Away Slow","Tear-Stained Tape Loop","Frozen Pond Stillness","Quiet Defeat Drone","Haunting Reverberant Whisper","Ghost Ship Drift","Eternal Midnight Blues"],"angry":["Searing Guitar Shred","Relentless Blast Beats","Ferocious Riff Assault","Crushing Industrial Grind","Raw Cybernetic Fury","Blood-Boiling Distortions","Spiteful Grudge Groove","Screaming Feedback Havoc","Throat-Tearing Growl","Sledgehammer Bass Slam","Blinding Hate Surge","Punishing Breakcore Frenzy","Razor-Wire Static","Unhinged Metalcore Breakdown","Snarl And Bite","Scorched Earth Drop","Violent Tremolo Strike","Volcanic Magma Eruption","Brawling Pit Mayhem","Vengeful Drum Assault","Redline Overdrive Peak","Clanging Chain Strike","Guttural Roar Surge","Malicious Code Corruption","Piercing Siren Panic","Shattered Glass Impact","Toxic Fume Rage","Frenzied Mosh Clash","Deafening Feedback Wall","Hardcore Punch-Out","Sonic Teeth Gnashing","Bitter Spite Spit","Rampaging War Engine","Chugging Down-Tuned Riffs","Brutal Concrete Slam","Vicious Bassbite Attack","Stabbing Synth Stabs","Anarchic Riot Wave","Thunderous Fury Stomp","Boiling Blood Rhythm","Jagged Metal Scrape","Destructive Waveform Crash","Merciless Tempo Push","Seething Resentment Pulse","Uncaged Wild Beast","Furious Headbang Loop","Crushed Bone Sub","Acid Fire Spurt","Heavy Percussive Pound","Cataclysmic Noise Swarm"],"weird":["Bent Tape Wobble","Glitched Dream Logic","Alien Circus March","Warped Vinyl Slime","Subaquatic Clock Tick","Disorienting Polyrhythm Drift","Haunted Toybox Melody","Microtonal Meadow Flute","Dripping Slime Synth","Uncanny Valley Hum","Backward Vocal Reversal","Twisted Carousel Organ","Bouncing Rubber Bass","Psychedelic Frog Choir","Broken Radio Chimes","Liquid Crystal Drip","Melting Wax Drone","Fluorescent Bug Buzz","Dimension Slip Echo","Erratic Neon Jitter","Detuned Arcade Madness","Phantasmal Funhouse Mirror","Whispering Fungus Forest","Wobbling Jello Beat","Martian Swamp Lullaby","Elastic Pitch Bender","Surrealist Dream Sequence","Creepy Marionette Stumble","Quantum Foam Fizzle","Cryptid Footstep Crunch","Static-Soaked Static Glitch","Astral Jester Waltz","Inverted Echo Chamber","Bubbling Cauldron Pluck","Glitchy Clockwork Beetle","Fractured Hologram Tone","Spooky Theremin Wobble","Hypnotic Spiral Pulse","Hallucinogenic Rainbow Shimmer","Stuttering Time Warp","Odd Meter Stumble","Ghost In Microwave","Wonky Bass Squiggle","Floating Upside Down","Shuffling Skeleton Bones","Murky Cavern Gurgle","Vaporous Slime Bounce","Out-Of-Tune Musicbox","Cosmic Static Sneeze","Bizarre Twilight Carnival"],"happy":["Sun-Drenched Whistle","Golden Hour Bounce","Upbeat Ukulele Strum","Joyful Brass Blast","Carefree Bubblegum Pop","Careless Whispering Breeze","Sparkling Pool Splash","Bouncy Morning Coffee","Jubilant Handclap Rhythm","Warm Woolen Sweater","Radiant Sunset Smile","Cheerful Roadtrip Vibe","Giddy Sugar Rush","Blithe Prairie Stroll","Pure Childhood Glee","Sweet Honeycomb Groove","Bubbly Synth Flutter","Playful Puppy Bounce","High-Five Funk Jam","Carefree Summer Vacation","Smiling Sunflower Sway","Confetti Explosion Pop","Floating Balloon Bounce","Bright Neon Sparkle","Lively Campfire Singalong","Warm Hug Acoustic","Breezy Bicycle Coast","Skipping Pavement Groove","Crisp Morning Air","Vibrant Spring Bloom","Roller-Skating Disco Sparkle","Triumphant Happy Tears","Sweet Strawberry Jam","Sunny Balcony Serenade","Euphoric Festival Bounce","Optimistic Tomorrow Melody","Glistening Dewdrop Chime","Laughing Friend Echo","Peppy Sidewalk Strut","Cozy Cocoa Warmth","Heartfelt Grin Melody","Carefree Beach Cruise","Tropical Breeze Sway","Cheerful Whistle Chorus","Sunlit Daisy Meadow","Sparkling Citrus Fizz","Warm Glow Harmony","Playful Kazoo Parade","Golden Ribbon Dance","Blissful Saturday Morning"],"criminal":["Gritty Street Swagger","Lowrider Hydraulic Bounce","Menacing 808 Knock","Smoked-Out Velvet Lounge","Cold-Blooded Corner Stare","Heavy Gold Chain","Sinister Trap Whistle","Mafia Speakeasy Brass","Ruthless Kingpin Strut","Muffled Trunk Rattle","Dark Alley Stroll","Midnight Drive-By Bass","Ice-Cold Pimp Walk","Unforgiving Concrete Jungle","Raw Boom-Bap Knock","Shadowy Syndicate Meeting","Chrome Rim Glint","Chilling Minor Piano","Smoldering Cigar Smoke","G-Funk Whine Glide","Cutthroat Hustler Stride","Heavy Mobster Waltz","Cold Steel Clink","Menacing Midnight Stalker","Bulletproof Tint Cruise","Gritty Vinyl Crackle","Blacked-Out Sedan Glide","Ruthless Turf Patrol","High-Stakes Card Game","Heavy Velvet Trenchcoat","Dark Trap Menace","Subwoofer Ground Quake","Shady Rooftop Deal","Low-Key Heist Tension","Diamond Cut Precision","Sinister Brass Swell","Streetlight Shadow Lurk","Slow-Rolling Cadillac Beat","Brick Wall Standoff","Dangerous Money Talk","Relentless Corner Pressure","Smokey Backroom Poker","Ghostly Street Violin","Heavy Artillery Bump","Tough Guy Sneer","Midnight Block Watch","Razor-Sharp Flow Vibe","Chilling Godfather Melody","Dark Crown Sovereign","Street Code Silence"]};
// MOOD_SPARK_BANK_END
let crateSparkPhrase="";
function compatibleSpark(cue){
 // These are creative filters, not BPM measurements or genre judgements.
 if(["slow","relaxed"].includes(tempo)&&/blast beats|breakcore|frenz|redline|tempo push|headbang|mosh|sugar rush|upbeat/i.test(cue))return false;
 if(["brisk","fast"].includes(tempo)&&/slow|stillness|quiet defeat drone|sinking abyss/i.test(cue))return false;
 return true;
}
function nextCrateSparkPhrase(){
 const cues=(moodSparkBank[mood]||Object.values(moodSparkBank).flat()).filter(compatibleSpark);
 const key="ghg-crate-sparks-v2-"+mood+"-"+(tempo||"any");
 const image=nextDiscoveryCue(cues,key+"-image");
 const texture=nextDiscoveryCue(crateSparkWords[0],"ghg-crate-sparks-v2-texture");
 const setting=nextDiscoveryCue(crateSparkWords[1],"ghg-crate-sparks-v2-setting");
 return texture+" / "+setting+" / "+image.toLowerCase();
}
// The skill owns curation policy; GO sends only current creative inputs and service.
function goPrompt(ai,service,mood){
 const parts=[goCommand(ai,service,mood)];
 if(crateSelected.size)parts.push(crateRegionPrompt());
 const brief=moodDiscoveryBrief(mood);if(brief)parts.push(brief.trim());
 if(tempo)parts.push("Tempo preference: "+tempoNames[tempo]+".");
 if(crateSparkPhrase)parts.push("Seed: "+crateSparkPhrase+".");
 parts.push("Service: "+serviceNames[service]+".");
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
 return "Regional exploration: "+all.join(", ")+".";
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
 const confirmation=ai==="gemini"?"Check that v3.7.2 is installed as a persistent Skill in a new conversation. Reading the files once does not count. Then return to the Jukebox and press GO.":"Run the setup check above. When your AI confirms the skill and music connection are ready, return to the Jukebox and press GO.";
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
 const tempoHelp=doc.getElementById("tempoHelp");if(tempoHelp)tempoHelp.textContent=tempo?tempoNames[tempo]+" pace. Choose Any to clear it.":"Any pace. The clerk can cope. Move the slider to choose.";
 if(anyTempo)anyTempo.setAttribute("aria-pressed",String(!tempo));
 doc.querySelectorAll("[data-mood]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mood===mood)));
 const clerkNotes={happy:"Optimism. An ambitious brief.",angry:"For when everyone else is obviously the problem.",sad:"Melancholy. Filed under essential listening.",weird:"The neighbors may have questions."};
 const moodHelp=doc.getElementById("moodHelp");if(moodHelp)moodHelp.textContent=mood==="criminal"?"Songs about crime. Artist reputations are not evidence.":mood==="go"?"No mood? We’ll use our judgment.":mood[0].toUpperCase()+mood.slice(1)+" selected. "+clerkNotes[mood];
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
 moodAngle=moodInterpretations[mood]?nextDiscoveryCue(moodInterpretations[mood],"ghg-mood-angles-v1-"+mood):"";freshCrateLens="";crateSparkPhrase=nextCrateSparkPhrase();renderLaunch();
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
 const a=touches[0],b=touches[1]||a;
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
 const beginTouch=(event,continuing=false)=>{
  if(event.touches.length<1||event.touches.length>2){atlasTouchGesture=null;flushAtlasNavigation();return;}
  stopZoom();flushAtlasNavigation();
  const view=atlasView(),screen=atlasGesturePoints(event.touches),rect=map.getBoundingClientRect();
  atlasTouchGesture={view,anchor:atlasScreenAnchor(map,view,screen.x,screen.y,rect),distance:screen.distance,rect,count:event.touches.length,start:screen,moved:continuing};
  if(event.touches.length===2){if(event.cancelable)event.preventDefault();atlasSuppressTapUntil=Date.now()+700;}
  else if(!continuing)atlasSuppressTapUntil=0;
 };
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
