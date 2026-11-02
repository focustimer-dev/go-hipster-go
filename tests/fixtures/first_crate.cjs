const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('launcher/assets/first-crate.js','utf8');
function boot(saved,initial={ai:'chatgpt',service:'spotify'}){
 const events={},nodes={},details={open:false,querySelector:()=>({select(){}})};let savedValue=saved;
 function node(id){return nodes[id]??=( {value:id==='ai'?'ChatGPT':id==='service'?'Spotify':id==='pace'?'Any':'Worldwide',checked:false,hidden:false,innerHTML:'',textContent:'',classList:{toggle(){}},append(){},focus(){},scrollIntoView(){},setAttribute(){},addEventListener(t,f){events[id+':'+t]=f},querySelector(q){return q==='details'?details:node('dynamic')},querySelectorAll(){return []}})}
 const root={querySelector:q=>q.startsWith('#fc-')?node(q.slice(4)):node('mood'),querySelectorAll:()=>[],addEventListener(t,f){events[t]=f}};
 const c={window:{HipsterSetup:{getPair:()=>initial,setPair(){}}},document:{getElementById:()=>root,querySelector:()=>node('mood'),addEventListener(){}},navigator:{clipboard:{writeText:async()=>{throw Error('denied')}}},localStorage:{getItem:()=>savedValue||null,setItem:(k,v)=>savedValue=v}};
 vm.createContext(c);vm.runInContext(code.replace(/render\(\);\s*\}\)\(\);\s*$/,`render();globalThis.inspect=()=>({stage,paused,completed,help,copySerial,confirmedPairs});})();`),c);
 return {c,nodes,events,details,state:()=>c.inspect(),saved:()=>savedValue,click:async a=>events.click({target:{closest:()=>({dataset:{action:a},disabled:false})}}),change:async(id,value)=>{node(id).value=value;events[id+':change']()}};
}
(async()=>{
 const a=boot();await a.click('check');await a.click('copy');assert.equal(a.state().stage,'check');assert(a.details.open);assert(a.nodes.ticket.innerHTML.includes('MY AI CONFIRMED'));
 await a.click('copied');assert.equal(a.state().stage,'copied');assert(!a.nodes.ticket.innerHTML.includes('<details open'));assert(a.nodes.ticket.innerHTML.includes('MY AI CONFIRMED'));
 await a.click('pause');assert(a.state().paused&&!a.state().completed);const paused=boot(a.saved());assert(paused.state().paused);await paused.click('resume');assert(!paused.state().completed);
 await a.click('resume');await a.click('ready');assert(a.state().completed);assert(a.nodes['current-setup'].innerHTML.includes('ALL SET'));assert(a.nodes['current-setup'].innerHTML.includes('stamp-arrival'));const b=boot(a.saved());assert(b.state().completed);assert(!b.nodes['current-setup'].innerHTML.includes('stamp-arrival'));const changed=boot(a.saved(),{ai:'gemini',service:'youtube'});assert(!changed.state().completed);assert(!Object.hasOwn(changed.state().confirmedPairs,JSON.stringify(['Gemini','YouTube Music'])));
 await b.click('choose');b.change('ai','Gemini');assert(!b.state().completed);assert(b.nodes.ticket.innerHTML.includes('SHOW SETUP STEPS'));b.change('ai','ChatGPT');assert(b.nodes.ticket.innerHTML.includes('USE CONFIRMED SETUP'));await b.click('restore');assert(b.state().completed);assert(!b.nodes['current-setup'].innerHTML.includes('stamp-arrival'));
 await b.click('choose');b.change('service','YouTube Music');await b.click('restore');assert(!b.state().completed);await b.click('check');await b.click('previous');assert.equal(b.state().stage,'install');
 await b.click('help');assert(b.nodes.ticket.innerHTML.includes('Skill not installed'));assert(b.nodes.ticket.innerHTML.includes('Music service won’t connect'));assert(b.nodes.ticket.innerHTML.includes('Can’t save playlists'));await b.click('recommendations');assert(!b.state().completed);
 for(const ai of ['ChatGPT','Gemini','Claude','Other'])for(const service of ['Spotify','YouTube Music','Apple Music']){const t=boot();t.change('ai',ai);t.change('service',service);await t.click('install');assert(!t.nodes.ticket.innerHTML.includes('undefined'));assert(t.nodes.ticket.innerHTML.includes('NEXT: CONNECTION CHECK'))}
 console.log('PASS: clipboard denial, manual-copy collapse, confirmation, Close/resume/reload, pairing isolation/restoration, Back, three help paths, recommendations without false completion, and 12 installation pairings.');
})().catch(e=>{console.error(e);process.exit(1)});
