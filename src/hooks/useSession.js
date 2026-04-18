import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    const { data, error } = await supabase
      .from("sessions")
      .select("*, current_question:questions!current_question_id(*)")
      .eq("id", sessionId)
      .single();
    if (error) setError(error);
    else setSession(data);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` },
        fetchSession)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [sessionId, fetchSession]);

  return { session, loading, error, refresh: fetchSession };
}