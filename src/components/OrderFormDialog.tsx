import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, CheckCircle, Loader2 } from "lucide-react";
import { getProduct } from "@/lib/productStore";
import { supabase } from "@/integrations/supabase/client";
import { syncOrderToSheet } from "@/lib/sheetSync";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderFormDialog = ({ open, onOpenChange }: OrderFormDialogProps) => {
  const navigate = useNavigate();
  const product = getProduct();
  const [form, setForm] = useState({ name: "", number: "", address: "", pincode: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "नाम डालें";
    if (!/^\d{10}$/.test(form.number)) errs.number = "10 अंकों का मोबाइल नंबर डालें";
    if (!form.address.trim()) errs.address = "पता डालें";
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = "6 अंकों का पिनकोड डालें";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getClientIp = async (): Promise<string | null> => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip || null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Get client IP
      const ip = await getClientIp();

      // Check for duplicate order from same IP
      if (ip) {
        const { data: existing } = await supabase
          .from("orders")
          .select("id")
          .eq("ip_address", ip)
          .limit(1);

        if (existing && existing.length > 0) {
          setErrors({ form: "आपने पहले से एक ऑर्डर किया है। डुप्लीकेट ऑर्डर नहीं हो सकता।" });
          setLoading(false);
          return;
        }
      }

      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const orderId = `ORD${String((count || 0) + 1).padStart(4, "0")}`;

      const { error } = await supabase.from("orders").insert({
        order_id: orderId,
        name: form.name,
        phone: form.number,
        address: form.address,
        pincode: form.pincode,
        amount: Number(product.price) || 1499,
        ip_address: ip,
      } as any);

      if (error) throw error;

      // Sync to Google Sheet
      syncOrderToSheet({
        order_id: orderId,
        name: form.name,
        phone: form.number,
        address: form.address,
        pincode: form.pincode,
        amount: Number(product.price) || 1499,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      onOpenChange(false);
      navigate("/thank-you", { state: { name: form.name, phone: form.number, orderId } });
    } catch (err) {
      console.error("Order error:", err);
      setErrors({ form: "ऑर्डर प्लेस करने में समस्या हुई। दोबारा कोशिश करें।" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (value: boolean) => {
    if (!value && submitted) {
      setSubmitted(false);
      setForm({ name: "", number: "", address: "", pincode: "" });
      setErrors({});
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">ऑर्डर सफल! 🎉</h2>
            <p className="text-muted-foreground">
              आपका ऑर्डर रिसीव हो गया है। Cash on Delivery से डिलीवरी होगी।
            </p>
            <p className="text-sm text-muted-foreground">
              {form.name} — {form.number}
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">बंद करें</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl">🛒 COD ऑर्डर करें</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {product.name} — <span className="font-bold text-primary">₹{product.price}</span>
                <span className="line-through text-muted-foreground ml-2">₹{product.originalPrice}</span>
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input placeholder="आपका नाम" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Input placeholder="मोबाइल नंबर (10 अंक)" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" />
                {errors.number && <p className="text-xs text-destructive mt-1">{errors.number}</p>}
              </div>
              <div>
                <Textarea placeholder="पूरा पता (मकान नंबर, गली, शहर)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} />
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
              </div>
              <div>
                <Input placeholder="पिनकोड (6 अंक)" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" />
                {errors.pincode && <p className="text-xs text-destructive mt-1">{errors.pincode}</p>}
              </div>
              {errors.form && <p className="text-sm text-destructive text-center">{errors.form}</p>}
              <Button type="submit" size="lg" className="w-full text-lg font-bold gap-2 py-6" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                {loading ? "ऑर्डर हो रहा है..." : "ऑर्डर करें — Cash on Delivery"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">💚 फ्री डिलीवरी • कोई एडवांस पेमेंट नहीं</p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderFormDialog;
