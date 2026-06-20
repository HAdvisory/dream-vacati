/*!
 * dv-tdi-map.js — DreamVacati Tourism Demand Index world map layer
 *
 * Renders a color-coded world map showing crowd pressure, budget pressure,
 * or tourism level for TDI destinations. Layer mode toggled via buttons.
 *
 * Depends on (must load first):
 *   js/dv-destinations.js    → window.DV_DESTINATIONS  (provides iso per slug)
 *   js/tourism-demand-data.js → window.TOURISM_DEMAND_DATA (provides scores)
 *
 * SVG source: assets/maps/world-map.svg (same source as dv-map-highlight.js).
 * Separate module — TDI coloring is metric-driven and multi-destination,
 * not ISO-brand-color-based. Browser HTTP cache prevents duplicate fetches.
 *
 * iso:null destinations (Maldives MV, Bora Bora PF, Singapore SG, Barbados BB)
 * are absent from the Natural Earth world-scale SVG. They are logged with
 * console.info and skipped on the map. Full TDI data appears in the cards.
 *
 * When multiple TDI destinations share one ISO (Cancún + Mexico City → MX),
 * the higher (more conservative) crowdScore and budgetPressure are used.
 */

(function () {
  'use strict';

  // ── Color scales (match SCORE_CROWD_COLORS in tourism-demand-index.js) ─────
  // Index 0 = score 1, index 9 = score 10.
  var SCORE_FILLS = [
    'rgba(46,196,182,0.85)',   // 1
    'rgba(46,196,182,0.85)',   // 2
    'rgba(69,201,192,0.85)',   // 3
    'rgba(244,162,97,0.85)',   // 4
    'rgba(244,162,97,0.85)',   // 5
    'rgba(244,162,97,0.85)',   // 6
    'rgba(231,111,81,0.85)',   // 7
    'rgba(231,111,81,0.85)',   // 8
    'rgba(214,40,40,0.85)',    // 9
    'rgba(214,40,40,0.85)'    // 10
  ];
  var SCORE_STROKES = [
    '#1aa89f','#1aa89f','#1aa89f',
    '#c9743a','#c9743a','#c9743a',
    '#b84d2b','#b84d2b',
    '#a01818','#a01818'
  ];

  var LEVEL_FILLS   = { 'low':'rgba(46,196,182,0.85)', 'medium':'rgba(244,162,97,0.85)',
                        'high':'rgba(231,111,81,0.85)', 'very-high':'rgba(214,40,40,0.85)' };
  var LEVEL_STROKES = { 'low':'#1aa89f', 'medium':'#c9743a',
                        'high':'#b84d2b', 'very-high':'#a01818' };

  // Dim style for non-highlighted paths — matches dv-map-highlight.js DIM constant.
  var DIM = { fill: 'rgba(255,255,255,0.055)', stroke: 'rgba(255,255,255,0.09)', width: '0.5' };

  // Documented iso:null slugs — absent from Natural Earth SVG by design.
  var ISO_NULL_SLUGS = { maldives:1, 'bora-bora':1, singapore:1, barbados:1 };

  // ── 1. Build ISO → TDI data map ─────────────────────────────────────────────
  // Returns { ISO: { crowdScore, budgetPressure, tourismLevel, names[] } }
  // Multiple TDI destinations sharing one ISO are merged using max scores.
  function buildIsoDataMap() {
    var TDI = window.TOURISM_DEMAND_DATA;
    var DV  = window.DV_DESTINATIONS;
    if (!TDI || !DV) { return null; }

    var LEVEL_ORDER = { 'low':0, 'medium':1, 'high':2, 'very-high':3 };
    var map = {};

    TDI.forEach(function (d) {
      var dvEntry = DV[d.id];
      if (!dvEntry) { return; }

      var iso = dvEntry.iso;
      if (!iso) {
        if (ISO_NULL_SLUGS[d.id]) {
          console.info('[dv-tdi-map] ' + d.name + ' (iso:null) — not in Natural Earth SVG. ' +
            'Shown in TDI cards; skipped on map.');
        } else {
          console.warn('[dv-tdi-map] Unexpected iso:null for slug: ' + d.id);
        }
        return;
      }

      if (!map[iso]) {
        map[iso] = {
          crowdScore:     d.crowdScore,
          budgetPressure: d.budgetPressure,
          tourismLevel:   d.tourismLevel,
          names:          [d.name]
        };
      } else {
        // ISO collision — use max scores for conservative display.
        map[iso].names.push(d.name);
        if (d.crowdScore     > map[iso].crowdScore)     { map[iso].crowdScore     = d.crowdScore;     }
        if (d.budgetPressure > map[iso].budgetPressure) { map[iso].budgetPressure = d.budgetPressure; }
        var newOrder = LEVEL_ORDER[d.tourismLevel]     || 0;
        var curOrder = LEVEL_ORDER[map[iso].tourismLevel] || 0;
        if (newOrder > curOrder) { map[iso].tourismLevel = d.tourismLevel; }
      }
    });

    return map;
  }

  // ── 2. Color selectors ───────────────────────────────────────────────────────
  function getColor(mode, isoData) {
    var idx;
    if (mode === 'crowd') {
      idx = Math.max(0, Math.min(9, (isoData.crowdScore || 1) - 1));
      return { fill: SCORE_FILLS[idx], stroke: SCORE_STROKES[idx] };
    }
    if (mode === 'budget') {
      idx = Math.max(0, Math.min(9, (isoData.budgetPressure || 1) - 1));
      return { fill: SCORE_FILLS[idx], stroke: SCORE_STROKES[idx] };
    }
    // mode === 'level'
    var lvl = isoData.tourismLevel || 'medium';
    return { fill: LEVEL_FILLS[lvl] || LEVEL_FILLS.medium, stroke: LEVEL_STROKES[lvl] || LEVEL_STROKES.medium };
  }

  function modeLabel(mode) {
    if (mode === 'crowd')  { return 'crowd pressure'; }
    if (mode === 'budget') { return 'budget pressure'; }
    return 'tourism level';
  }

  function modeValue(mode, isoData) {
    if (mode === 'crowd')  { return 'crowd score '     + isoData.crowdScore     + '/10'; }
    if (mode === 'budget') { return 'budget pressure ' + isoData.budgetPressure + '/10'; }
    return 'tourism level: ' + (isoData.tourismLevel || 'n/a');
  }

  // ── 3. SVG fetch cache ───────────────────────────────────────────────────────
  var _svgCache    = null;
  var _svgFetching = false;
  var _svgQueue    = [];

  function getSVG(cb) {
    if (_svgCache) { cb(_svgCache); return; }
    _svgQueue.push(cb);
    if (_svgFetching) { return; }
    _svgFetching = true;
    fetch('assets/maps/world-map.svg')
      .then(function (r) {
        if (!r.ok) { throw new Error('SVG fetch failed: HTTP ' + r.status); }
        return r.text();
      })
      .then(function (txt) {
        _svgCache = txt;
        var q = _svgQueue.slice(); _svgQueue = [];
        q.forEach(function (fn) { fn(txt); });
      })
      .catch(function (err) {
        console.warn('[dv-tdi-map] ' + err.message);
        var q = _svgQueue.slice(); _svgQueue = [];
        q.forEach(function (fn) { fn(null); });
      });
  }

  // ── 4. Apply colors to an SVG element ────────────────────────────────────────
  // Called on initial render and again when mode changes.
  var _missingISOs = {};   // tracks which ISOs have already been logged missing

  function applyColors(svgEl, mode) {
    if (!_isoDataMap) { return; }
    Object.keys(_isoDataMap).forEach(function (iso) {
      var path = svgEl.getElementById(iso);
      if (!path) {
        if (!_missingISOs[iso]) {
          _missingISOs[iso] = true;
          console.info('[dv-tdi-map] ISO "' + iso + '" (' + _isoDataMap[iso].names.join(', ') +
            ') not found in world-scale SVG — too small for Natural Earth dataset.');
        }
        return;
      }
      var col   = getColor(mode, _isoDataMap[iso]);
      var label = _isoDataMap[iso].names.join(' / ') + ': ' + modeValue(mode, _isoDataMap[iso]);
      path.style.fill          = col.fill;
      path.style.stroke        = col.stroke;
      path.style.strokeWidth   = '1.5';
      path.style.pointerEvents = 'none';
      path.setAttribute('aria-label', label);
      path.setAttribute('role', 'img');
    });
  }

  // ── 5. Initial map render ────────────────────────────────────────────────────
  // Fetches SVG, dims all paths, highlights TDI destinations.
  // Uses _currentMode at callback time (handles button clicks before fetch completes).
  function renderMap(container) {
    getSVG(function (txt) {
      if (!txt) {
        container.innerHTML = '<div class="dv-map-error">Map unavailable</div>';
        return;
      }

      var parser = new DOMParser();
      var doc    = parser.parseFromString(txt, 'image/svg+xml');
      var svgEl  = doc.documentElement;

      svgEl.removeAttribute('id');
      svgEl.removeAttribute('class');
      svgEl.removeAttribute('aria-hidden');
      svgEl.setAttribute('viewBox', '0 0 1008 651');
      svgEl.setAttribute('role', 'presentation');
      svgEl.style.cssText = 'width:100%;height:auto;display:block;cursor:default';

      // Dim all paths first
      svgEl.querySelectorAll('.country-path').forEach(function (path) {
        path.style.fill          = DIM.fill;
        path.style.stroke        = DIM.stroke;
        path.style.strokeWidth   = DIM.width;
        path.style.cursor        = 'default';
        path.style.pointerEvents = 'none';
        path.classList.remove('visited', 'just-marked');
      });

      applyColors(svgEl, _currentMode);

      container.innerHTML = '';
      container.appendChild(svgEl);
      _svgEl = svgEl;
    });
  }

  // ── 6. Update colors in the live SVG (mode toggle) ───────────────────────────
  // Re-dims all paths then re-applies colors. No SVG re-fetch.
  function updateColors(mode) {
    if (!_svgEl) { return; }
    _svgEl.querySelectorAll('.country-path').forEach(function (path) {
      path.style.fill        = DIM.fill;
      path.style.stroke      = DIM.stroke;
      path.style.strokeWidth = DIM.width;
    });
    applyColors(_svgEl, mode);
  }

  // ── Module state ──────────────────────────────────────────────────────────────
  var _isoDataMap  = null;
  var _svgEl       = null;
  var _currentMode = 'crowd';

  // ── 7. Boot ───────────────────────────────────────────────────────────────────
  function init() {
    var container = document.querySelector('[data-tdi-map]');
    if (!container) { return; }

    _isoDataMap = buildIsoDataMap();
    if (!_isoDataMap) {
      console.warn('[dv-tdi-map] Required data unavailable. ' +
        'Ensure dv-destinations.js and tourism-demand-data.js are loaded first.');
      return;
    }

    // Sync initial aria-label to default mode
    container.setAttribute('aria-label', 'World map showing ' + modeLabel(_currentMode) + ' by destination');
    renderMap(container);

    // Mode toggle buttons
    var toggleEl = document.getElementById('tdi-map-toggle');
    if (toggleEl) {
      var btns = toggleEl.querySelectorAll('[data-tdi-mode]');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var mode = btn.getAttribute('data-tdi-mode');
          if (mode === _currentMode) { return; }
          _currentMode = mode;
          btns.forEach(function (b) { b.classList.remove('tdi-map-btn--active'); });
          btn.classList.add('tdi-map-btn--active');
          container.setAttribute('aria-label',
            'World map showing ' + modeLabel(mode) + ' by destination');
          updateColors(mode);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
