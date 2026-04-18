import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const frames = [
    'cake_slice_010.png',
    'cake_slice_025.png',
    'cake_slice_033.png',
    'cake_slice_050.png',
    'cake_slice_066.png',
    'cake_slice_075.png',
    'cake_slice_100.png'
  ];
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 200); // Change frame every 200ms
    return () => clearInterval(interval);
  }, [frames.length]);

  return (
    <div className="home">
      <header className="home-header">
        <img src={`/resources/${frames[currentFrame]}`} alt="Cake Slice Logo" className="home-logo" />
        <h1>Qui aura le gateau ?</h1>
      </header>
      <main className="home-main">
        <div className="home-image">
          <img src="/resources/cake_front.png" alt="Cake Illustration" />
        </div>
        <div className="home-description">
          <p>Challenge your friends or join a game!</p>
        </div>
        <div className="home-actions">
          <button onClick={() => navigate("/host")}>
            Créer une session (Maître)
          </button>
          <button onClick={() => navigate("/join")}>
            Rejoindre une session (Joueur)
          </button>
          <button onClick={() => navigate("/join")}>
            Gestion (Admin)
          </button>
        </div>
      </main>
    </div>
  );
}