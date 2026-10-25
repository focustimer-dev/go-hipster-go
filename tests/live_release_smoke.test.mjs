import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAsset, verifyCommit, criticalAssets } from '../scripts/smoke_live.mjs';

test('a version label cannot conceal stale asset bytes', () => {
  const label = '/assets/app.js?v=current';
  assert.throws(() => verifyAsset(Buffer.from('old'), Buffer.from('new'), label), /served bytes differ/);
  assert.doesNotThrow(() => verifyAsset(Buffer.from('new'), Buffer.from('new'), label));
});
test('the shared stylesheet is covered, including corrupted declarations', () => {
  assert.equal(criticalAssets.get('/assets/hipster.css'), 'launcher/assets/hipster.css');
  assert.throws(() => verifyAsset(Buffer.from('inline-release:light'), Buffer.from('color-scheme:light'), 'shared CSS'), /served bytes differ/);
});
test('an ambiguous release reference is rejected', () => {
  for (const value of ['', 'main', 'abc1234']) assert.throws(() => verifyCommit(value));
  assert.equal(verifyCommit('a'.repeat(40)), 'a'.repeat(40));
});

const { verifyGeometry } = await import('../scripts/smoke_live.mjs');
const target = (label, left, top, width = 44, height = 44) => ({ label, left, top, width, height, right: left + width, bottom: top + height });
test('phone geometry permits wrapping into another row', () => {
  assert.doesNotThrow(() => verifyGeometry({ clientWidth: 390, scrollWidth: 390, targets: [target('Shuffle', 0, 0), target('Pin', 0, 48)] }, 'phone'));
});
test('phone geometry rejects overflow, undersized targets and overlap', () => {
  assert.throws(() => verifyGeometry({ clientWidth: 390, scrollWidth: 410, targets: [] }, 'phone'), /horizontal page overflow/);
  assert.throws(() => verifyGeometry({ clientWidth: 390, scrollWidth: 390, targets: [target('Pin', 0, 0, 30)] }, 'phone'), /tap target/);
  assert.throws(() => verifyGeometry({ clientWidth: 390, scrollWidth: 390, targets: [target('Shuffle', 0, 0), target('Pin', 30, 0)] }, 'phone'), /overlaps/);
  assert.throws(() => verifyGeometry({ clientWidth: 390, scrollWidth: 390, targets: [target('Pin', 370, 0)] }, 'phone'), /outside the page/);
});
