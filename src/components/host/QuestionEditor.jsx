import { useState } from "react";
import { supabase, uploadVideo } from "../../lib/supabase";
import { QUESTION_TYPE, DEFAULT_TIME_LIMIT, DEFAULT_POINTS, MCQ_CHOICES } from "../../lib/constants";

const EMPTY = { type: QUESTION_TYPE.TEXT, content: "", options: ["","","",""], time_limit: DEFAULT_TIME_LIMIT, points: DEFAULT_POINTS };

export default function QuestionEditor({ sessionId, onSaved }) {
  const [q,       setQ]       = useState(EMPTY);
  const [file,    setFile]    = useState(null);
  const [saving,  setSaving]  = useState(false);

  async function save() {
    setSaving(true);
    let video_url = null;
    if (q.type === QUESTION_TYPE.VIDEO && file) {
      video_url = await uploadVideo(file, sessionId);
    }
    const options = q.type === QUESTION_TYPE.MCQ
      ? MCQ_CHOICES.map((label, i) => ({ label, text: q.options[i] }))
      : null;

    await supabase.from("questions").insert({
      session_id: sessionId,
      type:       q.type,
      content:    q.content,
      options,
      video_url,
      time_limit: q.time_limit,
      points:     q.points,
    });
    setQ(EMPTY);
    setFile(null);
    setSaving(false);
    onSaved?.();
  }

  return (
    <div className="question-editor">
      <h3>Ajouter une question</h3>
      <select value={q.type} onChange={e => setQ({ ...q, type: e.target.value })}>
        <option value={QUESTION_TYPE.TEXT}>Texte libre</option>
        <option value={QUESTION_TYPE.MCQ}>QCM (A/B/C/D)</option>
        <option value={QUESTION_TYPE.VIDEO}>Vidéo + réponse</option>
        <option value={QUESTION_TYPE.ORAL}>Oral + texte téléphone</option>
      </select>

      <textarea placeholder="Texte de la question" value={q.content}
        onChange={e => setQ({ ...q, content: e.target.value })} />

      {q.type === QUESTION_TYPE.MCQ && MCQ_CHOICES.map((label, i) => (
        <input key={label} placeholder={`Option ${label}`} value={q.options[i]}
          onChange={e => {
            const opts = [...q.options]; opts[i] = e.target.value;
            setQ({ ...q, options: opts });
          }} />
      ))}

      {q.type === QUESTION_TYPE.VIDEO && (
        <input type="file" accept="video/mp4,video/webm,video/ogg"
          onChange={e => setFile(e.target.files[0])} />
      )}

      <div className="editor-meta">
        <label>Temps (s)
          <input type="number" value={q.time_limit} min={5} max={120}
            onChange={e => setQ({ ...q, time_limit: +e.target.value })} />
        </label>
        <label>Points
          <input type="number" value={q.points} min={10}
            onChange={e => setQ({ ...q, points: +e.target.value })} />
        </label>
      </div>

      <button onClick={save} disabled={saving || !q.content}>
        {saving ? "Enregistrement..." : "Ajouter"}
      </button>
    </div>
  );
}