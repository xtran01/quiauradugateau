import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function QuestionList({ sessionId }) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    supabase.from("questions").select("*")
      .eq("session_id", sessionId).order("order")
      .then(({ data }) => setQuestions(data ?? []));
  }, [sessionId]);

  async function remove(id) {
    await supabase.from("questions").delete().eq("id", id);
    setQuestions(q => q.filter(x => x.id !== id));
  }

  if (!questions.length) return <p className="empty">Aucune question ajoutée.</p>;

  return (
    <ul className="question-list">
      {questions.map((q, i) => (
        <li key={q.id}>
          <span className="q-index">{i + 1}</span>
          <span className="q-type">{q.type}</span>
          <span className="q-content">{q.content}</span>
          <button onClick={() => remove(q.id)}>âœ•</button>
        </li>
      ))}
    </ul>
  );
}