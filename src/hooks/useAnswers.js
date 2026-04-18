import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAnswers(questionId) {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (!questionId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("answers")
        .select("*, player:players(nickname)")
        .eq("question_id", questionId)
        .order("answered_at", { ascending: true });
      setAnswers(data ?? []);
    };
    fetch();
    const channel = supabase
      .channel(`answers:${questionId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "answers", filter: `question_id=eq.${questionId}` },
        fetch)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [questionId]);

  return answers;
}