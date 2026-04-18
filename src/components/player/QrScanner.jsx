import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { supabase } from "../../lib/supabase";

export default function QrScanner({ session, player }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [msg, setMsg] = useState("Pointe ta caméra vers un QR code");
  const [scanned, setScanned] = useState([]);

  useEffect(() => {
    let stream;
    let raf;

    async function start() {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      scan();
    }

    function scan() {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      const ctx = canvas.getContext("2d");

      function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width  = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) handleScan(code.data);
        }
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }

    start().catch(() => setMsg("Caméra inaccessible"));
    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  async function handleScan(token) {
    if (scanned.includes(token)) return;

    const { data: qr } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("token", token)
      .eq("session_id", session.id)
      .single();

    if (!qr) { setMsg("QR code non reconnu"); return; }

    const { error } = await supabase.from("qr_scans").insert({
      qr_code_id: qr.id,
      player_id:  player.id,
      session_id: session.id,
    });

    if (error?.code === "23505") {
      setMsg("DéjÃ  scanné !");
    } else {
      setScanned(s => [...s, token]);
      setMsg(`QR scanné ! (${scanned.length + 1} trouvé(s))`);
    }
  }

  return (
    <div className="qr-scanner">
      <p>{msg}</p>
      <video ref={videoRef} playsInline muted style={{ width: "100%" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <p className="scan-count">QR trouvés : {scanned.length}</p>
    </div>
  );
}