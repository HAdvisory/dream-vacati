'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools.html'), 'utf8');
const shared = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const inline = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map(m => m[1]).find(s => s.includes('function updateBudgetVisual()'));
assert.ok(inline, 'Actual page calculator script exists');
const end = inline.indexOf('\n    updateBudgetVisual();');
assert.ok(end > 0, 'Calculator initialization boundary exists');
// Keep the actual calculator callback, excluding unrelated itinerary/pet sections.
const calculator = inline.slice(0, end + '\n    updateBudgetVisual();'.length) + '\n});';
const ids = ['budget-input', 'budget-total', 'remaining-budget', 'allocated-display', 'budget-dest-tip',
  ...['accom', 'flights', 'food', 'activities'].flatMap(id => ['budget-' + id, 'val-' + id, 'bar-' + id])];

function boot({ legacy = false, noHooks = false, noAnalytics = false, page = true, reverse = false } = {}) {
  const nodes = new Map(), ready = [], events = [], writes = [];
  for (const id of ids) {
    if (noHooks || legacy && /flights/.test(id)) continue;
    const input = html.match(new RegExp('<input\\b[^>]*id="' + id + '"[^>]*>'))?.[0];
    let value = input?.match(/\bvalue="([^"]*)"/)?.[1] || '';
    let max = input?.match(/\bmax="([^"]*)"/)?.[1] || '';
    let text = 'untouched';
    const range = input?.includes('type="range"');
    nodes.set(id, { id, style: {}, handlers: [],
      get max() { return max; }, set max(v) { max = String(v); },
      get value() { return value; }, set value(v) {
        value = range ? String(Math.max(0, Math.min(Number(max), Math.round(Number(v))))) : String(v);
      },
      get textContent() { return text; }, set textContent(v) { text = String(v); writes.push({ id, value: text }); },
      addEventListener(type, fn, options) { this.handlers.push({ type, fn, once: !!options?.once }); }
    });
  }
  const document = { getElementById: id => nodes.get(id) || null, querySelectorAll: () => [],
    addEventListener(type, fn) { if (type === 'DOMContentLoaded') ready.push(fn); } };
  const context = { document, console };
  context.window = context;
  if (!noAnalytics) context.gtag = (...args) => events.push(JSON.parse(JSON.stringify(args)));
  vm.createContext(context);
  const pageScript = page && !legacy && !noHooks;
  if (reverse) vm.runInContext(shared, context);
  if (pageScript) vm.runInContext(calculator, context);
  if (!reverse) vm.runInContext(shared, context);
  ready.forEach(fn => fn());
  function input(id, value) {
    const node = nodes.get(id);
    if (value !== undefined) node.value = value;
    for (const h of [...node.handlers]) if (h.type === 'input') {
      if (h.once) node.handlers.splice(node.handlers.indexOf(h), 1);
      h.fn.call(node, { target: node });
    }
  }
  return { nodes, events, writes, input, node: id => nodes.get(id),
    text: id => nodes.get(id)?.textContent,
    number: id => Number(nodes.get(id)?.textContent.replace(/[$,]/g, '')),
    count: id => writes.filter(w => w.id === id).length };
}
function expect(app, values, allocated, remaining, total) {
  ['accom', 'flights', 'food', 'activities'].forEach((id, i) => {
    assert.equal(Number(app.node('budget-' + id).value), values[i]);
    assert.equal(app.number('val-' + id), values[i]);
    assert.equal(app.text('val-' + id), values[i].toLocaleString());
  });
  assert.equal(app.number('allocated-display'), allocated);
  assert.equal(app.number('remaining-budget'), remaining);
  if (total !== undefined) assert.equal(app.number('budget-total'), total);
}
const firstEvents = [
  ['event', 'tool_used', { event_category: 'tools', event_label: 'budget_calculator' }],
  ['event', 'tool_start', { event_category: 'tools', event_label: 'budget_calculator' }]
];

