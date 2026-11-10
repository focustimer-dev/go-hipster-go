#!/usr/bin/env node
// Offline experiment only. Never alters deployed Atlas geometry or artwork.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {performance} from 'node:perf_hooks';
import {gzipSync} from 'node:zlib';
import {topology} from 'topojson-server';
import {mesh} from 'topojson-client';
import {geoPath,geoOrthographic} from 'd3-geo';
import {geoRobinson} from 'd3-geo-projection';
import {geoCahillKeyes} from 'd3-geo-polygon';
const source=JSON.parse(fs.readFileSync('assets/us-region-state-boundaries.json','utf8'));
const regionOf=new Map(Object.entries(source.regionStates).flatMap(([region,postals])=>postals.map(postal=>[postal,region])));
const features=source.states.map(s=>({type:'Feature',properties:{country:'USA',postal:s.postal,region:regionOf.get(s.postal)},geometry:s.geometry}));
if(features.length!==51||regionOf.size!==51||Object.keys(source.regionStates).length!==4||features.some(f=>!f.properties.region))throw Error('Invalid 51-state/four-region source');
const fc={type:'FeatureCollection',features};
const code=fs.readFileSync('android-lab/web/globe.js','utf8').match(/function labUSRegionBorderGeometry\(geography\)\{[\s\S]*?\n\}/)?.[0];
if(!code)throw Error('Existing border helper not found');
const legacy=vm.runInNewContext(code+'\nlabUSRegionBorderGeometry;',{})(fc).geometry;
const t0=performance.now(),topo=topology({states:fc}),buildMs=performance.now()-t0;
const t1=performance.now(),combined=mesh(topo,topo.objects.states,(a,b)=>a===b||a.properties.region!==b.properties.region),meshMs=performance.now()-t1;
const coord=p=>p.map(n=>Number(n).toFixed(6)).join(',');
const edge=(a,b)=>[coord(a),coord(b)].sort().join('|');
const getEdges=g=>{
 if(g.type!=='MultiLineString')throw Error('Expected MultiLineString');
 const s=new Set();
 for(const line of g.coordinates)for(let i=1;i<line.length;i++)if(coord(line[i])!==coord(line[i-1]))s.add(edge(line[i-1],line[i]));
 return s;
};
const oldEdges=getEdges(legacy),newEdges=getEdges(combined);
const missing=[...oldEdges].filter(k=>!newEdges.has(k));
const excess=[...newEdges].filter(k=>!oldEdges.has(k));
const sharedStates=new Map();
for(const f of features){
 const polygons=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
 for(const polygon of polygons)for(const ring of polygon)for(let i=1;i<ring.length;i++){
  const k=edge(ring[i-1],ring[i]);if(!sharedStates.has(k))sharedStates.set(k,[]);
  sharedStates.get(k).push(f.properties.region);
 }
}
const internal=[...sharedStates].filter(([,rs])=>rs.length>1&&rs.every(x=>x===rs[0])).map(([k])=>k);
const leaks=internal.filter(k=>newEdges.has(k));
const outIndex=process.argv.indexOf('--out'),out=outIndex<0?'artifacts/atlas-topology-experiment':process.argv[outIndex+1];
if(!out)throw Error('Missing --out directory');
fs.mkdirSync(out,{recursive:true});
const sizes=x=>{const bytes=JSON.stringify(x);return {json:Buffer.byteLength(bytes),gzip:gzipSync(bytes).length};};
const esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
const projections=[['Robinson',geoRobinson()],['Cahill-Keyes',geoCahillKeyes()],['Globe',geoOrthographic().rotate([100,-37])]];
const projected=[],sections=[];
for(const [name,p] of projections){
 p.fitExtent([[28,28],[932,492]],{type:'Sphere'});
 const draw=geoPath(p),old=draw(legacy)||'',current=draw(combined)||'';
 if(!old||!current||/NaN|Infinity/.test(old+current))throw Error('Invalid D3 '+name+' geometry');
 projected.push({name,legacyPathChars:old.length,topologyPathChars:current.length});
 const panel=(label,d)=>'<div class="panel"><h3>'+label+'</h3><svg viewBox="0 0 960 540"><path d="'+esc(d)+'" fill="none" stroke="#003f2b" stroke-linejoin="round" stroke-width="1.5"/></svg></div>';
 sections.push('<section><h2>'+name+'</h2><div class="panels">'+panel('Current algorithm',old)+panel('TopoJSON mesh',current)+'</div></section>');
}
const report={
 scope:'No runtime change; isolated topology benchmark',
 states:features.length,regions:[...new Set(features.map(f=>f.properties.region))].sort(),
 legacyPaths:legacy.coordinates.length,topologyPaths:combined.coordinates.length,
 topologyArcs:topo.arcs.length,legacySegments:oldEdges.size,topologySegments:newEdges.size,
 discardedSameRegionStateEdges:internal.length,leakedStateEdges:leaks.length,
 legacyOnly:missing.length,topologyOnly:excess.length,
 sampleDifferences:{legacyOnly:missing.slice(0,6),topologyOnly:excess.slice(0,6)},
 sizeBytes:{topology:sizes(topo),topologyMesh:sizes(combined),legacyMesh:sizes(legacy)},
 buildMs:+buildMs.toFixed(2),meshMs:+meshMs.toFixed(2),projected
};
fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(out,'comparison.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Atlas topology comparison</title><style>body{background:#f4efe5;color:#003f2b;font:16px system-ui;margin:1rem}.panels{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1rem}.panel{border:1px solid #aba48f;background:#fffdf8;padding:.8rem}.panel svg{width:100%;height:auto}h2{margin-top:2rem}</style><h1>One geographic border mesh, three D3 projections</h1><p>Canonical 51 US polygons remain unchanged for touch selection. Both sides draw border lines only; production is unaffected.</p>'+sections.join('')+'</html>');
// Additional deployment candidate: construct topology from the actual poster
// SVG coordinates that bundle_maplibre_lab.py turns into Android GeoJSON.
// This avoids small border/fill discrepancies from mixing source precisions.
const {createHash}=await import('node:crypto');
const launcher=fs.readFileSync('launcher/index.html','utf8');
const usTags=[...launcher.matchAll(/<path [^>]*data-atlas-country=[^>]*>/g)].map(x=>x[0]).filter(x=>x.includes('data-atlas-country="USA"'));
const runtimeFeatures=usTags.map(tag=>{
 const country=tag.match(/data-atlas-country="([^"]+)"/)[1];
 const region=tag.match(/data-atlas-region="([^"]+)"/)[1];
 const d=tag.match(/\bd="([^"]+)"/)[1];
 const coordinates=[...d.matchAll(/M[^M]+/g)].map(part=>{
  const ring=[...part[0].matchAll(/[ML](-?[\d.]+)\s+(-?[\d.]+)/g)].map(pair=>{
   const x=Number(pair[1]),y=Number(pair[2]);
   return [Number((x/2-180).toFixed(5)),
    Number((Math.atan(Math.sinh((235.5-y)/116))*180/Math.PI).toFixed(5))];
  });
  if(ring.length<3)return null;
  if(ring[0][0]!==ring.at(-1)[0]||ring[0][1]!==ring.at(-1)[1])ring.push([...ring[0]]);
  return [ring];
 }).filter(Boolean);
 return {type:'Feature',properties:{country,region},geometry:{type:'MultiPolygon',coordinates}};
});
if(runtimeFeatures.length!==51||runtimeFeatures.some(x=>!x.geometry.coordinates.length))
 throw Error('Android runtime must have 51 US state/DC shapes');
