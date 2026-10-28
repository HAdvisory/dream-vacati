'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sourceUrl = 'https://www.jnto.go.jp/news/press/20250115_monthly.html';

function loadData(withRegistry = true) {
  const warnings = [];
  const context = { window: {}, console: { log() {}, error() {}, warn: msg => warnings.push(msg) } };
  vm.createContext(context);
  if (withRegistry) vm.runInContext(read('js/dv-destinations.js'), context);
  vm.runInContext(read('js/tourism-demand-data.js'), context);
  return { context, records: context.window.TOURISM_DEMAND_DATA, warnings };
}

function render(records) {
  const ids = ['tdi-region', 'tdi-level', 'tdi-trend', 'tdi-traveler', 'tdi-sort',
    'tdi-search', 'tdi-reset', 'tdi-count', 'tdi-results', 'tdi-error'];
  const elements = Object.fromEntries(ids.map(id => [id, {
    value: '', innerHTML: '', textContent: '', style: {}, listeners: {},
    addEventListener(event, handler) { this.listeners[event] = handler; }, appendChild() {}
  }]));
  elements['tdi-sort'].value = 'crowd-asc';
  const context = {
    window: { TOURISM_DEMAND_DATA: records },
    document: { readyState: 'complete', getElementById: id => elements[id], createElement: () => ({}) }
  };
  vm.runInNewContext(read('js/tourism-demand-index.js'), context);
  return {
    html: () => elements['tdi-results'].innerHTML,
    count: () => elements['tdi-count'].textContent,
    change(id, value) { elements[id].value = value; elements[id].listeners[id === 'tdi-search' ? 'input' : 'change'](); },
    reset() { elements['tdi-reset'].listeners.click(); }
  };
}

test('Japan uses the sourced 2024 provisional visitor figure, with statistic-specific dates', () => {
  const { records, context } = loadData();
  assert.equal(Object.keys(context.window.DV_DESTINATIONS).length, 50);
  assert.equal(records.length, 30);
  const japan = records.find(d => d.id === 'japan');
  assert.equal(japan.annualArrivals, 36.8699);
  assert.equal(japan.arrivalsSource.url, sourceUrl);
  assert.equal(japan.arrivalsSource.referenceYear, 2024);
  assert.equal(japan.arrivalsSource.publishedAt, '2025-01-15');
  assert.equal(japan.arrivalsSource.verifiedOn, '2026-10-25');
  assert.equal(japan.arrivalsSource.metric, 'international visitor arrivals');
  assert.equal(japan.arrivalsSource.geographicScope, 'Japan (national)');
  assert.equal(japan.arrivalsSource.status, 'provisional');
  assert.match(japan.trendNote, /47\.1%/);
  assert.doesNotMatch(japan.notes + japan.trendNote, /31\.9/);
  assert.equal(context.window.getDVDestinationByISO('JP').annualArrivals, '36.8699M');
  assert.equal(context.window.validateDVDestinations().ok, true);
});

test('registry and no-registry fallback keep all 30 records, scores and source details consistent', () => {
  const generated = loadData();
  const fallback = loadData(false);
  assert.equal(generated.warnings.length, 0);
  assert.equal(fallback.warnings.length, 1);
  assert.equal(fallback.records.length, 30);
  for (const current of generated.records) {
    const backup = fallback.records.find(d => d.id === current.id);
    assert.ok(backup, current.id);
    for (const field of ['annualArrivals', 'crowdScore', 'budgetPressure', 'trend', 'trendNote', 'notes']) {
      assert.equal(current[field], backup[field], `${current.id}: ${field}`);
    }
    assert.equal(JSON.stringify(current.arrivalsSource || null), JSON.stringify(backup.arrivalsSource || null));
    assert.ok(current.bestMonths.every(m => m >= 1 && m <= 12));
    assert.ok(Number.isFinite(current.annualArrivals));
  }
});

test('cards render source/year/verification only for the checked figure and label 29 unverified estimates', () => {
  for (const mode of [true, false]) {
    const ui = render(loadData(mode).records);
    assert.equal(ui.count(), '30 destinations');
    assert.equal((ui.html().match(/class="tdi-card"/g) || []).length, 30);
    assert.equal((ui.html().match(/Unverified visitor estimate:/g) || []).length, 29);
    assert.equal((ui.html().match(/arrival figure checked/g) || []).length, 1);
    assert.match(ui.html(), /36\.9M international visitor arrivals \(2024\)/);
    assert.ok(ui.html().includes(sourceUrl));
    assert.match(ui.html(), /Published 2025-01-15; arrival figure checked 2026-10-25/);
    assert.doesNotMatch(ui.html(), /NaN|undefined|visitors\/yr/);
  }
});

