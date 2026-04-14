import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

interface ContactData {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
}

const defaultContact: ContactData = {
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
};

export function getContactData(): ContactData {
  try {
    const saved = localStorage.getItem("contact_data");
    if (saved) return { ...defaultContact, ...JSON.parse(saved) };
  } catch {}
  return defaultContact;
}

export function saveContactData(data: ContactData) {
  localStorage.setItem("contact_data", JSON.stringify(data));
}

const Footer = () => {
  const contact = getContactData();
  const hasContact = contact.phone || contact.whatsapp || contact.email || contact.address;

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-10 text-primary-foreground bg-secondary-foreground">
        <div className="grid sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-3xl text-primary-foreground text-center">AS AYURVEDA</h3>
            <p className="text-sm opacity-70">
              100% आयुर्वेदिक प्रोडक्ट — प्राकृतिक और सुरक्षित। आपकी सेहत, हमारी ज़िम्मेदारी।
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider opacity-80">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="#benefits" className="hover:text-primary transition-colors">फायदे</a></li>
              <li><a href="#reviews" className="hover:text-primary transition-colors">Reviews</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider opacity-80">Contact Us</h4>
            {hasContact ? (
              <ul className="space-y-2 text-sm opacity-70">
                {contact.phone && (
                  <li>
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Phone className="h-4 w-4 shrink-0" /> {contact.phone}
                    </a>
                  </li>
                )}
                {contact.whatsapp && (
                  <li>
                    <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4 shrink-0" /> WhatsApp: {contact.whatsapp}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Mail className="h-4 w-4 shrink-0" /> {contact.email}
                    </a>
                  </li>
                )}
                {contact.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {contact.address}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm opacity-50">Contact details Admin Panel से add करें।</p>
            )}
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-6 text-center text-xs opacity-50">
          © {new Date().getFullYear()} AS Ayurveda. सभी अधिकार सुरक्षित।
        </div>
      </div>
    </footer>
  );
};

export default Footer;
