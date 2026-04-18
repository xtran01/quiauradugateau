export default function Scoreboard({ players, final }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className="scoreboard">
      <h3>{final ? "Classement final" : "Classement"}</h3>
      <ol>
        {sorted.map((p, i) => (
          <li key={p.id} className={i === 0 ? "first" : ""}>
            <span>{i + 1}. {p.nickname}</span>
            <span>{p.score} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
}