// One native draw per new request. Failed copies reuse their pending outcome.
let labSurpriseLine="",labSurpriseBase="";
function labPrepareSurprise(){
 const previous=labSurpriseLine;labSurpriseLine="";
 const base=goPrompt(ai,service,mood);
 if(base===labSurpriseBase&&previous&&!copiedPrompt){labSurpriseLine=previous;return}
 labSurpriseBase=base;
 if(window.HipsterLab?.rollSurprise)labSurpriseLine=window.HipsterLab.rollSurprise();
}