test('four-category controls suppress shared calculation registration and initialization', () => {
  const app = boot({ page: false });
  assert.equal(app.writes.length, 0);
  assert.equal(app.node('budget-input').handlers.length, 1, 'Only independent analytics');
  for (const id of ['accom', 'flights', 'food', 'activities']) assert.equal(app.node('budget-' + id).handlers.length, 0);
  app.input('budget-input', '4000');
  assert.equal(app.writes.length, 0);
  assert.deepEqual(app.events, firstEvents);
});
test('initial 3000 defaults have exactly one calculation owner and no overwrite', () => {
  const app = boot();
  expect(app, [1200, 750, 600, 450], 3000, 0, 3000);
  assert.equal(app.count('remaining-budget'), 1);
  assert.equal(app.count('budget-total'), 1);
  assert.deepEqual(app.events, []);
});
test('4000 total updates once with all four categories', () => {
  const app = boot(); app.writes.length = 0; app.input('budget-input', '4000');
  expect(app, [1600, 1000, 800, 600], 4000, 0, 4000);
  assert.equal(app.count('remaining-budget'), 1);
  assert.equal(app.count('budget-total'), 1);
});
for (const [id, value, values, allocated, remaining] of [
  ['accom', 1000, [1000, 1000, 800, 600], 3400, 600],
  ['flights', 999, [1600, 999, 800, 600], 3999, 1],
  ['food', 700, [1600, 1000, 700, 600], 3900, 100],
  ['activities', 500, [1600, 1000, 800, 500], 3900, 100]
]) test(id + ' slider has one renderer and a correct four-category balance', () => {
  const app = boot(); app.input('budget-input', '4000'); app.writes.length = 0;
  assert.equal(app.node('budget-' + id).handlers.length, 1);
  app.input('budget-' + id, value); expect(app, values, allocated, remaining, 4000);
  assert.equal(app.count('remaining-budget'), 1);
});
test('flights followed by accommodation retains correct remaining 2', () => {
  const app = boot(); app.input('budget-input', '4000');
  app.input('budget-flights', 999); app.input('budget-accom', 1599);
  expect(app, [1599, 999, 800, 600], 3998, 2);
});
test('repeated totals reset defaults without listener growth', () => {
  const app = boot();
  for (let i = 0; i < 4; i++) {
    app.input('budget-input', '4000'); app.input('budget-accom', 1000); app.writes.length = 0;
    app.input('budget-input', '5000'); expect(app, [2000, 1250, 1000, 750], 5000, 0, 5000);
    assert.equal(app.count('remaining-budget'), 1);
  }
  assert.equal(app.node('budget-input').handlers.length, 1, 'Once analytics removed; page writer remains');
  assert.deepEqual(app.events, firstEvents);
});
for (const total of ['0', '']) test('existing zero/blank fallback: ' + JSON.stringify(total), () => {
  const app = boot(); app.input('budget-input', total); expect(app, [0, 0, 0, 0], 0, 0, 0);
});
test('decimal budget preserves whole-dollar truncation', () => {
  const app = boot(); app.input('budget-input', '4000.75'); expect(app, [1600, 1000, 800, 600], 4000, 0, 4000);
});
test('10 retains independently rounded sum 11 and existing cap/clamp', () => {
  const app = boot(); app.input('budget-input', '10'); expect(app, [4, 3, 2, 2], 10, 0, 10);
});
test('1 retains rounding remainder instead of redistributing', () => {
  const app = boot(); app.input('budget-input', '1'); expect(app, [0, 0, 0, 0], 0, 1, 1);
});
test('manual over-allocation retains capped allocated and nonnegative remaining', () => {
  const app = boot(); app.input('budget-input', '4000'); app.input('budget-accom', '4000');
  expect(app, [4000, 1000, 800, 600], 4000, 0, 4000);
  assert.equal(app.node('bar-accom').style.width, '100%');
});
test('total changes preserve slider maxima and fixed markup labels', () => {
  const app = boot(); app.input('budget-input', '5000');
  for (const id of ['accom', 'flights', 'food', 'activities']) assert.equal(app.node('budget-' + id).max, '5000');
  for (const label of ['Accommodation (40%)', 'Flights (25%)', 'Food &amp; Dining (20%)', 'Activities (15%)']) assert.ok(html.includes(label));
});
test('bars retain actual existing percentages after partial allocation', () => {
  const app = boot(); app.input('budget-input', '4000'); app.input('budget-accom', 1000);
  assert.deepEqual(['accom', 'flights', 'food', 'activities'].map(id => app.node('bar-' + id).style.width), ['25%', '25%', '20%', '15%']);
});
test('three-category legacy fallback initializes and handles total/slider inputs', () => {
  const app = boot({ legacy: true });
  assert.equal(app.number('remaining-budget'), 750);
  app.input('budget-input', '4000'); assert.equal(app.number('remaining-budget'), 1750);
  app.input('budget-accom', 1600); assert.equal(app.number('remaining-budget'), 1350);
  app.input('budget-food', 800); app.input('budget-activities', 600);
  assert.equal(app.number('remaining-budget'), 1000);
  app.input('budget-input', '4000'); assert.deepEqual(app.events, firstEvents);
});
test('missing allocator hooks leave shared initialization guarded', () => {
  const app = boot({ noHooks: true }); assert.equal(app.nodes.size, 0); assert.equal(app.writes.length, 0); assert.deepEqual(app.events, []);
});
test('absent gtag does not break four-category calculation', () => {
  const app = boot({ noAnalytics: true }); app.input('budget-input', '4000'); expect(app, [1600, 1000, 800, 600], 4000, 0);
});
test('absent gtag does not break legacy calculation', () => {
  const app = boot({ legacy: true, noAnalytics: true }); app.input('budget-input', '4000'); assert.equal(app.number('remaining-budget'), 1750);
});
test('first total input preserves exact once-only event names/payloads', () => {
  const app = boot(); assert.deepEqual(app.events, []);
  app.input('budget-accom', 1199); assert.deepEqual(app.events, []);
  app.input('budget-input', '4000'); assert.deepEqual(app.events, firstEvents);
  app.input('budget-input', '5000'); app.input('budget-flights', 1000); assert.deepEqual(app.events, firstEvents);
});
test('blank first input still consumes the existing once-only analytics listener', () => {
  const app = boot(); app.input('budget-input', ''); app.input('budget-input', '4000'); assert.deepEqual(app.events, firstEvents);
});
test('four-category owner remains sole writer with reversed callback registration', () => {
  const app = boot({ reverse: true }); app.input('budget-input', '4000'); expect(app, [1600, 1000, 800, 600], 4000, 0);
  assert.equal(app.count('remaining-budget'), 2, 'One initialization plus one input');
});
