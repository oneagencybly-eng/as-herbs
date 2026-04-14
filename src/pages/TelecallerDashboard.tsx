import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Phone, RefreshCw, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AssignedOrder {
  id: string;
  order_id: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  status: string;
  amount: number;
  created_at: string;
  notes?: string;
}

const TelecallerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const telecallerId = sessionStorage.getItem("telecallerId");
  const telecallerName = sessionStorage.getItem("telecallerName");

  useEffect(() => {
    if (sessionStorage.getItem("telecallerAuth") !== "true") {
      navigate("/telecaller");
    }
  }, [navigate]);

  const fetchAssignedOrders = async () => {
    if (!telecallerId) return;
    setLoading(true);
    try {
      // Get assigned order IDs
      const { data: assignments, error: aErr } = await supabase
        .from("order_assignments")
        .select("order_id, notes")
        .eq("telecaller_id", telecallerId);

      if (aErr) throw aErr;
      if (!assignments || assignments.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = assignments.map((a) => a.order_id);
      const notesMap = new Map(assignments.map((a) => [a.order_id, a.notes]));

      const { data: orderData, error: oErr } = await supabase
        .from("orders")
        .select("*")
        .in("id", orderIds)
        .order("created_at", { ascending: false });

      if (oErr) throw oErr;

      setOrders(
        (orderData || []).map((o) => ({
          ...o,
          notes: notesMap.get(o.id) || undefined,
        }))
      );
    } catch (err) {
      console.error(err);
      toast({ title: "❌ Orders load करने में error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (!error) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast({ title: "✅ Status अपडेट हो गया!" });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("telecallerAuth");
    sessionStorage.removeItem("telecallerId");
    sessionStorage.removeItem("telecallerName");
    navigate("/telecaller");
  };

  const statusColor = (s: string) => {
    if (s === "pending") return "destructive" as const;
    if (s === "shipped") return "secondary" as const;
    if (s === "follow_up") return "outline" as const;
    if (s === "cancelled") return "destructive" as const;
    return "default" as const;
  };

  return (
    <div className="min-h-screen bg-section-alt">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          <div>
            <h1 className="text-lg font-bold text-primary">📞 Telecaller Panel</h1>
            <p className="text-xs text-muted-foreground">Welcome, {telecallerName}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="container py-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-sm text-muted-foreground">Assigned Orders</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Phone className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</div>
                <div className="text-sm text-muted-foreground">Pending Calls</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>आपके Assigned Orders</CardTitle>
              <Button variant="outline" size="sm" onClick={fetchAssignedOrders} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">अभी कोई order assign नहीं है।</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>नाम</TableHead>
                    <TableHead>फ़ोन</TableHead>
                    <TableHead>पता</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.order_id}</TableCell>
                      <TableCell>{order.name}</TableCell>
                      <TableCell>
                        <a href={`tel:${order.phone}`} className="text-primary underline">{order.phone}</a>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.address}</TableCell>
                      <TableCell>₹{order.amount}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{order.notes || "—"}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <a href={`tel:${order.phone}`}>
                          <Button variant="outline" size="sm" className="gap-1 text-primary border-primary hover:bg-primary/10">
                            <Phone className="h-4 w-4" /> Call
                          </Button>
                        </a>
                        <select
                          className="text-sm border rounded px-2 py-1 bg-background"
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="follow_up">Follow Up</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Order Done</option>
                          <option value="cancelled">Order Cancel</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TelecallerDashboard;
