import { useEffect } from "react";

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export const trackPixelEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.fbq) {
    if (params) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }
  }
};

const MetaPixel = () => {
  const pixelId = localStorage.getItem("meta_pixel_id");

  useEffect(() => {
    if (!pixelId || pixelId.trim() === "") return;

    // Prevent duplicate injection
    if (document.getElementById("meta-pixel-script")) return;

    // Inject fbq script
    const script = document.createElement("script");
    script.id = "meta-pixel-script";
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Inject noscript fallback in body
    const noscript = document.createElement("noscript");
    noscript.id = "meta-pixel-noscript";
    const img = document.createElement("img");
    img.height = 1;
    img.width = 1;
    img.style.display = "none";
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);

    return () => {
      document.getElementById("meta-pixel-script")?.remove();
      document.getElementById("meta-pixel-noscript")?.remove();
    };
  }, [pixelId]);

  return null;
};

export default MetaPixel;
