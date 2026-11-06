// Deterministic checks of the vendored 1975 Cahill-Keyes projection.
// No network, WebGL, browser or guessed butterfly coordinates.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'../android-lab/web/cahill-keyes-vendor.js'),'utf8');
const sandbox={window:{}};
vm.runInNewContext(code,sandbox,{timeout:12000});
const d3=sandbox.window.labCahillD3;
assert(d3?.geoCahillKeyes,'Real polyhedral projection must be bundled for offline use');
const projection=d3.geoCahillKeyes().fitExtent([[24,20],[936,516]],{type:'Sphere'});
const pathGenerator=d3.geoPath(projection);
const sphere=pathGenerator({type:'Sphere'});
assert(sphere&&sphere.length>100,'The actual octahedral exterior must render');
const landmarks={
 vancouver:[-123,49],rio:[-43,-23],london:[-.1,51.5],lagos:[3.4,6.5],
 cairo:[31,30],mumbai:[73,19],tokyo:[139.7,35.7],sydney:[151.2,-33.9],
 antarctica:[0,-75],hawaii:[-156,21]
};
const positions={};
for(const [name,lonlat] of Object.entries(landmarks)){
 const point=projection(lonlat);
 assert(point?.length===2&&point.every(Number.isFinite),name+' has finite real Cahill-Keyes x/y');
 positions[name]=point;
}
assert(Math.hypot(positions.vancouver[0]-positions.tokyo[0],
 positions.vancouver[1]-positions.tokyo[1])>40,'Pacific locations must not fold onto one another');
const bounds=pathGenerator.bounds({type:'Sphere'});
assert(bounds.flat().every(Number.isFinite),'Earth extent is finite');
assert(bounds[1][0]>bounds[0][0]&&bounds[1][1]>bounds[0][1],'M-map has area');
assert(bounds[1][0]-bounds[0][0]>400,'Octahedral map spans the viewport');
console.log('Cahill-Keyes octahedral geometry passed:',{landmarks:Object.keys(positions).length,
 pathBytes:sphere.length,bounds});
