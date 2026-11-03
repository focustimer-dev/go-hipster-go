// Regression for the phone recording: tiny corner drags must not switch islands.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('launcher/assets/app.js','utf8');
const html=fs.readFileSync('android-lab/app/src/main/assets/site/index.html','utf8');
const geometry=JSON.parse(html.match(/<script[^>]*id="atlasNavigationGeometry"[^>]*>([\s\S]*?)<\/script>/)[1]);
const normalize=source.slice(source.indexOf('function atlasNormalize('),source.indexOf('function atlasCollectLand('));
const boundary=source.slice(source.indexOf('function atlasHull('),source.indexOf('function atlasViewForGesture('));
const context={atlasLandAnchors:geometry.anchors};vm.createContext(context);vm.runInContext(normalize+boundary,context);
const constrain=view=>Array.from(context.atlasConstrain(view));
let maximum=0,samples=0;
for(const w of [120,150,240,360,599,600,719]){
 const h=w*372/720;
 for(let y=-12;y<=384-h;y+=3)for(let x=-12;x<=732-w;x+=3){
  const a=constrain([x,y,w,h]);
  for(const [dx,dy] of [[.25,0],[0,.25],[.25,.25]]){
   const b=constrain([x+dx,y+dy,w,h]),distance=Math.hypot(a[0]-b[0],a[1]-b[1]);
   maximum=Math.max(maximum,distance);samples++;
   assert(distance<=Math.hypot(dx,dy)+1e-7,'Corner camera cannot amplify a tiny drag');
   assert(b[0]>=-1e-7&&b[0]+b[2]<=720+1e-7&&b[1]>=-1e-7&&b[1]+b[3]<=372+1e-7,'Camera stays inside world');
  }
 }
}
// Crossing the old 600-unit cutoff must not introduce a pinch discontinuity.
for(let x=0;x<720;x+=17)for(let y=0;y<372;y+=17){
 const a=constrain([x,y,599.9999,599.9999*372/720]),b=constrain([x,y,600.0001,600.0001*372/720]);
 assert(Math.hypot(a[0]-b[0],a[1]-b[1])<.002,'Pinch boundary stays continuous through the former cutoff');
}
assert.deepEqual(constrain([0,0,720,372]),[0,0,720,372]);
console.log('PASS: '+samples+' corner movements; maximum displacement '+maximum.toFixed(4)+' for a 0.3536-unit drag.');
