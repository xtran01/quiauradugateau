import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAnswers } from "../../hooks/useAnswers";
import { SESSION_STATUS, QUESTION_TYPE } from "../../lib/constants";
import VideoPlayer from "./VideoPlayer";

export default function LiveQuestion({ session }) {
  const q = session.current_question;
  const answers = useAnswers(q?.id);
  const [timeLeft, setTimeLeft] = useState(q?.time_limit ?? 30);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  async function reveal() {
    await supabase.from("sessions")
      .update({ status: SESSION_STATUS.REVEAL })
      .eq("id", session.id);
  }

  if (!q) return <p>Aucune question active.</p>;

  return (
    <div className="live-question">
      <div className="live-question-header">
        <span className="timer">{timeLeft}s</span>
        <span className="answer-count">{answers.length} réponse(s)</span>
      </div>

      <p className="question-text">{q.content}</p>

      {q.type === QUESTION_TYPE.VIDEO && q.video_url && (
        <VideoPlayer url={q.video_url} />
      )}

      {q.type === QUESTION_TYPE.MCQ && q.options && (
        <div className="mcq-preview">
          {q.options.map(o => (
            <span key={o.label} className="mcq-option">
              <strong>{o.label}</strong> {o.text}
            </span>
          ))}
        </div>
      )}

      <button className="btn-primary" onClick={reveal}>
        Révéler les réponses
      </button>
    </div>
  );
}