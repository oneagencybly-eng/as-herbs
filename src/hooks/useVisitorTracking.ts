import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const getSessionId = () => {
  let sid = sessionStorage.getItem("visitor_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("visitor_session_id", sid);
  }
  return sid;
};

export const useVisitorTracking = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sessionId = getSessionId();
    const pageUrl = window.location.pathname;

    const heartbeat = async () => {
      try {
        const { error } = await supabase
          .from("site_visitors")
          .upsert(
            { session_id: sessionId, page_url: pageUrl, last_seen: new Date().toISOString() },
            { onConflict: "session_id" }
          );
        if (error) console.error("Visitor heartbeat error:", error);
      } catch (e) {
        // silent fail
      }
    };

    // Initial heartbeat
    heartbeat();

    // Send heartbeat every 30 seconds
    intervalRef.current = setInterval(heartbeat, 30000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
};
