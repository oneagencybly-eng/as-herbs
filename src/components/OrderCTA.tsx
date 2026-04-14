import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderCTAProps {
  onOrderClick?: () => void;
}

const OrderCTA = ({ onOrderClick }: OrderCTAProps) => (
  <section className="py-12 md:py-20 bg-primary text-primary-foreground">
    <div className="container text-center space-y-6">
      <h2 className="text-2xl md:text-4xl font-bold">Playnight कॉम्बो अभी ऑर्डर करें</h2>
      <p className="text-lg opacity-90">4-in-1 आयुर्वेदिक पावर पैक — सीमित समय ऑफ़र!</p>
      <Button size="lg" variant="secondary" className="text-lg px-10 py-6 font-bold gap-2 text-center" onClick={onOrderClick}>
        <ShoppingCart className="h-5 w-5" />
        Cash on Delivery से ऑर्डर करें
      </Button>
    </div>
  </section>
);

export default OrderCTA;
