import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useSession } from "../hooks/useSession";
import WaitingRoom     from "../components/player/WaitingRoom";
import QuestionDisplay from "../components/player/QuestionDisplay";
import QrScanner       from "../components/player/QrScanner";
import Scoreboard      from "../components/host/Scoreboard";
import { SESSION_STATUS } from "../lib/constants";

export default function PlayerJoin() {
  const { code: paramCode } = useParams();
  const navigate = useNavigate();

  const [code,     setCode]     = useState(paramCode ?? "");
  const [nickname, setNickname] = useState("");
  const [player,   setPlayer]   = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const { session } = useSession(sessionId);

  async function join() {
    // 1. Trouver la session par code
    const { data: sess, error } = await supabase
      .from("sessions")
      .select("id, status")
      .eq("code", code.toUpperCase())
      .single();
    if (error || !sess) { alert("Code introuvable"); return; }

    // 2. Créer le joueur
    const { data: p, error: pe } = await supabase
      .from("players")
      .insert({ session_id: sess.id, nickname })
      .select()
      .single();
    if (pe) { alert("Erreur lors de l inscription"); return; }

    setSessionId(sess.id);
    setPlayer(p);
  }

  if (!player) {
    return (
      <div className="join-container">
        <h2>Rejoindre la session</h2>
        <input placeholder="Code (ex: XK7T2P)" value={code}
          onChange={e => setCode(e.target.value)} maxLength={6} />
        <input placeholder="Ton pseudo" value={nickname}
          onChange={e => setNickname(e.target.value)} />
        <button onClick={join} disabled={!code || !nickname}>Rejoindre</button>
      </div>
    );
  }

  if (!session) return <p>Connexion...</p>;

  return (
    <>
      {session.status === SESSION_STATUS.LOBBY    && <WaitingRoom session={session} player={player} />}
      {session.status === SESSION_STATUS.QUESTION && <QuestionDisplay session={session} player={player} />}
      {session.status === SESSION_STATUS.REVEAL   && <p className="player-wait">En attente du résultat...</p>}
      {session.status === SESSION_STATUS.LIVE     && <p className="player-wait">Prochaine question bientÃ´t...</p>}
      {session.status === SESSION_STATUS.QR       && <QrScanner session={session} player={player} />}
      {session.status === SESSION_STATUS.FINISHED && <Scoreboard session={session} final />}
    </>
  );
}