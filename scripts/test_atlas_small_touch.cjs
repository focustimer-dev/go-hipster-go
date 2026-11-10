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
// Cahill border ink contract: selection never thickens polygon outlines,
// all US state seams remain hidden, and the tween paints one shared outline.
const workspaceCSS=read('android-lab/web/workspace.css');
const printCSS=read('android-lab/web/theme-print.css');
const themeCSS=read('launcher/assets/pwa-atlas-themes.css');
const tweenSource=read('android-lab/web/cahill-keyes-motion.js');
assert.match(workspaceCSS, /#labAtlasCahill\{--lab-keyes-border-width:\.4px\}/);
assert.match(workspaceCSS, /#labAtlasCahill \[data-cahill-us-state\]\{[\s\S]*?stroke:none!important;/);
assert.doesNotMatch(printCSS, /\[data-cahill-region\]\[aria-pressed=true\]\{[^}]*stroke-width:1\.35/);
assert.doesNotMatch(themeCSS, /\[data-cahill-region\]\[aria-pressed=true\]\{[^}]*stroke-width:1\.35/);
assert.match(tweenSource, /region\.hasAttribute\('data-cahill-us-state'\)/);
assert.match(tweenSource, /world\.querySelector\('\.lab-us-region-boundaries'\)/);

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

// One precomputed TopoJSON mesh replaces the bespoke edge-joining helper.
// Compare the mesh against the EXACT source SVG the Android builder transforms,
// not the higher-precision Natural Earth source (which could misalign overlays).
const crypto=require('node:crypto');
const packed=JSON.parse(read('android-lab/web/us-region-mesh.json'));
const usTags=[...read('launcher/index.html').matchAll(/<path [^>]*data-atlas-country=[^>]*>/g)]
 .map(m=>m[0]).filter(tag=>tag.includes('data-atlas-country="USA"'));
assert.equal(usTags.length,51);
assert.equal(packed.sourceFeatureCount,51);
assert.equal(packed.sourceSha256,crypto.createHash('sha256').update(usTags.join('\n')).digest('hex'));
const border=packed.feature;
assert.equal(border.geometry.type,'MultiLineString');
assert.equal(border.properties.kind,'us-listening-regions');
const segmentKey=(a,b)=>[a.map(n=>+n.toFixed(5)).join(','),b.map(n=>+n.toFixed(5)).join(',')].sort().join('|');
const sourceEdges=new Map();
for(const tag of usTags){
 const region=tag.match(/data-atlas-region="([^"]+)"/)[1];
 const d=tag.match(/\bd="([^"]+)"/)[1];
 for(const part of d.match(/M[^M]+/g)||[]){
  const ring=[...part.matchAll(/[ML](-?[\d.]+)\s+(-?[\d.]+)/g)].map(pair=>{
   const x=Number(pair[1]),y=Number(pair[2]);
   return [+(x/2-180).toFixed(5),+(Math.atan(Math.sinh((235.5-y)/116))*180/Math.PI).toFixed(5)];
  });
  if(ring.length<3)continue;
  if(ring[0].join()!==ring.at(-1).join())ring.push([...ring[0]]);
  for(let i=1;i<ring.length;i++){
   if(ring[i-1].join(',')===ring[i].join(','))continue; // Degenerate state vertices are not drawable borders.
   const edge=segmentKey(ring[i-1],ring[i]);
   if(!sourceEdges.has(edge))sourceEdges.set(edge,[]);
   sourceEdges.get(edge).push(region);
  }
 }
}
const expected=new Set([...sourceEdges].filter(([,regions])=>
 regions.length===1||new Set(regions).size>1).map(([edge])=>edge));
const drawn=new Set();
for(const line of border.geometry.coordinates){
 assert(line.length>1);
 for(let i=1;i<line.length;i++){
  if(line[i-1].join(',')===line[i].join(','))continue; // TopoJSON may retain harmless zero-length vertices.
  drawn.add(segmentKey(line[i-1],line[i]));
 }
}
assert.equal(expected.size,620,'US regional border count changed unexpectedly');
assert.deepEqual([...drawn].sort(),[...expected].sort(),
 'TopoJSON mesh must draw exactly the four listening-region outlines and coastlines');
assert(!globe.includes('function labUSRegionBorderGeometry('),
 'Android must not retain a second dynamic border builder');
assert(cahill.includes('const boundaryPath=path(labAtlasBoundaryLines)'),
 'Cahill and Globe must consume the same single geographic border mesh');
assert(read('scripts/bundle_maplibre_lab.py').includes('sourceSha256'),
 'Build must reject a stale shared region mesh');
console.log('PASS: one fingerprinted runtime TopoJSON border mesh, exact 620 edges, no state seams.');

assert.deepEqual(packed.fills.map(f=>f.properties.region).sort(),Object.keys(regionStates).sort());
for(const fill of packed.fills){
 const {region,country}=fill.properties;
 assert.equal(country,'USA');
 assert.equal(fill.geometry.type,'MultiPolygon');
 const regionOutline=[...sourceEdges].filter(([,owners])=>
  owners.filter(owner=>owner===region).length===1).map(([edge])=>edge);
 const fillOutline=[];
 for(const polygon of fill.geometry.coordinates)for(const ring of polygon){
  assert.deepEqual(ring[0],ring.at(-1));
  for(let i=1;i<ring.length;i++){
   if(ring[i-1].join()!==ring[i].join())fillOutline.push(segmentKey(ring[i-1],ring[i]));
  }
 }
 assert.deepEqual(fillOutline.sort(),regionOutline.sort(),
  region+' fill must share the exact regional boundary and omit internal state edges');
}
