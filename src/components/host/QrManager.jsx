import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../../lib/supabase";
import { useQrScans } from "../../hooks/useQrScans";
import { SESSION_STATUS, DEFAULT_QR_POINTS } from "../../lib/constants";

export default function QrManager({ session }) {
  const [codes,   setCodes]   = useState([]);
  const [label,   setLabel]   = useState("");
  const [points,  setPoints]  = useState(DEFAULT_QR_POINTS);
  const [qrImgs,  setQrImgs]  = useState({});
  const scans = useQrScans(session.id);

  useEffect(() => {
    supabase.from("qr_codes").select("*").eq("session_id", session.id)
      .then(({ data }) => {
        setCodes(data ?? []);
        data?.forEach(c => {
          QRCode.toDataURL(c.token, { width: 150 })
            .then(url => setQrImgs(prev => ({ ...prev, [c.id]: url })));
        });
      });
  }, [session.id]);

  async function addCode() {
    const { data } = await supabase.from("qr_codes")
      .insert({ session_id: session.id, label, points }).select().single();
    setCodes(c => [...c, data]);
    const url = await QRCode.toDataURL(data.token, { width: 150 });
    setQrImgs(prev => ({ ...prev, [data.id]: url }));
    setLabel("");
  }

  async function endQr() {
    await supabase.from("sessions")
      .update({ status: SESSION_STATUS.LIVE }).eq("id", session.id);
  }

  return (
    <div className="qr-manager">
      <h3>Chasse aux QR codes</h3>

      <div className="qr-add">
        <input placeholder="Label (ex: Salle B)" value={label}
          onChange={e => setLabel(e.target.value)} />
        <input type="number" value={points} min={10}
          onChange={e => setPoints(+e.target.value)} />
        <button onClick={addCode} disabled={!label}>Générer</button>
      </div>

      <div className="qr-grid">
        {codes.map(c => (
          <div key={c.id} className="qr-card">
            {qrImgs[c.id] && <img src={qrImgs[c.id]} alt={c.label} />}
            <p>{c.label} â€” {c.points} pts</p>
          </div>
        ))}
      </div>

      <div className="qr-scans">
        <h4>Scans ({scans.length})</h4>
        <ol>
          {scans.map(s => (
            <li key={s.id}>
              #{s.rank} {s.player?.nickname} â€” {s.qr_code?.label}
            </li>
          ))}
        </ol>
      </div>

      <button onClick={endQr}>Terminer la chasse</button>
    </div>
  );
}