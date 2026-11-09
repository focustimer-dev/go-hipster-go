// Shared per-tap decision for narrow Central American and Caribbean land.
// Called only on a missed geographic tap, never during map drawing or gestures.
function labAtlasSmallHit(regions){
 const candidates=new Set(regions);
 if(!candidates.has('central-america')&&!candidates.has('caribbean'))return null;
 if(candidates.size===1)return {type:'land',id:candidates.values().next().value};
 return {type:'zoom'}; // Overlapping territories: closer view, never guess.
}
