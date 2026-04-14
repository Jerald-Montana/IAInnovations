/*
  Set this to your real GA4 Measurement ID before deployment.
  Example: const GA4_MEASUREMENT_ID = "G-ABC123XYZ9";
*/
const GA4_MEASUREMENT_ID = "";

(function initAnalytics() {
  if (!GA4_MEASUREMENT_ID || !/^G-[A-Z0-9]+$/i.test(GA4_MEASUREMENT_ID)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_MEASUREMENT_ID);
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID);
})();
