import { useState, useEffect, useRef } from "react";
import { MicIcon, CamIcon, Avatar } from "./Icons";

const TOTAL_SECONDS = 4 * 60 + 32;

function CountdownTimer({ seconds }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return <span>{mins}:{secs}</span>;
}

export default function SessionLobby({ onJoin }) {
  const [timeLeft, setTimeLeft]           = useState(TOTAL_SECONDS);
  const [micActive, setMicActive]         = useState(false);
  const [camActive, setCamActive]         = useState(false);
  const [micError, setMicError]           = useState(null);
  const [camError, setCamError]           = useState(null);
  const [camPermission, setCamPermission] = useState("idle");

  const videoRef     = useRef(null);
  const streamRef    = useRef(null);
  const micStreamRef = useRef(null);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const toggleMic = async () => {
    if (micActive) {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
      setMicActive(false);
    } else {
      setMicError(null);
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = s;
        setMicActive(true);
      } catch (e) {
        setMicError(e.name === "NotAllowedError"
          ? "Microphone access denied. Allow it in browser settings."
          : "Could not access mic: " + e.message);
      }
    }
  };

  const toggleCam = async () => {
    if (camActive) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCamActive(false);
    } else {
      setCamError(null);
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); }
        setCamPermission("granted");
        setCamActive(true);
      } catch (e) {
        setCamPermission("denied");
        setCamError(e.name === "NotAllowedError"
          ? "Camera access denied. Allow it in browser settings."
          : "Could not access camera: " + e.message);
      }
    }
  };

  const handleJoin = () => onJoin({ camStream: streamRef.current, micActive, camActive });
  const minutesLeft = Math.ceil(timeLeft / 60);

  return (
    <>
      <style>{`
        .lobby-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #f3f0ff 0%, #ede8fb 50%, #f8f5ff 100%);
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          // padding: 75px 32px 40px;
          padding-top: 75px;
          box-sizing: border-box;
        }
        .lobby-card {
          width: 100%;
          background: #f7f4fe;
          border-radius: 20px;
          border: 1.5px solid #ddd6f8;
          box-shadow: 0 6px 32px rgba(100,70,200,.10);
          overflow: hidden;
        }
        .lobby-body {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 24px;
          padding: 24px;
        }
        @media (max-width: 768px) {
          .lobby-body { grid-template-columns: 1fr; }
          .privacy-grid { grid-template-columns: 1fr !important; }
          .session-meta-row { flex-direction: column; gap: 10px; align-items: flex-start !important; }
          .countdown-badge { align-self: flex-start; }
          .controls-row { flex-wrap: wrap; }
        }
        .icon-btn-active {
          background: #ede8fb;
          border: 1.5px solid #c4b0f0;
          color: #6b3fd4;
        }
        .icon-btn-active:hover { background: #e0d8f8; }
        .icon-btn-inactive {
          background: #fde8e8;
          border: 1.5px solid #f5b8b8;
          color: #dc2626;
        }
        .icon-btn-inactive:hover { background: #fdd0d0; }
        .icon-btn-base {
          border-radius: 10px;
          padding: 9px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          transition: all .18s;
          user-select: none;
          white-space: nowrap;
        }
        .join-btn {
          background: linear-gradient(135deg, #6b3fd4, #4a26a0);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          width: 100%;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: .3px;
          box-shadow: 0 4px 18px rgba(107,63,212,.32);
          transition: opacity .15s, transform .1s;
        }
        .join-btn:hover { opacity: .92; transform: translateY(-1px); }
        .device-row {
          background: white;
          border: 1.5px solid #ddd6f8;
          border-radius: 10px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
        }
        .privacy-card {
          background: white;
          border: 1.5px solid #ece6fb;
          border-radius: 14px;
          padding: 16px;
        }
      `}</style>

      <div className="lobby-root">
        <div className="lobby-card">

          {/* ── BODY ── */}
          <div className="lobby-body">

            {/* ── LEFT: Camera & Audio ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#4a3680", letterSpacing: ".2px" }}>
                Camera &amp; Audio Settings
              </div>

              {/* Video preview */}
              <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "4/3", position: "relative", background: "#1a1030" }}>
                <video
                  ref={videoRef} autoPlay muted playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: camActive ? "block" : "none", transform: "scaleX(-1)" }}
                />
                {!camActive && (
                  <div style={{ position: "absolute", inset: 0, background: camError ? "linear-gradient(160deg,#4a1a1a,#2d0f0f)" : "linear-gradient(160deg,#2d1f5e,#1a1030)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 20, textAlign: "center" }}>
                    {camError ? (
                      <>
                        <span style={{ fontSize: 32 }}>⚠️</span>
                        <span style={{ fontSize: 12, color: "rgba(255,150,150,.9)", fontWeight: 500, lineHeight: 1.5 }}>{camError}</span>
                      </>
                    ) : (
                      <>
                        <CamIcon off size={40} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,.45)", fontWeight: 500 }}>
                          {camPermission === "idle" ? "Click 'Cam On' to enable" : "Camera is off"}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Device selectors */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[["Camera", "HD Webcam"], ["Microphone", "Default Microphone"], ["Speaker", "Default Speakers"]].map(([label, value]) => (
                  <div key={label} className="device-row">
                    <span style={{ fontSize: 12, color: "#9889c8", minWidth: 80, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13, color: "#2d1f5e", fontWeight: 500, flex: 1 }}>{value}</span>
                    <span style={{ color: "#9889c8", fontSize: 12 }}>▾</span>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="controls-row" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    className={`icon-btn-base ${micActive ? "icon-btn-active" : "icon-btn-inactive"}`}
                    onClick={toggleMic}
                  >
                    <MicIcon muted={!micActive} size={15} />
                    {micActive ? "Mic On" : "Mic Off"}
                  </button>
                  <button
                    className={`icon-btn-base ${camActive ? "icon-btn-active" : "icon-btn-inactive"}`}
                    onClick={toggleCam}
                  >
                    <CamIcon off={!camActive} size={15} />
                    {camActive ? "Cam On" : "Cam Off"}
                  </button>
                  <button
                    style={{ background: "#ede8fb", border: "none", borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontSize: 13, color: "#5a3db5", fontWeight: 600, fontFamily: "inherit" }}
                    onClick={toggleMic}
                  >
                    {micActive ? "🔊 Testing..." : "Test Mic"}
                  </button>
                </div>
                {micError && (
                  <div style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: "8px 12px", lineHeight: 1.5 }}>
                    🎤 {micError}
                  </div>
                )}
              </div>

              <button className="join-btn" onClick={handleJoin}>
                {(() => {
                  if (minutesLeft > 0) {
                    return `Join in ${minutesLeft} min`;
                  } else {
                    return "Join Now";
                  }
                })()}
              </button>
            </div>

            {/* ── RIGHT: Therapist & Privacy ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Therapist card */}
              <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1.5px solid #ece6fb", boxShadow: "0 2px 12px rgba(100,70,200,.06)" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                  <Avatar size={56} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#2d1f5e" }}>
                      Dr. Sarah Mitchell, <span style={{ fontWeight: 400, fontSize: 15 }}>PhD</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#7c6aaa", marginTop: 2 }}>RCI Verified</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <span style={{ background: "#7c4ddb", color: "white", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>Anxiety</span>
                      <span style={{ background: "#ede8fb", color: "#5a3db5", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>Relationships</span>
                    </div>
                  </div>
                </div>
                <div className="session-meta-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 14, color: "#3d2e70", fontWeight: 500, lineHeight: 1.8 }}>
                    Duration: 50 mins<br />
                    Starts in <CountdownTimer seconds={timeLeft} />
                  </div>
                  <div className="countdown-badge" style={{ background: "#7c4ddb", color: "white", borderRadius: 12, padding: "9px 16px", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>
                    Session starts in <CountdownTimer seconds={timeLeft} />
                  </div>
                </div>
              </div>

              {/* Privacy cards grid */}
              <div className="privacy-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  [{ icon: "🔒", t: "Encrypted session" }, { icon: "🎬", t: "No recording allowed" }, { icon: "👤", t: "Journal stays private" }],
                  [{ icon: "✅", t: "Encrypted session" }, { icon: "✅", t: "No recording allowed" }, { icon: "🚫", t: "Journal stays private" }],
                ].map((items, i) => (
                  <div key={i} className="privacy-card">
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#2d1f5e", marginBottom: 12 }}>Secure &amp; Private</div>
                    {items.map(({ icon, t }) => (
                      <div key={t} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8, fontSize: 13, color: "#4a3680", fontWeight: 500 }}>
                        <span style={{ fontSize: 16 }}>{icon}</span> {t}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button className="join-btn" onClick={handleJoin}>
                {(() => {
                  if (minutesLeft > 0) {
                    return `Join in ${minutesLeft} min`;
                  } else {
                    return "Join Now";
                  }
                })()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}