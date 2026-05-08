/* Cookie consent banner — loaded via <script src="/cookie-consent.js">.
   External file so script-src 'self' CSP allows it without unsafe-inline.
   Supports Accept and Decline. Persists choice to localStorage.               */
(function () {
  var CONSENT_KEY = 'dv_cookies_ok';

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      var banner = document.getElementById('dv-cookie-banner');
      if (banner) banner.style.display = 'none';
    } catch (err) {
      console.warn('Cookie consent error:', err);
    }
  }

  function initBanner() {
    var stored    = localStorage.getItem(CONSENT_KEY);
    var banner    = document.getElementById('dv-cookie-banner');
    var acceptBtn = document.getElementById('dv-cookie-accept');
    var declineBtn = document.getElementById('dv-cookie-decline');

    if (!banner) return;

    if (stored) {
      banner.style.display = 'none';
      return;
    }

    banner.style.display = 'flex';

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () { setConsent('accepted'); });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function () { setConsent('declined'); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
