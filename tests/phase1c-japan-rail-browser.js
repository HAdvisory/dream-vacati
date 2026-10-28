'use strict';

// Existing Playwright/Chromium only. GET-only local QA; ads/backend/tracking blocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const baseline = process.env.DV_BASELINE_ROOT;
const screenshots = process.env.DV_SCREENSHOT_DIR;
const files = ['blog-japan-transportation-guide.html', 'blog-japan-travel-budget.html',
  'blog-japan-travel-mistakes.html', 'japan-travel-guide.html',
  'blog-best-time-japan.html', 'blog-tokyo-vs-osaka.html'];
const server = http.createServer((req, res) => {
  if (req.method !== 'GET') return res.writeHead(405).end();
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const serving = baseline && pathname.startsWith('/__baseline/') ? baseline : root;
  if (serving === baseline) pathname = pathname.slice('/__baseline'.length);
  const file = path.resolve(serving, '.' + pathname);
  if (!file.startsWith(path.resolve(serving) + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.webp':'image/webp', '.svg':'image/svg+xml' };
  res.setHeader('Content-Type', (mime[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
  res.end(fs.readFileSync(file));
});

(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless: true });
    const errors = [], missing = [], attempts = [], layouts = [];
    let checks = 0, stylesheetLoaded = false;
    for (const mode of ['enabled','disabled','pause-script-blocked']) {
      const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
      await context.addInitScript(() => localStorage.setItem('dv_cookies_ok', 'declined'));
      await context.route('**/*', route => {
        const req = route.request(), url = new URL(req.url());
        if (req.method() !== 'GET') { attempts.push(req.method() + ' ' + url.pathname); return route.abort(); }
        if (/list-manage|\/api\/email-capture/.test(url.href)) { attempts.push(url.pathname); return route.abort(); }
        if (mode === 'pause-script-blocked' && url.pathname.endsWith('/js/email-capture.js')) return route.abort();
        if (url.origin === base || ['cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)) return route.continue();
        return route.abort();
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base) && response.status() >= 400) missing.push(response.url());
        if (response.url().startsWith(base) && response.url().endsWith('/footer-global.css') && response.ok()) stylesheetLoaded = true;
      });
      for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
        await page.setViewportSize(viewport);
        for (const file of files) {
          await page.goto(`${base}/${file}`, { waitUntil:'networkidle' });
          assert.equal(await page.locator('h1').count(), 1, file);
          assert.equal(await page.locator('[data-dv-signup], [name="EMAIL"], [name="dv_hp"]').count(), 0);
          assert.match(await page.locator('[data-dv-newsletter-paused]').textContent(), /currently unavailable/);
          const source = await page.locator('script[type="application/ld+json"]').allTextContents();
          source.forEach(s => JSON.parse(s));
          const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(n => n.id));
          assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
          const details = page.locator('details.faq-item');
          const questions = await details.locator('summary').allTextContents();
          assert.equal(new Set(questions).size, questions.length, `${file}: duplicate FAQs`);
          for (let i=0; i<await details.count(); i++) {
            const item = details.nth(i);
            await item.locator('summary').click();
            assert.equal(await item.getAttribute('open'), '');
            assert.ok(await item.locator('.faq-answer').isVisible());
          }
          const geometry = await page.evaluate(() => ({
            documentWidth: document.documentElement.scrollWidth,
            tables: [...document.querySelectorAll('article table')].map(table => ({
              width: table.getBoundingClientRect().width,
              right: table.getBoundingClientRect().right,
              clippedCells: [...table.querySelectorAll('td,th')].filter(cell => cell.scrollWidth > cell.clientWidth + 1).length
            }))
          }));
          assert.ok(geometry.tables.every(t => t.clippedCells === 0), `${file}: clipped table content`);
          if (mode === 'enabled') {
            if (screenshots) {
              fs.mkdirSync(screenshots, { recursive:true });
              await page.evaluate(() => scrollTo(0,0));
              await page.screenshot({path:path.join(screenshots,`${file}-${viewport.width}-top.png`)});
              const table = page.locator('article table').last();
              if (await table.count()) {
                await table.scrollIntoViewIfNeeded();
                await page.screenshot({path:path.join(screenshots,`${file}-${viewport.width}-table.png`)});
              }
            }
            if (baseline) {
              await page.goto(`${base}/__baseline/${file}`, { waitUntil:'networkidle' });
              const old = await page.evaluate(() => ({documentWidth:document.documentElement.scrollWidth,
                tables:[...document.querySelectorAll('article table')].map(t => t.getBoundingClientRect().width)}));
              assert.ok(geometry.documentWidth <= Math.max(viewport.width,old.documentWidth)+1, `${file}: new document overflow ${geometry.documentWidth} vs ${old.documentWidth}`);
              geometry.tables.forEach((t,i) => assert.ok(t.width <= Math.max(viewport.width,old.tables[i] || 0)+1, `${file}: new table overflow`));
              layouts.push({file,viewport,documentWidth:geometry.documentWidth,baselineWidth:old.documentWidth,tables:geometry.tables});
            } else layouts.push({file,viewport,...geometry});
          }
          checks++;
          console.log(`PASS Japan article/FAQ/newsletter: ${file} ${viewport.width}x${viewport.height} ${mode}`);
        }
      }
      await context.close();
    }
    assert.ok(stylesheetLoaded, 'The articles\' actual local stylesheet must load for layout validation');
    assert.deepEqual(errors, []); assert.deepEqual(missing, []); assert.deepEqual(attempts, []);
    console.log(JSON.stringify({checks,errors,missing,attempts,layouts},null,2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode=1; });
