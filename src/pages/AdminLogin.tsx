import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedEmail = localStorage.getItem("admin_email") || "admin@admin.com";
    const savedPassword = localStorage.getItem("admin_password") || "admin123";

    if (email === savedEmail && password === savedPassword) {
      sessionStorage.setItem("adminAuth", "true");
      navigate("/admin/dashboard");
    } else {
      setError("❌ गलत Email या Password!");
    }
  };

  const panelName = localStorage.getItem("admin_panel_name") || "Admin Panel";

  return (
    <div className="min-h-screen flex items-center justify-center bg-section-alt p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Lock className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl">{panelName}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">अपना Email और Password डालें</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full gap-2">
              <Lock className="h-4 w-4" /> Login करें
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Default: admin@admin.com / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
