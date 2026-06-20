/*!
 * dv-wc-map.js — DreamVacati FIFA World Cup 2026 host-country map layer
 *
 * Highlights the 3 host nations (US, CA, MX) on the world map SVG.
 * Host-country ISOs are derived from window.DV_DESTINATIONS
 * (entries where worldCupHostCountry === true).
 *
 * City-level markers are not possible at world-scale SVG resolution.
 * Per-city detail lives in the crawlable HTML list rendered beside the map
 * in each page's template — this module only paints country shapes.
 *
 * Depends on (must load first):
 *   js/dv-destinations.js → window.DV_DESTINATIONS
 *
 * SVG source: assets/maps/world-map.svg
 * Browser HTTP cache prevents duplicate network requests when other map
 * modules (dv-map-highlight.js, dv-tdi-map.js) share the same URL.
 *
 * Usage:
 *   <div data-wc-map data-region="north-america"
 *        role="img" aria-label="..."></div>
 *
 * Supported data-region values: north-america (default), world
 */

(function () {
  'use strict';

  // ── Region viewBox crops (sub-rectangles of master "0 0 1008 651") ──────────
  var REGIONS = {
    'north-america': '30 120 355 265',   // US, Canada, Mexico together
    'world':         '0 0 1008 651'
  };

  // ── Host country colors ──────────────────────────────────────────────────────
  // Colors match COLOR_PRIMARY entries in dv-map-highlight.js for consistency.
  var HOST_COLORS = {
    US: { fill: 'rgba(3,4,94,0.82)',   stroke: '#03045E', width: '1.5' },  // navy
    CA: { fill: 'rgba(200,0,0,0.78)',  stroke: '#c80000', width: '1.5' },  // Canadian red
    MX: { fill: 'rgba(0,107,63,0.78)', stroke: '#006B3F', width: '1.5' }   // Mexican green
  };
  var HOST_DEFAULT = { fill: 'rgba(46,196,182,0.82)', stroke: '#1aa89f', width: '1.5' };

  // Dim style — matches DIM constant in dv-map-highlight.js and dv-tdi-map.js
  var DIM = { fill: 'rgba(255,255,255,0.055)', stroke: 'rgba(255,255,255,0.09)', width: '0.5' };

  // ── 1. Build host-country ISO set from DV_DESTINATIONS ──────────────────────
  // Returns { ISO: { country, slugs[] } } for each worldCupHostCountry:true entry.
  // Multiple slugs can share one ISO (e.g. cancun + mexico-city → MX).
  function buildHostISOs() {
    var DV = window.DV_DESTINATIONS;
    if (!DV) { return null; }

    var isos = {};
    Object.keys(DV).forEach(function (slug) {
      var d = DV[slug];
      if (!d.worldCupHostCountry || !d.iso) { return; }
      if (!isos[d.iso]) { isos[d.iso] = { country: d.country, slugs: [] }; }
      isos[d.iso].slugs.push(slug);
    });
    return Object.keys(isos).length ? isos : null;
  }

  // ── 2. SVG fetch cache ───────────────────────────────────────────────────────
  // Independent from dv-map-highlight.js and dv-tdi-map.js — browser HTTP cache
  // handles deduplication at the network level.
  var _cache    = null;
  var _fetching = false;
  var _queue    = [];

  function getSVG(cb) {
    if (_cache)   { cb(_cache); return; }
    _queue.push(cb);
    if (_fetching) { return; }
    _fetching = true;
    fetch('assets/maps/world-map.svg')
      .then(function (r) {
        if (!r.ok) { throw new Error('SVG fetch failed: HTTP ' + r.status); }
        return r.text();
      })
      .then(function (txt) {
        _cache = txt;
        var q = _queue.slice(); _queue = [];
        q.forEach(function (fn) { fn(txt); });
      })
      .catch(function (err) {
        console.warn('[dv-wc-map] ' + err.message);
        var q = _queue.slice(); _queue = [];
        q.forEach(function (fn) { fn(null); });
      });
  }

  // ── 3. Render a single [data-wc-map] element ─────────────────────────────────
  function renderComponent(el) {
    if (el.dataset.wcMapReady) { return; }
    el.dataset.wcMapReady = '1';

    var region    = (el.getAttribute('data-region') || 'north-america').toLowerCase().trim();
    var regionBox = REGIONS[region] || REGIONS['north-america'];

    getSVG(function (txt) {
      if (!txt) {
        el.innerHTML = '<div class="dv-map-error">Map unavailable</div>';
        return;
      }
      if (!_hostISOs) { return; }

      var parser = new DOMParser();
      var doc    = parser.parseFromString(txt, 'image/svg+xml');
      var svgEl  = doc.documentElement;

      svgEl.removeAttribute('id');
      svgEl.removeAttribute('class');
      svgEl.removeAttribute('aria-hidden');
      svgEl.setAttribute('viewBox', regionBox);
      svgEl.setAttribute('role', 'presentation');
      svgEl.style.cssText = 'width:100%;height:auto;display:block;cursor:default';

      // Dim all country paths
      svgEl.querySelectorAll('.country-path').forEach(function (path) {
        path.style.fill          = DIM.fill;
        path.style.stroke        = DIM.stroke;
        path.style.strokeWidth   = DIM.width;
        path.style.cursor        = 'default';
        path.style.pointerEvents = 'none';
        path.classList.remove('visited', 'just-marked');
      });

      // Highlight host countries
      Object.keys(_hostISOs).forEach(function (iso) {
        var path = svgEl.getElementById(iso);
        if (!path) {
          console.info('[dv-wc-map] ISO "' + iso + '" not found in SVG.');
          return;
        }
        var col   = HOST_COLORS[iso] || HOST_DEFAULT;
        var label = (_hostISOs[iso].country || iso) + ' — FIFA World Cup 2026 host country';
        path.style.fill        = col.fill;
        path.style.stroke      = col.stroke;
        path.style.strokeWidth = col.width;
        path.setAttribute('aria-label', label);
        path.setAttribute('role', 'img');
      });

      el.innerHTML = '';
      el.appendChild(svgEl);
    });
  }

  // ── Module state ──────────────────────────────────────────────────────────────
  var _hostISOs = null;

  // ── 4. Boot ───────────────────────────────────────────────────────────────────
  function init() {
    var targets = document.querySelectorAll('[data-wc-map]');
    if (!targets.length) { return; }

    _hostISOs = buildHostISOs();
    if (!_hostISOs) {
      console.warn('[dv-wc-map] DV_DESTINATIONS unavailable — ensure dv-destinations.js loads first.');
      return;
    }

    if (!window.IntersectionObserver) {
      targets.forEach(function (el) { renderComponent(el); });
      return;
    }

    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          renderComponent(entry.target);
        }
      });
    }, { rootMargin: '300px 0px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
