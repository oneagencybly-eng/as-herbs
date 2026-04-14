import { CheckCircle, XCircle } from "lucide-react";

const items = [
  { before: "छोटा और ढीला लिंग", after: "बड़ा और सख्त लिंग", iconB: XCircle, iconA: CheckCircle },
  { before: "शीघ्रपतन, कम सेक्स अवधि", after: "नॉनस्टॉप +45 मिनट सेक्स", iconB: XCircle, iconA: CheckCircle },
];

interface BeforeAfterImages {
  beforeImg?: string;
  afterImg?: string;
}

const defaultImages: BeforeAfterImages = {
  beforeImg: "",
  afterImg: "",
};

function getBeforeAfterImages(): BeforeAfterImages {
  try {
    const saved = localStorage.getItem("before_after_images");
    if (saved) return { ...defaultImages, ...JSON.parse(saved) };
  } catch {}
  return defaultImages;
}

const BeforeAfterSection = () => {
  const images = getBeforeAfterImages();

  return (
    <section className="py-12 md:py-20">
      <div className="container max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          पहले | Playnight के बाद
        </h2>

        {/* Images Row */}
        {(images.beforeImg || images.afterImg) && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {images.beforeImg && (
              <div className="text-center">
                <p className="text-sm font-semibold text-destructive mb-2">पहले ❌</p>
                <img src={images.beforeImg} alt="Before" className="rounded-xl w-full object-cover max-h-[250px]" />
              </div>
            )}
            {images.afterImg && (
              <div className="text-center">
                <p className="text-sm font-semibold text-primary mb-2">बाद में ✅</p>
                <img src={images.afterImg} alt="After" className="rounded-xl w-full object-cover max-h-[250px]" />
              </div>
            )}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-3 bg-destructive/10 rounded-xl p-4">
                <item.iconB className="h-6 w-6 text-destructive shrink-0" />
                <span className="font-medium text-foreground">{item.before}</span>
              </div>
              <div className="flex items-center gap-3 bg-primary/10 rounded-xl p-4">
                <item.iconA className="h-6 w-6 text-primary shrink-0" />
                <span className="font-medium text-foreground">{item.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
