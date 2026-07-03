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

  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
  document.head.appendChild(gaScript);

  window.gtag('js', new Date());
  window.gtag('config', GA4_ID);

  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () {
      (c[a].q = c[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);
})();
