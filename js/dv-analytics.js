// js/dv-analytics.js — DreamVacati centralized tool analytics
//
// Event taxonomy (active from 2026-10-12):
//   tool_view     — a [data-dv-tool] element has entered the viewport (any pixel
//                   visible; uses threshold [0,0.25] so tall sections always fire).
//                   Replaces the pre-2026-10-12 tool_start that fired on page load.
//   tool_start    — visitor's first meaningful interaction with a specific tool
//                   (first input/click inside a tool container). Emitted by each
//                   tool's own interaction handler in main.js / tools.html inline JS.
//   tool_complete — tool produced a usable result (list generated, results shown).
//                   Emitted per-tool alongside legacy tool_used for continuity.
//   requirements_lookup — visitor requested entry requirements for a destination.
//   comparison_generated — destination comparison rendered a result.
//   filter_applied — filter or sort changed within the Tourism Demand Index.
//
// Legacy events preserved for GA4 continuity:
//   tool_used — kept in parallel with tool_complete; deprecate after 30-day
//               overlap period once tool_complete volume is confirmed.
(function () {
  window.dvTrack = function (eventName, params) {
    try {
      if (typeof gtag === 'function') {
        gtag('event', eventName, Object.assign({ event_category: 'tools' }, params || {}));
      }
    } catch (e) {}
  };

  // Fire tool_view when each [data-dv-tool] element enters the viewport.
  // threshold [0, 0.25]: fires at any-pixel-visible (0) so that elements taller
  // than 4× the viewport height always trigger — a tool taller than the viewport
  // can never reach 25% intersection ratio, so threshold 0.25 alone would silently
  // suppress the event on mobile. Checking isIntersecting in the callback ensures
  // we only fire on entry (not exit). Each element is unobserved after first fire.
  document.addEventListener('DOMContentLoaded', function () {
    var toolEls = document.querySelectorAll('[data-dv-tool]');
    if (!toolEls.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            window.dvTrack('tool_view', {
              tool_name: entry.target.getAttribute('data-dv-tool')
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: [0, 0.25] });

      toolEls.forEach(function (el) { observer.observe(el); });
    } else {
      // Fallback for browsers without IntersectionObserver support
      toolEls.forEach(function (el) {
        window.dvTrack('tool_view', { tool_name: el.getAttribute('data-dv-tool') });
      });
    }
  });
})();
