// Verify that geographically sampled Cahill-Keyes shipping lanes never
// make a false straight chord across the M-map's interrupted octahedral gaps.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'../android-lab/web');
const box={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'cahill-keyes-vendor.js'),'utf8'),box);
vm.runInNewContext(fs.readFileSync(path.join(root,'cahill-keyes-routes.js'),'utf8'),box);
const projection=box.window.labCahillD3.geoCahillKeyes()
 .fitExtent([[22,20],[938,516]],{type:'Sphere'});
const tracks=[
 {name:'Atlantic crossing',points:[[-58,7],[-17,15]],expectBreak:true},
 {name:'Southern Atlantic',points:[[-43,-23],[13,-8]],expectBreak:false},
 {name:'Indian Ocean',points:[[39,-4],[73,19]],expectBreak:false},
 {name:'Pacific east leg',points:[[113.62,22.78],[150,33],[180,45]],expectBreak:true},
 {name:'Pacific west leg',points:[[-180,45],[-150,40],[-118.2,33.77]],expectBreak:false},
 {name:'Liverpool to Halifax',points:[[-3.05,53.43],[-20,50.7],[-40,49.2],[-63.57,44.65]],expectBreak:true},
 {name:'Halifax to Caribbean',points:[[-63.57,44.65],[-67,39.2],[-69.5,33.5],[-71.13,21.47]],expectBreak:false}
];
for(const sample of tracks){
 const route=vm.runInNewContext('labCahillProjectRoute',box)(sample.points,projection);
 assert(route.d.length>20,sample.name+' draws an actual lane');
 assert(route.midpoint?.every(Number.isFinite),sample.name+' has a geographic touch marker');
 assert.equal(route.breaks>0,sample.expectBreak,sample.name+' respects interruptions');
 assert(route.totalLength>15,sample.name+' has visible distance');
 let segments=0;
 for(const part of route.fragments){
  for(let i=1;i<part.length;i++){
   const delta=Math.hypot(part[i][0]-part[i-1][0],part[i][1]-part[i-1][1]);
   assert(delta<=32.001,sample.name+' drew an illegal cross-seam chord');
   segments++;
  }
 }
 assert(segments>=10,sample.name+' has geographic detail');
 const moves=(route.d.match(/M/g)||[]).length;
 assert.equal(moves,route.fragments.length,sample.name+' splits only at its intended breaks');
 console.log(sample.name,{pieces:route.fragments.length,cuts:route.breaks,
  brokenJump:Math.round(route.maxJump),segments});
}
