import { useEffect } from "react";

const GTMLoader = () => {
  useEffect(() => {
    // Load GTM
    const gtmId = localStorage.getItem("gtm_id");
    if (gtmId && gtmId.startsWith("GTM-") && !document.getElementById("gtm-script")) {
      const script = document.createElement("script");
      script.id = "gtm-script";
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
      document.head.appendChild(script);
      const noscript = document.createElement("noscript");
      noscript.id = "gtm-noscript";
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    // Load GA4
    const gaId = localStorage.getItem("ga_measurement_id");
    if (gaId && gaId.startsWith("G-") && !document.getElementById("ga-script")) {
      const script1 = document.createElement("script");
      script1.id = "ga-script";
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);
      const script2 = document.createElement("script");
      script2.id = "ga-config";
      script2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
      document.head.appendChild(script2);
    }
  }, []);

  return null;
};

export default GTMLoader;
