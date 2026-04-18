import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function HostSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function createSession() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sessions")
      .insert({ code: "" })   // le trigger génère le code
      .select()
      .single();
    if (error) { console.error(error); setLoading(false); return; }
    navigate(`/host/${data.id}/live`);
  }

  return (
    <div className="setup-container">
      <h2>Nouvelle session</h2>
      <button onClick={createSession} disabled={loading}>
        {loading ? "Création...." : "Démarrer"}
      </button>
    </div>
  );
}