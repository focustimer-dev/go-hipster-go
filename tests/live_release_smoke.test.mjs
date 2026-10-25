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
