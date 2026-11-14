#!/usr/bin/env node
// Public anonymous smoke for the policy and support pages.
const arg=process.argv.find(value=>value.startsWith('--base='));
const base=(arg?arg.slice(7):'https://hipster-go.samelling.workers.dev').replace(/\/$/,'');
const pages=[
 ['/privacy/','Privacy Policy','full URL you supplied','/assets/legal.css'],
 ['/support/','Support','gohipstergosupport@proton.me','/privacy/']
];
for(const [path,title,required,link] of pages){
 const response=await fetch(base+path,{redirect:'manual',headers:{accept:'text/html'}});
 if(response.status!==200)throw new Error(path+' returned '+response.status);
 if(!response.headers.get('content-type')?.includes('text/html'))throw new Error(path+' did not return HTML');
 const html=await response.text();
 for(const term of [title,required,link])if(!html.toLowerCase().includes(term.toLowerCase()))throw new Error(path+' missing '+term);
 console.log(path+' live HTML OK');
}
for(const path of ['/privacy','/support']){
 const response=await fetch(base+path,{redirect:'manual'});
 if(response.status!==308||response.headers.get('location')!==base+path+'/')throw new Error(path+' does not redirect to canonical slash: '+response.status);
 console.log(path+' redirect OK');
}
const css=await fetch(base+'/assets/legal.css');
if(css.status!==200||(await css.text()).indexOf('.mast')<0)throw new Error('Legal stylesheet unavailable');
console.log('Public legal pages verified');