const runtimeFC={type:'FeatureCollection',features:runtimeFeatures};
const rtTopo=topology({states:runtimeFC});
const rtMesh=mesh(rtTopo,rtTopo.objects.states,(a,b)=>a===b||a.properties.region!==b.properties.region);
const rtOld=vm.runInNewContext(code+'\nlabUSRegionBorderGeometry;',{})(runtimeFC).geometry;
const rtOldEdges=getEdges(rtOld),rtNewEdges=getEdges(rtMesh);
const rtAbsent=[...rtOldEdges].filter(k=>!rtNewEdges.has(k));
const rtExtra=[...rtNewEdges].filter(k=>!rtOldEdges.has(k));
if(rtAbsent.length||rtExtra.length)throw Error('Android runtime geometry mismatch. Old-only '+rtAbsent.length+', topo-only '+rtExtra.length);
const sourceSha256=createHash('sha256').update(usTags.join('\n')).digest('hex');
const packed={sourceSha256,sourceFeatureCount:usTags.length,feature:{
 type:'Feature',properties:{kind:'us-listening-regions'},geometry:rtMesh}};
fs.writeFileSync(path.join(out,'android-us-regions-mesh.json'),JSON.stringify(packed)+'\n');
report.androidRuntime={sha256:sourceSha256,features:usTags.length,
 oldSegments:rtOldEdges.size,topologySegments:rtNewEdges.size,
 topologicalPaths:rtMesh.coordinates.length,legacyPaths:rtOld.coordinates.length,
 missing:rtAbsent.length,additional:rtExtra.length,
 packedBytes:Buffer.byteLength(JSON.stringify(packed))};
fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(report,null,2)+'\n');

console.log(JSON.stringify(report,null,2));
if(missing.length||excess.length||leaks.length)throw Error('Topology differs from current boundary segments or leaks same-region state seams; investigate before adoption');
console.log('PASS: identical visible boundary segments, no state seams, valid paths in all three D3 projections.');
