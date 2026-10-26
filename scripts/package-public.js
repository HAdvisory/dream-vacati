'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const forbidden = /^(?:reports|tests|scripts|deployment|node_modules|\.git)(?:\/|$)/i;
const extension = /\.(?:html|css|js|json|svg|webp|png|jpe?g|gif|ico|avif|woff2?|txt|xml)$/i;
const special = new Set(['CNAME', '_headers', '_redirects']);
function inside(root, file) {
  const relative = path.relative(root, file);
  return relative !== '' && !relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative);
}
function publicCandidates(root) {
  const files = [];
  function walk(dir) {
    for (const item of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const file = path.posix.join(dir, item.name);
      if (item.isSymbolicLink()) throw new Error('Review symbolic link before packaging: ' + file);
      if (item.isDirectory()) walk(file);
      else if (item.isFile() && extension.test(item.name)) files.push(file);
      else if (item.isFile() && !/\.md$/i.test(item.name)) throw new Error('Review unknown runtime asset: ' + file);
    }
  }
  for (const item of fs.readdirSync(root, { withFileTypes: true })) {
    if (item.isFile() && (extension.test(item.name) || special.has(item.name))) files.push(item.name);
  }
  for (const dir of ['js', 'data', 'CSS', 'assets', 'images']) {
    if (fs.existsSync(path.join(root, dir))) walk(dir);
  }
  return files.sort();
}
function validatePaths(root, files) {
  if (!Array.isArray(files) || !files.length) throw new Error('Public file allowlist is empty or invalid.');
  root = fs.realpathSync(root);
  const seen = new Set();
  for (const file of files) {
    if (typeof file !== 'string' || file.includes('\\') || file.split('/').some(part => !part || part === '.' || part === '..' || part.startsWith('.')) ||
        path.isAbsolute(file) || forbidden.test(file) || (!special.has(file) && !extension.test(file)) || /(?:^|\/)(?:package(?:-lock)?\.json|.*\.env)(?:$|\/)/i.test(file)) {
      throw new Error('Forbidden or invalid public path: ' + file);
    }
    const key = file.toLowerCase();
    if (seen.has(key)) throw new Error('Duplicate public path/case collision: ' + file);
    seen.add(key);
    const source = path.resolve(root, file);
    if (!inside(root, source) || !fs.existsSync(source) || !fs.lstatSync(source).isFile() || !inside(root, fs.realpathSync(source))) {
      throw new Error('Missing or unsafe public dependency: ' + file);
    }
    // Windows accepts wrong-case names; production hosting may not.
    let parent = root;
    for (const part of file.split('/')) {
      if (!fs.readdirSync(parent).includes(part)) throw new Error('Public filename case mismatch: ' + file);
      parent = path.join(parent, part);
      if (fs.lstatSync(parent).isSymbolicLink()) throw new Error('Symbolic links cannot be packaged: ' + file);
    }
  }
  return files;
}
function packagePublic(root, output) {
  root = fs.realpathSync(root);
  if (!output || !path.isAbsolute(output)) throw new Error('Provide an explicit absolute --output directory outside the source tree.');
  output = path.resolve(output);
  const parent = fs.realpathSync(path.dirname(output));
  output = path.join(parent, path.basename(output));
  if (output === root || inside(root, output) || inside(output, root)) throw new Error('Output must be separate from the source tree.');
  if (fs.existsSync(output)) throw new Error('Output already exists; use a new directory. Nothing will be deleted.');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'deployment/public-files.json'), 'utf8'));
  if (manifest.schemaVersion !== 1) throw new Error('Unsupported deployment manifest version.');
  const files = validatePaths(root, manifest.files);
  const expected = publicCandidates(root);
  const missing = expected.filter(file => !files.includes(file));
  const extra = files.filter(file => !expected.includes(file));
  if (missing.length || extra.length) throw new Error('Runtime inventory/allowlist mismatch: ' + JSON.stringify({ missing, extra }));
  for (const required of ['index.html', 'tools.html', 'js/travel-requirements.js', 'data/travel-requirements.json', 'sitemap.xml', 'robots.txt']) {
    if (!files.includes(required)) throw new Error('Required production dependency omitted: ' + required);
  }
  // Preflight is complete before creating output. No cleanup or source writes.
  fs.mkdirSync(output, { recursive: true });
  const digest = crypto.createHash('sha256');
  for (const file of files) {
    const buffer = fs.readFileSync(path.join(root, file));
    const target = path.join(output, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, buffer, { flag: 'wx' });
    digest.update(file + '\0').update(buffer);
  }
  return { output, fileCount: files.length, sha256: digest.digest('hex') };
}
if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--output') throw new Error('Usage: node scripts/package-public.js --output <new absolute directory outside source>');
    console.log(JSON.stringify(packagePublic(path.resolve(__dirname, '..'), args[1]), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { packagePublic, validatePaths, publicCandidates };