test('region, search, sorting, no-result and reset interactions still work', () => {
  const { records } = loadData();
  const ui = render(records);
  ui.change('tdi-region', 'Caribbean');
  assert.equal(ui.count(), `${records.filter(d => d.region === 'Caribbean').length} destinations`);
  ui.reset();
  ui.change('tdi-sort', 'arrivals-desc');
  const sorted = [...records].sort((a, b) => b.annualArrivals - a.annualArrivals);
  assert.ok(ui.html().indexOf(`>${sorted[0].name}</h3>`) < ui.html().indexOf(`>${sorted[1].name}</h3>`));
  ui.change('tdi-search', 'Japan');
  assert.equal(ui.count(), '1 destination');
  assert.match(ui.html(), /36\.9M international visitor arrivals/);
  ui.change('tdi-search', 'no-matching-destination-123');
  assert.equal(ui.count(), '0 destinations');
  assert.match(ui.html(), /No destinations match/);
  ui.reset();
  assert.equal(ui.count(), '30 destinations');
});

test('missing and non-finite figures do not become false zeroes or break rendering', () => {
  for (const value of [null, NaN, undefined, -1]) {
    const { records } = loadData();
    records[0].annualArrivals = value;
    const ui = render(records);
    ui.change('tdi-search', 'Japan');
    assert.match(ui.html(), /Visitor estimate unavailable/);
    assert.doesNotMatch(ui.html(), /0K|NaN|undefined|arrival figure checked/);
  }
});

test('Jamaica resort and airport corrections cover related pages and schema', () => {
  const guide = read('jamaica-travel-guide.html');
  assert.doesNotMatch(guide, /Royal Barbados/);
  for (const name of ['jamaica-travel-guide.html', 'montego-bay-jamaica.html',
    'montego-bay-vs-negril.html', 'blog-compare-caribbean-islands.html']) {
    const html = read(name);
    for (const table of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/g)) {
      assert.doesNotMatch(table[0], /Moon Palace/, name);
    }
    assert.match(html, /Moon Palace Jamaica[^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*Ocho Rios|Moon Palace Jamaica<\/strong>[^<]*<a[^>]*>Ocho Rios/, name);
  }
  for (const name of ['negril-jamaica.html', 'montego-bay-vs-negril.html', 'jamaica-travel-guide.html']) {
    assert.doesNotMatch(read(name), /[Nn]o (?:direct |commercial )?airport (?:in|itself)|no commercial airport/);
    assert.match(read(name), /domestic aerodrome/);
  }
  for (const name of ['montego-bay-jamaica.html', 'montego-bay-vs-negril.html']) {
    assert.match(read(name), /Secrets Wild Orchid is adults-only/);
    assert.doesNotMatch(read(name), /all have strong (?:family programs|kids' programs)/);
  }
});

test('visible TDI FAQs and structured answers agree on estimates, measurement and review limits', () => {
  const html = read('tourism-demand-index.html');
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => JSON.parse(m[1]));
  const faq = schemas.find(s => s['@type'] === 'FAQPage');
  for (const index of [0, 1, 2, 4]) assert.ok(html.includes(faq.mainEntity[index].acceptedAnswer.text));
  assert.doesNotMatch(html, /reflects actual in-person density|reviewed quarterly|pre-pandemic baseline adjusted/);
});

test('Greece FAQ navigation has one static target on the existing FAQ section', () => {
  const html = read('best-time-greece.html');
  assert.match(html, /<a\b[^>]*href="#faq"[^>]*>FAQs<\/a>/);
  assert.equal((html.match(/\bid\s*=\s*["']faq["']/g) || []).length, 1);
  assert.match(html, /<section\b[^>]*class="faq-section"[^>]*id="faq"[^>]*>\s*<h2>Frequently Asked Questions<\/h2>/);
  assert.ok(html.includes('<link rel="canonical" href="https://dreamvacati.com/best-time-greece.html">'));
  assert.ok(html.includes('<meta name="robots" content="index, follow">'));
});

test('JSON, JSON-LD and JS syntax, local links and the 48 sitemap canonicals remain valid', () => {
  for (const dir of ['', 'js']) {
    for (const file of fs.readdirSync(path.join(root, dir)).filter(f => f.endsWith('.js'))) {
      new vm.Script(read(path.join(dir, file)));
    }
  }
  for (const file of fs.readdirSync(path.join(root, 'data')).filter(f => f.endsWith('.json'))) {
    JSON.parse(read(`data/${file}`));
  }
  const sitemap = read('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.equal(urls.length, 48);
  for (const url of urls) {
    const file = new URL(url).pathname === '/' ? 'index.html' : new URL(url).pathname.slice(1);
    const html = read(file);
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), file);
    assert.doesNotMatch(html, /<meta name="robots" content="noindex/);
  }
  for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
    const html = read(file);
    for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (!/\bsrc\s*=|application\/ld\+json/.test(match[1]) && match[2].trim()) new vm.Script(match[2]);
    }
    const initialHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    for (const match of initialHtml.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
      const value = match[1];
      if (/^(?:https?:|\/\/|data:|mailto:|tel:|#)/.test(value) || /\$\{|\{/.test(value)) continue;
      const local = value.split(/[?#]/)[0].replace(/^\//, '');
      if (local) assert.ok(fs.existsSync(path.join(root, local)), `${file}: ${value}`);
    }
  }
});
