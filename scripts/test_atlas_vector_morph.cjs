// Deterministic geometry test; no WebGL or network required.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../android-lab/web/atlas-morph-vectors.js'),'utf8');
const idleQueue=[];
const fakeCanvas=()=>{
 const ctx=context(),canvas={width:0,height:0,getContext:()=>ctx};
 return canvas;
};
const vectors=vm.runInNewContext(src+';labAtlasMorphVectors',{
 document:{createElement:()=>fakeCanvas()},
 devicePixelRatio:1,
 setTimeout:callback=>{idleQueue.push(callback);return idleQueue.length}
});
const geo={type:'FeatureCollection',features:[
 {type:'Feature',properties:{region:'europe'},geometry:{type:'MultiPolygon',
 coordinates:[[[[-10,30],[15,30],[15,60],[-10,60],[-10,30]]]]}},
 {type:'Feature',properties:{region:'pacific'},geometry:{type:'MultiPolygon',
 coordinates:[[[[170,-10],[175,-10],[175,10],[170,10],[170,-10]]]]}}
]};
const projected=vectors.prepare(geo,[10,15]);
assert.equal(projected.vertices,10);
assert.equal(projected.features.length,2);
for(const f of projected.features)
 for(const poly of f.polygons)for(const ring of poly)
  for(const xy of ring){
   assert.equal(xy.length,4,'Each canonical vertex has both projections');
   assert(xy.every(Number.isFinite),'Both projections remain finite even on the far hemisphere');
  }
const back=projected.features[1].polygons[0][0][0];
assert(Math.hypot(back[2]-.5,back[3]-.5)>.45,'Far hemisphere exits the globe limb instead of mirroring back onto Africa');
const first=projected.features[0].polygons[0][0][0];
assert(Math.hypot(first[2]-first[0],first[3]-first[1])>.02,'Source vertices genuinely change geographic position');
function context(){
 const points=[],transforms=[],draws=[];let ellipseCount=0,fillCount=0;
 const c={points,transforms,draws,drawImage(...args){draws.push(args)},
 get fills(){return fillCount},get ellipseCount(){return ellipseCount},
  setTransform(){},translate(x,y){transforms.push(['translate',x,y])},
  scale(x,y){transforms.push(['scale',x,y])},
  clearRect(){},save(){},beginPath(){},ellipse(){ellipseCount++},clip(){},
  fillRect(){},moveTo(x,y){points.push([x,y])},lineTo(x,y){points.push([x,y])},
  closePath(){},fill(){fillCount++},stroke(){},restore(){},set lineWidth(v){},set strokeStyle(v){},
  set lineJoin(v){},set fillStyle(v){}};
 return c;
}
function drawn(t){
 const c=context(),canvas={width:400,getContext:()=>c};
 vectors.paint(canvas,projected,t,new Set(['europe']));
 assert.equal(c.fills,2,'Every world country is retained in the in-between');
 assert.equal(c.ellipseCount,1,'Every in-between has a single round chart limb');
 return c.points;
}
const source=drawn(0),middle=drawn(.5),target=drawn(1);
assert(source.length===middle.length&&middle.length===target.length);
assert(Math.abs(middle[0][0]-(source[0][0]+target[0][0])/2)<1e-9,'In-between X is the actual vertex midpoint');
assert(Math.abs(middle[0][1]-(source[0][1]+target[0][1])/2)<1e-9,'In-between Y is the actual vertex midpoint');
// Endpoint landing is measured from projected geographic anchors, not from
// nominal canvas percentages. These synthetic destination cameras let us
// verify exact pixel correspondence in both geometries.
const globeFit=vectors.landingFit('globe',400,400,([lon,lat])=>{
 if(lon===10&&lat===15)return{x:203,y:198};
 if(lon===100&&lat===0)return{x:323,y:198};
 throw Error('unexpected Globe anchor');
});
assert(Math.abs(globeFit.sx-120/180)<1e-8,'Globe radius lands at the actual MapLibre horizon');
assert.equal(globeFit.sy,globeFit.sx,'Globe landing preserves circular geometry');
assert.equal(globeFit.x,3);assert.equal(globeFit.y,-2);
const flatFit=vectors.landingFit('robinson',400,206,([lon,lat])=>{
 if(lon===0&&lat===0)return{x:201,y:103};
 if(lon===170&&lat===0)return{x:388,y:103};
 if(lon===0&&lat===75)return{x:201,y:19};
 throw Error('unexpected Robinson anchor');
});
assert(Math.abs(flatFit.sx-187/(.45*170/180*400))<1e-8,'Robinson map width matches renderer');
assert(Math.abs(flatFit.sy-84/(.44*.8936*206))<1e-8,'Robinson map height matches renderer');
assert.equal(flatFit.x,1);assert.equal(flatFit.y,0);
assert.equal(flatFit.sampled,true,'A settled Robinson camera must produce a valid measured endpoint');
const unsettled=vectors.landingFit('robinson',400,206,([lon,lat])=>
 (lon===0&&lat===0)?{x:200,y:103}:{x:200,y:103});
