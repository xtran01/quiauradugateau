import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { MCQ_CHOICES } from "../../lib/constants";

export default function McqAnswer({ question, player, session, onAnswered }) {
  const [selected, setSelected] = useState(null);

  async function choose(label) {
    setSelected(label);
    await supabase.from("answers").insert({
      player_id:   player.id,
      question_id: question.id,
      session_id:  session.id,
      choice:      label,
    });
    onAnswered();
  }

  return (
    <div className="mcq-answer">
      {question.options?.map(o => (
        <button key={o.label}
          className={`mcq-btn mcq-${o.label.toLowerCase()} ${selected === o.label ? "selected" : ""}`}
          onClick={() => choose(o.label)} disabled={!!selected}>
          <strong>{o.label}</strong> {o.text}
        </button>
      ))}
    </div>
  );
}