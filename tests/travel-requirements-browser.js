'use strict';
// Uses existing Playwright/Chromium. No installation or external writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/travel-requirements.json'), 'utf8'));
const server = http.createServer((req, res) => {
  if (req.method !== 'GET') return res.writeHead(405).end();
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(path.resolve(root) + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml' };
  res.setHeader('Content-Type', (mime[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
  if (new URL(req.url, 'http://localhost').searchParams.has('csp')) {
    const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
    res.setHeader('Content-Security-Policy', headers.match(/^\s*Content-Security-Policy: (.+)$/m)[1]);
  }
  res.end(fs.readFileSync(file));
});
(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addInitScript(() => localStorage.setItem('dv_cookies_ok', 'declined'));
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (route.request().method() !== 'GET') return route.abort();
      if (url.origin === base || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    let stylesheetLoaded = false;
    page.on('response', response => {
      if (response.url().includes('bootstrap.min.css') && response.ok()) stylesheetLoaded = true;
    });
    let downloads = 0;
    page.on('request', req => { if (req.url().endsWith('/data/travel-requirements.json')) downloads++; });
    const choose = async code => { await page.selectOption('#req-destination', code); await page.click('#get-requirements'); };
    const done = () => page.waitForFunction(() => !document.getElementById('requirements-output').hasAttribute('aria-busy'));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base + '/tools.html', { waitUntil: 'networkidle' });
      await page.evaluate(() => { window.testEvents = []; window.dvTrack = (name, payload) => testEvents.push({ name, payload }); });
      const before = downloads;
      await page.click('#get-requirements');
      assert.match(await page.locator('#requirements-output').textContent(), /Please select/);
      for (const code of Object.keys(data.countryMappings)) {
        await choose(code); await done();
        assert.match(await page.locator('#requirements-output h3').textContent(), new RegExp(data.countryMappings[code].name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        assert.equal(await page.locator('#requirements-output .req-row').count(), 6);
        assert.ok(await page.locator('#requirements-output a').count());
        assert.match(await page.locator('#requirements-output').textContent(), /2026-10-25/);
      }
      assert.equal(downloads - before, 1, 'one cached fetch across all destinations');
      const events = await page.evaluate(() => testEvents);
      assert.deepEqual(events.find(event => event.name === 'tool_start'), { name: 'tool_start', payload: { tool_name: 'requirements' } });
      assert.equal(events.filter(e => e.name === 'tool_start').length, 1);
      assert.deepEqual(events.filter(e => e.name === 'requirements_lookup').map(e => e.payload.destination), Object.keys(data.countryMappings));
      await page.fill('#budget-input', '4000');
      assert.equal(await page.locator('#budget-total').textContent(), '4,000');
      await page.click('#generate-packing');
      assert.ok(await page.locator('#pack-list li').count());
      await page.fill('#custom-activity-input', 'Phase 1B regression activity');
      await page.click('#add-custom-activity');
      assert.match(await page.locator('#activities-list').textContent(), /Phase 1B regression activity/);
      await page.click('#pet-calc-btn');
      assert.match(await page.locator('#pet-total-display').textContent(), /\$/);
      const bounds = await page.locator('#requirements-output .req-card').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, 'output card fits viewport');
      await page.locator('#requirements-output').scrollIntoViewIfNeeded();
      if (process.env.DV_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.DV_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.DV_SCREENSHOT_DIR, `requirements-${width}.png`) });
      }
      console.log(`PASS all 14 destinations, cache, analytics and layout at ${width}px`);
    }
    for (const scenario of ['offline', 'http', 'json', 'missing-record', 'missing-source', 'missing-claim', 'missing-date', 'unsafe-text']) {
      await page.route('**/data/travel-requirements.json', route => {
        if (scenario === 'offline') return route.abort();
        if (scenario === 'http') return route.fulfill({ status: 404, body: 'Not found' });
        if (scenario === 'json') return route.fulfill({ contentType: 'application/json', body: '{' });
        const fixture = structuredClone(data);
        const japan = fixture.destinations.find(d => d.id === 'japan');
        if (scenario === 'missing-record') fixture.destinations = fixture.destinations.filter(d => d.id !== 'japan');
        if (scenario === 'missing-source') fixture.sources = {};
        if (scenario === 'missing-claim') delete japan.claims.passport;
        if (scenario === 'missing-date') japan.claims.passport.lastReviewed = null;
        if (scenario === 'unsafe-text') japan.claims.passport.text = '<img src=x onerror=alert(1)>';
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(fixture) });
      });
      await page.goto(base + '/tools.html', { waitUntil: 'networkidle' });
      await page.evaluate(() => { window.testEvents = []; window.dvTrack = (name, payload) => testEvents.push({ name, payload }); });
      await choose('JP'); await done();
      const text = await page.locator('#requirements-output').textContent();
      if (['offline', 'http', 'json', 'missing-record'].includes(scenario)) {
        assert.match(text, /could not be confirmed/);
        assert.equal(await page.locator('#requirements-output .req-card').count(), 0);
        assert.equal(await page.evaluate(() => testEvents.filter(e => e.name === 'requirements_lookup').length), 0);
        await page.unroute('**/data/travel-requirements.json');
        if (scenario === 'missing-record') {
          await page.reload({ waitUntil: 'networkidle' });
          await page.selectOption('#req-destination', 'JP');
        }
        await page.click('#get-requirements'); await done();
        assert.match(await page.locator('#requirements-output h3').textContent(), /Japan/);
      } else if (scenario === 'missing-date') assert.match(text, /UNVERIFIED; review date unavailable/);
      else if (scenario === 'unsafe-text') {
        assert.ok(text.includes('<img src=x onerror=alert(1)>'));
        assert.equal(await page.locator('#requirements-output img').count(), 0);
      } else assert.match(text, /UNVERIFIED - Source information missing/);
      await page.unroute('**/data/travel-requirements.json');
      console.log('PASS failure/disclosure scenario: ' + scenario);
    }
    // A late response must not replace a newly selected destination.
    await page.route('**/data/travel-requirements.json', async route => {
      await new Promise(resolve => setTimeout(resolve, 300));
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
    });
    await page.goto(base + '/tools.html', { waitUntil: 'networkidle' });
    await choose('JP'); await page.selectOption('#req-destination', 'GB');
    await page.waitForTimeout(400);
    assert.equal(await page.locator('#requirements-output').textContent(), '');
    await page.click('#get-requirements'); await done();
    assert.match(await page.locator('#requirements-output h3').textContent(), /United Kingdom/);
    await page.unroute('**/data/travel-requirements.json');
    await page.goto(base + '/tools.html?csp=1', { waitUntil: 'networkidle' });
    await choose('JP'); await done();
    assert.match(await page.locator('#requirements-output h3').textContent(), /Japan/);
    console.log('PASS requirements adapter and JSON fetch under existing strict CSP');
    assert.deepEqual(errors, []);
    assert.equal(stylesheetLoaded, true, 'Bootstrap must load for meaningful layout validation');
    console.log('PASS stale-response protection; no JavaScript page errors');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
