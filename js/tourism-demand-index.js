/**
 * js/tourism-demand-index.js — DreamVacati Tourism Demand Index
 * Driven by window.TOURISM_DEMAND_DATA (tourism-demand-data.js)
 * No framework dependencies — vanilla JS only.
 */
(function () {
  'use strict';

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const LEVEL_META = {
    'low':       { label: 'Low Tourism',      cls: 'tdi-badge--low',      icon: '🟢' },
    'medium':    { label: 'Moderate Tourism', cls: 'tdi-badge--medium',   icon: '🟡' },
    'high':      { label: 'High Tourism',     cls: 'tdi-badge--high',     icon: '🟠' },
    'very-high': { label: 'Very High',        cls: 'tdi-badge--veryhigh', icon: '🔴' },
  };

  const TREND_META = {
    'rising':  { label: 'Rising',  cls: 'tdi-trend--rising',  icon: '↑' },
    'stable':  { label: 'Stable',  cls: 'tdi-trend--stable',  icon: '→' },
    'cooling': { label: 'Cooling', cls: 'tdi-trend--cooling', icon: '↓' },
  };

  const SCORE_CROWD_COLORS  = ['#2EC4B6','#2EC4B6','#45c9c0','#f4a261','#f4a261','#f4a261','#e76f51','#e76f51','#d62828','#d62828'];
  const SCORE_BUDGET_COLORS = ['#2EC4B6','#2EC4B6','#45c9c0','#f4a261','#f4a261','#f4a261','#e76f51','#e76f51','#d62828','#d62828'];

  let data = [];
  let firstInteraction = true;

  // ── Init ────────────────────────────────────────────────────────────────────

  function init() {
    if (!window.TOURISM_DEMAND_DATA || !window.TOURISM_DEMAND_DATA.length) {
      showError('Could not load demand data. Please refresh the page.');
      return;
    }
    data = window.TOURISM_DEMAND_DATA;

    populateFilters();
    setupEventListeners();
    applyFilters(); // default render on load
  }

  // ── Populate filter dropdowns ───────────────────────────────────────────────

  function populateFilters() {
    const regions = [...new Set(data.map(d => d.region))].sort();
    const regionSel = document.getElementById('tdi-region');
    if (regionSel) {
      regions.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        regionSel.appendChild(opt);
      });
    }
  }

  // ── Event listeners ─────────────────────────────────────────────────────────

  function setupEventListeners() {
    const ids = ['tdi-region', 'tdi-level', 'tdi-trend', 'tdi-traveler', 'tdi-sort'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', onFilterChange);
    });

    const search = document.getElementById('tdi-search');
    if (search) search.addEventListener('input', onFilterChange);

    const resetBtn = document.getElementById('tdi-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetFilters);
  }

  function onFilterChange() {
    if (firstInteraction) {
      firstInteraction = false;
      if (typeof gtag !== 'undefined') {
        gtag('event', 'tool_used', { event_category: 'tools', event_label: 'tourism_demand_index' });
      }
    }
    applyFilters();
  }

  // ── Apply filters & sort ────────────────────────────────────────────────────

  function applyFilters() {
    const region   = document.getElementById('tdi-region')?.value   || '';
    const level    = document.getElementById('tdi-level')?.value    || '';
    const trend    = document.getElementById('tdi-trend')?.value    || '';
    const traveler = document.getElementById('tdi-traveler')?.value || '';
    const sort     = document.getElementById('tdi-sort')?.value     || 'crowd-asc';
    const search   = (document.getElementById('tdi-search')?.value || '').toLowerCase().trim();

    let results = [...data];

    if (region)   results = results.filter(d => d.region === region);
    if (level)    results = results.filter(d => d.tourismLevel === level);
    if (trend)    results = results.filter(d => d.trend === trend);
    if (traveler) results = results.filter(d => d.travelerTypes.includes(traveler));
    if (search)   results = results.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.country.toLowerCase().includes(search) ||
      d.region.toLowerCase().includes(search) ||
      (d.tags || []).some(t => t.toLowerCase().includes(search))
    );

    // Sort
    switch (sort) {
      case 'crowd-asc':    results.sort((a, b) => a.crowdScore - b.crowdScore);      break;
      case 'crowd-desc':   results.sort((a, b) => b.crowdScore - a.crowdScore);      break;
      case 'budget-asc':   results.sort((a, b) => a.budgetPressure - b.budgetPressure); break;
      case 'budget-desc':  results.sort((a, b) => b.budgetPressure - a.budgetPressure); break;
      case 'arrivals-asc': results.sort((a, b) => a.annualArrivals - b.annualArrivals); break;
      case 'arrivals-desc':results.sort((a, b) => b.annualArrivals - a.annualArrivals); break;
      case 'az':           results.sort((a, b) => a.name.localeCompare(b.name));     break;
    }

    renderGrid(results);

    if (typeof gtag !== 'undefined') {
      gtag('event', 'destination_comparison', {
        event_category: 'tools',
        event_label: 'tourism_demand_filter',
        result_count: results.length
      });
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────

  function resetFilters() {
    ['tdi-region','tdi-level','tdi-trend','tdi-traveler','tdi-sort'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = id === 'tdi-sort' ? 'crowd-asc' : '';
    });
    const search = document.getElementById('tdi-search');
    if (search) search.value = '';
    applyFilters();
  }

  // ── Render grid ─────────────────────────────────────────────────────────────

  function renderGrid(results) {
    const grid    = document.getElementById('tdi-results');
    const countEl = document.getElementById('tdi-count');
    if (!grid) return;

    if (countEl) {
      countEl.textContent = `${results.length} destination${results.length !== 1 ? 's' : ''}`;
    }

    if (results.length === 0) {
      grid.innerHTML = '<p class="tdi-empty">No destinations match your filters. Try broadening your search.</p>';
      return;
    }

    grid.innerHTML = results.map(d => `<div class="col-md-6 col-lg-4">${buildCard(d)}</div>`).join('');
  }

  // ── Build destination card ──────────────────────────────────────────────────

  function buildCard(dest) {
    const level  = LEVEL_META[dest.tourismLevel] || LEVEL_META['medium'];
    const trend  = TREND_META[dest.trend]        || TREND_META['stable'];

    const crowdColor  = SCORE_CROWD_COLORS[Math.min(dest.crowdScore - 1, 9)];
    const budgetColor = SCORE_BUDGET_COLORS[Math.min(dest.budgetPressure - 1, 9)];
    const crowdPct    = (dest.crowdScore  / 10) * 100;
    const budgetPct   = (dest.budgetPressure / 10) * 100;

    const monthChips = dest.bestMonths.map(m =>
      `<span class="tdi-month-chip">${MONTH_NAMES[m - 1]}</span>`
    ).join('');

    const travelerChips = (dest.travelerTypes || []).slice(0, 4).map(t =>
      `<span class="tdi-traveler-chip">${capitalize(t)}</span>`
    ).join('');

    const ctaHtml = dest.internalLink
      ? `<a href="${dest.internalLink}" class="tdi-cta-link">Full guide →</a>`
      : '';

    const arrivalsFmt = dest.annualArrivals >= 1
      ? `${dest.annualArrivals.toFixed(1)}M visitors/yr`
      : `${(dest.annualArrivals * 1000).toFixed(0)}K visitors/yr`;

    return `
      <div class="tdi-card">
        <div class="tdi-card-header">
          <div>
            <h3 class="tdi-card-title">${dest.name}</h3>
            <p class="tdi-card-subtitle">${dest.country} &middot; ${dest.region}</p>
          </div>
          <div class="tdi-badges">
            <span class="tdi-badge ${level.cls}" title="Tourism level">${level.icon} ${level.label}</span>
            <span class="tdi-trend ${trend.cls}" title="Trend: ${dest.trendNote}">${trend.icon} ${trend.label}</span>
          </div>
        </div>

        <p class="tdi-arrivals">${arrivalsFmt}</p>

        <div class="tdi-scores">
          <div class="tdi-score-row">
            <span class="tdi-score-label">Crowd pressure</span>
            <div class="tdi-score-bar-track" title="Crowd score: ${dest.crowdScore}/10">
              <div class="tdi-score-bar-fill" style="width:${crowdPct}%;background:${crowdColor}"></div>
            </div>
            <span class="tdi-score-num">${dest.crowdScore}/10</span>
          </div>
          <div class="tdi-score-row">
            <span class="tdi-score-label">Budget pressure</span>
            <div class="tdi-score-bar-track" title="Budget pressure: ${dest.budgetPressure}/10">
              <div class="tdi-score-bar-fill" style="width:${budgetPct}%;background:${budgetColor}"></div>
            </div>
            <span class="tdi-score-num">${dest.budgetPressure}/10</span>
          </div>
        </div>

        <div class="tdi-best-months">
          <span class="tdi-section-label">Best months:</span>
          <div class="tdi-month-chips">${monthChips || '<span class="tdi-month-chip tdi-month-chip--none">Year-round</span>'}</div>
        </div>

        <div class="tdi-traveler-chips">${travelerChips}</div>

        <p class="tdi-notes">${dest.notes}</p>

        ${ctaHtml ? `<div class="tdi-card-cta">${ctaHtml}</div>` : ''}
      </div>
    `;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function showError(msg) {
    const el = document.getElementById('tdi-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
