(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.DVRequirements = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => api.mount(document, root));
    else api.mount(document, root);
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const statuses = ['VERIFIED', 'PARTIALLY VERIFIED', 'UNVERIFIED', 'OUTDATED'];
  const fields = [['passport', 'Passport'], ['visa', 'Visa Status'], ['eta', 'eTA / Entry Auth'], ['health', 'Health']];
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  function officialUrl(value) {
    try {
      const url = new URL(value);
      const host = url.hostname;
      return url.protocol === 'https:' && !url.username && !url.password &&
        (host.endsWith('.gov') || host.endsWith('.gov.uk') || host.endsWith('.gov.au') ||
         host.endsWith('.govt.nz') || host.endsWith('.gov.mv') || host.endsWith('.gov.jm') ||
         host.endsWith('.gc.ca') || host === 'www.canada.ca' || host.endsWith('.go.jp') ||
         host.endsWith('.europa.eu')) ? url.href : null;
    } catch (_) { return null; }
  }
  function validate(data) {
    if (!data || data._meta?.schemaVersion !== 2 || !Array.isArray(data.destinations) ||
        !data.countryMappings || !data.sources || data._meta.citizenship !== 'US' ||
        data._meta.purpose !== 'tourism' || data._meta.passportType !== 'ordinary') {
      throw new Error('Invalid requirements dataset.');
    }
    const ids = new Set();
    for (const destination of data.destinations) {
      if (!destination || typeof destination.id !== 'string' || !destination.id || ids.has(destination.id) ||
          typeof destination.name !== 'string' || !destination.claims || !statuses.includes(destination.status)) {
        throw new Error('Invalid or duplicate requirements record.');
      }
      ids.add(destination.id);
    }
    return data;
  }
  function createClient(fetcher) {
    let pending;
    return {
      load() {
        if (!pending) pending = Promise.resolve().then(() => fetcher('data/travel-requirements.json', { credentials: 'same-origin' }))
          .then(response => {
            if (!response.ok) throw new Error('Requirements download failed.');
            return response.json();
          }).then(validate).catch(error => { pending = undefined; throw error; });
        return pending;
      },
      async lookup(code, context = {}) {
        if ((context.citizenship && context.citizenship !== 'US') ||
            (context.purpose && context.purpose !== 'tourism') ||
            (context.passportType && context.passportType !== 'ordinary')) {
          throw new Error('This guide only covers U.S. citizens using ordinary passports for tourism. Other circumstances require official advice.');
        }
        const data = await this.load();
        const mapping = Object.prototype.hasOwnProperty.call(data.countryMappings, code) && data.countryMappings[code];
        const record = mapping && data.destinations.find(item => item.id === mapping.destinationId);
        if (!record) throw new Error('Requirements data not available for this destination.');
        return { data, record, mapping };
      }
    };
  }
  function mount(doc, win) {
    const select = doc.getElementById('req-destination');
    const button = doc.getElementById('get-requirements');
    const output = doc.getElementById('requirements-output');
    if (!select || !button || !output) return;
    const client = createClient(win.fetch.bind(win));
    let started = false;
    let request = 0;
    output.setAttribute('role', 'status');
    output.setAttribute('aria-live', 'polite');
    select.setAttribute('aria-label', 'Select destination for U.S. citizen tourism requirements');
    const track = (name, payload) => { if (typeof win.dvTrack === 'function') win.dvTrack(name, payload); };
    const element = (tag, text, className) => {
      const node = doc.createElement(tag);
      if (text) node.textContent = text;
      if (className) node.className = className;
      return node;
    };
    function message(text) { output.replaceChildren(element('p', text, 'text-muted')); }
    select.addEventListener('change', function () {
      request++;
      output.removeAttribute('aria-busy');
      output.replaceChildren();
      if (!started && this.value) {
        track('tool_start', { tool_name: 'requirements' });
        started = true;
      }
    });
    button.addEventListener('click', async () => {
      const code = select.value;
      const current = ++request;
      if (!code) { message('Please select a destination above.'); return; }
      output.setAttribute('aria-busy', 'true');
      message('Loading requirements...');
      try {
        const { data, record, mapping } = await client.lookup(code);
        if (current !== request) return;
        const card = element('div', '', 'req-card');
        const heading = element('h3', `${mapping.name} - Entry Requirements (U.S. Passport Holders)`);
        heading.style.cssText = 'font-size:1.05rem;font-weight:800;color:var(--deep-navy);margin-bottom:1rem';
        card.append(heading);
        card.append(element('p', 'U.S. citizens, ordinary passport books, short tourist visits by air. Work, study, residence, other citizenships, emergency passports and transit rules are not covered.'));
        const safeSources = new Map();
        for (const [key, label] of fields) {
          const row = element('div', '', 'req-row');
          row.append(element('span', label, 'req-label'));
          const value = element('span', '', 'req-value');
          const claim = record.claims[key];
          const refs = Array.isArray(claim?.sources) ? claim.sources : [];
          const sources = refs.map(id => [id, data.sources[id]]).filter(([, source]) => source && officialUrl(source.url));
          const supported = claim && typeof claim.text === 'string' && statuses.includes(claim.status) && sources.length;
          if (!supported) value.textContent = 'UNVERIFIED - Source information missing. Confirm this requirement with the destination government before travel.';
          else {
            const checked = date(claim.lastReviewed) ? `; reviewed ${claim.lastReviewed}` : '; review date unavailable';
            const status = date(claim.lastReviewed) ? claim.status : 'UNVERIFIED';
            value.textContent = `${claim.text} (${status}${checked})`;
            for (const [id, source] of sources) safeSources.set(id, source);
          }
          row.append(value);
          card.append(row);
        }
        for (const [label, text] of [['Currency', record.currency], ['Power Plug', mapping.electricity || record.electricity]]) {
          const row = element('div', '', 'req-row');
          row.append(element('span', label, 'req-label'), element('span', text || 'Not reviewed.', 'req-value'));
          card.append(row);
        }
        card.append(element('div', `Important: ${record.notes || ''} Review coverage: ${record.status}. ${date(record.lastReviewed) ? 'Last reviewed ' + record.lastReviewed + '.' : 'Review date unavailable.'} This is not an entry guarantee. Confirm rules, transit conditions and health advice with official authorities before booking and again before departure.`, 'req-note'));
        if (safeSources.size) {
          const list = element('ul');
          for (const source of safeSources.values()) {
            const li = element('li');
            const link = element('a', source.label);
            link.href = officialUrl(source.url);
            li.append(link);
            list.append(li);
          }
          card.append(element('p', 'Official confirmation:'), list);
        } else card.append(element('p', 'Official source links are missing. Do not rely on this record for entry decisions.'));
        output.replaceChildren(card);
        track('requirements_lookup', { destination: code });
      } catch (error) {
        if (current === request) message(`Requirements could not be confirmed. ${error.message} Check the destination government's immigration or embassy website and try again.`);
      } finally {
        if (current === request) output.removeAttribute('aria-busy');
      }
    });
  }
  return { validate, createClient, officialUrl, mount };
});
