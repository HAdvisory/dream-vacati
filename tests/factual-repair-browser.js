'use strict';

// Requires an existing Playwright installation and Chromium; installs nothing.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const output = process.env.DV_SCREENSHOT_DIR;
const baselineRoot = process.env.DV_BASELINE_ROOT;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') { res.writeHead(405).end(); return; }
  let requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const servingRoot = baselineRoot && requested.startsWith('/__baseline/') ? baselineRoot : root;
  if (servingRoot === baselineRoot) requested = requested.slice('/__baseline'.length);
  const file = path.resolve(servingRoot, '.' + (requested === '/' ? '/index.html' : requested));
  if (!file.startsWith(path.resolve(servingRoot) + path.sep)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
  res.end(fs.readFileSync(file));
});

async function checkGreeceFaq(page, base, viewport, mode) {
  await page.setViewportSize(viewport);
  await page.goto(`${base}/best-time-greece.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[id="faq"]').count(), 1);
  assert.equal(await page.locator('section.faq-section#faq > h2').textContent(), 'Frequently Asked Questions');
  const before = await page.evaluate(() => scrollY);
  await page.locator('a[href="#faq"]').click();
  // Poll from Node rather than relying on page timers when JavaScript is disabled.
  let arrived = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    arrived = await page.evaluate(previous => {
      const section = document.getElementById('faq');
      const top = section.getBoundingClientRect().top;
      // Existing asynchronous content can shift layout after the native anchor jump.
      const heading = section.querySelector('h2').getBoundingClientRect();
      return location.hash === '#faq' && scrollY > previous && top >= -1 &&
        heading.top >= 0 && heading.bottom <= innerHeight;
    }, before);
    if (arrived) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(arrived, 'Native FAQ navigation scrolls the existing heading into view');
  assert.equal(new URL(page.url()).hash, '#faq');
  assert.equal(await page.locator('#faq .faq-answer').count(), 4);
  assert.equal(await page.locator('[data-dv-signup], [name="EMAIL"], [name="dv_hp"]').count(), 0);
  console.log(`PASS Greece FAQ native anchor and scroll: ${viewport.width}x${viewport.height}, ${mode}`);
}

(async function () {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const errors = [];
    const failedLocal = [];
    let stylesheetLoaded = false;
    await context.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() !== 'GET') return route.abort();
      if (url.origin === base || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) {
        return route.continue();
      }
      // Ads, analytics, newsletter and backend traffic cannot leave this test.
      return route.abort();
    });
    const page = await context.newPage();
    await context.addInitScript(() => localStorage.setItem('dv_cookies_ok', 'declined'));
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => {
      if (r.url().startsWith(base) && r.status() >= 400) failedLocal.push(r.url());
      if (r.url().includes('bootstrap.min.css') && r.ok()) stylesheetLoaded = true;
    });
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      await checkGreeceFaq(page, base, viewport, 'JavaScript enabled');
      await page.setViewportSize(viewport);
      await page.goto(`${base}/tourism-demand-index.html`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelectorAll('.tdi-card').length === 30);
      assert.equal(await page.locator('.tdi-arrivals').filter({ hasText: 'Unverified visitor estimate:' }).count(), 29);
      await page.selectOption('#tdi-region', 'Caribbean');
      assert.equal(await page.locator('.tdi-card').count(), 4);
      await page.click('#tdi-reset');
      assert.equal(await page.locator('.tdi-card').count(), 30);
      await page.selectOption('#tdi-sort', 'arrivals-desc');
      const highestVisitorFigure = await page.evaluate(() => window.TOURISM_DEMAND_DATA.reduce(
        (highest, item) => item.annualArrivals > highest.annualArrivals ? item : highest).name);
      assert.equal(await page.locator('.tdi-card-title').first().textContent(), highestVisitorFigure);
      await page.fill('#tdi-search', 'Japan');
      assert.equal(await page.locator('.tdi-card').count(), 1);
      assert.match(await page.locator('.tdi-arrivals').textContent(), /36\.9M international visitor arrivals \(2024\)/);
      assert.match(await page.locator('.tdi-arrivals').textContent(), /arrival figure checked 2026-10-25/);
      await page.locator('.tdi-card').scrollIntoViewIfNeeded();
      if (output) {
        fs.mkdirSync(output, { recursive: true });
        await page.screenshot({ path: path.join(output, `tdi-japan-${viewport.width}.png`) });
      }
      const overflow = await page.evaluate(() => ({
        width: innerWidth, scroll: document.documentElement.scrollWidth,
        elements: [...document.querySelectorAll('body *')].filter(el => {
          const box = el.getBoundingClientRect(); return box.width && box.right > innerWidth + 1;
        }).slice(0, 8).map(el => ({ tag: el.tagName, id: el.id, class: el.className }))
      }));
      const cardBounds = await page.locator('.tdi-card').boundingBox();
      assert.ok(cardBounds.x >= 0 && cardBounds.x + cardBounds.width <= viewport.width + 1, 'TDI card fits viewport');
      if (overflow.scroll > overflow.width) {
        if (baselineRoot) {
          const baselinePage = await context.newPage();
          await baselinePage.setViewportSize(viewport);
          await baselinePage.goto(`${base}/__baseline/tourism-demand-index.html`, { waitUntil: 'networkidle' });
          await baselinePage.waitForFunction(() => document.querySelectorAll('.tdi-card').length === 30);
          await baselinePage.fill('#tdi-search', 'Japan');
          const originalWidth = await baselinePage.evaluate(() => document.documentElement.scrollWidth);
          assert.ok(overflow.scroll <= originalWidth, 'No new document overflow relative to baseline');
          console.log(`NOTE pre-existing TDI document overflow: baseline=${originalWidth}px, patched=${overflow.scroll}px at ${viewport.width}px`);
          await baselinePage.close();
        } else {
          console.log(`NOTE TDI document overflow=${overflow.scroll}px at ${viewport.width}px; changed card fits viewport`);
        }
      }
      await page.fill('#tdi-search', 'nonexistent-123');
      assert.equal(await page.locator('.tdi-card').count(), 0);
      await page.click('#tdi-reset');
      assert.equal(await page.locator('.tdi-card').count(), 30);
      for (const file of ['jamaica-travel-guide.html', 'montego-bay-jamaica.html', 'montego-bay-vs-negril.html',
        'negril-jamaica.html', 'blog-compare-caribbean-islands.html']) {
        await page.goto(`${base}/${file}`, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('h1').count(), 1);
        const currentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        if (currentWidth > viewport.width && baselineRoot) {
          const originalPage = await context.newPage();
          await originalPage.setViewportSize(viewport);
          await originalPage.goto(`${base}/__baseline/${file}`, { waitUntil: 'networkidle' });
          const originalWidth = await originalPage.evaluate(() => document.documentElement.scrollWidth);
          assert.ok(currentWidth <= originalWidth, `${file}: no new horizontal overflow`);
          console.log(`NOTE ${file} document width: baseline=${originalWidth}px, patched=${currentWidth}px at ${viewport.width}px`);
          await originalPage.close();
        } else if (currentWidth > viewport.width) {
          console.log(`NOTE ${file} document width=${currentWidth}px at ${viewport.width}px; baseline comparison not supplied`);
        }
        assert.equal(await page.locator('[data-dv-signup] input[type=email]').count(), 0, 'Newsletter stays paused');
        if (output && file === 'jamaica-travel-guide.html') {
          await page.locator('#couples-families').scrollIntoViewIfNeeded();
          await page.screenshot({ path: path.join(output, `jamaica-corrections-${viewport.width}.png`) });
        }
      }
      console.log(`PASS desktop/mobile page, source wrapping, TDI filters and paused newsletter: ${viewport.width}px`);
    }
    const noScriptContext = await browser.newContext({ javaScriptEnabled: false });
    try {
      await noScriptContext.route('**/*', route => {
        const request = route.request(), url = new URL(request.url());
        if (request.method() === 'GET' && (url.origin === base ||
          ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname))) return route.continue();
        return route.abort();
      });
      const noScriptPage = await noScriptContext.newPage();
      for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
        await checkGreeceFaq(noScriptPage, base, viewport, 'JavaScript disabled');
      }
    } finally {
      await noScriptContext.close();
    }
    await page.goto(`${base}/best-time.html`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('#btt-destination').options.length === 23);
    await page.selectOption('#btt-destination', 'jamaica');
    assert.match(await page.locator('#btt-single-result').textContent(), /Jamaica/);
    await page.goto(`${base}/destination-comparison.html`, { waitUntil: 'networkidle' });
    await page.selectOption('#dest-a', 'japan');
    await page.selectOption('#dest-b', 'jamaica');
    await page.click('#compare-btn');
    assert.match(await page.locator('body').textContent(), /Japan/);
    await page.goto(`${base}/tools.html`, { waitUntil: 'networkidle' });
    await page.selectOption('#req-destination', 'JP');
    await page.click('#get-requirements');
    await page.waitForFunction(() => document.querySelector('#requirements-output h3')?.textContent.includes('Japan'));
    assert.match(await page.locator('#requirements-output').textContent(), /Japan/);
    assert.equal(stylesheetLoaded, true, 'Bootstrap stylesheet must load for layout checks');
    assert.deepEqual(failedLocal, []);
    assert.deepEqual(errors, []);
    console.log('PASS existing seasonal/comparison/requirements interactions; no page errors or missing local resources');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
