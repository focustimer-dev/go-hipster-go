// Lightweight, deterministic geography + touch-decision gate. No WebGL/CI flakes.
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const helper=read('android-lab/web/atlas-touch-targets.js');
const context=vm.createContext({});
vm.runInContext(helper,context);
const decide=regions=>{
 const out=vm.runInContext('labAtlasSmallHit('+JSON.stringify(regions)+')',context);
 return out?JSON.parse(JSON.stringify(out)):null;
};
assert.deepEqual(decide(['caribbean']),{type:'land',id:'caribbean'});
assert.deepEqual(decide(['central-america']),{type:'land',id:'central-america'});
assert.deepEqual(decide(['caribbean','caribbean']),{type:'land',id:'caribbean'});
assert.deepEqual(decide(['central-america','caribbean']),{type:'zoom'});
assert.deepEqual(decide(['mexico','central-america']),{type:'zoom'});
assert.deepEqual(decide(['caribbean','northern-south-america']),{type:'zoom'});
assert.equal(decide(['mexico']),null);
assert.equal(decide([]),null);
const data=JSON.parse(read('assets/us-region-state-boundaries.json'));
const {regionStates,states}=data;
assert.equal(new Set(Object.values(regionStates).flat()).size,51,'All 50 US states plus DC belong to exactly one region');
assert.equal(Object.values(regionStates).flat().length,51,'No state overlaps regions');
assert.equal(states.length,51,'Subdivisions include every state and DC');
assert.deepEqual(new Set(states.map(s=>s.postal)),new Set(Object.values(regionStates).flat()));
for(const [region,code] of [['us-midwest','IL'],['us-midwest','MI'],['us-south','TX'],['us-south','LA'],['us-east','NY'],['us-west','CA']])
 assert(regionStates[region].includes(code),code+' is assigned to '+region);
const editions=['launcher/index.html','launcher/editions/gig-poster/index.html'];
for(const file of editions){
 const html=read(file);
 const paths=[...html.matchAll(/<path [^>]*data-atlas-country=[^>]*>/g)].map(m=>m[0]);
 const land=(region,country)=>paths.some(tag=>tag.includes('data-atlas-region="'+region+'"')&&tag.includes('data-atlas-country="'+country+'"'));
 for(const region of ['us-midwest','us-south','us-east','us-west'])
  assert(land(region,'USA'),file+' is missing painted '+region);
 for(const [country,region] of [['GRC','mediterranean-europe'],['ALB','balkans'],['BGR','balkans'],['BLZ','central-america'],['CRI','central-america'],['CUB','caribbean'],['JAM','caribbean']])
  assert(land(region,country),file+' misclassified '+country);
 assert(!land('balkans','GRC'),'Greece keeps a Mediterranean home with documented Balkans crossover');
 const names=[...html.matchAll(/data-crate-region="([^"]+)"/g)].map(m=>m[1]);
 for(const id of ['us-midwest','us-south','balkans','central-america','caribbean'])
  assert(names.includes(id),file+' must let users choose '+id);
}
const globe=read('android-lab/web/globe.js'),cahill=read('android-lab/web/cahill-keyes.js'),
 bundle=read('scripts/bundle_android_lab.py');
assert(globe.includes('labAtlasSmallHit(')&&globe.includes("labGlobe.on('click',event=>"),'Both MapLibre modes need the missed-tap handler');
assert(cahill.includes('nearbySmallRegion')&&cahill.includes('zoomAssists'),'Keyes needs touch selection with safe zoom assistance');
assert(bundle.includes("android-lab/web/atlas-touch-targets.js"),'Offline Android/PWA atlas bundles must include the shared helper');
assert(read('scripts/pwa_inline_atlas_qa.mjs').includes('ghg-crate-map-regions-v2'),'PWA test must assert the current storage key');
console.log('PASS: 51 state partitions, Mediterranean/Balkan split, parent map parity and ambiguous island tap safety.');
