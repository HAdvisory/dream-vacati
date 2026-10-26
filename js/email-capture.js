/**
 * email-capture.js — DreamVacati newsletter signup
 *
 * CURRENT STATE: Newsletter collection is not active.
 *
 * Current HTML contains static unavailable notices, not signup forms or
 * newsletter controls. Its disablement does not depend on this script.
 *
 * The legacy [data-dv-signup] replacement below is a defensive backstop
 * only. It sends no data and fires no analytics. It cannot protect old
 * cached signup HTML when JavaScript or this file is unavailable.
 *
 * A form with action="#" and method="post" can send fields to the current
 * document. Removing the form from the initial HTML is the safety control.
 */

(function () {
  'use strict';

  // ── Coming-soon replacement content ─────────────────────────────────────────

  // For standard footer newsletter columns (.dfg-newsletter-col)
  var FOOTER_PAUSED_HTML =
    '<div class="dfg-col-heading">Travel Updates Coming Soon</div>' +
    '<p class="dfg-newsletter-desc">' +
      'Newsletter updates are currently unavailable.' +
    '</p>' +
    '<p class="dfg-newsletter-desc" style="margin-top:.5rem">' +
      'In the meantime, explore DreamVacati’s free ' +
      '<a href="destination-comparison.html">destination guides</a> and ' +
      '<a href="tools.html">travel planning tools</a>.' +
    '</p>';

  // For the homepage hero signup section (.dv-email-signup)
  var HERO_PAUSED_HTML =
    '<h2 class="h4 mb-2">Travel Updates Coming Soon</h2>' +
    '<p class="mb-2" style="max-width:500px;margin:0 auto">' +
      'Newsletter updates are currently unavailable.' +
    '</p>' +
    '<p class="mb-0" style="max-width:500px;margin:0 auto">' +
      'In the meantime, explore DreamVacati’s free ' +
      '<a href="destination-comparison.html">destination guides</a> and ' +
      '<a href="tools.html">travel planning tools</a>.' +
    '</p>';

  // Fallback for any form not inside a recognised container
  var INLINE_PAUSED_HTML =
    '<div class="dv-newsletter-paused" role="status">' +
      '<p style="margin:0">' +
        '<strong>Travel Updates Coming Soon.</strong> ' +
        'Newsletter updates are currently unavailable.' +
      '</p>' +
    '</div>';

  // ── Form replacement ─────────────────────────────────────────────────────────

  function pauseForm(form) {
    // Belt-and-suspenders: prevent any submit that reaches the form element
    // (e.g., if JavaScript replaces the DOM after this listener is added).
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    var col    = form.closest('.dfg-newsletter-col');
    var hero   = form.closest('.dv-email-signup');

    if (col) {
      col.innerHTML = FOOTER_PAUSED_HTML;
    } else if (hero) {
      hero.innerHTML = HERO_PAUSED_HTML;
    } else {
      form.innerHTML = INLINE_PAUSED_HTML;
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    var forms = document.querySelectorAll('[data-dv-signup]');
    forms.forEach(pauseForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
