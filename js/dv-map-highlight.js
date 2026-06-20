/*!
 * dv-map-highlight.js  v1.1
 * DreamVacati — Destination highlight map component
 *
 * Reuses assets/maps/world-map.svg (176 ISO paths, viewBox 0 0 1008 651).
 * Read-only display. When DV_BY_ISO is available (via dv-destinations.js),
 * primary ISO paths with a guideUrl become keyboard-focusable links.
 * Context-country paths (BS, CU, etc.) are display-only — never interactive.
 * No tracker state. No localStorage.
 *
 * Usage:
 *   <div data-dv-map data-iso="JM" data-region="caribbean"></div>
 *   <div data-dv-map data-iso="ID,TH" data-region="southeast-asia"></div>
 *
 * Load order (both defer):
 *   <script src="js/dv-destinations.js" defer></script>
 *   <script src="js/dv-map-highlight.js" defer></script>
 *
 * Coordinate reference — all values are sub-rectangles of "0 0 1008 651":
 *   JM (Jamaica)     257, 411  — Caribbean viewBox
 *   JP (Japan)       853, 362  — East Asia viewBox
 *   GR (Greece)      ~510, 305 — Mediterranean viewBox
 *   ID (Indonesia)   ~700, 460 — Southeast Asia viewBox
 *   TH (Thailand)    ~685, 360 — Southeast Asia viewBox
 *   MX (Mexico)      ~140, 385 — Central America viewBox
 *   US (United States) ~155, 285 — North America viewBox
 *   CA (Canada)      ~130, 195 — North America viewBox
 *   BS (Bahamas)     258, 395  — Caribbean (context for JM)
 *   CU (Cuba)        ~245, 397 — Caribbean (context for JM)
 *
 * Countries NOT in SVG (absent from Natural Earth world-scale dataset):
 *   MV (Maldives), PF (French Polynesia / Bora Bora),
 *   SG (Singapore), BB (Barbados) — these require separate assets.
 */

