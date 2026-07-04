(function () {
  var GA4_ID = 'G-1ZRVGCMZ43';
  var CLARITY_ID = 'wyzjzrud6n';
  var hostname = window.location.hostname;
  var analyticsEnabled = hostname === 'asap.repair' || hostname === 'www.asap.repair';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  if (!analyticsEnabled) {
    window.repairAsapAnalyticsEnabled = false;
    return;
  }

  window.repairAsapAnalyticsEnabled = true;

  window.gtag('js', new Date());
  window.gtag('config', GA4_ID);

  window.clarity = window.clarity || function clarity() {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };

  function loadScript(src) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  function loadAnalyticsVendors() {
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID));
    loadScript('https://www.clarity.ms/tag/' + CLARITY_ID);
  }

  function scheduleVendorLoad() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAnalyticsVendors, { timeout: 2500 });
      return;
    }

    window.addEventListener('load', function () {
      window.setTimeout(loadAnalyticsVendors, 800);
    }, { once: true });
  }

  scheduleVendorLoad();
})();
