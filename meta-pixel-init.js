/* Meta Pixel initialization — loaded via <script src="/meta-pixel-init.js">.
   External file so script-src CSP allows it without unsafe-inline.
   Gated on marketing consent: reads localStorage key 'dv_cookies_ok'
   (set by cookie-consent.js). Pixel fires only when value === 'accepted'.

   State model — three independent flags:
     sdkLoaded    : fbevents.js injected + fbq('init') called — one-time per document.
     consentGranted: marketing consent currently active.
     pageViewSent : PageView sent in the current consent period.

   Lifecycle:
     First accept  → bootstrapSdk() + fbq('track','PageView')
     Re-accept     → fbq('consent','grant') + fbq('track','PageView')  [no second init]
     Withdraw      → fbq('consent','revoke')  [real revocation, not just a flag reset]
     New page load → state resets; page-load check re-runs the grant path if accepted   */

(function () {
  var PIXEL_ID   = '1416821763772251';
  var CONSENT_KEY = 'dv_cookies_ok';

  var sdkLoaded     = false; /* fbevents.js injected + fbq('init') called */
  var consentGranted = false; /* tracking currently permitted             */
  var pageViewSent  = false; /* PageView sent in this consent period     */

  /* Inject the SDK and call fbq('init') exactly once per document. */
  function bootstrapSdk() {
    if (sdkLoaded) return;
    sdkLoaded = true;
    /* Meta Pixel base code — do not alter PIXEL_ID here */
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
  }

  /* Activate tracking for a consent-granted session. Idempotent. */
  function grantConsent() {
    if (consentGranted) return;
    consentGranted = true;
    if (!sdkLoaded) {
      bootstrapSdk();           /* first-time: inject SDK + init */
    } else {
      fbq('consent', 'grant');  /* subsequent: re-enable via Meta consent API */
    }
    if (!pageViewSent) {
      pageViewSent = true;
      fbq('track', 'PageView');
    }
  }

  /* Revoke tracking consent for the active Pixel. Idempotent. */
  function revokeConsent() {
    if (!consentGranted) return;
    consentGranted = false;
    pageViewSent   = false; /* reset so re-accept sends one fresh PageView */
    if (typeof fbq === 'function') {
      fbq('consent', 'revoke');
    }
  }

  function handleConsentChange(value) {
    if (value === 'accepted') {
      grantConsent();
    } else if (value === 'declined') {
      revokeConsent();
    }
  }

  /* Page load: returning visitors who already accepted */
  try {
    if (localStorage.getItem(CONSENT_KEY) === 'accepted') {
      grantConsent();
    }
  } catch (e) {}

  /* Same-tab: dispatched by cookie-consent.js (storage event silent in origin tab) */
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
