'use strict';
// Uses the existing Playwright installation. Local GET-only QA; external integrations blocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const baseline = process.env.DV_COMPARISON_BASELINE_FILE;
const output = process.env.DV_SCREENSHOT_DIR;
const filename = 'destination-comparison.html';
const server = http.createServer((req, res) => {
  if (req.method !== 'GET') return res.writeHead(405).end();
  let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const old = name.startsWith('/__baseline__/');
  if (old) name = name.slice('/__baseline__'.length);
  let file = path.resolve(root, '.' + name);
  if (!file.startsWith(path.resolve(root) + path.sep)) return res.writeHead(403).end();
  if (old && name === '/' + filename && baseline) file = baseline;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  const mime = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp' };
  res.setHeader('Content-Type', (mime[path.extname(file)] || 'text/plain') + '; charset=utf-8');
  res.end(fs.readFileSync(file));
});
const scenarios = [
  ['A default', '', 'jamaica','bali','Jamaica','Bali'],
  ['B Japan/Thailand', '?a=japan&b=thailand','japan','thailand','Japan','Thailand'],
  ['C another pair', '?a=paris&b=rome','paris','rome','Paris','Rome'],
  ['C hyphenated', '?a=iceland&b=new-zealand','iceland','new-zealand','Iceland','New Zealand'],
  ['J valid encoding', '?a=%6Aapan&b=thai%6Cand','japan','thailand','Japan','Thailand'],
  ...[
    ['D invalid','?a=unknown&b=thailand'],
    ['E identical','?a=japan&b=japan'],
    ['F missing B','?a=japan'],['F missing A','?b=thailand'],
    ['F empty A','?a=&b=thailand'],['F empty B','?a=japan&b='],
    ['G repeated A','?a=japan&a=thailand&b=thailand'],
    ['G repeated B','?a=japan&b=thailand&b=bali'],
    ['G repeated equal','?a=japan&a=japan&b=thailand'],
    ['J prototype','?a=__proto__&b=thailand'],
    ['J malformed encoding','?a=%E0%A4%A&b=thailand'],
    ['J markup','?a='+encodeURIComponent('<svg onload="window.__dvInjected=true">')+'&b=thailand']
  ].map(([label, query]) => [label,query,'jamaica','bali','Jamaica','Bali'])
];