(function () {
  'use strict';

  // ── 1. Region viewBox crops ────────────────────────────────────────────
  // Format: "minX minY width height" — sub-rectangles of the master SVG.
  // Derived from actual path coordinate data in world-map.svg.
  // Each crop is wide enough to show geographic context (neighboring countries).
  var REGIONS = {
    'caribbean':        '175 365 195 110',   // Cuba → Puerto Rico, Bahamas → Jamaica (tighter: removes excess left ocean)
    'east-asia':        '740 240 220 185',   // Japan, Korea, coastal China
    'europe':           '365 125 275 215',   // Full Europe including UK and Scandinavia
    'mediterranean':    '445 245 200 155',   // Greece, Italy, Turkey, N. Africa coast (shifted: centers Greece)
    'southeast-asia':   '620 290 230 205',   // Thailand, Indonesia, Vietnam, Malaysia (extended: captures Indonesia south coast)
    'south-asia':       '570 215 195 185',   // India, Sri Lanka, Bay of Bengal
    'oceania':          '760 385 230 215',   // New Zealand, Australia, Pacific
    'north-america':    '30 120 355 265',    // US, Canada, Mexico together
    'central-america':  '85 300 210 165',    // Mexico, Caribbean, Central America
    'north-africa':     '355 230 240 185',   // Morocco → Egypt, Mediterranean coast
    'middle-east':      '535 220 185 165',   // Saudi, UAE, Jordan, Israel
    'world':            '0 0 1008 651'       // Full globe — fallback
  };

  // ── 2. Per-ISO highlight colors ────────────────────────────────────────
  // Primary (index 0) and secondary (index 1 in two-country comparisons).
  // Primary colors match each destination's brand association.
  // Secondary is always comparison-purple to match destination-comparison.html.
  var COLOR_PRIMARY = {
    JM: { fill: 'rgba(0,107,63,0.82)',    stroke: '#004d2d', width: '1.5' },  // Jamaica green
    JP: { fill: 'rgba(188,0,45,0.78)',    stroke: '#bc002d', width: '1.5' },  // Japan red
    GR: { fill: 'rgba(13,148,136,0.78)',  stroke: '#0d9488', width: '1.5' },  // teal
    ID: { fill: 'rgba(220,38,38,0.72)',   stroke: '#dc2626', width: '1.5' },  // Indonesia red
    TH: { fill: 'rgba(30,64,175,0.72)',   stroke: '#1e40af', width: '1.5' },  // Thai blue
    MX: { fill: 'rgba(0,107,63,0.78)',    stroke: '#006B3F', width: '1.5' },  // Mexican green
    US: { fill: 'rgba(3,4,94,0.78)',      stroke: '#03045E', width: '1.5' },  // navy
    CA: { fill: 'rgba(3,4,94,0.78)',      stroke: '#03045E', width: '1.5' },  // navy
    IS: { fill: 'rgba(3,4,94,0.82)',      stroke: '#03045E', width: '1.5' },  // navy
    NZ: { fill: 'rgba(3,4,94,0.78)',      stroke: '#03045E', width: '1.5' },  // navy
    FR: { fill: 'rgba(30,64,175,0.72)',   stroke: '#1e40af', width: '1.5' },  // French blue
    IT: { fill: 'rgba(13,148,136,0.72)',  stroke: '#0d9488', width: '1.5' },  // teal
    VN: { fill: 'rgba(218,30,40,0.72)',   stroke: '#da1e28', width: '1.5' },  // Vietnam red
    CR: { fill: 'rgba(0,107,63,0.78)',    stroke: '#006B3F', width: '1.5' },  // Costa Rica
    // Caribbean neighbors — dimmer version, used for context only
    BS: { fill: 'rgba(10,126,140,0.45)',  stroke: '#0A7E8C', width: '1'   },
    CU: { fill: 'rgba(10,126,140,0.45)',  stroke: '#0A7E8C', width: '1'   },
    DO: { fill: 'rgba(10,126,140,0.45)',  stroke: '#0A7E8C', width: '1'   },
    HT: { fill: 'rgba(10,126,140,0.45)',  stroke: '#0A7E8C', width: '1'   },
    PR: { fill: 'rgba(10,126,140,0.45)',  stroke: '#0A7E8C', width: '1'   }
  };

  // Secondary highlight — always purple (matches destination-comparison.html)
  var COLOR_SECONDARY = { fill: 'rgba(124,58,237,0.75)', stroke: '#7c3aed', width: '1.5' };

  // Default for any ISO not in the table above
  var COLOR_DEFAULT_PRIMARY = { fill: 'rgba(10,126,140,0.78)', stroke: '#0A7E8C', width: '1.5' };

  // Dim style applied to every non-target path
  var DIM = { fill: 'rgba(255,255,255,0.055)', stroke: 'rgba(255,255,255,0.09)', width: '0.5' };

  // ── 3. ISO → human-readable name lookup ──────────────────────────────
  // Used for aria-label only — keeps screen-reader output meaningful.
  // Hardcoded entries are the authoritative fallback; never overwritten by registry.
  var ISO_NAMES = {
    JM: 'Jamaica',   JP: 'Japan',        GR: 'Greece',     ID: 'Indonesia',
    TH: 'Thailand',  MX: 'Mexico',       US: 'United States', CA: 'Canada',
    IS: 'Iceland',   NZ: 'New Zealand',  FR: 'France',     IT: 'Italy',
    VN: 'Vietnam',   CR: 'Costa Rica',   BS: 'Bahamas',    CU: 'Cuba',
    DO: 'Dominican Republic', HT: 'Haiti', PR: 'Puerto Rico', TT: 'Trinidad and Tobago'
  };

  // Extend ISO_NAMES from DV_BY_ISO when the registry is available.
  // Uses .country (not .name) to resolve sovereign state, not sub-destination.
  // Only adds ISOs not already hardcoded above — existing entries are never overwritten.
  if (window.DV_BY_ISO && typeof window.DV_BY_ISO === 'object') {
    Object.keys(window.DV_BY_ISO).forEach(function (iso) {
      if (!ISO_NAMES[iso]) {
        var c = window.DV_BY_ISO[iso].country;
        if (c) { ISO_NAMES[iso] = c; }
      }
    });
  }

  // ── 3.5. Destination link resolver ────────────────────────────────────
  // Returns the guideUrl for a primary ISO when DV_BY_ISO is available.
  // Returns null when: ISO is a display-only context country, no guideUrl
  // exists in the registry, or guideUrl points to the current page.
  var _CONTEXT_ISOS = { BS: 1, CU: 1, DO: 1, HT: 1, PR: 1 };

  function resolveDestLink(iso) {
    if (_CONTEXT_ISOS[iso])               { return null; }
    var byIso = window.DV_BY_ISO;
    if (!byIso || !byIso[iso])            { return null; }
    var url = byIso[iso].guideUrl;
    if (!url)                             { return null; }
    var rel     = url.replace(/^\//, '');
    var current = window.location.pathname.split('/').pop() || '';
    if (rel === current)                  { return null; }
    return url;
  }

  // ── 4. SVG module cache ────────────────────────────────────────────────
  // One fetch per page load, shared by ALL [data-dv-map] elements on the page.
  // Subsequent calls receive the cached text synchronously via callback queue.
  var _cache    = null;   // string: raw SVG text after first fetch
  var _fetching = false;  // lock: prevents concurrent fetches
  var _queue    = [];     // callbacks waiting for the first fetch to complete

  function getSVG(cb) {
    if (_cache)   { cb(_cache); return; }
    _queue.push(cb);
    if (_fetching) { return; }
    _fetching = true;
    fetch('assets/maps/world-map.svg')
      .then(function (r) {
        if (!r.ok) throw new Error('SVG fetch failed: HTTP ' + r.status);
        return r.text();
      })
      .then(function (txt) {
        _cache = txt;
        var q = _queue.slice(); _queue = [];
        q.forEach(function (fn) { fn(txt); });
      })
      .catch(function (err) {
        console.warn('[dv-map-highlight] ' + err.message);
        var q = _queue.slice(); _queue = [];
        q.forEach(function (fn) { fn(null); });
      });
  }

  // ── 5. Single component renderer ──────────────────────────────────────
  function renderComponent(el) {
    if (el.dataset.dvMapReady) { return; }
    el.dataset.dvMapReady = '1';

    // Parse attributes
    var isoAttr   = (el.getAttribute('data-iso') || '').toUpperCase().trim();
    var region    = (el.getAttribute('data-region') || 'world').toLowerCase().trim();
    var isos      = isoAttr ? isoAttr.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
    var regionBox = REGIONS[region] || REGIONS['world'];

    // Resolve primary ISO destination link now (DV_BY_ISO already populated by defer order).
    var primaryDestUrl = isos.length ? resolveDestLink(isos[0]) : null;

    // ── Container semantics — set before SVG injects to prevent AT misread ─
    // Layout space is reserved by per-region aspect-ratio rules in main.css.
    if (primaryDestUrl) {
      // role="group" lets AT discover the role="link" path inside.
      // role="img" would make the container opaque to AT and hide the inner link.
      el.setAttribute('role', 'group');
      el.setAttribute('aria-label', (ISO_NAMES[isos[0]] || isos[0]) + ' location map');
    } else {
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', isos.length
        ? isos.map(function (iso) { return ISO_NAMES[iso] || iso; }).join(' and ') + ' shown on world map'
        : 'World map');
    }

    getSVG(function (txt) {
      if (!txt) {
        el.innerHTML = '<div class="dv-map-error">Map unavailable</div>';
        return;
      }

      // Parse SVG into DOM
      var parser = new DOMParser();
      var doc    = parser.parseFromString(txt, 'image/svg+xml');
      var svgEl  = doc.documentElement;

      // ── Strip tracker-specific attributes from the original SVG ──────
      svgEl.removeAttribute('id');        // was 'world-map-svg' in tracker
      svgEl.removeAttribute('class');
      svgEl.removeAttribute('aria-hidden');

      // ── Apply viewBox crop ────────────────────────────────────────────
      svgEl.setAttribute('viewBox', regionBox);
      svgEl.setAttribute('role', 'presentation');
      svgEl.style.cssText = 'width:100%;height:auto;display:block;cursor:default';

      // ── Dim all country paths first ───────────────────────────────────
      svgEl.querySelectorAll('.country-path').forEach(function (path) {
        path.style.fill          = DIM.fill;
        path.style.stroke        = DIM.stroke;
        path.style.strokeWidth   = DIM.width;
        path.style.cursor        = 'default';
        path.style.pointerEvents = 'none';  // non-interactive by default
        path.classList.remove('visited', 'just-marked');
      });

      // ── Highlight target ISO codes ─────────────────────────────────────
      isos.forEach(function (iso, idx) {
        var path = svgEl.getElementById(iso);
        if (!path) {
          // ISO not in SVG (MV, PF, SG, BB) — log and skip silently
          console.warn('[dv-map-highlight] ISO "' + iso + '" not found in SVG. ' +
            'This destination requires a separate map asset.');
          return;
        }
        var col = idx === 0
          ? (COLOR_PRIMARY[iso] || COLOR_DEFAULT_PRIMARY)
          : COLOR_SECONDARY;

        path.style.fill        = col.fill;
        path.style.stroke      = col.stroke;
        path.style.strokeWidth = col.width;

        // ── Keyboard accessibility — primary ISO with a guide link only ─
        // Context countries (idx > 0 or no guideUrl) remain display-only.
        if (idx === 0 && primaryDestUrl) {
          path.setAttribute('tabindex', '0');
          path.setAttribute('role', 'link');
          path.setAttribute('aria-label', 'View ' + (ISO_NAMES[iso] || iso) + ' travel guide');
          path.classList.add('dv-map-link-path');
          path.style.cursor        = 'pointer';
          path.style.pointerEvents = 'auto';
          path.addEventListener('click', function () {
            window.location.href = primaryDestUrl;
          });
          path.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              window.location.href = primaryDestUrl;
            }
          });
        } else {
          path.style.cursor = 'default';
          // pointerEvents remains 'none' from dim phase
        }
      });

      // ── Inject into DOM ───────────────────────────────────────────────
      el.innerHTML = '';
      el.appendChild(svgEl);

      // ── Fire analytics event ──────────────────────────────────────────
      if (typeof window.dvTrack === 'function') {
        window.dvTrack('destination_map_rendered', {
          iso:    isoAttr || 'none',
          region: region
        });
      }
    });
  }

  // ── 6. IntersectionObserver lazy loader ───────────────────────────────
  // Triggers SVG fetch only when the component scrolls within 300px of viewport.
  // For above-fold placement (not recommended), IO fires immediately.
  function boot() {
    var targets = document.querySelectorAll('[data-dv-map]');
    if (!targets.length) { return; }

    // Pre-fetch SVG as soon as the first component is seen in the DOM,
    // regardless of viewport position — warms the cache for all components.
    var prefetched = false;
    function prefetch() {
      if (prefetched) { return; }
      prefetched = true;
      getSVG(function () {}); // warm cache, render triggered by IO separately
    }

    if (!window.IntersectionObserver) {
      // Fallback for browsers without IntersectionObserver (< 1% of traffic)
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
    }, { rootMargin: '300px 0px' });  // begin fetch 300px before visible

    targets.forEach(function (el) {
      prefetch();       // warm SVG cache on first target observed
      io.observe(el);
    });
  }

  // ── 7. Boot ────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

}());
