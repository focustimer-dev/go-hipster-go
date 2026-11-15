const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.Event=class Event{};
let draws=0,base='go';
const c=vm.createContext({Event,window:{dispatchEvent(){},HipsterLab:{rollSurprise:()=>`Protocol: ${++draws}`}},goPrompt:()=>base,ai:'chatgpt',service:'spotify',mood:'go',copiedPrompt:null});
vm.runInContext(fs.readFileSync('android-lab/web/surprise.js','utf8'),c);
const run=()=>vm.runInContext('labPrepareSurprise();labSurpriseLine',c);
assert.equal(run(),'Protocol: 1');assert.equal(run(),'Protocol: 1');assert.equal(draws,1);
c.copiedPrompt='copied';assert.equal(run(),'Protocol: 2');
c.copiedPrompt=null;base='changed';assert.equal(run(),'Protocol: 3');
const app=fs.readFileSync('launcher/assets/app.js','utf8');
vm.runInContext(app.slice(app.indexOf('function curveOwnsMoods'),app.indexOf('function goPrompt')),c);
for(const [code,expected] of [['',false],['c1:012',false],['c1:0tc-1',true],['c1:0x12',true]]){c.mixCurveTrialCode=code;assert.equal(vm.runInContext('curveOwnsMoods()',c),expected)}
console.log('Surprise retries/new requests and curve mood ownership passed');
// Exercise the real exporter: global moods survive a tempo-only curve, but not mood pins.
Object.assign(c,{goCommand:(a,s,m)=>'go'+(m==='go'?'':' '+m),mixCurveSlotAudit:()=>'',crateSelected:new Set(),moodDiscoveryBrief:m=>m==='go'?'':'Mood angle: happy',tempo:'',skipRough:false,pwaReference:'',crateSparkPhrase:'',includeCover:false});
vm.runInContext(app.slice(app.indexOf('function goPrompt'),app.indexOf('const crateRegions')),c);
c.mixCurveTrialCode='c1:0tc-1-1-2-2d-2012fs210tf';
assert.match(vm.runInContext('goPrompt(ai,service,"happy triumphant")',c),/^go\nc1:/);
assert.doesNotMatch(vm.runInContext('goPrompt(ai,service,"happy triumphant")',c),/Mood angle/);
c.mixCurveTrialCode='c1:000000000000';
assert.match(vm.runInContext('goPrompt(ai,service,"happy triumphant")',c),/^go happy triumphant/);
console.log('Real prompt exporter preserves tempo-only moods and excludes superseded moods');
