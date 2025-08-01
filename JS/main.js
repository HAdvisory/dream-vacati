// main.js
document.addEventListener('DOMContentLoaded', () => {
  // ─── 1) Countdown Timer ─────────────────────────────────
  const timerEl = document.getElementById('countdown-timer');
  const tripDate = new Date("2025-12-01T00:00:00").getTime();
  setInterval(() => {
    const diff = tripDate - Date.now();
    if (diff <= 0) {
      timerEl.textContent = "You're there! 🌴";
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      timerEl.textContent = `${days} days left`;
    }
  }, 1000);

  // ─── 2) Itinerary Builder (Drag & Drop) ──────────────────
  document.querySelectorAll('#activities-list li').forEach(item => {
    item.draggable = true;
    item.addEventListener('dragstart', ev => {
      ev.dataTransfer.setData('text/plain', ev.target.dataset.activity);
    });
  });
  const schedule = document.getElementById('schedule-area');
  schedule.addEventListener('dragover', ev => ev.preventDefault());
  schedule.addEventListener('drop', ev => {
    ev.preventDefault();
    const activity = ev.dataTransfer.getData('text/plain');
    const el = document.createElement('div');
    el.className = 'p-2 mb-1 bg-white border rounded';
    el.textContent = activity;
    schedule.appendChild(el);
  });

  // ─── 3) Packing Checklist Generator ────────────────────────
  const packData = {
    tropical: {
      summer: ['Swimwear','Sunscreen','Flip-flops','Light Shirt','Hat'],
      winter: ['Light Jacket','Raincoat','Umbrella']
    },
    mountain: {
      summer: ['Hiking Boots','Shorts','Sunscreen','Water Bottle'],
      winter: ['Thermal Jacket','Gloves','Beanie','Warm Socks']
    },
    city: {
      spring: ['Light Jacket','Comfortable Shoes','Umbrella','Portable Charger']
    }
  };
  document.getElementById('generate-packing').addEventListener('click', () => {
    const dest   = document.getElementById('pack-destination').value;
    const season = document.getElementById('pack-season').value;
    const listEl = document.getElementById('pack-list');
    listEl.innerHTML = '';
    (packData[dest]?.[season] || []).forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex align-items-center';
      li.innerHTML = `<input type="checkbox" class="form-check-input me-2">${item}`;
      listEl.appendChild(li);
    });
  });

  // ─── 4) Budget Dashboard Logic ─────────────────────────────
  const totalInput = document.getElementById('budget-input');
  const totalSpan  = document.getElementById('budget-total');
  const sliders    = ['accom','food','activities']
    .map(id => document.getElementById(`budget-${id}`));
  const values     = sliders.map(s => document.getElementById(`val-${s.id.split('-')[1]}`));
  const remaining  = document.getElementById('remaining-budget');
  function updateBudget() {
    const total = parseInt(totalInput.value) || 0;
    totalSpan.textContent = total;
    let used = 0;
    sliders.forEach((s,i) => {
      const v = parseInt(s.value) || 0;
      values[i].textContent = v;
      used += v;
    });
    remaining.textContent = Math.max(total - used, 0);
  }
  totalInput.addEventListener('input', updateBudget);
  sliders.forEach(s => s.addEventListener('input', updateBudget));
  updateBudget();

  // ─── 5) “Prepare for Travel” Mock Fetch ───────────────────
  document.getElementById('fetch-requirements').addEventListener('click', async () => {
    const out         = document.getElementById('requirements-output');
    const origin      = document.getElementById('origin-input').value.trim();
    const destination = document.getElementById('destination-input').value.trim();
    if (!origin || !destination) {
      out.innerHTML = '<div class="alert alert-warning">Please fill both fields.</div>';
      return;
    }
    out.innerHTML = '<p>Loading requirements…</p>';
    try {
      await new Promise(r => setTimeout(r, 500)); // simulate
      out.innerHTML = `
        <ul class="list-group">
          <li class="list-group-item"><strong>Visa:</strong> e-Visa required</li>
          <li class="list-group-item"><strong>Vaccines:</strong> Yellow Fever</li>
          <li class="list-group-item"><strong>Currency:</strong> Yen (¥)</li>
          <li class="list-group-item"><strong>Customs:</strong> No fresh produce</li>
          <li class="list-group-item"><strong>Emergency:</strong> 110 (Police), 119 (Ambulance)</li>
        </ul>`;
    } catch {
      out.innerHTML = '<div class="alert alert-danger">Failed to load requirements.</div>';
    }
  });

  // ─── 6) Travel Planner Map + Zoom/Pan + Tap-to-Toggle ─────
  const STORAGE_KEY = 'visitedCountries';
  const form        = document.getElementById('add-country-form');
  const input       = document.getElementById('country-input');
  const errMsg      = document.getElementById('error-msg');
  const totalCount  = document.getElementById('total-count');
  const svgMap      = document.getElementById('world-map');
  let visited       = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  function renderMap() {
    svgMap.querySelectorAll('path').forEach(p => p.classList.remove('visited'));
    visited.forEach(code => {
      const path = svgMap.querySelector(`#${code.toUpperCase()}`);
      if (path) path.classList.add('visited');
    });
    totalCount.textContent = visited.length;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    errMsg.textContent = '';
    const name = input.value.trim();
    if (!name) return;
    const match = Array.from(svgMap.querySelectorAll('path'))
      .find(p => p.getAttribute('title')?.toLowerCase()
                 .includes(name.toLowerCase()));
    if (!match) {
      errMsg.textContent = 'Country not found on map.';
    } else if (visited.includes(match.id)) {
      errMsg.textContent = 'You already added that country.';
    } else {
      visited.push(match.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
      renderMap();
      input.value = '';
    }
  });

  // Zoom in/out buttons
  const svg     = svgMap;
  const zin     = document.getElementById('zoom-in');
  const zout    = document.getElementById('zoom-out');
  const factor  = 1.2;
  let vb        = svg.getAttribute('viewBox').split(' ').map(Number);
  function setVB() { svg.setAttribute('viewBox', vb.join(' ')); }

  zin.addEventListener('click', () => {
    let [x,y,w,h] = vb;
    const nw = w/factor, nh = h/factor;
    vb = [ x + (w-nw)/2, y + (h-nh)/2, nw, nh ];
    setVB();
  });
  zout.addEventListener('click', () => {
    let [x,y,w,h] = vb;
    const nw = w*factor, nh = h*factor;
    vb = [ x - (nw-w)/2, y - (nh-h)/2, nw, nh ];
    setVB();
  });

  // Pan & tap-to-toggle
  let isDragging   = false, hasMoved = false;
  let startPoint   = {x:0,y:0}, startVB = [...vb];

  function getPoint(evt) {
    return {
      x: evt.clientX ?? evt.touches?.[0]?.clientX,
      y: evt.clientY ?? evt.touches?.[0]?.clientY
    };
  }

  svg.addEventListener('pointerdown', evt => {
    isDragging   = true;
    hasMoved     = false;
    startPoint   = getPoint(evt);
    startVB      = [...vb];
    svg.classList.add('dragging');
    svg.setPointerCapture(evt.pointerId);
  });

  svg.addEventListener('pointermove', evt => {
    if (!isDragging) return;
    hasMoved = true;
    const pt   = getPoint(evt);
    const rect = svg.getBoundingClientRect();
    const kx   = vb[2]/rect.width;
    const ky   = vb[3]/rect.height;
    vb[0] = startVB[0] + (startPoint.x - pt.x)*kx;
    vb[1] = startVB[1] + (startPoint.y - pt.y)*ky;
    setVB();
  });

  svg.addEventListener('pointerup', evt => {
    svg.releasePointerCapture(evt.pointerId);
    svg.classList.remove('dragging');
    isDragging = false;
    // tap = no move + path target
    if (!hasMoved && evt.target.tagName === 'path') {
      const code = evt.target.id;
      const idx  = visited.indexOf(code);
      if (idx >= 0) visited.splice(idx,1);
      else          visited.push(code);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
      renderMap();
    }
  });

  svg.addEventListener('pointerleave', () => {
    if (isDragging) {
      isDragging = false;
      svg.classList.remove('dragging');
    }
  });

  // Initial map render
  renderMap();
});
