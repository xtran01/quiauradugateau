import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function usePlayers(sessionId) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!sessionId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("session_id", sessionId)
        .eq("is_active", true)
        .order("score", { ascending: false });
      setPlayers(data ?? []);
    };
    fetch();
    const channel = supabase
      .channel(`players:${sessionId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `session_id=eq.${sessionId}` },
        fetch)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [sessionId]);

  return players;
}