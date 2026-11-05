// Android Lab: temporary vector in-between frames for Robinson <-> Globe.
// Use the EXISTING geographic source: no duplicate outlines, new engine, or
// per-frame MapLibre GeoJSON uploads. The live map owns interaction outside
// the short switch, while this throwaway 2D canvas owns projection motion.
const labAtlasMorphVectors=(()=>{
 const X=[1,.9986,.9954,.99,.9822,.973,.96,.9427,.9216,.8962,.8679,.835,.7986,.7597,.7186,.6732,.6213,.5722,.5322];
 const Y=[0,.062,.124,.186,.248,.31,.372,.434,.4958,.5571,.6176,.6769,.7346,.7903,.8435,.8936,.9394,.9761,1];
 const DEG=Math.PI/180;
 const palette={paper:'#dfb045',ocean:'#103135',selected:'#a83223'};
 // Precompute correspondence ONCE per tap; a feature's source and destination
 // always use the same canonical vertices. Spring frames only interpolate XY.
 function prepare(geojson,center=[10,15]){
  const latitude0=center[1]*DEG,cos0=Math.cos(latitude0),sin0=Math.sin(latitude0);
  function point(lon,lat){
   const a=Math.min(90,Math.abs(lat)),i=Math.min(17,Math.floor(a/5)),t=(a-i*5)/5;
   const rx=X[i]+t*(X[i+1]-X[i]),ry=Y[i]+t*(Y[i+1]-Y[i]);
   const flatX=.5+lon/180*.45*rx,flatY=.5-Math.sign(lat)*.44*ry;
   const phi=lat*DEG,lambda=((lon-center[0]+540)%360-180)*DEG;
   const cosPhi=Math.cos(phi);
   const u=cosPhi*Math.sin(lambda),v=cos0*Math.sin(phi)-sin0*cosPhi*Math.cos(lambda);
   const facing=Math.max(-1,Math.min(1,sin0*Math.sin(phi)+cos0*cosPhi*Math.cos(lambda)));
   // The far hemisphere must leave the disk, not be reflected through it.
   // Push hidden geometry radially past the limb; the animated geographic
   // silhouette clips it. A small lower bound avoids antipode division by 0.
   const distance=Math.acos(facing),norm=Math.hypot(u,v);
   const radius=facing>=0?norm:1+.6*(distance-Math.PI/2)/(Math.PI/2);
   const k=radius/Math.max(norm,.0001);
   return [flatX,flatY,.5+.45*u*k,.5-.45*v*k];
  }
  const features=geojson.features.map(feature=>({
   region:feature.properties.region,
   polygons:feature.geometry.coordinates.map(poly=>poly.map(ring=>ring.map(([lon,lat])=>point(lon,lat))))
  }));
  return {features,vertices:features.reduce((sum,f)=>sum+f.polygons.reduce((n,p)=>n+p.reduce((m,r)=>m+r.length,0),0),0)};
 }
 // Measured phone baseline, used only when the target renderer has not
 // yet switched. A live source camera supplies its exact start endpoint;
 // the destination camera supplies a tiny residual correction after commit.
 const BASE_FIT={
  robinson:{x:0,y:0,sx:1.118858,sy:1.110402},
  globe:{x:0,y:0,sx:.749728,sy:.749728}
 };
 function estimatedFit(mode){return {...BASE_FIT[mode]}}
 function paint(canvas,prepared,t,selected,fits=null){
  const progress=Math.max(0,Math.min(1,t)),context=canvas.getContext('2d');
  if(!context)return;
  const res=canvas.width;
  context.setTransform(res,0,0,res,0,0);
  context.clearRect(0,0,1,1);
  context.save();
  // Use the SAME progress for geography, chart silhouette and zoom fit.
  // The old code animated nominal geography and resized it 235ms later,
  // visibly disrupting the final fold (especially Robinson -> Globe).
  if(fits){
   const a=fits.robinson,b=fits.globe;
   const sx=a.sx+(b.sx-a.sx)*progress,sy=a.sy+(b.sy-a.sy)*progress;
   const ox=(a.x+(b.x-a.x)*progress)/Math.max(1,fits.width);
   const oy=(a.y+(b.y-a.y)*progress)/Math.max(1,fits.height);
   context.translate(.5+ox,.5+oy);
   context.scale(sx,sy);
   context.translate(-.5,-.5);
  }
  // Robinson is a wide paper chart; the destination is a circular sphere.
  // The host's own height changes on this same normalized timeline.
  context.beginPath();
  context.ellipse(.5,.5,.48-.025*progress,.455+.005*progress,0,0,Math.PI*2);
  context.clip();
  context.fillStyle=palette.ocean;context.fillRect(0,0,1,1);
  context.lineWidth=.0009;context.strokeStyle=palette.ocean;context.lineJoin='round';
  for(const feature of prepared.features){
   context.beginPath();
   for(const polygon of feature.polygons)for(const ring of polygon){
    if(!ring.length)continue;
    for(let i=0;i<ring.length;i++){
     const [x0,y0,x1,y1]=ring[i];
     const x=x0+(x1-x0)*progress,y=y0+(y1-y0)*progress;
     if(i===0)context.moveTo(x,y);else context.lineTo(x,y);
    }
    context.closePath();
   }
   context.fillStyle=selected.has(feature.region)?palette.selected:palette.paper;
   context.fill('evenodd');context.stroke();
  }
  context.restore();
 }
 // Calibrate the last vector frame against the *actual* destination camera.
 // Both views already have known geographic anchors: no WebGL readback, no
 // guesswork about map radius, and no extra map instances.
 function landingFit(mode,width,height,project){
  const w=Math.max(1,width),h=Math.max(1,height);
  const center=project(mode==='globe'?[10,15]:[0,0]);
  let sx=1,sy=1;
  if(mode==='globe'){
   // Orthographic right-hand horizon, 90 degrees east of the centered globe.
   const east=project([100,0]);
   sx=sy=Math.hypot(east.x-center.x,east.y-center.y)/(.45*w);
  }else{
   // Robinson's flattened source is expressed as geographic points in
   // MapLibre's Mercator camera; project those same canonical anchors.
   const east=project([170,0]),north=project([0,75]);
   sx=(east.x-center.x)/(.45*(170/180)*w);
   sy=(center.y-north.y)/(.44*Y[15]*h);
  }
  const expected=estimatedFit(mode);
  // During a projection change MapLibre can expose its old camera for a
  // frame. Never interpret an invalid intermediate projection as a real
  // 1.0x fit: that was causing a visible ~10% correction on the return trip.
  const valid=(raw,baseline)=>Number.isFinite(raw)&&raw>.2&&raw<2&&
   Math.abs(raw/baseline-1)<.15;
  const validX=valid(sx,expected.sx),validY=valid(sy,expected.sy);
  return {x:Number.isFinite(center.x)?center.x-w/2:0,
   y:Number.isFinite(center.y)?center.y-h/2:0,
   sx:validX?sx:expected.sx,sy:validY?sy:expected.sy,
   sampled:validX&&validY};
 }
 function make(canvas,geojson,selected,center){
  // This is at most ~2 MiB of short-lived bitmap memory on current phones.
  const width=Math.min(720,Math.max(300,Math.round(canvas.parentElement.clientWidth*Math.min(devicePixelRatio||1,1.25))));
  canvas.width=canvas.height=width;
  return {data:prepare(geojson,center),selected:new Set(selected)};
 }
 return {make,paint,prepare,landingFit,estimatedFit};
})();
