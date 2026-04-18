import { useParams } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { usePlayers } from "../hooks/usePlayers";
import { SESSION_STATUS } from "../lib/constants";
import SessionLobby  from "../components/host/SessionLobby";
import LiveQuestion  from "../components/host/LiveQuestion";
import AnswersBoard  from "../components/host/AnswersBoard";
import Scoreboard    from "../components/host/Scoreboard";
import QrManager     from "../components/host/QrManager";

export default function HostLive() {
  const { sessionId } = useParams();
  const { session, loading } = useSession(sessionId);
  const players = usePlayers(sessionId);

  if (loading) return <p>Chargement...</p>;
  if (!session) return <p>Session introuvable.</p>;

  return (
    <div className="host-live">
      <header className="host-header">
        <span>Code : <strong>{session.code}</strong></span>
        <span>{players.length} joueur(s)</span>
      </header>

      {session.status === SESSION_STATUS.LOBBY    && <SessionLobby session={session} players={players} />}
      {session.status === SESSION_STATUS.QUESTION && <LiveQuestion session={session} />}
      {session.status === SESSION_STATUS.REVEAL   && <AnswersBoard session={session} players={players} />}
      {session.status === SESSION_STATUS.LIVE     && <Scoreboard   session={session} players={players} />}
      {session.status === SESSION_STATUS.QR       && <QrManager    session={session} />}
      {session.status === SESSION_STATUS.FINISHED && <Scoreboard   session={session} players={players} final />}
    </div>
  );
}