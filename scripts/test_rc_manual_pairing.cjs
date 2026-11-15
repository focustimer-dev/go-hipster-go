const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '../android-lab/app/src/main/assets/site');

(async () => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep)) { res.statusCode = 403; return res.end(); }
    try { res.end(fs.readFileSync(file)); }
    catch (_) { res.statusCode = 404; res.end(); }
  });
  await new Promise(resolve => server.listen(0, resolve));
  let browser;
  try {
    browser = await chromium.launch({
    ...(process.env.LAB_CHROMIUM ? { executablePath: process.env.LAB_CHROMIUM } : {}),
    args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:' + server.address().port + '/index.html?ai=chatgpt&service=spotify');
    await page.locator('[data-lab-tab="manual"]').click();
    const guide = page.frameLocator('#labManualFrame');
    await guide.locator('#overviewSetupLink').waitFor();

    async function check(ai, service, aiName, serviceName, setupHash) {
      await page.evaluate(pair => window.HipsterSetup.setPair(pair), { ai, service });
      // postMessage to the embedded Manual is asynchronous; wait for the
      // selected pairing rather than racing the iframe's message handler.
      await page.waitForFunction(expected => {
        const frame = document.getElementById('labManualFrame')?.contentDocument;
        return frame?.getElementById('requestServiceName')?.textContent === expected;
      }, serviceName);
      assert.equal(await guide.locator('#overviewSetupLink').getAttribute('href'), setupHash);
      assert.equal(await guide.locator('#introSetupLink').getAttribute('href'), setupHash);
      assert.equal(await guide.locator('#sendAiName').textContent(), aiName);
      assert.equal(await guide.locator('#sendCopyAiName').textContent(), aiName);
      assert.equal(await guide.locator('#keepAiName').textContent(), aiName);
      assert.equal(await guide.locator('#requestServiceName').textContent(), serviceName);
      await page.evaluate(() => {
        const frame = document.getElementById('labManualFrame');
        if (!frame || !frame.contentWindow) throw Error('Manual frame missing');
      });
    }

    await check('chatgpt', 'spotify', 'ChatGPT', 'Spotify', '#setupChat');
    await check('gemini', 'youtube', 'Gemini', 'YouTube Music', '#setup');
    assert.equal(await guide.locator('#geminiCurrentService').textContent(), 'YouTube Music');
    await check('claude', 'spotify', 'Claude', 'Spotify', '#claude');
    await check('other', 'spotify', 'Other AI', 'Spotify', '#other');
    await check('chatgpt', 'apple', 'ChatGPT', 'Apple Music', '#setupChat');
    assert.equal(await guide.locator('#chatReceiptService').textContent(), 'Apple Music');
    await guide.locator('#overviewSetupLink').click();
    await guide.locator('#practicePasteChat').click();
    assert.match(await guide.locator('#setupPasteChat').textContent(), /ChatGPT \+ Apple Music/);
    assert.match(await guide.locator('#setupPasteChat').textContent(), /Apple Music/);

    await page.evaluate(() => window.HipsterSetup.setPair({ ai: 'gemini', service: 'youtube' }));
    await guide.locator('#cratePicker > summary').click();
    assert.equal(await guide.locator('#cratePanelSetup a[href="#setup"]').count(), 1, 'Guide picker stays available');
    assert.deepEqual(errors, [], 'Manual has no browser runtime errors');
    console.log('PASS: Manual routing, chosen AI/service across four AI providers, Apple Music setup copy, guide picker.');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
