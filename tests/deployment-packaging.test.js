'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = process.env.DV_TEST_ROOT || path.join(__dirname, '..');
const { validatePaths, publicCandidates, packagePublic } = require(path.join(root, 'scripts/package-public.js'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'deployment/public-files.json'), 'utf8'));
const essential = ['index.html', 'tools.html', 'js/travel-requirements.js', 'data/travel-requirements.json', 'sitemap.xml', 'robots.txt'];
function fixture() {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'dv-package-test-'));
  const source = path.join(parent, 'source'); fs.mkdirSync(source);
  for (const file of essential) {
    const target = path.join(source, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, file);
  }
  fs.mkdirSync(path.join(source, 'deployment'));
  const writeManifest = files => fs.writeFileSync(path.join(source, 'deployment/public-files.json'), JSON.stringify({ schemaVersion: 1, files }));
  writeManifest(essential);
  return { parent, source, output: path.join(parent, 'public'), writeManifest };
}
test('actual allowlist covers every runtime asset with exact case and required module', () => {
  assert.deepEqual([...validatePaths(root, manifest.files)].sort(), publicCandidates(root));
  for (const file of essential) assert.ok(manifest.files.includes(file), file);
  assert.equal(manifest.files.filter(f => f.endsWith('.html')).length, 54);
});
test('traversal, absolute, backslash and hidden paths reject', () => {
  for (const file of ['../index.html', '/index.html', 'C:\\secret.js', 'js\\travel-requirements.js', '.env', '.git/config', 'images/../index.html']) {
    assert.throws(() => validatePaths(root, [file]), /Forbidden|invalid/);
  }
});
test('reports, tests, release tooling and internal documentation cannot be allowlisted', () => {
  for (const file of ['reports/private.json', 'tests/factual-repair.test.js', 'scripts/package-public.js', 'deployment/public-files.json', 'README.md', 'package.json', 'service.env']) {
    assert.throws(() => validatePaths(root, [file]), /Forbidden|invalid/);
  }
});
test('missing dependency rejects', () => assert.throws(() => validatePaths(root, ['js/missing.js']), /Missing/));
test('duplicate and case-colliding entries reject', () => {
  assert.throws(() => validatePaths(root, ['index.html', 'index.html']), /Duplicate/);
  assert.throws(() => validatePaths(root, ['index.html', 'INDEX.html']), /Duplicate/);
});
test('wrong-case runtime reference cannot pass on Windows', () => assert.throws(() => validatePaths(root, ['js/Travel-requirements.js']), /case mismatch|Missing/));
test('package contains only exact allowlist bytes, not internal files or environment files', () => {
  const f = fixture();
  fs.mkdirSync(path.join(f.source, 'reports')); fs.writeFileSync(path.join(f.source, 'reports/private.txt'), 'internal');
  fs.mkdirSync(path.join(f.source, 'tests')); fs.writeFileSync(path.join(f.source, 'tests/private.js'), 'internal');
  fs.writeFileSync(path.join(f.source, '.env'), 'DO_NOT_PUBLISH=fixture');
  const result = packagePublic(f.source, f.output);
  assert.equal(result.fileCount, essential.length);
  for (const file of essential) assert.deepEqual(fs.readFileSync(path.join(f.output, file)), fs.readFileSync(path.join(f.source, file)));
  for (const file of ['reports', 'tests', '.env', 'deployment']) assert.equal(fs.existsSync(path.join(f.output, file)), false);
});
test('existing output refuses without deleting or overwriting contents', () => {
  const f = fixture(); fs.mkdirSync(f.output); fs.writeFileSync(path.join(f.output, 'keep.txt'), 'keep');
  assert.throws(() => packagePublic(f.source, f.output), /already exists/);
  assert.equal(fs.readFileSync(path.join(f.output, 'keep.txt'), 'utf8'), 'keep');
});
test('output within or above source refuses; explicit absolute output required', () => {
  const f = fixture();
  for (const output of [f.source, path.join(f.source, 'public'), f.parent, 'relative-output']) assert.throws(() => packagePublic(f.source, output), /separate|absolute/);
});
test('omitted production module blocks preflight before output exists', () => {
  const f = fixture(); f.writeManifest(essential.filter(file => file !== 'js/travel-requirements.js'));
  assert.throws(() => packagePublic(f.source, f.output), /mismatch|omitted/);
  assert.equal(fs.existsSync(f.output), false);
});
test('new runtime file requires explicit allowlist review', () => {
  const f = fixture(); fs.writeFileSync(path.join(f.source, 'js/new-runtime.js'), 'new');
  assert.throws(() => packagePublic(f.source, f.output), /mismatch/);
  assert.equal(fs.existsSync(f.output), false);
});
test('invalid schema fails before output creation', () => {
  const f = fixture(); fs.writeFileSync(path.join(f.source, 'deployment/public-files.json'), '{"schemaVersion":99,"files":[]}');
  assert.throws(() => packagePublic(f.source, f.output), /version/);
  assert.equal(fs.existsSync(f.output), false);
});
test('all allowlisted JavaScript compiles', () => {
  for (const file of manifest.files.filter(f => f.endsWith('.js'))) new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
});
test('GitHub Pages configuration excludes internal release material without changing site settings', () => {
  // JSON flow syntax is valid YAML and can be parsed without a new dependency.
  const config = JSON.parse(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
  assert.deepEqual(Object.keys(config), ['exclude']);
  for (const item of ['reports', 'tests', 'scripts', 'deployment', '.git', '.env', 'images/destinations/README.md']) assert.ok(config.exclude.includes(item));
  for (const file of manifest.files) {
    assert.equal(config.exclude.some(item => file === item || file.startsWith(item + '/')), false, 'Runtime file must remain publishable: ' + file);
  }
});
test('branch-source simulation publishes no internal files and preserves every runtime asset', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
  const published = [];
  function walk(dir = '') {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const file = path.posix.join(dir, entry.name);
      if (/^[._#]/.test(entry.name) || entry.name.endsWith('~') || config.exclude.some(item => file === item || file.startsWith(item + '/'))) continue;
      if (entry.isDirectory()) walk(file); else published.push(file);
    }
  }
  walk();
  // GitHub's Jekyll source build ignores underscore-prefixed host config files.
  assert.deepEqual(published.sort(), manifest.files.filter(file => !['_headers', '_redirects'].includes(file)).sort());
});
