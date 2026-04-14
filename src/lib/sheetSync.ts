import { supabase } from "@/integrations/supabase/client";

export function getSheetConfig() {
  try {
    const saved = localStorage.getItem("google_sheet_config");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

async function callSheetProxy(webhookUrl: string, payload: any) {
  const { data, error } = await supabase.functions.invoke("sync-google-sheet", {
    body: { webhookUrl, payload },
  });

  if (error) {
    console.error("Sheet sync edge function error:", error);
    throw error;
  }

  if (!data?.success) {
    console.error("Sheet sync failed:", data);
    throw new Error(data?.error || "Sheet sync failed");
  }

  return data;
}

export async function syncOrderToSheet(order: {
  order_id: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  amount: number;
  status: string;
  created_at: string;
}) {
  const config = getSheetConfig();
  if (!config?.isConnected || !config?.webhookUrl) return;

  try {
    await callSheetProxy(config.webhookUrl, order);
  } catch (err) {
    console.error("Sheet sync error:", err);
  }
}

export async function syncAllOrdersToSheet(orders: Array<{
  order_id: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  amount: number;
  status: string;
  created_at: string;
}>) {
  const config = getSheetConfig();
  if (!config?.isConnected || !config?.webhookUrl) return;

  try {
    await callSheetProxy(config.webhookUrl, { mode: "sync_all", orders });
  } catch (err) {
    console.error("Sheet sync all error:", err);
  }
}
