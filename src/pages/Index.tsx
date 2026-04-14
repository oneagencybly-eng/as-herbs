import { useState } from "react";
import TopBanner from "@/components/TopBanner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import ReviewsSection from "@/components/ReviewsSection";
import OrderCTA from "@/components/OrderCTA";
import OrderFormDialog from "@/components/OrderFormDialog";
import MetaPixel from "@/components/MetaPixel";
import Footer from "@/components/Footer";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

const Index = () => {
  const [orderOpen, setOrderOpen] = useState(false);
  useVisitorTracking();

  return (
    <div className="min-h-screen">
      <MetaPixel />
      <TopBanner />
      <Navbar />
      <HeroSection onOrderClick={() => setOrderOpen(true)} />
      <BenefitsSection />
      <BeforeAfterSection />
      <ReviewsSection />
      <OrderCTA onOrderClick={() => setOrderOpen(true)} />
      <OrderFormDialog open={orderOpen} onOpenChange={setOrderOpen} />
      <Footer />
    </div>
  );
};

export default Index;
