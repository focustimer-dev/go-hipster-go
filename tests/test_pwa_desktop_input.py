"""Keep desktop guidance scoped and keyboard dismissal predictable."""
import pathlib
import shutil
import subprocess
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class DesktopInputTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Node required')
    def test_pointer_guidance_and_escape(self):
        script = r'''
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('launcher/assets/app.js','utf8');
const render=source.slice(source.indexOf('function renderAtlasNavigation(){'),source.indexOf('function renderCrateStamps(){'));
for(const [fine,pwa,focused,expected] of [
 [true,true,false,'CLICK LAND TO EXPLORE · DRAG TO PAN · CTRL / ⌘ + SCROLL TO ZOOM'],
 [true,true,true,'CLICK TO INK / UNINK · DRAG TO PAN · CTRL / ⌘ + SCROLL TO ZOOM'],
 [false,true,false,'TAP LAND TO EXPLORE · DRAG TO PAN · TWO FINGERS TO ZOOM'],
 [true,false,false,'TAP LAND TO EXPLORE · SHIFT + SCROLL TO PAN · PINCH TO ZOOM']]){
 const hint={}; const context={atlasFocus:focused?'north':null,atlasUserNavigated:false,
 crateSelected:new Set(),doc:{body:{classList:{contains:()=>pwa}},getElementById:id=>id==='atlasInstruction'?hint:null},
 window:{matchMedia:()=>({matches:fine})}};
 vm.runInNewContext(render+';renderAtlasNavigation()',context);
 assert.equal(hint.textContent,expected);
}
const guides=fs.readFileSync('launcher/assets/pwa-guides.js','utf8');
const handler=guides.slice(guides.indexOf("manual.addEventListener('keydown',event=>{"),guides.indexOf('\nrenderGuide();',guides.indexOf("manual.addEventListener('keydown',event=>{")));
let listener,focused=0,prevented=0;const picker={open:true,querySelector:()=>({focus:()=>focused++})};
vm.runInNewContext(handler,{manual:{addEventListener:(_,fn)=>listener=fn},picker});
listener({key:'Escape',preventDefault:()=>prevented++});
assert.equal(picker.open,false);assert.equal(focused,1);assert.equal(prevented,1);
listener({key:'Escape',target:{closest:()=>null},preventDefault:()=>prevented++});
assert.equal(prevented,1,'Closed picker leaves Escape available to other controls');
'''
        result = subprocess.run(['node', '-e', script], cwd=ROOT, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
