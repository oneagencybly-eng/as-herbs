import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useLiveVisitorCount = () => {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = async () => {
    try {
      // Count visitors seen in last 60 seconds
      const cutoff = new Date(Date.now() - 60000).toISOString();
      const { count: visitorCount, error } = await supabase
        .from("site_visitors")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", cutoff);

      if (!error && visitorCount !== null) {
        setCount(visitorCount);
      }
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    fetchCount();
    // Refresh every 10 seconds
    intervalRef.current = setInterval(fetchCount, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return count;
};
