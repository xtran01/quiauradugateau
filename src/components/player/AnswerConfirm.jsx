import { useEffect, useState } from "react";

export default function AnswerConfirm({ timeLimit }) {
  const [t, setT] = useState(timeLimit);
  useEffect(() => {
    if (t <= 0) return;
    const id = setTimeout(() => setT(x => x - 1), 1000);
    return () => clearTimeout(id);
  }, [t]);

  return (
    <div className="answer-confirm">
      <div className="check-icon">âœ“</div>
      <p>Réponse envoyée !</p>
      <p className="confirm-timer">{t}s restantes</p>
    </div>
  );
}