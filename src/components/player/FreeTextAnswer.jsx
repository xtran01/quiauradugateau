import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function FreeTextAnswer({ question, player, session, onAnswered }) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!value.trim()) return;
    setSending(true);
    await supabase.from("answers").insert({
      player_id:   player.id,
      question_id: question.id,
      session_id:  session.id,
      value:       value.trim(),
    });
    onAnswered();
  }

  return (
    <div className="free-text">
      <textarea placeholder="Ta réponse..." value={value}
        onChange={e => setValue(e.target.value)} rows={3} />
      <button onClick={submit} disabled={sending || !value.trim()}>
        {sending ? "Envoi..." : "Envoyer"}
      </button>
    </div>
  );
}