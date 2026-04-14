import { ShoppingCart, Truck, IndianRupee, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "./CountdownTimer";
import { getProduct, getDefaultHeroImage } from "@/lib/productStore";

interface HeroSectionProps {
  onOrderClick?: () => void;
}

const HeroSection = ({ onOrderClick }: HeroSectionProps) => {
  const product = getProduct();
  const imgSrc = product.imageUrl || getDefaultHeroImage();

  return (
    <section className="bg-hero-gradient py-10 md:py-16">
      <div className="container grid md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <img
            src={imgSrc}
            alt={product.name}
            className="rounded-2xl shadow-2xl max-w-full w-[450px] animate-float"
            width={450}
            height={450}
          />
        </div>
        <div className="space-y-5 text-center -my-[10px]">
          <Badge variant="outline" className="border-primary text-primary font-semibold px-4 py-1 text-center">
            ⊕ {product.tagline}
          </Badge>
          <h1 className="md:text-5xl font-extrabold leading-tight text-foreground text-center text-2xl">
            {product.heroTitle} <span className="text-primary font-extrabold">{product.heroHighlight}</span>
          </h1>
          
          <div className="flex items-center gap-3 text-center justify-center">
            <span className="line-through text-muted-foreground text-lg">₹{product.originalPrice}</span>
            <span className="text-3xl font-bold text-primary">₹{product.price}</span>
            <span className="badge-discount text-sm font-bold px-3 py-1 rounded-full">{product.discount}% OFF</span>
          </div>
          <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6 font-bold gap-2 animate-[shake_0.5s_ease-in-out_1] shadow-[0_0_15px_hsl(var(--primary)/0.5),0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.7),0_0_40px_hsl(var(--primary)/0.4)] transition-shadow" onClick={onOrderClick}>
            <ShoppingCart className="h-5 w-5" />
            अभी ऑर्डर करें – COD
          </Button>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> फ्री डिलीवरी</span>
            <span className="flex items-center gap-1 text-right"><IndianRupee className="h-4 w-4" /> COD उपलब्ध</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> 127 लोग अभी देख रहे हैं</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> ऑफ़र जल्दी खत्म होगा</span>
          </div>
          <CountdownTimer />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
