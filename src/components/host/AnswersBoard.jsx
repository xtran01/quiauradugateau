import { useAnswers } from "../../hooks/useAnswers";
import { supabase } from "../../lib/supabase";
import { SESSION_STATUS } from "../../lib/constants";

export default function AnswersBoard({ session, players }) {
  const q = session.current_question;
  const answers = useAnswers(q?.id);

  async function validate(answer, correct) {
    const pts = correct ? q.points : 0;
    await supabase.from("answers")
      .update({ is_correct: correct, points_earned: pts })
      .eq("id", answer.id);
    if (correct) {
      await supabase.from("players")
        .update({ score: (players.find(p => p.id === answer.player_id)?.score ?? 0) + pts })
        .eq("id", answer.player_id);
    }
  }

  async function nextQuestion() {
    // Cherche la question suivante
    const { data: questions } = await supabase
      .from("questions")
      .select("id, order")
      .eq("session_id", session.id)
      .order("order");

    const idx = questions?.findIndex(q2 => q2.id === q?.id) ?? -1;
    const next = questions?.[idx + 1];

    if (next) {
      await supabase.from("sessions")
        .update({ status: SESSION_STATUS.QUESTION, current_question_id: next.id })
        .eq("id", session.id);
    } else {
      await supabase.from("sessions")
        .update({ status: SESSION_STATUS.FINISHED })
        .eq("id", session.id);
    }
  }

  return (
    <div className="answers-board">
      <h3>Réponses â€” {q?.content}</h3>
      <ul>
        {answers.map(a => (
          <li key={a.id} className={a.is_correct === true ? "correct" : a.is_correct === false ? "wrong" : ""}>
            <span>{a.player?.nickname}</span>
            <span>{a.value ?? a.choice}</span>
            {a.is_correct === null && (
              <>
                <button onClick={() => validate(a, true)}>âœ“</button>
                <button onClick={() => validate(a, false)}>âœ—</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <button className="btn-primary" onClick={nextQuestion}>Question suivante â†’</button>
    </div>
  );
}