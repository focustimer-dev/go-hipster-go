#!/usr/bin/env node
/** Read-only release smoke: exact served assets + real browser initialization. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const sourceRoot = 'https://raw.githubusercontent.com/focustimer-dev/go-hipster-go';
export const criticalAssets = new Map([
  ['/assets/app.js', 'launcher/assets/app.js'],
  ['/assets/hipster.css', 'launcher/assets/hipster.css'],
  ['/editions/gig-poster/edition.css', 'launcher/editions/gig-poster/edition.css'],
]);
export function verifyAsset(actual, expected, label) {
  const digest = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(digest(actual), digest(expected), `${label}: served bytes differ from the expected release`);
}
export function verifyCommit(commit) {
  assert.match(commit || '', /^[a-f0-9]{40}$/i, 'Supply the full expected release commit SHA');
  return commit;
}

export async function checkRelease(browser, baseURL, expectedCommit, sourceCache = new Map()) {
  verifyCommit(expectedCommit);
  const origin = new URL(baseURL).origin;
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  async function responseBytes(url) {
    const response = await context.request.get(url, { timeout: 15000 });
    assert.equal(response.status(), 200, `${url}: HTTP ${response.status()}`);
    return response.body();
  }
  async function checkAssets() {
    const urls = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(nodes =>
      nodes.map(node => node.src || node.href));
    for (const [path, sourcePath] of criticalAssets) {
      const live = urls.find(url => new URL(url).origin === origin && new URL(url).pathname === path);
      assert.ok(live, `${path}: missing from the rendered page`);
      const expectedURL = `${sourceRoot}/${expectedCommit}/${sourcePath}`;
      if (!sourceCache.has(expectedURL)) sourceCache.set(expectedURL, await responseBytes(expectedURL));
      // Compare actual bytes, never trust a reassuring version query string.
      verifyAsset(await responseBytes(live), sourceCache.get(expectedURL), path);
    }
  }
  try {
    const home = await page.goto(`${origin}/?ai=gemini&service=youtube&mood=angry&tempo=slow`, { waitUntil: 'networkidle' });
    assert.equal(home.status(), 200, 'Jukebox did not load');
    await checkAssets();
    for (const selector of ['#goButton', '#shuffleCrate', '#pinMood', '#pinPace', '#pinRegions', '#tempoSlider', '[data-mood="angry"]', '[data-ai="gemini"]']) {
      assert.ok(await page.locator(selector).isVisible(), `${selector}: control is not directly available`);
    }
    const before = await page.locator('#prompt').textContent();
    await page.locator('#pinMood').click();
    await page.locator('#pinRegions').click();
    await page.locator('#shuffleCrate').click();
    const shuffled = await page.locator('#prompt').textContent();
    assert.match(shuffled, /go angry/, 'Pinned mood changed');
    assert.doesNotMatch(shuffled, /Regional exploration:/, 'Pinned Worldwide selection changed');
    assert.doesNotMatch(shuffled, /Tempo preference: Slow/, 'Unpinned pace did not change');
    assert.equal(await page.locator('#receiptCopy').textContent(), 'REQUEST DRAFT', 'Shuffle incorrectly claims a copy');
    await page.locator('#pinPace').click();
    assert.ok(await page.locator('#shuffleCrate').isDisabled(), 'All pinned must disable shuffle');
    await page.locator('#pinPace').click();
    await page.locator('#undoShuffle').click();
    assert.equal(await page.locator('#prompt').textContent(), before, 'Undo did not restore the brief');
    await page.locator('#goButton').click();
    await page.waitForFunction(() => document.querySelector('#receiptCopy')?.textContent === 'COPIED TO CLIPBOARD');
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await page.locator('#prompt').textContent(), 'Receipt and clipboard differ');
    assert.equal(await page.locator('#promptReceipt').getAttribute('data-copy-state'), 'copied');
    const manual = await page.goto(`${origin}/setup/?ai=gemini&service=youtube`, { waitUntil: 'networkidle' });
    assert.equal(manual.status(), 200, 'Manual did not load');
    await checkAssets();
    await page.locator('.manual-install > summary').click();
    assert.equal(await page.locator('#recipeSteps .recipe-step-title').count(), 4, 'Manual steps did not initialize');
    const instructions = await page.locator('#recipeSteps').innerText();
    assert.match(instructions, /small entry skill/);
    assert.match(instructions, /latest release/);
    assert.doesNotMatch(instructions, /Task mode|v3\.7\.1/, 'Known stale installation instructions returned');
    assert.match(await page.locator('#setupPromptText').textContent(), /adapters\/gemini\/SKILL\.md/);
    assert.deepEqual(errors, [], 'Uncaught browser errors');
    return { release: expectedCommit, assets: criticalAssets.size, pages: ['Jukebox', 'Manual'], controls: 'GO, Shuffle, pins, Undo, clipboard and receipt passed' };
  } catch (error) {
    await mkdir('artifacts/live-smoke', { recursive: true });
    await page.screenshot({ path: 'artifacts/live-smoke/failure.png', fullPage: true, timeout: 5000 }).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const flag = name => args[args.indexOf(name) + 1];
  assert.ok(args.includes('--expected-commit'), 'Usage: node scripts/smoke_live.mjs --expected-commit SHA [--url URL]');
  const expected = verifyCommit(flag('--expected-commit'));
  const url = args.includes('--url') ? flag('--url') : 'https://hipster-go.samelling.workers.dev';
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const sourceCache = new Map();
  try {
    // Bounded propagation window when a main push immediately precedes deployment.
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        console.log(JSON.stringify({ status: 'PASS', ...await checkRelease(browser, url, expected, sourceCache) }, null, 2));
        return;
      } catch (error) {
        console.error(`Attempt ${attempt}/4: ${error.message}`);
        if (attempt === 4) throw error;
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  } finally { await browser.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(`FAIL: ${error.message}`); process.exitCode = 1; });
}
