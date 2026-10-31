const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('launcher/assets/app.js','utf8');
const start=source.indexOf('function atlasNormalize(');
const end=source.indexOf('function atlasBindGestures(',start);
const c={};vm.createContext(c);
vm.runInContext('const atlasLandAnchors=[];'+source.slice(start,end)+';globalThis.camera={atlasConstrain,atlasViewForGesture,atlasNormalize,atlasLandAnchors};',c);
const {atlasConstrain:constrain,atlasViewForGesture:gesture,atlasLandAnchors:land}=c.camera;
for(const view of [[0,0,720,372],[-1000,900,200,100],[900,-1000,200,100],[165,132,183,222],[0,0,1,1]]){
 const [x,y,w,h]=constrain(view);
 assert.ok(x>=0&&y>=0&&x+w<=720.001&&y+h<=372.001,'Camera stays inside the projected world');
 assert.ok(w>=120&&w<=720,'Zoom stays within 1–6x');
 assert.ok(Math.abs(w/h-720/372)<1e-9,'Camera matches viewport aspect, with no letterbox margins');
}
const rect={left:0,top:0,width:720,height:372};
const base=[180,80,360,186],anchor=[360,173],screen={x:360,y:186};
const [x,y,w,h]=gesture(base,anchor,screen,rect,.5);
assert.ok(Math.abs(x+w/2-anchor[0])<1e-9&&Math.abs(y+h/2-anchor[1])<1e-9,'Pinch keeps the focal point under the fingers');
land.push([200,180],[400,100],[550,260]);
for(let px=-1000;px<=1000;px+=100)for(let py=-1000;py<=1000;py+=100){
 const [x,y,w,h]=constrain([px,py,180,93]);
 assert.ok(land.some(([lx,ly])=>lx>=x+w*.15-.001&&lx<=x+w*.85+.001&&ly>=y+h*.15-.001&&ly<=y+h*.85+.001),'Extreme pans retain land in the central viewport');
}
console.log('Robinson camera: aspect, focal anchor, zoom limits and 441 extreme pans passed.');
vm.runInContext(source.slice(source.indexOf('function atlasSelectedView('),source.indexOf('function frameSelectedAtlas('))+';globalThis.fitSelection=atlasSelectedView;',c);
const shapes=[{id:'west',x:100,y:100,w:80,h:80,area:6400},{id:'west',x:680,y:100,w:1,h:1,area:1},{id:'east',x:500,y:180,w:60,h:30,area:1800}];
const single=c.fitSelection(shapes,['west']);
assert.ok(single[2]<220&&single[0]<100,'Tiny remote fragments do not pull a mainland selection across the world');
const paired=c.fitSelection(shapes,['west','east']);
assert.ok(paired[0]<=100&&paired[0]+paired[2]>=560,'Combined selections fit both highlighted areas');
assert.equal(c.fitSelection(shapes,[]),null,'No regions returns an empty fit for the world reset');
assert.ok(single[2]>=160,'Automatic region focus avoids excessive zoom');
console.log('Selection framing: aggregate regions, remote fragments and zoom floor passed.');
