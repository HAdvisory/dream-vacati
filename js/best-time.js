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
    const selectedMonth  = parseInt(document.getElementById('btt-month')?.value) || TODAY_MONTH;
    const statusForMonth = getMonthStatus(dest, selectedMonth);

    const calendarHtml = buildCalendarStrip(dest);

    // 3 tags in grid cards, 5 in detail view — prevents visual overload
    const tagsHtml = (dest.tags || []).slice(0, detailed ? 5 : 3)
      .map(t => `<span class="btt-tag">${t}</span>`).join('');

    const statusIcon = { best: '✅', shoulder: '🌤️', avoid: '⚠️', ok: '💤' }[statusForMonth.class] || '';
    const statusText = { best: 'Best time', shoulder: 'Good time', avoid: 'Avoid', ok: 'Off-season' }[statusForMonth.class] || statusForMonth.label;
    const monthNote  = selectedMonth !== TODAY_MONTH
      ? `<span style="opacity:.6;font-size:.7em;font-weight:400"> · ${MONTH_NAMES[selectedMonth - 1]}</span>` : '';

    const budgetSymbol = { budget: '$', moderate: '$$', high: '$$$', luxury: '$$$$' }[dest.budgetLevel] || '$$';
    const budgetTitle  = { budget: 'Budget-friendly', moderate: 'Moderate', high: 'Premium', luxury: 'Luxury' }[dest.budgetLevel] || '';

    return `
      <div class="btt-card ${detailed ? 'btt-card--detailed' : ''}">

        <!-- Title row + status badge side-by-side -->
        <div class="btt-card-header">
          <div>
            <h3 class="btt-card-title">${dest.name}</h3>
            <p class="btt-card-subtitle">${dest.country} &middot; ${dest.region}</p>
          </div>
          <div class="btt-status btt-status--${statusForMonth.class}" style="flex-shrink:0;align-self:flex-start;margin:0">
            ${statusIcon} ${statusText}${monthNote}
          </div>
        </div>

        <!-- Seasonal calendar — legend shown once on page, not per card -->
        ${calendarHtml}

        <p class="btt-weather">${dest.weatherSummary}</p>

        ${detailed ? `<p class="btt-notes"><strong>Planning notes:</strong> ${dest.planningNotes}</p>` : ''}

        <!-- Footer: tags left, budget symbol right -->
        <div class="btt-card-footer">
          <div class="btt-tags" style="margin:0">${tagsHtml}</div>
          <span class="btt-budget-badge" title="${budgetTitle}">${budgetSymbol}</span>
        </div>

        ${detailed ? `
          <div class="btt-crowd-row" style="margin-top:.75rem">
            <span>Peak crowds: <strong>${capitalize(dest.crowdLevel.peak)}</strong></span>
            <span>Shoulder: <strong>${capitalize(dest.crowdLevel.shoulder)}</strong></span>
            ${dest.longHaul ? '<span>✈️ Long-haul</span>' : ''}
          </div>
        ` : `
          <button class="btt-expand-btn" onclick="window.dvBestTime.expandCard('${dest.id}', this)">
            Full seasonal breakdown ↓
          </button>
        `}
      </div>
    `;
  }

  // ── Calendar strip: 12 coloured cells — legend shown once on page ─
  function buildCalendarStrip(dest) {
    const cells = MONTH_NAMES.map((name, i) => {
      const m      = i + 1;
      const status = getMonthStatus(dest, m);
      const isToday = m === TODAY_MONTH;
      return `<div class="btt-cal-cell btt-cal-cell--${status.class}${isToday ? ' btt-cal-cell--today' : ''}" title="${MONTH_FULL[i]}: ${status.label}">${name}</div>`;
    }).join('');

    return `<div class="btt-calendar">${cells}</div>`;
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
