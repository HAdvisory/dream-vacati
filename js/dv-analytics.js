// js/dv-analytics.js — DreamVacati centralized tool analytics
(function () {
  window.dvTrack = function (eventName, params) {
    try {
      if (typeof gtag === 'function') {
        gtag('event', eventName, Object.assign({ event_category: 'tools' }, params || {}));
      }
    } catch (e) {}
  };

  // Auto-fire tool_start for any page that has a [data-dv-tool] element
  document.addEventListener('DOMContentLoaded', function () {
    var toolEl = document.querySelector('[data-dv-tool]');
    if (toolEl) {
      window.dvTrack('tool_start', { tool_name: toolEl.getAttribute('data-dv-tool') });
    }
  });
})();
