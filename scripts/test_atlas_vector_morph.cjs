// Deterministic geometry test; no WebGL or network required.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../android-lab/web/atlas-morph-vectors.js'),'utf8');
const vectors=vm.runInNewContext(src+';labAtlasMorphVectors');
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
 const points=[];let ellipseCount=0,fillCount=0;
 const c={points,get fills(){return fillCount},get ellipseCount(){return ellipseCount},
  setTransform(){},clearRect(){},save(){},beginPath(){},ellipse(){ellipseCount++},clip(){},
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
console.log('Atlas geographic in-betweening passes:',projected.vertices,'matched vector points');