assert.equal(unsettled.sampled,false,'An unsettled renderer must be explicitly flagged');
assert.equal(unsettled.sx,vectors.estimatedFit('robinson').sx,
 'Never replace a calibrated endpoint with an invalid 1x camera measurement');
const interim=vectors.landingFit('robinson',400,206,([lon,lat])=>{
 if(lon===0&&lat===0)return{x:200,y:103};
 if(lon===170&&lat===0)return{x:200+1.118858*1.09*(.45*170/180*400),y:103};
 if(lon===0&&lat===75)return{x:200,y:103-1.110402*(.44*.8936*206)};
 throw Error('Unexpected interim camera anchor');
},.03);
assert.equal(interim.sampled,false,'A plausible but 9%-wrong intermediate camera cannot cause a last-frame resize');
assert.equal(interim.sx,vectors.estimatedFit('robinson').sx,'Discard invalid intermediary scale, keep calibrated endpoint');

// Every geographic midpoint also uses the same interpolation for chart size.
// This prevents a late, separate shrink/expand at the live MapLibre handoff.
const fits={robinson:vectors.estimatedFit('robinson'),globe:vectors.estimatedFit('globe'),width:400,height:206};
const fitted=t=>{
 const ctx=context();
 vectors.paint({width:400,getContext:()=>ctx},projected,t,new Set(['europe']),fits);
 const scale=ctx.transforms.find(([kind])=>kind==='scale');
 assert(scale,'The geographic renderer applies calibrated fit during the morph');
 return scale.slice(1);
};
const aFit=fitted(0),mFit=fitted(.5),bFit=fitted(1);
for(let axis=0;axis<2;axis++){
 assert(Math.abs(aFit[axis]-fits.robinson[['sx','sy'][axis]])<1e-8,
  'Flat start must already match its live Robinson scale');
 assert(Math.abs(bFit[axis]-fits.globe[['sx','sy'][axis]])<1e-8,
  'Globe endpoint must already match the final MapLibre radius');
 assert(Math.abs(mFit[axis]-(aFit[axis]+bFit[axis])/2)<1e-8,
  'Mid-morph geography and scale must share one continuous timeline');
}
assert(mFit[0]<aFit[0]&&mFit[0]>bFit[0],
 'Robinson -> Globe shrinks progressively rather than at the last frame');
assert(fitted(1)[0]===bFit[0]&&fitted(0)[0]===aFit[0],
 'Globe -> Robinson reuses the exact same sizes in reverse');
// Idle-prepared geographic sprite sheet: 19 poses prepared in separate tasks,
// then one drawImage per animation frame instead of 183 polygons / ~11k points.
const selected=new Set(['europe']);
const warming=vectors.warmFrames(geo,selected,400);
assert.equal(warming.ready,false,'Do not synchronously paint all 19 frames on tap');
let ticks=0;
while(idleQueue.length&&ticks<100){idleQueue.shift()();ticks++}
assert.equal(vectors.cacheStatus().ready,true,'Idle cache must finish before playback');
assert.equal(vectors.cacheStatus().frames,19,'All geographic poses are available');
assert(ticks>=19,'Prewarming is split across tasks, not one blocking batch');
const visible=fakeCanvas();visible.width=visible.height=400;
assert.equal(vectors.paintCached(visible,projected,.5,selected,fits),true,
 'Matching selection and map scale should play a cached vector frame');
assert.equal(visible.getContext('2d').draws.length,1,
 'Cached playback needs only one canvas blit instead of redrawing countries');
const adjusted=fakeCanvas();adjusted.width=adjusted.height=400;
const shifted={...fits,robinson:{...fits.robinson,
 sx:fits.robinson.sx*1.04,sy:fits.robinson.sy*.98,x:3,y:-2}};
assert.equal(vectors.paintCached(adjusted,projected,.5,selected,shifted),true,
 'Slight live-camera differences should preserve the fast cached path');
const correctedScale=adjusted.getContext('2d').transforms.find(([name])=>name==='scale');
assert(correctedScale&&correctedScale[1]>1&&correctedScale[2]<1,
 'Cached art must honor live-camera X and Y scaling, not stretch blindly');
const outOfBounds=fakeCanvas();outOfBounds.width=outOfBounds.height=400;
assert.equal(vectors.paintCached(outOfBounds,projected,.5,selected,{
 ...fits,robinson:{...fits.robinson,sx:fits.robinson.sx*1.6}}),false,
 'A significantly zoomed camera must use exact vector painting instead of a stale sprite');
const uncached=fakeCanvas();uncached.width=uncached.height=400;
assert.equal(vectors.paintCached(uncached,projected,.5,new Set(['pacific']),fits),false,
 'Changed selections must not replay stale highlighted geography');
assert.equal(uncached.getContext('2d').draws.length,0,
 'Cache miss uses live vector painting, not mismatched sprite art');
vectors.warmFrames(geo,new Set(['pacific']),400);
vectors.pauseWarm();
while(idleQueue.length&&ticks<120){idleQueue.shift()();ticks++}
assert.equal(vectors.cacheStatus().ready,true,
 'Cancelling work in progress must preserve the last valid cached selection');
console.log('Atlas geographic in-betweening passes:',projected.vertices,'matched vector points');
