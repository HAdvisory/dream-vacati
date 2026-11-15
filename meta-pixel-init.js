/* Meta Pixel initialization — loaded via <script src="/meta-pixel-init.js">.
   External file so script-src CSP allows it without unsafe-inline.
   Gated on marketing consent: reads localStorage key 'dv_cookies_ok'
   (set by cookie-consent.js). Pixel fires only when value === 'accepted'.
   Also listens for the consent update from cookie-consent.js via storage
   event so late-grant sessions initialize without a page reload.          */
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

  /* Check consent on page load (handles returning visitors who already accepted) */
  try {
    if (localStorage.getItem(CONSENT_KEY) === 'accepted') {
      loadPixel();
    }
  } catch (e) {}

  /* Listen for consent granted during this session (first-time visitors who click Accept) */
  window.addEventListener('storage', function (evt) {
    if (evt.key === CONSENT_KEY && evt.newValue === 'accepted') {
      loadPixel();
    }
  });
})();
