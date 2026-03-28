// main.js — DreamVacati v2
document.addEventListener('DOMContentLoaded', () => {

  // ─── 1) Itinerary Builder (Drag & Drop) ──────────────────
  const activitiesList = document.getElementById('activities-list');
  const schedule = document.getElementById('schedule-area');

  if (activitiesList && schedule) {
    activitiesList.querySelectorAll('li').forEach(item => {
      item.draggable = true;
      item.addEventListener('dragstart', ev => {
        ev.dataTransfer.setData('text/plain', ev.target.dataset.activity);
      });
    });
    schedule.addEventListener('dragover', ev => ev.preventDefault());
    schedule.addEventListener('drop', ev => {
      ev.preventDefault();
      const activity = ev.dataTransfer.getData('text/plain');
      const el = document.createElement('div');
      el.className = 'p-2 mb-1 bg-white border rounded d-flex justify-content-between align-items-center';
      el.innerHTML = `<span>${activity}</span><button class="btn btn-sm btn-outline-danger ms-2" onclick="this.parentElement.remove()">&times;</button>`;
      schedule.appendChild(el);
    });
  }

  // ─── 2) Packing Checklist Generator (COMPLETE data) ────────
  const packData = {
    tropical: {
      summer: ['Swimwear (2-3 sets)', 'Reef-safe Sunscreen SPF 50+', 'Flip-flops', 'Light cotton shirts', 'Wide-brim hat', 'Sunglasses', 'Aloe vera gel', 'Insect repellent', 'Waterproof phone case', 'Light beach cover-up'],
      winter: ['Light jacket', 'Raincoat or poncho', 'Umbrella', 'Swimwear', 'Sunscreen', 'Quick-dry shorts', 'Water shoes', 'Light sweater for evenings', 'Waterproof bag'],
      spring: ['Light layers', 'Swimwear', 'Sunscreen', 'Rain jacket', 'Comfortable walking sandals', 'Sunglasses', 'Insect repellent', 'Light scarf', 'Reusable water bottle']
    },
    mountain: {
      summer: ['Hiking boots (broken in)', 'Moisture-wicking shorts', 'Sunscreen SPF 50+', 'Reusable water bottle', 'Daypack', 'Trail snacks', 'First aid kit', 'Trekking poles', 'Quick-dry shirt', 'Sun hat'],
      winter: ['Insulated jacket', 'Thermal base layers', 'Waterproof gloves', 'Beanie/warm hat', 'Wool hiking socks', 'Snow boots', 'Hand warmers', 'Neck gaiter', 'Ski goggles (if skiing)', 'Chapstick with SPF'],
      spring: ['Layerable fleece', 'Rain shell', 'Hiking boots', 'Moisture-wicking base layer', 'Sunglasses', 'Daypack', 'Water bottle', 'Trail mix', 'Light gloves', 'Convertible pants']
    },
    city: {
      summer: ['Comfortable walking shoes', 'Light breathable clothing', 'Sunglasses', 'Small crossbody bag', 'Portable charger', 'Reusable water bottle', 'Sunscreen', 'City map/offline maps', 'Smart casual outfit (for dining)'],
      winter: ['Warm coat', 'Comfortable waterproof boots', 'Scarf & gloves', 'Umbrella', 'Layers (thermals)', 'Portable charger', 'Warm socks', 'Smart casual outfit', 'Hand warmers'],
      spring: ['Light jacket', 'Comfortable walking shoes', 'Umbrella (compact)', 'Portable charger', 'Layers for variable temps', 'Sunglasses', 'Small daypack', 'Smart casual outfit', 'Reusable tote bag']
    }
  };

  const genBtn = document.getElementById('generate-packing');
  if (genBtn) {
    genBtn.addEventListener('click', () => {
      const dest = document.getElementById('pack-destination').value;
      const season = document.getElementById('pack-season').value;
      const listEl = document.getElementById('pack-list');
      const ctaEl = document.getElementById('packing-cta');
      listEl.innerHTML = '';
      const items = packData[dest]?.[season] || [];
      items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex align-items-center';
        li.innerHTML = `<input type="checkbox" class="form-check-input me-2"><span>${item}</span>`;
        listEl.appendChild(li);
      });
      // Show CTA after generating list
      if (ctaEl && items.length > 0) ctaEl.style.display = 'block';
    });
  }

  // ─── 3) Budget Dashboard ─────────────────────────────
  const totalInput = document.getElementById('budget-input');
  const totalSpan = document.getElementById('budget-total');
  const remaining = document.getElementById('remaining-budget');

  if (totalInput && totalSpan) {
    const sliders = ['accom', 'food', 'activities']
      .map(id => document.getElementById(`budget-${id}`))
      .filter(Boolean);
    const values = sliders.map(s => document.getElementById(`val-${s.id.split('-')[1]}`));

    function updateBudget() {
      const total = parseInt(totalInput.value) || 0;
      totalSpan.textContent = total;
      let used = 0;
      sliders.forEach((s, i) => {
        const v = parseInt(s.value) || 0;
        if (values[i]) values[i].textContent = v;
        used += v;
      });
      if (remaining) remaining.textContent = Math.max(total - used, 0);
    }
    totalInput.addEventListener('input', updateBudget);
    sliders.forEach(s => s.addEventListener('input', updateBudget));
    updateBudget();
  }

  // ─── 4) Travel Prep — redirect to full requirements tool ──
  // The comprehensive requirements guide is in index.html#tool-requirements
  // and is powered by inline destination data. This section handles
  // any legacy origin/destination inputs if they exist on the page.
  const fetchBtn = document.getElementById('fetch-requirements');
  if (fetchBtn) {
    fetchBtn.addEventListener('click', () => {
      const out = document.getElementById('requirements-output');
      if (out) {
        out.innerHTML = `
          <div class="alert alert-info">
            <strong>Planning tip:</strong> Use the <a href="index.html#tool-requirements">Travel Requirements Planning Guide</a>
            to get destination-specific passport, visa, eTA, health, and customs guidance for 15 destinations.
            <br><small class="text-muted mt-1 d-block">Planning guidance only — always verify with official embassy or immigration sources before travel.</small>
          </div>`;
      }
    });
  }

  // ─── 5) Travel Map + Zoom/Pan + Tap-to-Toggle ─────────────
  // Skip if upgraded inline map script already loaded
  if (!window.__dvMapUpgraded) {
  const STORAGE_KEY = 'visitedCountries';
  const form = document.getElementById('add-country-form');
  const input = document.getElementById('country-input');
  const errMsg = document.getElementById('error-msg');
  const totalCount = document.getElementById('total-count');
  const svgMap = document.getElementById('world-map');

  if (form && svgMap) {
    let visited = [];
    try { visited = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { visited = []; }

    function renderMap() {
      svgMap.querySelectorAll('path').forEach(p => p.classList.remove('visited'));
      visited.forEach(code => {
        const path = svgMap.querySelector(`#${code.toUpperCase()}`);
        if (path) path.classList.add('visited');
      });
      if (totalCount) totalCount.textContent = visited.length;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (errMsg) errMsg.textContent = '';
      const name = input.value.trim();
      if (!name) return;
      const match = Array.from(svgMap.querySelectorAll('path'))
        .find(p => p.getAttribute('title')?.toLowerCase().includes(name.toLowerCase()));
      if (!match) {
        if (errMsg) errMsg.textContent = 'Country not found on map. Try the full country name.';
      } else if (visited.includes(match.id)) {
        if (errMsg) errMsg.textContent = 'You already added that country.';
      } else {
        visited.push(match.id);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(visited)); } catch(e) {}
        renderMap();
        input.value = '';
      }
    });

    // Zoom controls
    const zin = document.getElementById('zoom-in');
    const zout = document.getElementById('zoom-out');
    if (zin && zout) {
      const factor = 1.2;
      let vb = svgMap.getAttribute('viewBox').split(' ').map(Number);
      function setVB() { svgMap.setAttribute('viewBox', vb.join(' ')); }

      zin.addEventListener('click', () => {
        let [x, y, w, h] = vb;
        const nw = w / factor, nh = h / factor;
        vb = [x + (w - nw) / 2, y + (h - nh) / 2, nw, nh];
        setVB();
      });
      zout.addEventListener('click', () => {
        let [x, y, w, h] = vb;
        const nw = w * factor, nh = h * factor;
        vb = [x - (nw - w) / 2, y - (nh - h) / 2, nw, nh];
        setVB();
      });

      // Pan & tap-to-toggle
      let isDragging = false, hasMoved = false;
      let startPoint = { x: 0, y: 0 }, startVB = [...vb];

      svgMap.addEventListener('pointerdown', evt => {
        isDragging = true;
        hasMoved = false;
        startPoint = { x: evt.clientX, y: evt.clientY };
        startVB = [...vb];
        svgMap.classList.add('dragging');
        svgMap.setPointerCapture(evt.pointerId);
      });

      svgMap.addEventListener('pointermove', evt => {
        if (!isDragging) return;
        hasMoved = true;
        const rect = svgMap.getBoundingClientRect();
        const kx = vb[2] / rect.width;
        const ky = vb[3] / rect.height;
        vb[0] = startVB[0] + (startPoint.x - evt.clientX) * kx;
        vb[1] = startVB[1] + (startPoint.y - evt.clientY) * ky;
        setVB();
      });

      svgMap.addEventListener('pointerup', evt => {
        svgMap.releasePointerCapture(evt.pointerId);
        svgMap.classList.remove('dragging');
        isDragging = false;
        if (!hasMoved && evt.target.tagName === 'path') {
          const code = evt.target.id;
          const idx = visited.indexOf(code);
          if (idx >= 0) visited.splice(idx, 1);
          else visited.push(code);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(visited)); } catch(e) {}
          renderMap();
        }
      });

      svgMap.addEventListener('pointerleave', () => {
        if (isDragging) { isDragging = false; svgMap.classList.remove('dragging'); }
      });
    }

    renderMap();
  }
  } // end __dvMapUpgraded check
});

// ─── Email Signup ────────────────────────────────────────────
// Forms now use Mailchimp's standard embed format and POST directly
// to Mailchimp's servers — no JavaScript handler needed.
//
// To activate: replace REPLACE_U_PARAM and REPLACE_LIST_ID in
// index.html and blog.html with your actual Mailchimp audience values.
// Get them from: Mailchimp → Audience → Signup Forms → Embedded Forms
