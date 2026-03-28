/**
 * js/best-time.js — DreamVacati "Best Time to Travel" Tool
 * Driven by /data/destinations.json
 * No framework dependencies — vanilla JS only.
 */
(function () {
  'use strict';

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_FULL  = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
  const TODAY_MONTH = new Date().getMonth() + 1; // 1-indexed

  let allDestinations = [];

  // ── Load data ──────────────────────────────────────────────
  async function init() {
    try {
      const res = await fetch('data/destinations.json');
      if (!res.ok) throw new Error('Failed to load destinations data.');
      allDestinations = await res.json();
    } catch (err) {
      document.getElementById('btt-error').textContent =
        'Could not load destination data. Please refresh the page.';
      document.getElementById('btt-error').style.display = 'block';
      return;
    }

    populateDestinationSelect();
    populateRegionFilter();
    setupEventListeners();
    // Pre-run with "show best destinations right now"
    showBestThisMonth();
  }

  // ── Populate destination dropdown ─────────────────────────
  function populateDestinationSelect() {
    const sel = document.getElementById('btt-destination');
    if (!sel) return;

    // Sorted A–Z by name
    const sorted = [...allDestinations].sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach(dest => {
      const opt = document.createElement('option');
      opt.value = dest.id;
      opt.textContent = `${dest.name} (${dest.country})`;
      sel.appendChild(opt);
    });
  }

  // ── Populate region filter ─────────────────────────────────
  function populateRegionFilter() {
    const sel = document.getElementById('btt-region');
    if (!sel) return;

    const regions = [...new Set(allDestinations.map(d => d.region))].sort();
    regions.forEach(region => {
      const opt = document.createElement('option');
      opt.value = region;
      opt.textContent = region;
      sel.appendChild(opt);
    });
  }

  // ── Event listeners ────────────────────────────────────────
  function setupEventListeners() {
    const destSel    = document.getElementById('btt-destination');
    const regionSel  = document.getElementById('btt-region');
    const monthSel   = document.getElementById('btt-month');
    const budgetSel  = document.getElementById('btt-budget');
    const tripSel    = document.getElementById('btt-triptype');

    if (destSel) {
      destSel.addEventListener('change', () => {
        const id = destSel.value;
        if (!id) return clearSingleResult();
        const dest = allDestinations.find(d => d.id === id);
        if (dest) renderSingleDestination(dest);
      });
    }

    // Filter controls
    [regionSel, monthSel, budgetSel, tripSel].forEach(el => {
      if (el) el.addEventListener('change', applyFilters);
    });

    // "Best this month" button
    const nowBtn = document.getElementById('btt-best-now');
    if (nowBtn) nowBtn.addEventListener('click', showBestThisMonth);
  }

  // ── Single destination lookup ──────────────────────────────
  function renderSingleDestination(dest) {
    const panel = document.getElementById('btt-single-result');
    const grid  = document.getElementById('btt-filter-results');
    if (grid) grid.style.display = 'none';
    if (!panel) return;

    panel.style.display = 'block';
    panel.innerHTML = buildDestinationCard(dest, true);
  }

  function clearSingleResult() {
    const panel = document.getElementById('btt-single-result');
    if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }
    const grid = document.getElementById('btt-filter-results');
    if (grid) grid.style.display = '';
  }

  // ── Filter-based results ───────────────────────────────────
  function applyFilters() {
    const region   = document.getElementById('btt-region')?.value   || '';
    const month    = parseInt(document.getElementById('btt-month')?.value)  || 0;
    const budget   = document.getElementById('btt-budget')?.value   || '';
    const tripType = document.getElementById('btt-triptype')?.value || '';

    // Reset single destination panel
    const singlePanel = document.getElementById('btt-single-result');
    if (singlePanel) { singlePanel.style.display = 'none'; singlePanel.innerHTML = ''; }
    const destSel = document.getElementById('btt-destination');
    if (destSel) destSel.value = '';

    let results = [...allDestinations];

    if (region)   results = results.filter(d => d.region === region);
    if (budget)   results = results.filter(d => d.budgetLevel === budget);
    if (tripType) results = results.filter(d => d.tripType.includes(tripType));
    if (month)    results = results.filter(d =>
      d.bestMonths.includes(month) || d.shoulderMonths.includes(month)
    );

    // Sort: best month first, then shoulder, then others
    if (month) {
      results.sort((a, b) => {
        const scoreA = a.bestMonths.includes(month) ? 2 : a.shoulderMonths.includes(month) ? 1 : 0;
        const scoreB = b.bestMonths.includes(month) ? 2 : b.shoulderMonths.includes(month) ? 1 : 0;
        return scoreB - scoreA;
      });
    }

    renderFilterResults(results);
  }

  function renderFilterResults(results) {
    const grid    = document.getElementById('btt-filter-results');
    const countEl = document.getElementById('btt-result-count');
    if (!grid) return;

    grid.style.display = '';
    if (countEl) countEl.textContent = `${results.length} destination${results.length !== 1 ? 's' : ''} found`;

    if (results.length === 0) {
      grid.innerHTML = '<p class="text-muted text-center py-4">No destinations match your filters. Try broadening your search.</p>';
      return;
    }

    grid.innerHTML = results.map(d => `
      <div class="col-md-6 col-lg-4">
        ${buildDestinationCard(d, false)}
      </div>
    `).join('');
  }

  // ── Best this month ────────────────────────────────────────
  function showBestThisMonth() {
    const monthSel = document.getElementById('btt-month');
    if (monthSel) monthSel.value = TODAY_MONTH;
    applyFilters();

    const heading = document.getElementById('btt-results-heading');
    if (heading) heading.textContent = `Best Destinations for ${MONTH_FULL[TODAY_MONTH - 1]}`;
  }

  // ── Build destination card HTML ────────────────────────────
  function buildDestinationCard(dest, detailed) {
    const statusForToday = getMonthStatus(dest, TODAY_MONTH);
    const selectedMonth  = parseInt(document.getElementById('btt-month')?.value) || TODAY_MONTH;
    const statusForMonth = getMonthStatus(dest, selectedMonth);

    const calendarHtml = buildCalendarStrip(dest);
    const tagsHtml = (dest.tags || []).slice(0, 5)
      .map(t => `<span class="btt-tag">${t}</span>`).join('');

    const statusLabel = statusForMonth.class === 'best' ? '✅ Best time' :
                        statusForMonth.class === 'shoulder' ? '🟡 Good time' :
                        '⚠️ Avoid if possible';

    const budgetBadge = {
      'budget':   '<span class="badge bg-success">$ Budget-Friendly</span>',
      'moderate': '<span class="badge bg-primary">$$ Moderate</span>',
      'high':     '<span class="badge bg-warning text-dark">$$$ Premium</span>',
      'luxury':   '<span class="badge bg-danger">$$$$ Luxury</span>'
    }[dest.budgetLevel] || '';

    const longHaulBadge = dest.longHaul
      ? '<span class="badge bg-secondary ms-1">Long-Haul Flight</span>'
      : '';

    return `
      <div class="btt-card ${detailed ? 'btt-card--detailed' : ''}">
        <div class="btt-card-header">
          <div>
            <h3 class="btt-card-title">${dest.name}</h3>
            <p class="btt-card-subtitle">${dest.country} &bull; ${dest.region}</p>
          </div>
          <div class="btt-card-badges">
            ${budgetBadge}${longHaulBadge}
          </div>
        </div>

        <div class="btt-status btt-status--${statusForMonth.class}">
          ${statusLabel} ${selectedMonth !== TODAY_MONTH ? `for ${MONTH_NAMES[selectedMonth - 1]}` : 'this month'}
        </div>

        ${calendarHtml}

        <p class="btt-weather">${dest.weatherSummary}</p>

        ${detailed ? `<p class="btt-notes"><strong>Planning notes:</strong> ${dest.planningNotes}</p>` : ''}

        <div class="btt-tags">${tagsHtml}</div>

        ${detailed ? `
          <div class="btt-crowd-row">
            <span>Peak crowds: <strong>${capitalize(dest.crowdLevel.peak)}</strong></span>
            <span>Shoulder: <strong>${capitalize(dest.crowdLevel.shoulder)}</strong></span>
          </div>
        ` : `
          <button class="btt-expand-btn" onclick="window.dvBestTime.expandCard('${dest.id}', this)">
            View details &darr;
          </button>
        `}
      </div>
    `;
  }

  // ── Calendar strip: 12 colored month blocks ───────────────
  function buildCalendarStrip(dest) {
    const cells = MONTH_NAMES.map((name, i) => {
      const m = i + 1;
      const status = getMonthStatus(dest, m);
      const isToday = m === TODAY_MONTH;
      return `<div class="btt-cal-cell btt-cal-cell--${status.class}${isToday ? ' btt-cal-cell--today' : ''}" title="${MONTH_FULL[i]}: ${status.label}">
        ${name}
      </div>`;
    }).join('');

    return `
      <div class="btt-calendar">
        ${cells}
      </div>
      <div class="btt-cal-legend">
        <span class="btt-cal-legend-item"><span class="btt-cal-dot btt-cal-dot--best"></span> Best</span>
        <span class="btt-cal-legend-item"><span class="btt-cal-dot btt-cal-dot--shoulder"></span> Good</span>
        <span class="btt-cal-legend-item"><span class="btt-cal-dot btt-cal-dot--avoid"></span> Avoid</span>
        <span class="btt-cal-legend-item"><span class="btt-cal-dot btt-cal-dot--ok"></span> Off-season</span>
      </div>
    `;
  }

  function getMonthStatus(dest, month) {
    if (dest.bestMonths.includes(month))    return { class: 'best',     label: 'Best time to visit' };
    if (dest.avoidMonths.includes(month))   return { class: 'avoid',    label: 'Avoid if possible' };
    if (dest.shoulderMonths.includes(month))return { class: 'shoulder', label: 'Good time to visit' };
    return { class: 'ok', label: 'Off-season / less ideal' };
  }

  // ── Expand card to show details (for grid cards) ──────────
  window.dvBestTime = {
    expandCard: function (id, btn) {
      const dest = allDestinations.find(d => d.id === id);
      if (!dest) return;
      const card = btn.closest('.btt-card');
      if (!card) return;

      card.innerHTML = buildDestinationCard(dest, true).replace(/<div class="btt-card[^>]*>/, '').replace(/<\/div>\s*$/, '');
    }
  };

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // ── Boot ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
