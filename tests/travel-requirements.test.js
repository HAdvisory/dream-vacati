'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const api = require(path.join(root, 'js/travel-requirements.js'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const data = JSON.parse(read('data/travel-requirements.json'));
const copy = () => structuredClone(data);
const response = value => ({ ok: true, json: async () => value });
const codes = ['JP', 'GB', 'FR', 'IT', 'GR', 'ES', 'AU', 'NZ', 'AE', 'TH', 'MX', 'CA', 'JM', 'MV'];

test('canonical schema, unique IDs and legacy ID compatibility', () => {
  assert.equal(api.validate(data), data);
  assert.equal(new Set(data.destinations.map(d => d.id)).size, 13);
  for (const id of ['uk', 'schengen', 'japan', 'uae', 'canada', 'mexico', 'jamaica', 'barbados', 'thailand', 'australia', 'new-zealand', 'costa-rica']) {
    assert.ok(data.destinations.some(d => d.id === id));
  }
  assert.deepEqual(Object.keys(data.countryMappings), codes);
});
for (const code of codes) test(`${code} resolves through the adapter and unchanged dropdown`, async () => {
  const result = await api.createClient(async () => response(data)).lookup(code);
  assert.equal(result.record.id, data.countryMappings[code].destinationId);
  assert.match(read('tools.html'), new RegExp(`<option value="${code}">`));
  assert.equal(Object.keys(result.record.claims).length, 4);
});
test('Schengen maps four countries to one rolling allowance; ETIAS not falsely verified', () => {
  for (const code of ['FR', 'IT', 'GR', 'ES']) assert.equal(data.countryMappings[code].destinationId, 'schengen');
  const item = data.destinations.find(d => d.id === 'schengen');
  assert.match(item.claims.visa.text, /rolling 180-day.*combined/);
  assert.equal(item.claims.eta.status, 'UNVERIFIED');
  assert.equal(item.claims.eta.lastReviewed, null);
  assert.notEqual(data.countryMappings.GB.destinationId, 'schengen');
});
test('claim provenance and dates distinguish reviewed from unverified information', () => {
  for (const item of data.destinations) for (const claim of Object.values(item.claims)) {
    assert.ok(['VERIFIED', 'PARTIALLY VERIFIED', 'UNVERIFIED', 'OUTDATED'].includes(claim.status));
    assert.ok(claim.sources.length);
    if (claim.status === 'UNVERIFIED') assert.equal(claim.lastReviewed, null);
    else assert.equal(claim.lastReviewed, '2026-10-25');
    for (const id of claim.sources) {
      assert.ok(api.officialUrl(data.sources[id].url), id);
      assert.equal(data.sources[id].checkedOn, '2026-10-25');
      assert.ok(Object.hasOwn(data.sources[id], 'publicationDate'));
    }
  }
});
test('old false Canada/UAE/Maldives rules replaced or qualified', () => {
  const byId = Object.fromEntries(data.destinations.map(d => [d.id, d]));
  assert.match(byId.canada.claims.visa.text, /six months/);
  assert.match(byId.uae.claims.visa.text, /90 days in a 180-day/);
  assert.match(byId.maldives.claims.passport.text, /sources conflict/);
  assert.equal(byId.maldives.claims.passport.status, 'PARTIALLY VERIFIED');
  assert.equal(Object.keys(byId['costa-rica'].claims).length, 0);
});
test('cached same-origin fetch shares concurrent requests', async () => {
  let count = 0;
  const client = api.createClient(async (url, options) => {
    count++;
    assert.equal(url, 'data/travel-requirements.json');
    assert.equal(options.credentials, 'same-origin');
    return response(data);
  });
  await Promise.all(codes.map(code => client.lookup(code)));
  await client.lookup('JP');
  assert.equal(count, 1);
});
for (const kind of ['network', 'http', 'json', 'schema']) test(`${kind} failure rejects safely and permits retry`, async () => {
  let count = 0;
  const client = api.createClient(async () => {
    if (++count > 1) return response(data);
    if (kind === 'network') throw new Error('Offline');
    if (kind === 'http') return { ok: false };
    if (kind === 'json') return { ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } };
    return response({ destinations: [] });
  });
  await assert.rejects(client.lookup('JP'));
  assert.equal((await client.lookup('JP')).record.id, 'japan');
  assert.equal(count, 2);
});
test('duplicate IDs and malformed records rejected', () => {
  const duplicate = copy(); duplicate.destinations.push(duplicate.destinations[0]);
  assert.throws(() => api.validate(duplicate), /duplicate/);
  const malformed = copy(); malformed.destinations[0].claims = null;
  assert.throws(() => api.validate(malformed));
});
test('unsupported and missing destinations reject without fallback', async () => {
  const client = api.createClient(async () => response(data));
  for (const code of ['US', 'ZZ', '__proto__', '']) await assert.rejects(client.lookup(code), /not available/);
  const missing = copy(); missing.destinations = missing.destinations.filter(d => d.id !== 'japan');
  await assert.rejects(api.createClient(async () => response(missing)).lookup('JP'), /not available/);
});
test('unsupported traveler assumptions reject before fetching', async () => {
  let calls = 0;
  const client = api.createClient(async () => { calls++; return response(data); });
  for (const context of [{ citizenship: 'CA' }, { purpose: 'work' }, { passportType: 'emergency' }]) {
    await assert.rejects(client.lookup('JP', context), /only covers U.S. citizens/);
  }
  assert.equal(calls, 0);
});
test('unsafe and unofficial source links cannot render', () => {
  for (const value of ['javascript:alert(1)', 'http://www.gov.uk/', 'https://gov.uk.evil.example/', 'https://evil.example/', 'https://user:pass@www.gov.uk/']) assert.equal(api.officialUrl(value), null);
});
test('production tool has one external requirements adapter, no inline facts', () => {
  const html = read('tools.html');
  assert.doesNotMatch(html, /REQ_DATA|no time limit restriction|ETIAS not yet operational/);
  assert.equal((html.match(/src="js\/travel-requirements.js"/g) || []).length, 1);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.doesNotMatch(html, /Select your passport country/);
});
