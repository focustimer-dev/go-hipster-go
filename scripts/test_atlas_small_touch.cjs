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
assert.match(workspaceCSS, /#labAtlasCahill \[data-cahill-region\]\[aria-pressed=true\]\{[\s\S]*?stroke-width:\.65!important;/);
assert.match(workspaceCSS, /#labAtlasCahill \[data-cahill-us-state\]\{[\s\S]*?stroke:none!important;/);
assert.doesNotMatch(printCSS, /\[data-cahill-region\]\[aria-pressed=true\]\{[^}]*stroke-width:1\.35/);
assert.doesNotMatch(themeCSS, /\[data-cahill-region\]\[aria-pressed=true\]\{[^}]*stroke-width:1\.35/);
assert.match(tweenSource, /region\.hasAttribute\('data-cahill-us-state'\)/);
assert.match(tweenSource, /world\.querySelector\('\.lab-us-region-boundaries'\)/);

// Regression: the temporary Robinson/Globe morph must not resurrect all US
// state lines while folding to/from Cahill. Paint color-matched seams only.
const morphEnv=vm.createContext({window:{},devicePixelRatio:1});
vm.runInContext(read('android-lab/web/atlas-morph-vectors.js'),morphEnv);
const painter=vm.runInContext('labAtlasMorphVectors',morphEnv);
const triangle=(country,region)=>({type:'Feature',properties:{country,region},
 geometry:{type:'MultiPolygon',coordinates:[[[[0,0],[1,0],[1,1],[0,0]]]]]}});
const prepared=painter.prepare({type:'FeatureCollection',features:[
 triangle('USA','us-midwest'),triangle('CAN','canada-east')]});
assert.equal(prepared.features[0].country,'USA','Morph must retain country identity');
const painted=[],stroked=[],ink={
 setTransform(){},clearRect(){},save(){},translate(){},scale(){},
 beginPath(){},ellipse(){},clip(){},fillRect(){},moveTo(){},lineTo(){},
 closePath(){},fill(){painted.push(this.fillStyle)},
 stroke(){stroked.push(this.strokeStyle)},restore(){}};
painter.paint({width:460,getContext:()=>ink},prepared,0,new Set(['us-midwest']));
assert.equal(stroked.length,2,'One seam paint per feature, no duplicate overlay');
assert.equal(stroked[0],painted[0],'Selected US state seam must use its fill color');
assert.equal(stroked[1],'#103135','Non-US boundaries retain normal ink');

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

// The regional ink removes state-to-state seams WITHOUT merging tap polygons.
const globeSource=read('android-lab/web/globe.js');
const outlineFn=globeSource.match(/function labUSRegionBorderGeometry\(geography\)\{[\s\S]*?\n\}/)?.[0];
assert(outlineFn,'US boundary helper must be available to Globe and Keyes');
const outlineContext=vm.createContext({});
vm.runInContext(outlineFn,outlineContext);
const square=(x,region)=>({type:'Feature',properties:{country:'USA',region},
 geometry:{type:'Polygon',coordinates:[[[x,0],[x+1,0],[x+1,1],[x,1],[x,0]]]}});
const threeStates={features:[square(0,'us-west'),square(1,'us-west'),square(2,'us-midwest')]};
const outlines=vm.runInContext('labUSRegionBorderGeometry('+JSON.stringify(threeStates)+')',outlineContext);
const lines=JSON.parse(JSON.stringify(outlines.geometry.coordinates));
// No loss of real border segments while knitting them into fewer SVG strokes.
const segments=lines.flatMap(line=>line.slice(1).map((point,i)=>[line[i],point]));
assert.equal(segments.length,9,'External perimeter and cross-region border only');
assert(lines.length<segments.length&&lines.some(line=>line.length>2),
 'Segmented state edges must form continuous geographic border paths');
assert(!segments.some(edge=>edge.every(point=>point[0]===1)),
 'Same-region state boundary must disappear');
assert(segments.some(edge=>edge.every(point=>point[0]===2)),
 'Inter-region boundary remains');
