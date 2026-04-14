import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSettings, setLogoSettings] = useState({ height: 32, maxWidth: 160 });

  useEffect(() => {
    setLogo(localStorage.getItem("site_logo"));
    try {
      const s = JSON.parse(localStorage.getItem("site_logo_settings") || "{}");
      setLogoSettings({ height: s.height || 32, maxWidth: s.maxWidth || 160 });
    } catch {}
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b py-3">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Home</Link>
        </div>
        <Link to="/" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt="Logo" style={{ height: `${logoSettings.height}px`, maxWidth: `${logoSettings.maxWidth}px` }} className="object-contain" />
          ) : (
            <span className="text-primary text-sm font-extrabold">AS AYURVEDA</span>
          )}
        </Link>
        <div className="relative">
          <ShoppingCart className="h-5 w-5 text-foreground" />
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">1</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
