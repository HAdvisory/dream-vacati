/**
 * email-capture.js — DreamVacati newsletter signup
 *
 * Intercepts all newsletter forms on DreamVacati pages.
 * Submits via fetch to the Vercel backend only — no Mailchimp redirect,
 * no external page navigation, no broken provider pages.
 *
 * States: idle → loading → success | duplicate | error | invalid
 */

(function () {
  'use strict';

  const API_BASE = 'https://dreamvacati-backend.vercel.app';

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function pageSource() {
    const slug = location.pathname.replace(/^\/|\.html$/g, '').trim() || 'home';
    return slug + '-newsletter';
  }

  // ── Feedback element ────────────────────────────────────────────────────────

  function getFeedback(form) {
    let el = form.querySelector('.dv-signup-feedback');
    if (!el) {
      el = document.createElement('p');
      el.className = 'dv-signup-feedback';
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      form.appendChild(el);
    }
    return el;
  }

  // ── State machine ───────────────────────────────────────────────────────────

  function setState(form, state) {
    const btn      = form.querySelector('[type="submit"]');
    const input    = form.querySelector('input[type="email"]');
    const feedback = getFeedback(form);

    // Store original button text once
    if (btn && !btn.dataset.origText) {
      btn.dataset.origText = btn.textContent.trim();
    }

    switch (state) {
      case 'loading':
        if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }
        feedback.textContent = '';
        feedback.className   = 'dv-signup-feedback';
        break;

      case 'success':
        if (btn) { btn.disabled = true; btn.textContent = '✓ You’re in!'; }
        if (input) {
          input.value       = '';
          input.disabled    = true;
          input.placeholder = 'Check your inbox — talk soon!';
        }
        feedback.textContent = 'Subscribed. Travel ideas are on their way.';
        feedback.className   = 'dv-signup-feedback dv-signup-success';
        break;

      case 'duplicate':
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.origText || 'Get Travel Tips'; }
        feedback.textContent = 'You’re already on the list — thanks!';
        feedback.className   = 'dv-signup-feedback dv-signup-note';
        break;

      case 'invalid':
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.origText || 'Get Travel Tips'; }
        feedback.textContent = 'Please enter a valid email address.';
        feedback.className   = 'dv-signup-feedback dv-signup-error';
        break;

      case 'error':
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.origText || 'Get Travel Tips'; }
        feedback.textContent = 'Something went wrong — please try again.';
        feedback.className   = 'dv-signup-feedback dv-signup-error';
        break;
    }
  }

  // ── Form handler ─────────────────────────────────────────────────────────────

  function attachToForm(form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const input = form.querySelector('input[type="email"]');
      if (!input) return;

      const email = input.value.trim();

      if (!email || !EMAIL_RE.test(email)) {
        setState(form, 'invalid');
        input.focus();
        return;
      }

      setState(form, 'loading');

      try {
        const res = await fetch(`${API_BASE}/api/email-capture`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, source: pageSource() }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setState(form, data.duplicate ? 'duplicate' : 'success');
        } else {
          setState(form, 'error');
        }
      } catch {
        // Network error (offline, CORS, etc.) — silent fail, show friendly message
        setState(form, 'error');
      }
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    // Matches footer forms (action="#" data-dv-signup) and mid-page forms
    const forms = document.querySelectorAll(
      'form[data-dv-signup], form[action="#"][novalidate]'
    );
    forms.forEach(attachToForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
