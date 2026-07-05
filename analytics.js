(function () {
  var GA4_ID = 'G-1ZRVGCMZ43';
  var CLARITY_ID = 'wyzjzrud6n';
  var hostname = window.location.hostname;
  var analyticsEnabled = hostname === 'asap.repair' || hostname === 'www.asap.repair';
  var gaLoaded = false;
  var clarityLoaded = false;
  var gaLoadTimer = null;
  var clarityLoadTimer = null;

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

  function clearScheduledTimer(timer) {
    if (timer) window.clearTimeout(timer);
  }

  function loadGoogleAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;
    clearScheduledTimer(gaLoadTimer);
    gaLoadTimer = null;
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID));
  }

  function loadClarityVendor() {
    if (clarityLoaded) return;
    clarityLoaded = true;
    clearScheduledTimer(clarityLoadTimer);
    clarityLoadTimer = null;
    loadScript('https://www.clarity.ms/tag/' + CLARITY_ID);
  }

  function loadAnalyticsVendors() {
    loadGoogleAnalytics();
    loadClarityVendor();
  }

  function runWhenIdle(callback, timeout) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: timeout });
      return;
    }
    callback();
  }

  window.repairAsapLoadAnalyticsVendors = loadAnalyticsVendors;
  window.repairAsapLoadGoogleAnalytics = loadGoogleAnalytics;

  function scheduleVendorLoad() {
    var interactionEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    interactionEvents.forEach(function (eventName) {
      window.addEventListener(eventName, loadAnalyticsVendors, { once: true, passive: true });
    });

    function scheduleAfterLoad() {
      gaLoadTimer = window.setTimeout(function () {
        runWhenIdle(loadGoogleAnalytics, 2000);
      }, 1500);

      clarityLoadTimer = window.setTimeout(function () {
        runWhenIdle(loadClarityVendor, 2500);
      }, 5500);
    }

    if (document.readyState === 'complete') {
      scheduleAfterLoad();
      return;
    }

    window.addEventListener('load', scheduleAfterLoad, { once: true });
  }

  scheduleVendorLoad();
})();
