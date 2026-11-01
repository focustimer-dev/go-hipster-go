const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const index=JSON.parse(fs.readFileSync('android-lab/web/discovery-route-index.json','utf8'));
const source=fs.readFileSync('android-lab/web/discovery-routes.js','utf8').replace('/*LAB_ROUTE_INDEX*/',JSON.stringify(index));
const memory=new Map();
function boot(){const context=vm.createContext({stored:k=>memory.get(k),store:(k,v)=>memory.set(k,v),crypto:require('node:crypto').webcrypto});vm.runInContext(source,context);return context}
let c=boot();const draws=[];
for(let i=0;i<72;i++){
 if(i%7===0)c=boot(); // fresh WebView, same persistent storage
 const before=memory.get('ghg-lab-discovery-routes-v1');
 assert.equal(vm.runInContext('labRoutePrompt()',c),'');
 assert.equal(memory.get('ghg-lab-discovery-routes-v1'),before,'preview must not draw');
 const route=vm.runInContext('nextLabDiscoveryRoute()',c);
 assert.match(route,/^v1\/R\d\d$/);draws.push(route);
 if((i+1)%24===0)assert.equal(new Set(draws.slice(i-23,i+1)).size,24,'exhaust deck before reuse');
}
for(const boundary of [24,48])assert.ok(!draws.slice(boundary-8,boundary).includes(draws[boundary]),'cooldown survives reshuffle');
memory.set('ghg-lab-discovery-routes-v1','{corrupt');c=boot();assert.match(vm.runInContext('nextLabDiscoveryRoute()',c),/^v1\/R/);
memory.set('ghg-lab-discovery-routes-v1',JSON.stringify({remaining:['R99','R01','R01'],recent:['R99']}));c=boot();assert.equal(vm.runInContext('nextLabDiscoveryRoute()',c),'v1/R01');
console.log('PASS: route deck exhaustion, reload persistence, preview stability, reshuffle cooldown and malformed storage recovery.');
