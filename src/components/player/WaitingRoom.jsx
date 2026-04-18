export default function WaitingRoom({ session, player }) {
  return (
    <div className="waiting-room">
      <h2>Bienvenue, {player.nickname} !</h2>
      <p>Session <strong>{session.code}</strong></p>
      <p className="waiting-msg">En attente du maÃ®tre de jeu...</p>
      <div className="pulse-dot" />
    </div>
  );
}