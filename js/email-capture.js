/**
 * email-capture.js
 *
 * Intercepts newsletter form submissions on any DreamVacati page.
 * Strategy:
 *   1. POST the email to the Railway backend (/api/email-capture) — triggers
 *      a Resend confirmation email and stores the lead.
 *   2. Also submit the Mailchimp form in the background so the newsletter
 *      list stays in sync.
 *
 * The form's action URL (Mailchimp) is kept intact in the HTML — this file
 * only adds the parallel capture layer on top.
 */

(function () {
  'use strict';

  const API_BASE = 'https://dreamvacati-planner.up.railway.app';

  // Derive a human-readable source label from the current page
  function pageSource() {
    const slug = location.pathname.replace(/^\/|\.html$/g, '').trim() || 'home';
    return slug + '-newsletter';
  }

  // POST email to Railway backend (fire-and-forget from the user's perspective)
  async function captureEmail(email) {
    try {
      const res = await fetch(`${API_BASE}/api/email-capture`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, source: pageSource() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.warn('[DV email-capture] backend error:', body.error || res.status);
      }
    } catch (err) {
      // Network failure — silent. Mailchimp submission still proceeds.
      console.warn('[DV email-capture] fetch failed:', err.message);
    }
  }

  // Submit the Mailchimp form via hidden iframe (avoids page navigation)
  function submitToMailchimp(form) {
    try {
      // Mailchimp accepts POST to the action URL — use a hidden iframe so we
      // don't navigate away.  The response from Mailchimp is discarded.
      let iframe = document.getElementById('mc-hidden-frame');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id   = 'mc-hidden-frame';
        iframe.name = 'mc-hidden-frame';
        iframe.style.cssText = 'display:none;position:absolute;width:0;height:0;border:0';
        document.body.appendChild(iframe);
      }
      const clone = form.cloneNode(true);
      clone.target = 'mc-hidden-frame';
      clone.style.cssText = 'display:none;position:absolute';
      document.body.appendChild(clone);
      clone.submit();
      // Clean up after Mailchimp responds (or after 5 s)
      setTimeout(() => clone.remove(), 5000);
    } catch (err) {
      console.warn('[DV email-capture] Mailchimp iframe submit failed:', err.message);
    }
  }

  function showSuccess(form) {
    const successId = form.dataset.successTarget || null;
    const successEl = successId ? document.getElementById(successId) : null;

    if (successEl) {
      successEl.style.display = 'block';
    } else {
      // Fallback: replace the submit button text
      const btn = form.querySelector('[type="submit"]');
      if (btn) {
        btn.textContent = 'You\'re in!';
        btn.disabled    = true;
      }
    }
    // Clear and disable the email input
    const input = form.querySelector('input[type="email"]');
    if (input) {
      input.value    = '';
      input.disabled = true;
      input.placeholder = 'Thanks — check your inbox!';
    }
  }

  function attachToForm(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const emailInput = form.querySelector('input[type="email"][name="EMAIL"]');
      if (!emailInput) return; // not a Mailchimp newsletter form

      const email = emailInput.value.trim();
      if (!email) return;

      // Fire both captures in parallel — neither blocks the UX response
      captureEmail(email);
      submitToMailchimp(form);

      showSuccess(form);
    });
  }

  // Attach to all Mailchimp newsletter forms on the page
  function init() {
    // Mailchimp forms post to us1.list-manage.com
    const forms = document.querySelectorAll('form[action*="list-manage.com"]');
    forms.forEach(attachToForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
