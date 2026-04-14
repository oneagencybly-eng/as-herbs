import { getProduct } from "@/lib/productStore";

const BenefitsSection = () => {
  const product = getProduct();

  return (
    <section id="benefits" className="py-12 md:py-20 bg-section-alt">
      <div className="container max-w-3xl space-y-6">
        <h2 className="text-3xl font-bold text-primary text-center">Benefits</h2>
        <div className="space-y-4 text-foreground leading-relaxed">
          {product.benefits.map((b, i) => (
            <p key={i}>{b}</p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
