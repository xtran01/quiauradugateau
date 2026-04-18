import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../../lib/supabase";
import QuestionEditor from "./QuestionEditor";
import QuestionList   from "./QuestionList";

export default function SessionLobby({ session, players }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const joinUrl = `${window.location.origin}/join/${session.code}`;

  useEffect(() => {
    QRCode.toDataURL(joinUrl, { width: 200 }).then(setQrDataUrl);
  }, [joinUrl]);

  async function startSession() {
    await supabase.from("sessions").update({ status: "live" }).eq("id", session.id);
  }

  return (
    <div className="lobby">
      <div className="lobby-invite">
        {qrDataUrl && <img src={qrDataUrl} alt="QR invitation" />}
        <p>ou saisir le code <strong>{session.code}</strong></p>
        <p className="join-url">{joinUrl}</p>
      </div>

      <div className="lobby-players">
        <h3>Joueurs connectés ({players.length})</h3>
        <ul>{players.map(p => <li key={p.id}>{p.nickname}</li>)}</ul>
      </div>

      <QuestionEditor sessionId={session.id} />
      <QuestionList   sessionId={session.id} />

      <button className="btn-primary" onClick={startSession}
        disabled={players.length === 0}>
        Démarrer la session
      </button>
    </div>
  );
}