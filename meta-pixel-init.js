/* Meta Pixel initialization — loaded via <script src="/meta-pixel-init.js">.
   External file so script-src CSP allows it without unsafe-inline.
   Gated on marketing consent: reads localStorage key 'dv_cookies_ok'
   (set by cookie-consent.js). Pixel fires only when value === 'accepted'.
   Listens for dvConsentUpdated (same-tab) and storage (cross-tab) events
   so late-grant sessions initialize without a page reload.
   Withdrawal: if consent is declined after acceptance, marks pixelLoaded
   false so a future accepted state will correctly reinitialize.          */
(function () {
  var PIXEL_ID = '1416821763772251';
  var CONSENT_KEY = 'dv_cookies_ok';
  var pixelLoaded = false;

  function loadPixel() {
    if (pixelLoaded) return;
    pixelLoaded = true;
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }

  function handleConsentChange(value) {
    if (value === 'accepted') {
      loadPixel();
    } else if (value === 'declined') {
      /* Consent withdrawn — allow re-evaluation if user later re-accepts */
      pixelLoaded = false;
    }
  }

  /* Check consent on page load (handles returning visitors who already accepted) */
  try {
    if (localStorage.getItem(CONSENT_KEY) === 'accepted') {
      loadPixel();
    }
  } catch (e) {}

  /* Same-tab: fired by cookie-consent.js via dispatchEvent */
  document.addEventListener('dvConsentUpdated', function (evt) {
    if (evt.detail && evt.detail.value) {
      handleConsentChange(evt.detail.value);
    }
  });

  /* Cross-tab: storage event fires in all OTHER tabs/windows */
  window.addEventListener('storage', function (evt) {
    if (evt.key === CONSENT_KEY) {
      handleConsentChange(evt.newValue);
    }
  });
})();
