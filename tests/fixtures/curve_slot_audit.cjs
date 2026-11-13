'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const app=fs.readFileSync('launcher/assets/app.js','utf8');
const editor=fs.readFileSync('launcher/assets/mix-curve-trial.html','utf8');
const snippets=['mixCurveSlots','mixCurveSlotAudit'].map(name=>{
 const found=app.match(new RegExp('function '+name+'\\(code\\)\\{[\\s\\S]*?\\n\\}'));
 assert.ok(found,name+' must be exposed by the launcher');
 return found[0];
});
const scope={};
vm.runInNewContext(snippets.join('\n'),scope);
const code='c1:-2sw-1011sf1122f20-2ts';
const expected=['-2sw','-1','0','1','1sf','1','1','2','2f','2','0','-2ts'];
assert.deepEqual(Array.from(scope.mixCurveSlots(code)),expected,
 '12 tracks: identical adjacent tempo digits must never collapse');
const audit=scope.mixCurveSlotAudit(code);
assert.match(audit,/Curve slots \(12 in order;/);
assert.equal(audit.split(' | ').length,12);
assert.ok(audit.includes('06=1 | 07=1 | 08=2'),
 'the exact pair skipped by Gemini must remain explicitly numbered');
assert.equal(scope.mixCurveSlots('c1:-2sw-1011sf122f20-2ts'),null,
 'a genuine 11-track curve must still be rejected');
assert.match(editor,/Array\.from\(\{length:12\}/,
 'the chart encoder must still emit exactly twelve targets');
assert.match(app,/parts\.push\(mixCurveTrialCode\);\s*const audit=mixCurveSlotAudit\(mixCurveTrialCode\)/,
 'GO must export the original c1 sequence and a numbered audit together');
console.log('12-slot curve export audit contract OK');
