import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TelecallerLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !pin) {
      toast({ title: "❌ Phone और PIN दोनों डालें", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("telecallers")
        .select("*")
        .eq("phone", phone)
        .eq("pin", pin)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({ title: "❌ गलत Phone/PIN या account deactivate है", variant: "destructive" });
        return;
      }

      sessionStorage.setItem("telecallerAuth", "true");
      sessionStorage.setItem("telecallerId", data.id);
      sessionStorage.setItem("telecallerName", data.name);
      navigate("/telecaller/dashboard");
    } catch (err) {
      console.error(err);
      toast({ title: "❌ Login में error आया", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-section-alt p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">📞 Telecaller Login</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">अपना Phone और PIN डालें</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="pl-10"
                inputMode="numeric"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="pl-10"
                inputMode="numeric"
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
              {loading ? "Login हो रहा है..." : "Login करें"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelecallerLogin;
