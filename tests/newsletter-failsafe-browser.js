'use strict';
// Local GET-only server. No subscription requests are generated or transmitted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const representatives = ['index.html', 'tools.html', 'jamaica-travel-guide.html', 'trip-planner.html', 'blog-caribbean-family.html', 'blog-elmo.html', 'world-cup-2026-travel-guide.html'];
const server = http.createServer((req, res) => {
  if (req.method !== 'GET') return res.writeHead(405).end();
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(path.resolve(root) + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
  res.setHeader('Content-Type', (mime[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
  res.end(fs.readFileSync(file));
});
(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless: true });
    let stylesheetLoaded = false;
    for (const mode of ['enabled', 'disabled', 'pause-script-blocked']) {
      const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
      await context.addInitScript(() => {
        if (location.hostname === '127.0.0.1') localStorage.setItem('dv_cookies_ok', 'declined');
      });
      const attempts = [], errors = [];
      await context.route('**/*', route => {
        const request = route.request(), url = new URL(request.url());
        if (request.method() !== 'GET') { attempts.push(request.method() + ' ' + url.pathname); return route.abort(); }
        if (/email-capture|list-manage/i.test(url.pathname + url.hostname) && !url.pathname.endsWith('/js/email-capture.js')) {
          attempts.push('newsletter endpoint: ' + url.pathname); return route.abort();
        }
        if (mode === 'pause-script-blocked' && url.pathname.endsWith('/js/email-capture.js')) return route.abort();
        if (url.origin === base || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.continue();
        return route.abort();
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.url().includes('bootstrap.min.css') && response.ok()) stylesheetLoaded = true; });
      for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(viewport);
        // All pages in every state; representatives additionally exercise Enter and layout.
        for (const file of htmlFiles) {
          await page.goto(base + '/' + file, { waitUntil: 'domcontentloaded' });
          assert.equal(await page.locator('[data-dv-signup], .dfg-form, [name="EMAIL"], [name="dv_hp"]').count(), 0, file);
          assert.equal(await page.locator('input[type=email]').count(), file === 'trip-planner.html' ? 1 : 0, file);
          const footer = page.locator('[data-dv-newsletter-paused]');
          assert.equal(await footer.count(), 1, file);
          assert.match(await footer.textContent(), /Newsletter updates are currently unavailable\./);
          assert.equal(await footer.locator('form,input,button,textarea,select').count(), 0);
          if (representatives.includes(file)) {
            await footer.scrollIntoViewIfNeeded();
            await page.locator('body').click({ position: { x: 2, y: 2 } });
            await page.keyboard.press('Enter');
            const bounds = await footer.boundingBox();
            assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= viewport.width + 1, `${file}: footer fits viewport`);
          }
          if (file === 'index.html') {
            const hero = page.locator('#email-signup-form');
            assert.equal(await hero.locator('form,input,button,textarea,select').count(), 0);
            if (process.env.DV_SCREENSHOT_DIR) {
              fs.mkdirSync(process.env.DV_SCREENSHOT_DIR, { recursive: true });
              await hero.scrollIntoViewIfNeeded();
              await page.screenshot({ path: path.join(process.env.DV_SCREENSHOT_DIR, `newsletter-${mode}-${viewport.width}.png`) });
            }
          }
        }
        await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
        await page.locator('#email-signup-form a[href="tools.html"]').click();
        await page.waitForURL('**/tools.html');
        if (mode !== 'disabled') {
          await page.selectOption('#req-destination', 'JP'); await page.click('#get-requirements');
          await page.waitForFunction(() => document.querySelector('#requirements-output h3')?.textContent.includes('Japan'));
          const navToggle = page.locator('nav button[data-bs-toggle="collapse"]').first();
          if (viewport.width === 390 && await navToggle.count()) {
            const target = await navToggle.getAttribute('data-bs-target');
            await navToggle.click(); await page.locator(target + '.show').waitFor();
          }
        }
        await page.goto(base + '/privacy.html', { waitUntil: 'domcontentloaded' });
        assert.ok(await page.locator('a[href="mailto:hello@dreamvacati.com"]').count());
        assert.deepEqual(attempts, [], 'No newsletter/network submission attempts in ' + mode);
        console.log(`PASS ${mode}, ${viewport.width}x${viewport.height}: ${htmlFiles.length} pages, Enter safety, static navigation and contact link`);
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
    assert.equal(stylesheetLoaded, true, 'Stylesheet must load for meaningful layout checks');
    console.log('PASS all three JS states; no POSTs, newsletter endpoint attempts or page errors. Transactional planner input preserved.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
