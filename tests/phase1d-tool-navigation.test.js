'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'destination-comparison.html'), 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map(m => m[1]).find(s => s.includes('var COMP_META'));
assert.ok(script, 'Actual comparison application must be available');

function boot(search = '', options = {}) {
  const events = [], alerts = [], nodes = new Map(), ready = [];
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', innerHTML: '', style: {}, options: [], handlers: {},
      add(option) { this.options.push(option); },
      addEventListener(name, fn) { this.handlers[name] = fn; },
      scrollIntoView() {}
    });
    return nodes.get(id);
  }
  const pairs = [...html.matchAll(/class="pair-btn" data-a="([^"]+)" data-b="([^"]+)"/g)]
    .map(m => ({ a:m[1], b:m[2], handlers:{}, getAttribute(name) { return name === 'data-a' ? this.a : this.b; },
      addEventListener(name, fn) { this.handlers[name] = fn; } }));
  const sandbox = { URLSearchParams, console:{log(){},warn(){},error(){}},
    Option:function(text, value) { this.text = text; this.value = value; },
    alert:message => alerts.push(message),
    document:{ getElementById:node, querySelectorAll:() => pairs,
      addEventListener:(name, fn) => { if (name === 'DOMContentLoaded') ready.push(fn); } }
  };
  sandbox.window = sandbox;
  sandbox.location = { search };
  if (!options.noAnalytics) sandbox.dvTrack = (name, payload) => events.push({ name, ...payload });
  vm.createContext(sandbox);
  if (!options.fallback) vm.runInContext(fs.readFileSync(path.join(root, 'js/dv-destinations.js'), 'utf8'), sandbox);
  vm.runInContext(script, sandbox);
  ready.forEach(fn => fn());
  return { node, events, alerts, pairs };
}
function expectPair(app, a, b, nameA, nameB) {
  assert.equal(app.node('dest-a').value, a);
  assert.equal(app.node('dest-b').value, b);
  assert.ok(app.node('head-a').innerHTML.includes(nameA));
  assert.ok(app.node('head-b').innerHTML.includes(nameB));
  assert.equal(app.node('comp-result').style.display, 'block');
}

const cases = [
  ['default', '', 'jamaica', 'bali', 'Jamaica', 'Bali'],
  ['Japan/Thailand', '?a=japan&b=thailand', 'japan', 'thailand', 'Japan', 'Thailand'],
  ['another supported pair', '?a=paris&b=rome', 'paris', 'rome', 'Paris', 'Rome'],
  ['hyphenated slugs', '?a=iceland&b=new-zealand', 'iceland', 'new-zealand', 'Iceland', 'New Zealand'],
  ['encoded valid slugs', '?a=%6Aapan&b=thai%6Cand', 'japan', 'thailand', 'Japan', 'Thailand'],
  ['unrelated parameter', '?utm_source=guide&a=japan&b=thailand', 'japan', 'thailand', 'Japan', 'Thailand'],
  ...[
    ['unknown A','?a=unknown&b=thailand'], ['unknown B','?a=japan&b=unknown'],
    ['missing B','?a=japan'], ['missing A','?b=thailand'],
    ['empty A','?a=&b=thailand'], ['empty B','?a=japan&b='],
    ['identical','?a=japan&b=japan'],
    ['repeated A','?a=japan&a=thailand&b=thailand'],
    ['repeated B','?a=japan&b=thailand&b=bali'],
    ['repeated equal values','?a=japan&a=japan&b=thailand'],
    ['prototype key','?a=__proto__&b=thailand'], ['inherited key','?a=constructor&b=thailand'],
    ['registry-only destination','?a=south-korea&b=thailand'],
    ['case mismatch','?a=Japan&b=thailand'], ['whitespace','?a=%20japan&b=thailand'],
    ['malformed encoding','?a=%E0%A4%A&b=thailand'],
    ['encoded markup','?a=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&b=thailand'],
    ['path input','?a=..%2Ftools.html&b=thailand']
  ].map(([label, search]) => [label, search, 'jamaica', 'bali', 'Jamaica', 'Bali'])
];
for (const [label, search, a, b, nameA, nameB] of cases) {
  test('initialization: ' + label, () => {
    const app = boot(search);
    expectPair(app, a, b, nameA, nameB);
    assert.equal(app.events.length, 1, 'Same single initial render event as the existing default');
    assert.deepEqual(app.events[0], { name:'comparison_generated', tool_name:'destination_comparison', dest_a:nameA, dest_b:nameB });
    assert.ok(!app.node('comp-rows').innerHTML.includes('onerror'));
    assert.ok(!app.node('head-a').innerHTML.includes('alert(1)'));
  });
}
test('display uses existing comparison data, not a new query-specific data model', () => {
  const app = boot('?a=japan&b=thailand');
  assert.match(app.node('head-a').innerHTML, /145\/day/);
  assert.match(app.node('head-b').innerHTML, /65\/day/);
  assert.equal(app.node('dest-a').options.length, 20);
});
test('query selection works generically for every destination offered by the current tool', () => {
  const options = boot().node('dest-a').options;
  for (const option of options) {
    const other = option.value === 'jamaica' ? 'bali' : 'jamaica';
    const app = boot('?a=' + encodeURIComponent(option.value) + '&b=' + other);
    assert.equal(app.node('dest-a').value, option.value);
    assert.equal(app.node('dest-b').value, other);
    assert.ok(option.text.includes(app.events[0].dest_a));
  }
});
test('existing fallback data still supports valid queries if registry script is unavailable', () => {
  expectPair(boot('?a=japan&b=thailand', {fallback:true}), 'japan', 'thailand', 'Japan', 'Thailand');
});
test('manual compare remains usable after a query, including the existing identical-selection alert', () => {
  const app = boot('?a=japan&b=thailand');
  app.node('dest-a').value = 'paris'; app.node('dest-b').value = 'rome';
  app.node('compare-btn').handlers.click();
  expectPair(app, 'paris', 'rome', 'Paris', 'Rome');
  assert.equal(app.events.length, 2);
  app.node('dest-b').value = 'paris'; app.node('compare-btn').handlers.click();
  assert.deepEqual(app.alerts, ['Please select two different destinations.']);
  assert.equal(app.events.length, 2);
});
test('every existing quick pair still updates both controls and renders once', () => {
  const app = boot('?a=japan&b=thailand');
  assert.equal(app.pairs.length, 8);
  app.pairs.forEach((pair, i) => {
    pair.handlers.click();
    assert.equal(app.node('dest-a').value, pair.a);
    assert.equal(app.node('dest-b').value, pair.b);
    assert.equal(app.events.length, i + 2);
    assert.ok(app.node('head-a').innerHTML.includes(app.events.at(-1).dest_a));
    assert.ok(app.node('head-b').innerHTML.includes(app.events.at(-1).dest_b));
  });
});
test('optional analytics absence does not block initialization', () => {
  expectPair(boot('?a=japan&b=thailand', {noAnalytics:true}), 'japan', 'thailand', 'Japan', 'Thailand');
});
