import heroImg from "@/assets/hero-product.jpg";

export interface ProductData {
  name: string;
  tagline: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
  benefits: string[];
  heroTitle: string;
  heroHighlight: string;
}

const defaultProduct: ProductData = {
  name: "Playnight 2-in-1 कॉम्बो पैक",
  tagline: "2-in-1 कॉम्बो पैक",
  description: "​",
  price: "1499",
  originalPrice: "2999",
  discount: "50",
  imageUrl: "",
  benefits: [
    "जब मैंने पहली बार गोली ली थी तो मैं और मेरी बीवी एक घंटे तक सेक्स करते रहे थे। मेरा पहले इतना खड़ा नहीं हुआ: मेरा पत्थर जैसा सख्ती से खड़ा था।",
    "दो हफ्ते बाद मैंने अपनी बीवी को सेक्स के समय आहें भरते सुना। मैंने उससे पूछा कि उसे दर्द तो नहीं हो रहा। ऐसा नहीं था, उसे असल में पहली बार ओरगाज़्म मिला था।",
    "हालाँकि मैं देख सकता था कि मेरा लिंग दिन-ब-दिन बड़ा होता जा रहा है, फिर भी मुझे ऐसे परिणामों की उम्मीद नहीं थी. छह सेंटीमीटर जितना!",
  ],
  heroTitle: "Playnight से",
  heroHighlight: "30 दिन में आपके लिंग का आकार 8 इंच हो जाएगा",
};

export function getProduct(): ProductData {
  try {
    const saved = localStorage.getItem("product_data");
    if (saved) {
      return { ...defaultProduct, ...JSON.parse(saved) };
    }
  } catch {}
  return defaultProduct;
}

export function saveProduct(data: ProductData) {
  localStorage.setItem("product_data", JSON.stringify(data));
}

export function getDefaultHeroImage() {
  return heroImg;
}

export { defaultProduct };