(async () => {
  let browser;
  const errors = [], missing = [], attempts = [], results = [], layouts = [];
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ headless:true });
    for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(() => {
        localStorage.setItem('dv_cookies_ok','declined');
        window.__dvEvents = []; window.__dvInjected = false;
      });
      await context.route('**/*', route => {
        const req = route.request(), url = new URL(req.url());
        if (req.method() !== 'GET' || /list-manage|\/api\/email-capture/.test(url.href)) {
          attempts.push(req.method() + ' ' + url.pathname); return route.abort();
        }
        // Capture call sites without sending any event to a measurement service.
        if (url.origin === base && url.pathname.endsWith('/js/dv-analytics.js')) {
          return route.fulfill({contentType:'application/javascript',body:'window.dvTrack=function(name,payload){window.__dvEvents.push({name:name,payload:payload});};'});
        }
        if (url.origin === base || ['cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)) return route.continue();
        return route.abort();
      });
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) missing.push(r.url()); });
      let baselineWidth = null;
      if (baseline) {
        await page.goto(base + '/__baseline__/' + filename,{waitUntil:'networkidle'});
        assert.equal(await page.locator('#dest-a').inputValue(),'jamaica');
        assert.equal(await page.locator('#dest-b').inputValue(),'bali');
        assert.equal(await page.evaluate(() => __dvEvents.length),1);
        baselineWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      }
      async function pair(a,b,nameA,nameB) {
        assert.equal(await page.locator('#dest-a').inputValue(),a);
        assert.equal(await page.locator('#dest-b').inputValue(),b);
        assert.equal((await page.locator('#head-a .dest-name').textContent()).trim().endsWith(nameA),true);
        assert.equal((await page.locator('#head-b .dest-name').textContent()).trim().endsWith(nameB),true);
        assert.equal(await page.locator('#head-a .dest-name').isVisible(),true);
        assert.equal(await page.locator('#head-b .dest-name').isVisible(),true);
        assert.equal(await page.locator('#comp-result').isVisible(),true);
        const panel = await page.locator('#comp-result').evaluate(el => ({
          display:getComputedStyle(el).display,
          width:el.getBoundingClientRect().width,
          height:el.getBoundingClientRect().height
        }));
        assert.notEqual(panel.display,'none');
        assert.ok(panel.width > 0 && panel.height > 0,'Rendered panel has nonzero dimensions');
        assert.deepEqual(await page.evaluate(() => __dvEvents.at(-1)), {
          name:'comparison_generated', payload:{tool_name:'destination_comparison',dest_a:nameA,dest_b:nameB}
        });
        assert.equal(await page.evaluate(() => __dvInjected),false);
        assert.equal(await page.locator('[data-dv-signup],[name="EMAIL"],[name="dv_hp"]').count(),0);
        return {controls:[a,b],headings:[nameA,nameB],...panel};
      }
      for (const [label,query,a,b,nameA,nameB] of scenarios) {
        await page.goto(base + '/' + filename + query,{waitUntil:'networkidle'});
        const panel = await pair(a,b,nameA,nameB);
        assert.deepEqual(await page.evaluate(() => __dvEvents),[{name:'comparison_generated',payload:{tool_name:'destination_comparison',dest_a:nameA,dest_b:nameB}}]);
        if (label === 'B Japan/Thailand') {
          assert.match(await page.locator('#head-a .dest-cost').textContent(),/145/);
          assert.match(await page.locator('#head-b .dest-cost').textContent(),/65/);
          assert.doesNotMatch(await page.locator('#comp-result').innerText(),/Jamaica|Bali/);
          const geometry = await page.evaluate(() => ({width:document.documentElement.scrollWidth,
            clippedCells:[...document.querySelectorAll('.comp-cell')].filter(e=>e.scrollWidth>e.clientWidth+1).length}));
          assert.equal(geometry.clippedCells,0);
          assert.ok(geometry.width <= Math.max(viewport.width,baselineWidth || viewport.width)+1,'No unexplained overflow');
          layouts.push({viewport,baselineWidth,...geometry});
          if (output) {
            fs.mkdirSync(output,{recursive:true});
            await page.screenshot({path:path.join(output,'comparison-'+viewport.width+'-top.png')});
            await page.locator('#comp-result').scrollIntoViewIfNeeded();
            await page.screenshot({path:path.join(output,'comparison-'+viewport.width+'-result.png')});
          }
        }
        results.push({scenario:label,viewport,...panel,pass:true});
      }
      await page.goto(base+'/'+filename+'?a=japan&b=thailand',{waitUntil:'networkidle'});
      await page.locator('#dest-a').selectOption('paris'); await page.locator('#compare-btn').click();
      const manualA = await pair('paris','thailand','Paris','Thailand');
      await page.locator('#dest-b').selectOption('rome'); await page.locator('#compare-btn').click();
      const manualB = await pair('paris','rome','Paris','Rome');
      assert.equal(await page.evaluate(() => __dvEvents.length),3);
      results.push({scenario:'H manual change of each selector',viewport,steps:[manualA,manualB],events:3,pass:true});
      const buttons = page.locator('.pair-btn');
      assert.equal(await buttons.count(),8);
      for (let i=0;i<8;i++) {
        const btn = buttons.nth(i), a=await btn.getAttribute('data-a'), b=await btn.getAttribute('data-b');
        await btn.click();
        assert.equal(await page.locator('#dest-a').inputValue(),a);
        assert.equal(await page.locator('#dest-b').inputValue(),b);
        const names=await page.evaluate(()=>__dvEvents.at(-1).payload);
        const panel = await pair(a,b,names.dest_a,names.dest_b);
        assert.equal(await page.evaluate(() => __dvEvents.length),4+i);
        results.push({scenario:'I quick pair '+(i+1),viewport,...panel,events:4+i,pass:true});
      }
      results.push({scenario:'I all eight quick pairs',viewport,pass:true});
      await context.close();
    }
    assert.deepEqual(errors,[]); assert.deepEqual(missing,[]); assert.deepEqual(attempts,[]);
    console.log(JSON.stringify({scenarios:results.length,results,layouts,errors,missing,attempts,baselineCompared:!!baseline},null,2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode=1; });
