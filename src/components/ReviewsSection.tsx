import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const reviews = [
  { name: "मतीन खान", date: "12 मार्च 2025", text: "मैंने Playnight कॉम्बो ऑर्डर की। लंड 2 इंच लंबा हो गया लेकिन मुझे इसे लेना बंद करना पड़ा क्योंकि मैं 3-4 बार सेक्स करना चाहता था।", initial: "म" },
  { name: "अमित शर्मा", date: "7 जनवरी 2026", text: "मैंने इसे ट्राय करके देखा है! ये वायाग्रा से भी ज़्यादा शक्तिशाली है और आपका लिंग बड़ा हो जाएगा!", initial: "अ" },
  { name: "सुनील वर्मा", date: "18 जुलाई 2025", text: "अब मैं और मेरी बीवी इस प्रोडक्ट को ट्राय करके देख चुके हैं और एकदम सरप्राइज़ हैं!", initial: "स" },
  { name: "विकास पटेल", date: "2 अप्रैल 2026", text: "लड़कियों, जरा मेरे रिज़ल्ट तो देखो", initial: "व" },
  { name: "करीम अंसारी", date: "29 नवंबर 2024", text: "अच्छा प्रॉडक्ट हैं मेरा ऐसा खड़ा होता है मानो किसी ब्लू फिल्म के हीरो का हो।", initial: "क" },
  { name: "दानिश", date: "15 जून 2025", text: "मैंने Playnight ऑर्डर की लंड 3 इंच लंबा हो गया, और रोज सुबह पत्थर जैसी सख्ती से खड़ा हो जाता था।", initial: "द" },
  { name: "अजीज", date: "9 सितंबर 2024", text: "मेरी वाइफ़ ने ऑर्डर किया, ये कोई धोखा देना नहीं है, यह औरत का अपने प्यार और रिश्ते को बचाए रखने का प्रयास है।", initial: "अ" },
  { name: "अब्दुल रहमान", date: "21 फरवरी 2026", text: "अच्छा रिज़ल्ट मिल जाएगा! दोस्तों आराम से नहीं तो पैंट की फिटिंग नहीं आएगी।", initial: "अ" },
];

const ReviewsSection = () => (
  <section className="py-12 md:py-20">
    <div className="container">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        ⭐ ग्राहकों का अनुभव
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((r, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {r.initial}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.date}</div>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-gold text-gold" />)}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{r.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default ReviewsSection;
