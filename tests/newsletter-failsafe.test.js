'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
for (const file of pages) test(`${file}: static newsletter notice has no submission capability`, () => {
  const html = read(file);
  assert.match(html, /data-dv-newsletter-paused/);
  assert.match(html, /Newsletter updates are currently unavailable\./);
  assert.doesNotMatch(html, /data-dv-signup|name=["'](?:EMAIL|dv_hp|subscribe)["']|Subscribe to download|<form\b[^>]*dfg-form/);
  assert.doesNotMatch(html, /<form\b[^>]*(?:list-manage|email-capture)/i);
  const footer = html.match(/<div class="dfg-newsletter-col" data-dv-newsletter-paused>[\s\S]*?<\/p>\s*<\/div>/);
  assert.ok(footer, 'Static footer column exists');
  assert.doesNotMatch(footer[0], /<(?:form|input|button|select|textarea)\b|\b(?:action|method|formaction|onsubmit)=/i);
});
test('homepage preserves referral anchor but removes the hero form and controls', () => {
  const hero = read('index.html').match(/<section id="email-signup-form"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(hero, /<(?:form|input|button|textarea|select)\b/i);
  assert.match(hero, /Newsletter updates are currently unavailable/);
  assert.doesNotMatch(read('index.html'), /dv-hero-subscribe|dv-email-input/);
});
test('only transactional planner email input remains; contact mail links preserved', () => {
  const emailPages = pages.filter(file => /<input\b[^>]*type=["']email["']/i.test(read(file)));
  assert.deepEqual(emailPages, ['trip-planner.html']);
  assert.match(read('trip-planner.html'), /<input type="email" id="email"/);
  assert.match(read('privacy.html'), /mailto:hello@dreamvacati\.com/);
});
test('legacy pause handler safely does nothing when all signup forms are absent', () => {
  const calls = [];
  const document = { readyState: 'complete', querySelectorAll: selector => {
    assert.equal(selector, '[data-dv-signup]'); return [];
  } };
  new vm.Script(read('js/email-capture.js')).runInNewContext({ document,
    fetch: () => calls.push('fetch'), XMLHttpRequest: () => calls.push('xhr'),
    navigator: { sendBeacon: () => calls.push('beacon') }, gtag: () => calls.push('gtag'), dvTrack: () => calls.push('track') });
  assert.deepEqual(calls, []);
});
test('legacy guard still prevents a dynamically introduced form without sending data', () => {
  let submit;
  const form = { addEventListener: (name, fn) => { assert.equal(name, 'submit'); submit = fn; }, closest: () => null, innerHTML: '' };
  const document = { readyState: 'loading', querySelectorAll: () => [form], addEventListener: (name, fn) => {
    assert.equal(name, 'DOMContentLoaded'); fn();
  } };
  new vm.Script(read('js/email-capture.js')).runInNewContext({ document });
  let prevented = false; submit({ preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.match(form.innerHTML, /Newsletter updates are currently unavailable/);
});
test('newsletter script contains no network or analytics calls', () => {
  const source = read('js/email-capture.js');
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|sendBeacon|gtag|fbq|dvTrack)\s*\(/);
  assert.doesNotMatch(source, /submit produces a page refresh only/);
});
