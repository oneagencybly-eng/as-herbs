import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Package, Truck, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, phone, orderId } = (location.state as { name?: string; phone?: string; orderId?: string }) || {};

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-16 w-16 text-primary animate-countdown-pulse" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
          धन्यवाद! 🎉
        </h1>
        <p className="text-lg text-muted-foreground">
          आपका ऑर्डर सफलतापूर्वक प्लेस हो गया है।
        </p>

        {orderId && (
          <div className="bg-primary/10 rounded-xl p-4 space-y-1">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="text-xl font-bold text-primary">{orderId}</p>
          </div>
        )}

        {name && (
          <div className="bg-card rounded-xl border p-4 space-y-2 text-left">
            <p className="text-sm text-muted-foreground">👤 नाम: <span className="text-foreground font-medium">{name}</span></p>
            <p className="text-sm text-muted-foreground">📱 नंबर: <span className="text-foreground font-medium">{phone}</span></p>
          </div>
        )}

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span>आपका ऑर्डर 3-5 दिन में डिलीवर होगा</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <span>Cash on Delivery — कोई एडवांस पेमेंट नहीं</span>
          </div>
        </div>

        <Button size="lg" className="w-full text-lg font-bold gap-2 py-6" onClick={() => navigate("/")}>
          <Home className="h-5 w-5" />
          होम पेज पर जाएं
        </Button>
      </div>
    </div>
  );
};

export default ThankYou;
