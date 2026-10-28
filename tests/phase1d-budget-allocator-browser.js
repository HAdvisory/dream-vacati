'use strict';
// Existing Playwright, local GET-only server, actual page/scripts/styles; no measurement traffic.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(process.env.DV_TEST_ROOT || path.join(__dirname, '..'));
const output = process.env.DV_SCREENSHOT_DIR;
const server = http.createServer((req, res) => {
  if (req.method !== 'GET') return res.writeHead(405).end();
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  const mime = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp' };
  res.setHeader('Content-Type', (mime[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
  res.end(fs.readFileSync(file));
});
const expectedEvents = [
  ['event', 'tool_used', { event_category:'tools', event_label:'budget_calculator' }],
  ['event', 'tool_start', { event_category:'tools', event_label:'budget_calculator' }]
];
(async () => {
  let browser;
  const results = [], shared = [], consumers = [], errors = [], consoleErrors = [], missing = [], attempts = [];
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ headless:true });
    for (const viewport of [{ width:1440, height:1000 }, { width:390, height:844 }]) {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(() => {
        try { localStorage.setItem('dv_cookies_ok', 'declined'); } catch (_) {}
        window.__budgetWrites = [];
        document.addEventListener('DOMContentLoaded', () => {
          const target = document.getElementById('remaining-budget');
          if (target) new MutationObserver(records => {
            for (const record of records) window.__budgetWrites.push({ type:record.type, value:target.textContent });
          }).observe(target, { childList:true });
        });
      });
      await context.route('**/*', route => {
        const req = route.request(), url = new URL(req.url());
        if (req.method() !== 'GET' || /list-manage|\/api\/email-capture/.test(url.href)) {
          attempts.push(req.method() + ' ' + url.href); return route.abort();
        }
        if (url.origin === base || ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.continue();
        return route.abort();
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push({ viewport, message:error.message }));
      page.on('console', message => {
        if (message.type() === 'error' && !/net::ERR_FAILED/.test(message.text())) consoleErrors.push(message.text());
      });
      page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) missing.push(response.url()); });
      await page.goto(base + '/tools.html#tool-budget', { waitUntil:'networkidle' });
      assert.equal(await page.locator('#tool-budget .row').evaluate(el => getComputedStyle(el).display), 'flex', 'Bootstrap layout is loaded');
      const budgetEvents = () => page.evaluate(() => (window.dataLayer || []).map(x => Array.from(x))
        .filter(x => x[0] === 'event' && x[2]?.event_label === 'budget_calculator'));
      const clearWrites = () => page.evaluate(() => { window.__budgetWrites = []; });
      async function check(label, values, allocated, remaining, total, writes = 1) {
        const actual = await page.evaluate(() => {
          const ids = ['accom', 'flights', 'food', 'activities'];
          const text = id => document.getElementById(id).textContent;
          const panel = document.querySelector('.budget-result-box');
          return { values:ids.map(id => text('val-' + id)), sliderValues:ids.map(id => document.getElementById('budget-' + id).value),
            total:text('budget-total'), allocated:text('allocated-display'), remaining:text('remaining-budget'),
            bars:ids.map(id => document.getElementById('bar-' + id).style.width), writes:window.__budgetWrites,
            width:document.documentElement.scrollWidth, panel:panel.getBoundingClientRect().toJSON(), display:getComputedStyle(panel).display };
        });
        assert.deepEqual(actual.values, values.map(v => v.toLocaleString()));
        assert.deepEqual(actual.sliderValues, values.map(String));
        assert.equal(actual.total, total.toLocaleString());
        assert.equal(actual.allocated, '$' + allocated.toLocaleString());
        assert.equal(actual.remaining, remaining.toLocaleString());
        assert.equal(actual.writes.length, writes, label + ': exactly one remaining writer');
        assert.ok(actual.panel.width > 0 && actual.panel.height > 0 && actual.display !== 'none');
        assert.ok(actual.width <= viewport.width + 1, label + ': no horizontal overflow');
        assert.equal(await page.locator('[data-dv-signup], input[name="EMAIL"], input[name="dv_hp"]').count(), 0);
        results.push({ label, viewport, ...actual });
      }
      async function total(value) { await clearWrites(); await page.fill('#budget-input', String(value)); }
      async function slider(id, value) {
        await clearWrites();
        await page.locator('#budget-' + id).evaluate((el, value) => { el.value = String(value); el.dispatchEvent(new Event('input', { bubbles:true })); }, value);
      }
      async function left(id) { await clearWrites(); await page.locator('#budget-' + id).focus(); await page.keyboard.press('ArrowLeft'); }
      await check('A initial', [1200, 750, 600, 450], 3000, 0, 3000);
      assert.deepEqual(await budgetEvents(), []);
      await left('accom'); await check('slider-only first use', [1199, 750, 600, 450], 2999, 1, 3000);
      assert.deepEqual(await budgetEvents(), []);
      await total(4000); await check('B 4000', [1600, 1000, 800, 600], 4000, 0, 4000);
      assert.deepEqual(await budgetEvents(), expectedEvents);
      assert.deepEqual(await page.locator('.budget-bar-seg').evaluateAll(els => els.map(el => el.style.width)), ['40%', '25%', '20%', '15%']);
      if (output) {
        fs.mkdirSync(output, { recursive:true });
        await page.locator('#tool-budget').screenshot({ path:path.join(output, 'budget-' + viewport.width + '.png') });
      }
      await slider('accom', 1000); await check('C partial', [1000, 1000, 800, 600], 3400, 600, 4000);
      for (const [id, values] of [
        ['accom', [1599, 1000, 800, 600]], ['flights', [1600, 999, 800, 600]],
        ['food', [1600, 1000, 799, 600]], ['activities', [1600, 1000, 800, 599]]
      ]) {
        await total(4000); await left(id); await check('native ' + id + ' slider', values, 3999, 1, 4000);
      }
      await total(4000); await left('flights'); await check('D flights', [1600, 999, 800, 600], 3999, 1, 4000);
      await left('accom'); await check('D then accommodation', [1599, 999, 800, 600], 3998, 2, 4000);
      await total(5000); await check('E total 5000', [2000, 1250, 1000, 750], 5000, 0, 5000);
      await clearWrites(); await page.locator('#budget-input').dispatchEvent('input');
      await check('E repeated 5000', [2000, 1250, 1000, 750], 5000, 0, 5000);
      for (const [input, values, allocated, remaining, displayed] of [
        ['0', [0, 0, 0, 0], 0, 0, 0], ['', [0, 0, 0, 0], 0, 0, 0],
        ['4000.75', [1600, 1000, 800, 600], 4000, 0, 4000],
        ['10', [4, 3, 2, 2], 10, 0, 10], ['1', [0, 0, 0, 0], 0, 1, 1]
      ]) { await total(input); await check('edge ' + JSON.stringify(input), values, allocated, remaining, displayed); }
      await total(4000); await slider('accom', 4000);
      await check('over-allocation capped', [4000, 1000, 800, 600], 4000, 0, 4000);
      assert.deepEqual(await budgetEvents(), expectedEvents, 'No repeated starts or monetary payloads');
      const views = await page.evaluate(() => (window.dataLayer || []).map(x => Array.from(x))
        .filter(x => x[1] === 'tool_view' && x[2]?.tool_name === 'budget_calculator'));
      assert.deepEqual(views, [['event', 'tool_view', { event_category:'tools', tool_name:'budget_calculator' }]]);

      await page.selectOption('#pack-destination', 'city'); await page.selectOption('#pack-season', 'winter');
      await page.click('#generate-packing');
      assert.match(await page.locator('#pack-list').textContent(), /Warm coat/);
      await page.selectOption('#pack-season', 'spring'); await page.click('#generate-packing');
      assert.equal(await page.locator('#pack-list li').count(), 9);
      assert.match(await page.locator('#pack-list').textContent(), /Light jacket/);
      const firstActivity = page.locator('#activities-list li').first();
      const activityName = await firstActivity.getAttribute('data-activity');
      async function drag(source, target) {
        if (viewport.width > 390) return source.dragTo(target);
        // Chromium dragTo emits no drag events on this existing stacked mobile layout.
        const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
        try {
          await source.dispatchEvent('dragstart', { dataTransfer });
          await target.dispatchEvent('dragover', { dataTransfer });
          await target.dispatchEvent('drop', { dataTransfer });
        } finally { await dataTransfer.dispose(); }
      }
      await drag(firstActivity, page.locator('#schedule-area'));
      assert.ok((await page.locator('#schedule-area').textContent()).includes(activityName), 'Itinerary drop reaches actual shared main.js handler');
      await page.fill('#custom-activity-input', 'Allocator QA walk'); await page.click('#add-custom-activity');
      const custom = page.locator('#activities-list li').filter({ hasText:'Allocator QA walk' });
      assert.equal(await custom.count(), 1); assert.equal(await custom.getAttribute('draggable'), 'true');
      await drag(custom, page.locator('.day-drop').first());
      assert.match(await page.locator('.day-drop').first().textContent(), /Allocator QA walk/);
      await page.selectOption('#req-destination', 'JP'); await page.click('#get-requirements');
      await page.waitForFunction(() => !document.getElementById('requirements-output').hasAttribute('aria-busy'));
      assert.match(await page.locator('#requirements-output h3').textContent(), /Japan/);
      await page.click('#pet-calc-btn'); assert.ok(await page.locator('#pet-result').isVisible());
      assert.match(await page.locator('#pet-total-display').textContent(), /\$/);
      shared.push({ viewport, packing:'city winter/spring', dragMode:viewport.width > 390 ? 'native dragTo' : 'HTML5 DataTransfer dispatch', itinerary:'Day 1 drop', custom:'Day 2 drop', requirements:'Japan', pet:'visible result', pass:true });
      for (const file of ['index.html', 'book-now.html', 'blog-caribbean-family.html', 'blog-elmo.html']) {
        await page.goto(base + '/' + file, { waitUntil:'networkidle' });
        assert.ok(await page.locator('h1').first().isVisible());
        assert.equal(await page.locator('#budget-input').count(), 0);
        assert.ok(await page.locator('script[src^="main.js"]').count());
        consumers.push({ viewport, file, pass:true });
      }
      await context.close();
    }
    assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []); assert.deepEqual(missing, []); assert.deepEqual(attempts, []);
    console.log(JSON.stringify({ states:results.length, results, shared, consumers, errors, consoleErrors, missing, attempts }, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
