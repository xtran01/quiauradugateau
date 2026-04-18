import { useState } from "react";
import { QUESTION_TYPE } from "../../lib/constants";
import FreeTextAnswer from "./FreeTextAnswer";
import McqAnswer      from "./McqAnswer";
import AnswerConfirm  from "./AnswerConfirm";

export default function QuestionDisplay({ session, player }) {
  const [answered, setAnswered] = useState(false);
  const q = session.current_question;

  if (!q) return <p>En attente de la question...</p>;
  if (answered) return <AnswerConfirm timeLimit={q.time_limit} />;

  return (
    <div className="question-display">
      <p className="question-text">{q.content}</p>

      {(q.type === QUESTION_TYPE.TEXT || q.type === QUESTION_TYPE.ORAL || q.type === QUESTION_TYPE.VIDEO) && (
        <FreeTextAnswer question={q} player={player} session={session} onAnswered={() => setAnswered(true)} />
      )}

      {q.type === QUESTION_TYPE.MCQ && (
        <McqAnswer question={q} player={player} session={session} onAnswered={() => setAnswered(true)} />
      )}
    </div>
  );
}