import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <h1>Quiz App</h1>
      <div className="home-actions">
        <button onClick={() => navigate("/host")}>
          Créér une session (Maître)
        </button>
        <button onClick={() => navigate("/join")}>
          Rejoindre une session (Joueur)
        </button>
      </div>
    </div>
  );
}