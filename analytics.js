(function () {
  var GA4_ID = 'G-1ZRVGCMZ43';
  var CLARITY_ID = 'wyzjzrud6n';
  var hostname = window.location.hostname;
  var analyticsEnabled = hostname === 'asap.repair' || hostname === 'www.asap.repair';
  var vendorsLoaded = false;
  var vendorLoadTimer = null;

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
    if (vendorsLoaded) return;
    vendorsLoaded = true;
    if (vendorLoadTimer) {
      window.clearTimeout(vendorLoadTimer);
      vendorLoadTimer = null;
    }
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID));
    loadScript('https://www.clarity.ms/tag/' + CLARITY_ID);
  }

  window.repairAsapLoadAnalyticsVendors = loadAnalyticsVendors;

  function scheduleVendorLoad() {
    var interactionEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    interactionEvents.forEach(function (eventName) {
      window.addEventListener(eventName, loadAnalyticsVendors, { once: true, passive: true });
    });

    function scheduleAfterLoad() {
      vendorLoadTimer = window.setTimeout(function () {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(loadAnalyticsVendors, { timeout: 2000 });
          return;
        }
        loadAnalyticsVendors();
      }, 4500);
    }

    if (document.readyState === 'complete') {
      scheduleAfterLoad();
      return;
    }

    window.addEventListener('load', scheduleAfterLoad, { once: true });
  }

  scheduleVendorLoad();
})();
