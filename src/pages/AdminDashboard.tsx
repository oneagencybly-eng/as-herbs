import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, Users, LogOut, Star, Trash2, Plus, Save, Image, RefreshCw, Phone, Mail, MapPin, MessageCircle, FileSpreadsheet, Link, Unlink, Edit, Loader2, Eye, EyeOff, Lock, UserPlus, UserCheck, UserX, CalendarIcon, Filter, Download, Upload, Globe, Plug, PlugZap, Settings2, Copy, CheckCircle2, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isToday, isYesterday, subDays, startOfMonth, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { getProduct, saveProduct, type ProductData } from "@/lib/productStore";
import { useLiveVisitorCount } from "@/hooks/useLiveVisitorCount";
import { getContactData, saveContactData } from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  order_id: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  status: string;
  amount: number;
  created_at: string;
}

interface Review {
  name: string;
  text: string;
  date: string;
  rating: number;
}

const defaultReviews: Review[] = [
  { name: "मतीन खान", text: "बहुत बढ़िया प्रोडक्ट!", date: "12 मार्च 2025", rating: 5 },
  { name: "अमित शर्मा", text: "शानदार रिजल्ट!", date: "7 जनवरी 2026", rating: 5 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const liveVisitors = useLiveVisitorCount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("admin_reviews");
    return saved ? JSON.parse(saved) : defaultReviews;
  });
  const [newReview, setNewReview] = useState({ name: "", text: "", date: "" });
  const [product, setProduct] = useState<ProductData>(getProduct());
  const [newBenefit, setNewBenefit] = useState("");
  const [panelName, setPanelName] = useState(() => localStorage.getItem("admin_panel_name") || "🛠 Admin Panel");
  const [editingPanelName, setEditingPanelName] = useState(false);
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem("admin_password") || "admin123");
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem("admin_email") || "admin@admin.com");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [beforeAfterImages, setBeforeAfterImages] = useState(() => {
    try {
      const saved = localStorage.getItem("before_after_images");
      return saved ? JSON.parse(saved) : { beforeImg: "", afterImg: "" };
    } catch { return { beforeImg: "", afterImg: "" }; }
  });
  const [contactData, setContactData] = useState(getContactData());
  const [sheetConfig, setSheetConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("google_sheet_config");
      return saved ? JSON.parse(saved) : { webhookUrl: "", isConnected: false };
    } catch { return { webhookUrl: "", isConnected: false }; }
  });
  const [gtmId, setGtmId] = useState(() => localStorage.getItem("gtm_id") || "");
  const [gaId, setGaId] = useState(() => localStorage.getItem("ga_measurement_id") || "");
  const [sheetEditing, setSheetEditing] = useState(false);
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [testingSheet, setTestingSheet] = useState(false);

  // CRM Integration state
  interface CRMConfig {
    id: string;
    name: string;
    apiUrl: string;
    apiKey: string;
    method: string;
    headers: string;
    isConnected: boolean;
    lastSync: string | null;
  }
  const [crmList, setCrmList] = useState<CRMConfig[]>(() => {
    try {
      const saved = localStorage.getItem("crm_integrations");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [newCrm, setNewCrm] = useState<Omit<CRMConfig, "id" | "isConnected" | "lastSync">>({ name: "", apiUrl: "", apiKey: "", method: "GET", headers: "" });
  const [testingCrmId, setTestingCrmId] = useState<string | null>(null);
  const [crmTestResult, setCrmTestResult] = useState<{ id: string; success: boolean; data?: any; error?: string } | null>(null);
  const [addingCrm, setAddingCrm] = useState(false);

  useEffect(() => {
    localStorage.setItem("crm_integrations", JSON.stringify(crmList));
  }, [crmList]);

  const addCrm = () => {
    if (!newCrm.name || !newCrm.apiUrl) {
      toast({ title: "❌ CRM का नाम और API URL डालें", variant: "destructive" });
      return;
    }
    const crm: CRMConfig = {
      id: Date.now().toString(),
      ...newCrm,
      isConnected: true,
      lastSync: null,
    };
    setCrmList([...crmList, crm]);
    setNewCrm({ name: "", apiUrl: "", apiKey: "", method: "GET", headers: "" });
    setAddingCrm(false);
    toast({ title: `✅ ${crm.name} CRM जोड़ दिया गया!` });
  };

  const removeCrm = (id: string) => {
    setCrmList(crmList.filter(c => c.id !== id));
    toast({ title: "🗑 CRM हटा दिया गया!" });
  };

  const testCrmConnection = async (crm: CRMConfig) => {
    setTestingCrmId(crm.id);
    setCrmTestResult(null);
    try {
      const hdrs: Record<string, string> = { "Content-Type": "application/json" };
      if (crm.apiKey) hdrs["Authorization"] = `Bearer ${crm.apiKey}`;
      if (crm.headers) {
        try {
          const custom = JSON.parse(crm.headers);
          Object.assign(hdrs, custom);
        } catch {}
      }
      const resp = await fetch(crm.apiUrl, { method: crm.method, headers: hdrs });
      if (resp.ok) {
        const data = await resp.json().catch(() => ({ status: "ok" }));
        setCrmTestResult({ id: crm.id, success: true, data });
        setCrmList(crmList.map(c => c.id === crm.id ? { ...c, lastSync: new Date().toISOString() } : c));
        toast({ title: `✅ ${crm.name} connection successful!` });
      } else {
        setCrmTestResult({ id: crm.id, success: false, error: `HTTP ${resp.status}: ${resp.statusText}` });
        toast({ title: `❌ ${crm.name} connection failed`, description: `Status: ${resp.status}`, variant: "destructive" });
      }
    } catch (err: any) {
      setCrmTestResult({ id: crm.id, success: false, error: err.message });
      toast({ title: `❌ Connection error`, description: err.message, variant: "destructive" });
    } finally {
      setTestingCrmId(null);
    }
  };
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<"all" | "today" | "yesterday" | "last_month" | "custom">("all");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    if (orderFilter === "today") return orders.filter(o => isToday(new Date(o.created_at)));
    if (orderFilter === "yesterday") return orders.filter(o => isYesterday(new Date(o.created_at)));
    if (orderFilter === "last_month") {
      const start = startOfMonth(subMonths(new Date(), 1));
      const end = startOfMonth(new Date());
      return orders.filter(o => {
        const d = new Date(o.created_at);
        return d >= start && d < end;
      });
    }
    if (orderFilter === "custom" && customDate) {
      return orders.filter(o => {
        const d = new Date(o.created_at);
        return d.toDateString() === customDate.toDateString();
      });
    }
    return orders;
  }, [orders, orderFilter, customDate]);

  // Telecaller state
  interface Telecaller { id: string; name: string; phone: string; pin: string; is_active: boolean; }
  const [telecallers, setTelecallers] = useState<Telecaller[]>([]);
  const [newTelecaller, setNewTelecaller] = useState({ name: "", phone: "", pin: "" });
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedTelecallerId, setSelectedTelecallerId] = useState("");

  const fetchTelecallers = async () => {
    const { data } = await supabase.from("telecallers").select("*").order("created_at", { ascending: false });
    if (data) setTelecallers(data as Telecaller[]);
  };

  const addTelecaller = async () => {
    if (!newTelecaller.name || !newTelecaller.phone || !newTelecaller.pin) {
      toast({ title: "❌ सभी fields भरें", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("telecallers").insert(newTelecaller as any);
    if (error) {
      toast({ title: "❌ Error — शायद यह phone already registered है", variant: "destructive" });
      return;
    }
    setNewTelecaller({ name: "", phone: "", pin: "" });
    fetchTelecallers();
    toast({ title: "✅ Telecaller जोड़ दिया गया!" });
  };

  const toggleTelecaller = async (id: string, active: boolean) => {
    await supabase.from("telecallers").update({ is_active: active } as any).eq("id", id);
    fetchTelecallers();
  };

  const deleteTelecaller = async (id: string) => {
    await supabase.from("telecallers").delete().eq("id", id);
    fetchTelecallers();
    toast({ title: "🗑 Telecaller हटा दिया गया!" });
  };

  const assignOrder = async (orderId: string, telecallerId: string) => {
    if (!telecallerId) return;
    const { error } = await supabase.from("order_assignments").upsert(
      { order_id: orderId, telecaller_id: telecallerId } as any,
      { onConflict: "order_id,telecaller_id" }
    );
    if (error) {
      toast({ title: "❌ Assign करने में error", variant: "destructive" });
    } else {
      toast({ title: "✅ Order assign हो गया!" });
      setAssigningOrderId(null);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  // Fetch orders from database
  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoadingOrders(false);
  };

  useEffect(() => {
    fetchOrders();
    fetchTelecallers();
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_reviews", JSON.stringify(reviews));
  }, [reviews]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    navigate("/admin");
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      toast({ title: "✅ Status अपडेट हो गया!" });
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("क्या आप यह order delete करना चाहते हैं?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (!error) {
      setOrders(orders.filter(o => o.id !== id));
      toast({ title: "🗑 Order delete हो गया!" });
    } else {
      toast({ title: "❌ Delete में error", variant: "destructive" });
    }
  };

  const saveEditedOrder = async () => {
    if (!editingOrder) return;
    const { error } = await supabase.from("orders").update({
      name: editingOrder.name,
      phone: editingOrder.phone,
      address: editingOrder.address,
      pincode: editingOrder.pincode,
      amount: editingOrder.amount,
    }).eq("id", editingOrder.id);
    if (!error) {
      setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
      setEditingOrder(null);
      toast({ title: "✅ Order अपडेट हो गया!" });
    } else {
      toast({ title: "❌ Update में error", variant: "destructive" });
    }
  };

  const exportOrdersCSV = () => {
    const data = filteredOrders.length > 0 ? filteredOrders : orders;
    if (data.length === 0) {
      toast({ title: "❌ Export करने के लिए कोई order नहीं है", variant: "destructive" });
      return;
    }
    const headers = ["Order ID", "Name", "Phone", "Address", "Pincode", "Amount", "Status", "Date"];
    const rows = data.map(o => [
      o.order_id, o.name, o.phone, `"${o.address.replace(/"/g, '""')}"`, o.pincode, o.amount, o.status, new Date(o.created_at).toLocaleDateString("hi-IN")
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `✅ ${data.length} orders export हो गए!` });
  };

  const importFileRef = document.createElement("input");

  const handleImportOrders = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) {
      toast({ title: "❌ File में data नहीं है", variant: "destructive" });
      return;
    }
    // Skip header row
    const dataLines = lines.slice(1);
    let imported = 0;
    for (const line of dataLines) {
      // Parse CSV - handle quoted fields
      const cols = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, "").trim()) || [];
      if (cols.length < 5) continue;
      const [order_id_raw, name, phone, address, pincode, amountStr, statusStr] = cols;
      const amount = Number(amountStr) || 0;
      const status = statusStr || "pending";
      // Generate order ID if not present
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const order_id = order_id_raw || `ORD${String((count || 0) + 1).padStart(4, "0")}`;
      const { error } = await supabase.from("orders").insert({
        order_id, name: name || "N/A", phone: phone || "0000000000",
        address: address || "N/A", pincode: pincode || "000000", amount, status,
      });
      if (!error) imported++;
    }
    toast({ title: `✅ ${imported} orders import हो गए!` });
    fetchOrders();
    e.target.value = "";
  };

  const addReview = () => {
    if (newReview.name && newReview.text) {
      setReviews([...reviews, { ...newReview, date: newReview.date || new Date().toLocaleDateString("hi-IN"), rating: 5 }]);
      setNewReview({ name: "", text: "", date: "" });
      toast({ title: "✅ Review जोड़ दिया गया!" });
    }
  };

  const deleteReview = (index: number) => {
    setReviews(reviews.filter((_, i) => i !== index));
  };

  const handleSaveProduct = () => {
    saveProduct(product);
    toast({ title: "✅ प्रोडक्ट अपडेट हो गया!", description: "Landing page पर changes दिखेंगे।" });
  };

  const updateProduct = (field: keyof ProductData, value: string) => {
    setProduct({ ...product, [field]: value });
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setProduct({ ...product, benefits: [...product.benefits, newBenefit.trim()] });
      setNewBenefit("");
    }
  };

  const deleteBenefit = (index: number) => {
    setProduct({ ...product, benefits: product.benefits.filter((_, i) => i !== index) });
  };

  const statusColor = (s: string) => {
    if (s === "pending") return "destructive" as const;
    if (s === "shipped") return "secondary" as const;
    if (s === "follow_up") return "outline" as const;
    if (s === "cancelled") return "destructive" as const;
    return "default" as const;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    revenue: orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.amount, 0),
  };

  return (
    <div className="min-h-screen bg-section-alt">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          {editingPanelName ? (
            <div className="flex items-center gap-2">
              <Input
                className="h-8 text-lg font-bold w-48"
                value={panelName}
                onChange={(e) => setPanelName(e.target.value)}
                autoFocus
              />
              <Button size="sm" className="h-8 text-xs" onClick={() => {
                localStorage.setItem("admin_panel_name", panelName);
                setEditingPanelName(false);
                toast({ title: "✅ Panel का नाम बदल दिया गया!" });
              }}>Save</Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => {
                setPanelName(localStorage.getItem("admin_panel_name") || "🛠 Admin Panel");
                setEditingPanelName(false);
              }}>✕</Button>
            </div>
          ) : (
            <h1
              className="text-xl font-bold text-primary cursor-pointer hover:opacity-80 flex items-center gap-1"
              onClick={() => setEditingPanelName(true)}
              title="Click करके नाम बदलें"
            >
              {panelName} <Edit className="h-3.5 w-3.5 text-muted-foreground" />
            </h1>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <div className="grid sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="relative">
                <Eye className="h-8 w-8 text-primary" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse border-2 border-background" />
              </div>
              <div>
                <div className="text-2xl font-bold">{liveVisitors}</div>
                <div className="text-sm text-muted-foreground">Live Visitors</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">कुल ऑर्डर</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Package className="h-8 w-8 text-gold" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending ऑर्डर</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">कुल Revenue</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="w-full justify-start flex-wrap">
            <TabsTrigger value="orders">📦 ऑर्डर</TabsTrigger>
            <TabsTrigger value="telecallers">📞 Telecallers</TabsTrigger>
            <TabsTrigger value="product">🛍 प्रोडक्ट</TabsTrigger>
            <TabsTrigger value="reviews">⭐ Reviews</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          </TabsList>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="mt-4 space-y-4">
            {/* Order Date Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {[
                { key: "all", label: "All Orders" },
                { key: "today", label: "Today" },
                { key: "yesterday", label: "Yesterday" },
                { key: "last_month", label: "Last Month" },
              ].map(f => (
                <Button
                  key={f.key}
                  size="sm"
                  variant={orderFilter === f.key ? "default" : "outline"}
                  className="text-xs"
                  onClick={() => setOrderFilter(f.key as typeof orderFilter)}
                >
                  {f.label}
                  {f.key !== "all" && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1">
                      {f.key === "today" ? orders.filter(o => isToday(new Date(o.created_at))).length
                        : f.key === "yesterday" ? orders.filter(o => isYesterday(new Date(o.created_at))).length
                        : orders.filter(o => { const d = new Date(o.created_at); const s = startOfMonth(subMonths(new Date(), 1)); const e = startOfMonth(new Date()); return d >= s && d < e; }).length}
                    </Badge>
                  )}
                </Button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant={orderFilter === "custom" ? "default" : "outline"}
                    className="text-xs gap-1"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    {orderFilter === "custom" && customDate ? format(customDate, "dd/MM/yyyy") : "Custom Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDate}
                    onSelect={(d) => { setCustomDate(d); setOrderFilter("custom"); }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {orderFilter !== "all" && (
                <span className="text-sm text-muted-foreground ml-2">
                  {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} मिले
                </span>
              )}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>ऑर्डर मैनेजमेंट</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportOrdersCSV} className="gap-1 text-xs">
                      <Download className="h-4 w-4" /> Export CSV
                    </Button>
                    <label>
                      <Button variant="outline" size="sm" className="gap-1 text-xs cursor-pointer" asChild>
                        <span><Upload className="h-4 w-4" /> Import CSV</span>
                      </Button>
                      <input type="file" accept=".csv,.txt" className="hidden" onChange={handleImportOrders} />
                    </label>
                    <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-1">
                      <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {loadingOrders ? (
                  <p className="text-center text-muted-foreground py-8">Loading orders...</p>
                ) : filteredOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">अभी कोई ऑर्डर नहीं है।</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>नाम</TableHead>
                        <TableHead>फ़ोन</TableHead>
                        <TableHead>पता</TableHead>
                        <TableHead>पिनकोड</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>तारीख</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map(order => (
                        <TableRow key={order.id}>
                          {editingOrder?.id === order.id ? (
                            <>
                              <TableCell className="font-mono text-sm">{order.order_id}</TableCell>
                              <TableCell><Input className="h-8 text-sm" value={editingOrder.name} onChange={(e) => setEditingOrder({ ...editingOrder, name: e.target.value })} /></TableCell>
                              <TableCell><Input className="h-8 text-sm" value={editingOrder.phone} onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })} /></TableCell>
                              <TableCell><Input className="h-8 text-sm" value={editingOrder.address} onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })} /></TableCell>
                              <TableCell><Input className="h-8 text-sm w-20" value={editingOrder.pincode} onChange={(e) => setEditingOrder({ ...editingOrder, pincode: e.target.value })} /></TableCell>
                              <TableCell><Input className="h-8 text-sm w-20" type="number" value={editingOrder.amount} onChange={(e) => setEditingOrder({ ...editingOrder, amount: Number(e.target.value) })} /></TableCell>
                              <TableCell>
                                <div>{new Date(order.created_at).toLocaleDateString("hi-IN")}</div>
                                <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                              </TableCell>
                              <TableCell><Badge variant={statusColor(order.status)}>{order.status}</Badge></TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" className="text-xs h-7 gap-1" onClick={saveEditedOrder}><Save className="h-3 w-3" /> Save</Button>
                                  <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setEditingOrder(null)}>✕</Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="font-mono text-sm">{order.order_id}</TableCell>
                              <TableCell>{order.name}</TableCell>
                              <TableCell>{order.phone}</TableCell>
                              <TableCell>{order.address}</TableCell>
                              <TableCell>{order.pincode}</TableCell>
                              <TableCell>₹{order.amount}</TableCell>
                              <TableCell>
                                <div>{new Date(order.created_at).toLocaleDateString("hi-IN")}</div>
                                <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusColor(order.status)}>{order.status}</Badge>
                              </TableCell>
                              <TableCell className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <a href={`tel:${order.phone}`} title="Call करें">
                                    <Button variant="outline" size="sm" className="gap-1 text-primary border-primary hover:bg-primary/10">
                                      <Phone className="h-4 w-4" /> Call
                                    </Button>
                                  </a>
                                  <select
                                    className="text-sm border rounded px-2 py-1 bg-background"
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="follow_up">Follow Up</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Order Done</option>
                                    <option value="cancelled">Order Cancel</option>
                                  </select>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => setEditingOrder(order)}>
                                    <Edit className="h-3 w-3" /> Edit
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs gap-1 h-7 text-destructive border-destructive hover:bg-destructive/10" onClick={() => deleteOrder(order.id)}>
                                    <Trash2 className="h-3 w-3" /> Delete
                                  </Button>
                                  {assigningOrderId === order.id ? (
                                    <div className="flex items-center gap-1">
                                      <select
                                        className="text-xs border rounded px-1 py-1 bg-background"
                                        value={selectedTelecallerId}
                                        onChange={(e) => setSelectedTelecallerId(e.target.value)}
                                      >
                                        <option value="">Telecaller चुनें</option>
                                        {telecallers.filter(t => t.is_active).map(t => (
                                          <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                      </select>
                                      <Button size="sm" variant="default" className="text-xs h-7" onClick={() => assignOrder(order.id, selectedTelecallerId)}>Assign</Button>
                                      <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setAssigningOrderId(null)}>✕</Button>
                                    </div>
                                  ) : (
                                    <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => { setAssigningOrderId(order.id); setSelectedTelecallerId(""); }}>
                                      <UserPlus className="h-3 w-3" /> Assign
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TELECALLERS TAB */}
          <TabsContent value="telecallers" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> नया Telecaller जोड़ें</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-4 gap-3">
                  <Input placeholder="नाम" value={newTelecaller.name} onChange={(e) => setNewTelecaller({ ...newTelecaller, name: e.target.value })} />
                  <Input placeholder="Phone (10 अंक)" value={newTelecaller.phone} onChange={(e) => setNewTelecaller({ ...newTelecaller, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" />
                  <Input placeholder="PIN (4-6 अंक)" type="password" value={newTelecaller.pin} onChange={(e) => setNewTelecaller({ ...newTelecaller, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" />
                  <Button onClick={addTelecaller} className="gap-2"><Plus className="h-4 w-4" /> जोड़ें</Button>
                </div>
                <p className="text-xs text-muted-foreground">Telecaller इस link से login करेगा: <code className="bg-muted px-1 rounded">/telecaller</code></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>📞 Telecaller Team</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchTelecallers} className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>
                </div>
              </CardHeader>
              <CardContent>
                {telecallers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">अभी कोई telecaller नहीं है। ऊपर से जोड़ें।</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>नाम</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>PIN</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {telecallers.map(tc => (
                        <TableRow key={tc.id}>
                          <TableCell className="font-medium">{tc.name}</TableCell>
                          <TableCell>{tc.phone}</TableCell>
                          <TableCell className="font-mono">{"•".repeat(tc.pin.length)}</TableCell>
                          <TableCell>
                            <Badge variant={tc.is_active ? "default" : "destructive"}>
                              {tc.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-xs"
                              onClick={() => toggleTelecaller(tc.id, !tc.is_active)}
                            >
                              {tc.is_active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                              {tc.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteTelecaller(tc.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCT TAB */}
          <TabsContent value="product" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> प्रोडक्ट डिटेल्स</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">प्रोडक्ट का नाम</label>
                    <Input value={product.name} onChange={(e) => updateProduct("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tagline</label>
                    <Input value={product.tagline} onChange={(e) => updateProduct("tagline", e.target.value)} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Hero Title</label>
                    <Input value={product.heroTitle} onChange={(e) => updateProduct("heroTitle", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Hero Highlight (रंगीन text)</label>
                    <Input value={product.heroHighlight} onChange={(e) => updateProduct("heroHighlight", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea value={product.description} onChange={(e) => updateProduct("description", e.target.value)} rows={3} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">ओरिजिनल प्राइस (₹)</label>
                    <Input value={product.originalPrice} onChange={(e) => updateProduct("originalPrice", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">ऑफर प्राइस (₹)</label>
                    <Input value={product.price} onChange={(e) => updateProduct("price", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Discount (%)</label>
                    <Input value={product.discount} onChange={(e) => updateProduct("discount", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                    <Image className="h-4 w-4" /> प्रोडक्ट Image URL
                  </label>
                  <Input value={product.imageUrl} onChange={(e) => updateProduct("imageUrl", e.target.value)} placeholder="https://example.com/product.jpg" />
                  {product.imageUrl && <img src={product.imageUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg border" />}
                </div>
                <Button onClick={handleSaveProduct} className="gap-2"><Save className="h-4 w-4" /> सेव करें</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Benefits (फायदे)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea placeholder="नया benefit लिखें..." value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} rows={2} className="flex-1" />
                  <Button onClick={addBenefit} className="shrink-0 gap-1"><Plus className="h-4 w-4" /> जोड़ें</Button>
                </div>
                <div className="space-y-2">
                  {product.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <p className="flex-1 text-sm">{b}</p>
                      <Button variant="ghost" size="sm" onClick={() => deleteBenefit(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSaveProduct} variant="outline" className="gap-2"><Save className="h-4 w-4" /> Benefits सेव करें</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Before/After Images</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Before Image URL (पहले)</label>
                    <Input value={beforeAfterImages.beforeImg} onChange={(e) => setBeforeAfterImages({ ...beforeAfterImages, beforeImg: e.target.value })} placeholder="https://example.com/before.jpg" />
                    {beforeAfterImages.beforeImg && <img src={beforeAfterImages.beforeImg} alt="Before Preview" className="mt-2 w-32 h-32 object-cover rounded-lg border" />}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">After Image URL (बाद में)</label>
                    <Input value={beforeAfterImages.afterImg} onChange={(e) => setBeforeAfterImages({ ...beforeAfterImages, afterImg: e.target.value })} placeholder="https://example.com/after.jpg" />
                    {beforeAfterImages.afterImg && <img src={beforeAfterImages.afterImg} alt="After Preview" className="mt-2 w-32 h-32 object-cover rounded-lg border" />}
                  </div>
                </div>
                <Button onClick={() => { localStorage.setItem("before_after_images", JSON.stringify(beforeAfterImages)); toast({ title: "✅ Before/After Images सेव हो गई!" }); }} className="gap-2"><Save className="h-4 w-4" /> Images सेव करें</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVIEWS TAB */}
          <TabsContent value="reviews" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Reviews मैनेजमेंट</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-3">
                  <Input placeholder="नाम" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} />
                  <Input placeholder="तारीख" value={newReview.date} onChange={(e) => setNewReview({ ...newReview, date: e.target.value })} />
                  <Button onClick={addReview} className="gap-2"><Plus className="h-4 w-4" /> जोड़ें</Button>
                </div>
                <Textarea placeholder="Review लिखें..." value={newReview.text} onChange={(e) => setNewReview({ ...newReview, text: e.target.value })} />
                <div className="space-y-3">
                  {reviews.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{r.name}</span>
                          <span className="text-xs text-muted-foreground">{r.date}</span>
                          <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 fill-gold text-gold" />)}</div>
                        </div>
                        <p className="text-sm mt-1">{r.text}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteReview(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader><CardTitle>⚙️ Settings</CardTitle></CardHeader>
              <CardContent className="space-y-6">

                {/* Site Logo Upload */}
                <div className="max-w-md space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">🖼️ Site Logo</h3>
                  <p className="text-sm text-muted-foreground">Header में text logo की जगह image logo लगाएं। PNG/JPG upload करें।</p>
                  
                  {localStorage.getItem("site_logo") ? (
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4 bg-muted/50 flex items-center gap-4">
                        <img src={localStorage.getItem("site_logo")!} alt="Site Logo" style={{ height: `${JSON.parse(localStorage.getItem("site_logo_settings") || '{}').height || 32}px`, maxWidth: `${JSON.parse(localStorage.getItem("site_logo_settings") || '{}').maxWidth || 160}px` }} className="object-contain" />
                        <Badge variant="secondary">Active</Badge>
                      </div>

                      {/* Logo Size Controls */}
                      <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                        <p className="text-sm font-medium">📐 Logo Size Adjust</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Height (px)</label>
                            <Input
                              type="number"
                              min={16}
                              max={80}
                              defaultValue={JSON.parse(localStorage.getItem("site_logo_settings") || '{}').height || 32}
                              onChange={(e) => {
                                const settings = JSON.parse(localStorage.getItem("site_logo_settings") || '{}');
                                settings.height = Number(e.target.value) || 32;
                                localStorage.setItem("site_logo_settings", JSON.stringify(settings));
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Max Width (px)</label>
                            <Input
                              type="number"
                              min={60}
                              max={300}
                              defaultValue={JSON.parse(localStorage.getItem("site_logo_settings") || '{}').maxWidth || 160}
                              onChange={(e) => {
                                const settings = JSON.parse(localStorage.getItem("site_logo_settings") || '{}');
                                settings.maxWidth = Number(e.target.value) || 160;
                                localStorage.setItem("site_logo_settings", JSON.stringify(settings));
                              }}
                            />
                          </div>
                        </div>
                        <Button size="sm" className="gap-1 w-full" onClick={() => {
                          toast({ title: "✅ Logo size save हो गया!" });
                          window.location.reload();
                        }}>
                          <Save className="h-4 w-4" /> Size Save करें
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/png,image/jpeg,image/webp,image/svg+xml";
                          input.onchange = (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) { toast({ title: "❌ File 2MB से छोटी होनी चाहिए", variant: "destructive" }); return; }
                            const reader = new FileReader();
                            reader.onload = () => { localStorage.setItem("site_logo", reader.result as string); toast({ title: "✅ Logo update हो गया!" }); window.location.reload(); };
                            reader.readAsDataURL(file);
                          };
                          input.click();
                        }}>
                          <Upload className="h-4 w-4" /> Change Logo
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive hover:bg-destructive/10" onClick={() => {
                          localStorage.removeItem("site_logo");
                          localStorage.removeItem("site_logo_settings");
                          toast({ title: "🗑 Logo हटा दिया — text logo वापस आ जाएगा" });
                          window.location.reload();
                        }}>
                          <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button className="gap-2" onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/png,image/jpeg,image/webp,image/svg+xml";
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) { toast({ title: "❌ File 2MB से छोटी होनी चाहिए", variant: "destructive" }); return; }
                        const reader = new FileReader();
                        reader.onload = () => { localStorage.setItem("site_logo", reader.result as string); toast({ title: "✅ Logo upload हो गया!" }); window.location.reload(); };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}>
                      <Upload className="h-4 w-4" /> Logo Upload करें
                    </Button>
                  )}
                </div>

                <div className="max-w-md space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2">📊 Meta Pixel (Facebook Pixel)</h3>
                  
                  {/* Status indicator */}
                  {localStorage.getItem("meta_pixel_id") ? (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-medium">✅ Pixel Active — ID: {localStorage.getItem("meta_pixel_id")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted border rounded-lg">
                      <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Pixel अभी active नहीं है</span>
                    </div>
                  )}

                  {/* Setup Guide */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm space-y-1">
                    <p className="font-bold text-amber-800">📋 Meta Pixel ID कहाँ मिलेगा?</p>
                    <ol className="list-decimal list-inside space-y-1 text-amber-900">
                      <li><a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="underline text-primary">Meta Events Manager</a> खोलें</li>
                      <li>अपना Pixel select करें (या नया बनाएं)</li>
                      <li>Settings में जाएं → <strong>Pixel ID</strong> copy करें</li>
                      <li>नीचे paste करें — बस!</li>
                    </ol>
                  </div>

                  <Input
                    placeholder="Pixel ID डालें (जैसे: 123456789012345)"
                    defaultValue={localStorage.getItem("meta_pixel_id") || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      e.target.value = val;
                      localStorage.setItem("meta_pixel_id", val);
                    }}
                    inputMode="numeric"
                  />

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => {
                        const pid = localStorage.getItem("meta_pixel_id");
                        if (!pid || pid.length < 10) {
                          toast({ title: "❌ Valid Pixel ID डालें (कम से कम 10 अंक)", variant: "destructive" });
                          return;
                        }
                        toast({ title: "✅ Meta Pixel सेव हो गया!", description: "Page refresh करें ताकि pixel active हो जाए।" });
                        window.location.reload();
                      }}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" /> Pixel सेव करें
                    </Button>
                    {localStorage.getItem("meta_pixel_id") && (
                      <Button
                        variant="outline"
                        className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => {
                          localStorage.removeItem("meta_pixel_id");
                          toast({ title: "🗑 Meta Pixel हटा दिया गया!" });
                          window.location.reload();
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Remove Pixel
                      </Button>
                    )}
                  </div>

                  {/* Auto-tracked events info */}
                  <div className="border rounded-lg p-3 space-y-2">
                    <p className="font-semibold text-sm">🔄 Auto-Tracked Events:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-primary">📄</span> <span>PageView</span>
                        <Badge variant="secondary" className="text-xs ml-auto">Auto</Badge>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-primary">🛒</span> <span>Purchase</span>
                        <Badge variant="secondary" className="text-xs ml-auto">On Order</Badge>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-primary">📝</span> <span>Lead</span>
                        <Badge variant="secondary" className="text-xs ml-auto">On Order</Badge>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-primary">👁</span> <span>ViewContent</span>
                        <Badge variant="secondary" className="text-xs ml-auto">Auto</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">ये सभी events automatically fire होते हैं — कुछ करने की ज़रूरत नहीं!</p>
                  </div>
                </div>

                {/* Google Tag Manager */}
                <div className="max-w-md space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2">🏷️ Google Tag Manager (GTM)</h3>

                  {gtmId ? (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-medium">✅ GTM Active — ID: {gtmId}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted border rounded-lg">
                      <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                      <span className="text-sm text-muted-foreground">GTM अभी active नहीं है</span>
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm space-y-1">
                    <p className="font-bold text-amber-800">📋 GTM Container ID कहाँ मिलेगा?</p>
                    <ol className="list-decimal list-inside space-y-1 text-amber-900">
                      <li><a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="underline text-primary">Google Tag Manager</a> खोलें</li>
                      <li>अपना Account और Container select करें</li>
                      <li>ऊपर <strong>GTM-XXXXXXX</strong> format में ID दिखेगा</li>
                      <li>वो ID नीचे paste करें — बस!</li>
                    </ol>
                  </div>

                  <Input
                    placeholder="GTM Container ID (जैसे: GTM-XXXXXXX)"
                    value={gtmId}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                      setGtmId(val);
                    }}
                  />

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => {
                        if (!gtmId || !gtmId.startsWith("GTM-")) {
                          toast({ title: "❌ Valid GTM ID डालें (GTM-XXXXXXX format)", variant: "destructive" });
                          return;
                        }
                        localStorage.setItem("gtm_id", gtmId);
                        // Inject GTM script
                        if (!document.getElementById("gtm-script")) {
                          const script = document.createElement("script");
                          script.id = "gtm-script";
                          script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
                          document.head.appendChild(script);
                          // Add noscript iframe to body
                          if (!document.getElementById("gtm-noscript")) {
                            const noscript = document.createElement("noscript");
                            noscript.id = "gtm-noscript";
                            noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
                            document.body.insertBefore(noscript, document.body.firstChild);
                          }
                        }
                        toast({ title: "✅ Google Tag Manager सेव हो गया!", description: "GTM अब active है।" });
                      }}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" /> GTM सेव करें
                    </Button>
                    {gtmId && localStorage.getItem("gtm_id") && (
                      <Button
                        variant="outline"
                        className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => {
                          localStorage.removeItem("gtm_id");
                          setGtmId("");
                          const el = document.getElementById("gtm-script");
                          if (el) el.remove();
                          const ns = document.getElementById("gtm-noscript");
                          if (ns) ns.remove();
                          toast({ title: "🗑 GTM हटा दिया गया!" });
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Remove GTM
                      </Button>
                    )}
                  </div>
                </div>

                {/* Google Analytics */}
                <div className="max-w-md space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2">📈 Google Analytics (GA4)</h3>

                  {gaId ? (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-medium">✅ GA4 Active — ID: {gaId}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted border rounded-lg">
                      <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Google Analytics अभी active नहीं है</span>
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm space-y-1">
                    <p className="font-bold text-amber-800">📋 GA4 Measurement ID कहाँ मिलेगा?</p>
                    <ol className="list-decimal list-inside space-y-1 text-amber-900">
                      <li><a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline text-primary">Google Analytics</a> खोलें</li>
                      <li>Admin → Data Streams → अपनी Web stream select करें</li>
                      <li><strong>Measurement ID</strong> (G-XXXXXXXXXX) copy करें</li>
                      <li>नीचे paste करें — बस!</li>
                    </ol>
                  </div>

                  <Input
                    placeholder="Measurement ID (जैसे: G-XXXXXXXXXX)"
                    value={gaId}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
                      setGaId(val);
                    }}
                  />

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => {
                        if (!gaId || !gaId.startsWith("G-")) {
                          toast({ title: "❌ Valid Measurement ID डालें (G-XXXXXXXXXX format)", variant: "destructive" });
                          return;
                        }
                        localStorage.setItem("ga_measurement_id", gaId);
                        // Inject GA4 script
                        if (!document.getElementById("ga-script")) {
                          const script1 = document.createElement("script");
                          script1.id = "ga-script";
                          script1.async = true;
                          script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
                          document.head.appendChild(script1);
                          const script2 = document.createElement("script");
                          script2.id = "ga-config";
                          script2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
                          document.head.appendChild(script2);
                        }
                        toast({ title: "✅ Google Analytics सेव हो गया!", description: "GA4 अब active है।" });
                      }}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" /> GA4 सेव करें
                    </Button>
                    {gaId && localStorage.getItem("ga_measurement_id") && (
                      <Button
                        variant="outline"
                        className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => {
                          localStorage.removeItem("ga_measurement_id");
                          setGaId("");
                          const el = document.getElementById("ga-script");
                          if (el) el.remove();
                          const el2 = document.getElementById("ga-config");
                          if (el2) el2.remove();
                          toast({ title: "🗑 Google Analytics हटा दिया गया!" });
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Remove GA4
                      </Button>
                    )}
                  </div>
                </div>

                {/* Admin Login Credentials */}
                <div className="max-w-md space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2">🔐 Admin Login Details</h3>
                  <p className="text-sm text-muted-foreground">Admin login का Email और Password यहाँ से manage करें।</p>

                  {/* Current credentials display */}
                  <div className="bg-muted rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Current Login Info:</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{adminEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-primary" />
                      <span>{showCurrentPassword ? adminPassword : "••••••••"}</span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Change Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">📧 Email बदलें</label>
                    <Input
                      type="email"
                      placeholder="नया Email डालें"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        if (!newEmail || !newEmail.includes("@")) {
                          toast({ title: "❌ Valid email डालें", variant: "destructive" });
                          return;
                        }
                        localStorage.setItem("admin_email", newEmail);
                        setAdminEmail(newEmail);
                        setNewEmail("");
                        toast({ title: "✅ Email बदल दिया गया!" });
                      }}
                    >
                      <Save className="h-4 w-4" /> Email अपडेट करें
                    </Button>
                  </div>

                  {/* Change Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">🔑 Password बदलें</label>
                    <Input
                      type="password"
                      placeholder="नया Password डालें"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        if (!newPassword || newPassword.length < 4) {
                          toast({ title: "❌ कम से कम 4 characters का password डालें", variant: "destructive" });
                          return;
                        }
                        localStorage.setItem("admin_password", newPassword);
                        setAdminPassword(newPassword);
                        setNewPassword("");
                        toast({ title: "✅ Password बदल दिया गया!" });
                      }}
                    >
                      <Save className="h-4 w-4" /> Password अपडेट करें
                    </Button>
                  </div>

                  {/* Reset to default */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => {
                      localStorage.setItem("admin_email", "admin@admin.com");
                      localStorage.setItem("admin_password", "admin123");
                      setAdminEmail("admin@admin.com");
                      setAdminPassword("admin123");
                      toast({ title: "🔄 Login details reset हो गए! (admin@admin.com / admin123)" });
                    }}
                  >
                    🔄 Default पर Reset करें
                  </Button>
                </div>

                {/* Contact Details */}
                <div className="max-w-md space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Phone className="h-5 w-5" /> Contact Details</h3>
                  <p className="text-sm text-muted-foreground">Footer में दिखने वाली contact details यहाँ डालें।</p>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number</label>
                    <Input value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">WhatsApp Number</label>
                    <Input value={contactData.whatsapp} onChange={(e) => setContactData({ ...contactData, whatsapp: e.target.value })} placeholder="+919876543210" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} placeholder="info@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Address</label>
                    <Textarea value={contactData.address} onChange={(e) => setContactData({ ...contactData, address: e.target.value })} placeholder="आपका पता..." rows={2} />
                  </div>
                  <Button onClick={() => { saveContactData(contactData); toast({ title: "✅ Contact Details सेव हो गई!" }); }} variant="outline" className="gap-2">
                    <Save className="h-4 w-4" /> Contact सेव करें
                  </Button>
                </div>

                {/* Google Sheet Integration */}
                <div className="max-w-md space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-primary" /> Google Sheet Integration</h3>
                  
                  {sheetConfig.isConnected && !sheetEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                        <Link className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">✅ Sheet Connected</span>
                      </div>
                      <div className="text-sm text-muted-foreground break-all bg-muted p-2 rounded">
                        {sheetConfig.webhookUrl}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => setSheetEditing(true)}>
                          <Edit className="h-4 w-4" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-destructive border-destructive hover:bg-destructive/10" onClick={() => {
                          const newConfig = { webhookUrl: "", isConnected: false };
                          setSheetConfig(newConfig);
                          localStorage.setItem("google_sheet_config", JSON.stringify(newConfig));
                          toast({ title: "🗑 Google Sheet हटा दी गई!" });
                        }}>
                          <Unlink className="h-4 w-4" /> Remove
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1" disabled={testingSheet} onClick={async () => {
                          setTestingSheet(true);
                          try {
                            const resp = await supabase.functions.invoke("sync-google-sheet", {
                              body: {
                                webhookUrl: sheetConfig.webhookUrl,
                                payload: { order_id: "TEST", name: "Test Order", phone: "0000000000", address: "Test", pincode: "000000", amount: 0, status: "test", created_at: new Date().toISOString() },
                              },
                            });
                            if (resp.error) throw resp.error;
                            const body = resp.data;
                            if (body?.success && !body?.response?.includes("nicht gefunden") && !body?.response?.includes("not found")) {
                              toast({ title: "✅ Connection सही है! Sheet check करें।" });
                            } else {
                              toast({ title: "❌ Apps Script में doPost function नहीं मिला।", description: "कृपया नीचे दिए गए steps फॉलो करें।", variant: "destructive" });
                            }
                          } catch (err) {
                            console.error(err);
                            toast({ title: "❌ Test failed", description: String(err), variant: "destructive" });
                          } finally {
                            setTestingSheet(false);
                          }
                        }}>
                          {testingSheet ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Test Connection
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1" disabled={syncingSheet} onClick={async () => {
                          setSyncingSheet(true);
                          try {
                            const { syncAllOrdersToSheet } = await import("@/lib/sheetSync");
                            await syncAllOrdersToSheet(orders);
                            toast({ title: "✅ सभी ऑर्डर Sheet में sync हो गए!" });
                          } catch (err) {
                            console.error(err);
                            toast({ title: "❌ Sync में error आया", variant: "destructive" });
                          } finally {
                            setSyncingSheet(false);
                          }
                        }}>
                          {syncingSheet ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Sync All
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm space-y-2">
                        <p className="font-bold text-amber-800">📋 Step-by-Step Setup (5 min):</p>
                        <ol className="list-decimal list-inside space-y-1 text-amber-900">
                          <li>Google Sheet खोलें</li>
                          <li><strong>Extensions</strong> → <strong>Apps Script</strong> पर click करें</li>
                          <li>पहले से जो code है वो <strong>सब delete</strong> करें</li>
                          <li>नीचे दिया गया code <strong>copy करके paste</strong> करें</li>
                          <li>ऊपर <strong>Deploy</strong> → <strong>New deployment</strong> click करें</li>
                          <li>Type में <strong>"Web app"</strong> चुनें</li>
                          <li><strong>"Who has access"</strong> में <strong>"Anyone"</strong> चुनें</li>
                          <li><strong>Deploy</strong> दबाएं → URL copy करें</li>
                          <li>वो URL नीचे paste करें</li>
                        </ol>
                      </div>
                      <div className="relative">
                        <div className="bg-muted p-3 rounded text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  if (data.mode === "sync_all") {
    sheet.clear();
    sheet.appendRow(["Order ID","Name","Phone","Address","Pincode","Amount","Status","Date"]);
    data.orders.forEach(function(o) {
      sheet.appendRow([o.order_id, o.name, o.phone, o.address, o.pincode, "₹"+o.amount, o.status, new Date(o.created_at).toLocaleDateString("hi-IN")]);
    });
  } else {
    if (sheet.getLastRow() === 0) sheet.appendRow(["Order ID","Name","Phone","Address","Pincode","Amount","Status","Date"]);
    sheet.appendRow([data.order_id, data.name, data.phone, data.address, data.pincode, "₹"+data.amount, data.status, new Date(data.created_at).toLocaleDateString("hi-IN")]);
  }
  
  return ContentService.createTextOutput("ok");
}`}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2 text-xs"
                          onClick={() => {
                            const code = `function doPost(e) {\n  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();\n  var data = JSON.parse(e.postData.contents);\n  \n  if (data.mode === "sync_all") {\n    sheet.clear();\n    sheet.appendRow(["Order ID","Name","Phone","Address","Pincode","Amount","Status","Date"]);\n    data.orders.forEach(function(o) {\n      sheet.appendRow([o.order_id, o.name, o.phone, o.address, o.pincode, "₹"+o.amount, o.status, new Date(o.created_at).toLocaleDateString("hi-IN")]);\n    });\n  } else {\n    if (sheet.getLastRow() === 0) sheet.appendRow(["Order ID","Name","Phone","Address","Pincode","Amount","Status","Date"]);\n    sheet.appendRow([data.order_id, data.name, data.phone, data.address, data.pincode, "₹"+data.amount, data.status, new Date(data.created_at).toLocaleDateString("hi-IN")]);\n  }\n  \n  return ContentService.createTextOutput("ok");\n}`;
                            navigator.clipboard.writeText(code);
                            toast({ title: "📋 Code copied!" });
                          }}
                        >
                          📋 Copy
                        </Button>
                      </div>
                      <Input
                        placeholder="Apps Script Web App URL paste करें"
                        value={sheetConfig.webhookUrl || ""}
                        onChange={(e) => setSheetConfig({ ...sheetConfig, webhookUrl: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (!sheetConfig.webhookUrl?.startsWith("https://script.google.com/")) {
                              toast({ title: "❌ Valid Apps Script URL डालें", variant: "destructive" });
                              return;
                            }
                            const newConfig = { ...sheetConfig, isConnected: true };
                            setSheetConfig(newConfig);
                            localStorage.setItem("google_sheet_config", JSON.stringify(newConfig));
                            setSheetEditing(false);
                            toast({ title: "✅ Google Sheet जोड़ दी गई! अब 'Test Connection' दबाकर check करें।" });
                          }}
                          disabled={!sheetConfig.webhookUrl}
                          className="gap-2"
                        >
                          <FileSpreadsheet className="h-4 w-4" /> Connect करें
                        </Button>
                        {sheetEditing && (
                          <Button variant="outline" onClick={() => setSheetEditing(false)}>Cancel</Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* CRM Integration */}
                <div className="max-w-lg space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Plug className="h-5 w-5 text-primary" /> CRM Integrations</h3>
                    <Button size="sm" className="gap-1" onClick={() => setAddingCrm(!addingCrm)}>
                      <Plus className="h-4 w-4" /> CRM जोड़ें
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">अपनी team का कोई भी CRM यहाँ API से connect करें और live data fetch करें।</p>

                  {/* Add new CRM form */}
                  {addingCrm && (
                    <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                      <h4 className="font-medium flex items-center gap-2"><PlugZap className="h-4 w-4" /> नया CRM Add करें</h4>
                      <div>
                        <label className="text-sm font-medium block mb-1">CRM का नाम *</label>
                        <Input placeholder="जैसे: Zoho, HubSpot, Salesforce..." value={newCrm.name} onChange={(e) => setNewCrm({ ...newCrm, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">API Base URL *</label>
                        <Input placeholder="https://api.yourcrm.com/v1/contacts" value={newCrm.apiUrl} onChange={(e) => setNewCrm({ ...newCrm, apiUrl: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">API Key / Token</label>
                        <Input type="password" placeholder="Bearer token या API key" value={newCrm.apiKey} onChange={(e) => setNewCrm({ ...newCrm, apiKey: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">HTTP Method</label>
                        <select className="w-full border rounded-md p-2 text-sm bg-background" value={newCrm.method} onChange={(e) => setNewCrm({ ...newCrm, method: e.target.value })}>
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Custom Headers (JSON, optional)</label>
                        <Textarea placeholder='{"X-Custom-Header": "value"}' value={newCrm.headers} onChange={(e) => setNewCrm({ ...newCrm, headers: e.target.value })} rows={2} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addCrm} className="gap-1"><Save className="h-4 w-4" /> Save & Connect</Button>
                        <Button variant="outline" onClick={() => setAddingCrm(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {/* Connected CRMs list */}
                  {crmList.length === 0 && !addingCrm && (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                      <Globe className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">कोई CRM connected नहीं है</p>
                      <p className="text-xs">ऊपर "CRM जोड़ें" button दबाकर अपना CRM connect करें</p>
                    </div>
                  )}

                  {crmList.map((crm) => (
                    <div key={crm.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlugZap className="h-5 w-5 text-primary" />
                          <span className="font-semibold">{crm.name}</span>
                          <Badge variant="outline" className="text-xs border-primary/50 text-primary">Connected</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeCrm(crm.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="flex items-center gap-1"><Globe className="h-3 w-3" /> {crm.apiUrl}</p>
                        <p className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> Method: {crm.method} | Key: {crm.apiKey ? "••••••" : "None"}</p>
                        {crm.lastSync && <p className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Last sync: {new Date(crm.lastSync).toLocaleString("hi-IN")}</p>}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="gap-1" disabled={testingCrmId === crm.id} onClick={() => testCrmConnection(crm)}>
                          {testingCrmId === crm.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Test & Fetch
                        </Button>
                        {crm.apiKey && (
                          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => {
                            navigator.clipboard.writeText(crm.apiUrl);
                            toast({ title: "📋 API URL copied!" });
                          }}>
                            <Copy className="h-3 w-3" /> Copy URL
                          </Button>
                        )}
                      </div>
                      {/* Test result */}
                      {crmTestResult && crmTestResult.id === crm.id && (
                        <div className={`rounded-lg p-3 text-sm ${crmTestResult.success ? "bg-primary/10 border border-primary/30" : "bg-destructive/10 border border-destructive/30"}`}>
                          <div className="flex items-center gap-2 mb-1 font-medium">
                            {crmTestResult.success ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
                            {crmTestResult.success ? "✅ Data fetched successfully!" : "❌ Connection failed"}
                          </div>
                          <pre className="text-xs bg-background/50 rounded p-2 max-h-40 overflow-auto whitespace-pre-wrap">
                            {crmTestResult.success
                              ? JSON.stringify(crmTestResult.data, null, 2)
                              : crmTestResult.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
