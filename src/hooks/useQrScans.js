import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useQrScans(sessionId) {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    if (!sessionId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("qr_scans")
        .select("*, player:players(nickname), qr_code:qr_codes(label, points)")
        .eq("session_id", sessionId)
        .order("scanned_at", { ascending: true });
      setScans(data ?? []);
    };
    fetch();
    const channel = supabase
      .channel(`qr_scans:${sessionId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "qr_scans", filter: `session_id=eq.${sessionId}` },
        fetch)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [sessionId]);

  return scans;
}