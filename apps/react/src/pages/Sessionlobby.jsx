import { useState, useEffect, useRef } from "react";
import { MicIcon, CamIcon, Avatar } from "./Icons";
import { webRTCManager } from "../config/webrtcmanger";

const TOTAL_SECONDS = 4 * 60 + 32;

function CountdownTimer({ seconds }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{mins}:{secs}</span>;
}

/**
 * SessionLobby
 * Props:
 *   sessionCode  – string  (e.g. "ABC123")
 *   userId       – string
 *   role         – "patient" | "therapist"
 *   therapist    – { name, credentials, specialties, avatarInitials }
 *   sessionMeta  – { durationMins, startsAt (ISO string) }
 *   onJoined     – () => void  called after webRTCManager.initialize() succeeds
 */
export default function SessionLobby({
  sessionCode = "69a54abd29c99c56303ea5f6",
  userId = "696f408b2ff51b82b1cee0e6",
  role = "patient",
  therapist = { name: "Dr. Sarah Mitchell", credentials: "PhD", specialties: ["Anxiety", "Relationships"], avatarInitials: "SM" },
  sessionMeta = { durationMins: 50 },
  onJoined,
}) {
  const [timeLeft, setTimeLeft]           = useState(TOTAL_SECONDS);
  const [micActive, setMicActive]         = useState(false);
  const [camActive, setCamActive]         = useState(false);
  const [micError, setMicError]           = useState(null);
  const [camError, setCamError]           = useState(null);
  const [camPermission, setCamPermission] = useState("idle");
  const [joining, setJoining]             = useState(false);
  const [joinError, setJoinError]         = useState(null);

  const videoRef     = useRef(null);
  const streamRef    = useRef(null);
  const micStreamRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      micStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

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
        const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, frameRate: 30 } });
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
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

  const handleJoin = async () => {
    setJoining(true);
    setJoinError(null);

    // Stop local preview streams – webRTCManager will re-acquire them
    streamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    micStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    try {
      await webRTCManager.initialize(sessionCode, userId, role);
      onJoined?.();
    } catch (err) {
      setJoinError(
        err.name === "NotAllowedError"
          ? "Camera/microphone access denied. Please allow in browser settings and try again."
          : "Failed to start session: " + (err.message || "Unknown error")
      );
      setJoining(false);
    }
  };

  const minutesLeft = Math.ceil(timeLeft / 60);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        .lobby-root {
          min-height: 100vh;
          background: linear-gradient(145deg, #f0ecff 0%, #e8e2fb 40%, #f5f2ff 100%);
          font-family: 'Sora', 'Segoe UI', sans-serif;
          padding-top: 72px;
          padding-bottom: 40px;
          padding-left: 24px;
          padding-right: 24px;
          box-sizing: border-box;
        }
        .lobby-card {
          max-width: 960px;
          margin: 0 auto;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1.5px solid rgba(180,160,240,0.3);
          box-shadow: 0 8px 48px rgba(100,60,200,.12), 0 2px 12px rgba(100,60,200,.06);
          overflow: hidden;
        }
        .lobby-header {
          background: linear-gradient(90deg, #6b3fd4 0%, #8b5cf6 100%);
          padding: 18px 28px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lobby-header-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,.25);
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 3px rgba(74,222,128,.25); }
          50% { box-shadow: 0 0 0 6px rgba(74,222,128,.1); }
        }
        .lobby-body {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 0;
        }
        @media (max-width: 760px) {
          .lobby-body { grid-template-columns: 1fr; }
          .lobby-right { border-left: none !important; border-top: 1.5px solid #ede8fb; }
        }
        .lobby-left { padding: 24px; }
        .lobby-right { padding: 24px; border-left: 1.5px solid #ede8fb; }

        .device-row {
          background: #f7f4fe;
          border: 1.5px solid #e8e2f8;
          border-radius: 10px;
          padding: 9px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: default;
        }
        .ctrl-toggle {
          border-radius: 10px;
          padding: 9px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          transition: all .16s;
          border: 1.5px solid transparent;
          outline: none;
        }
        .ctrl-on  { background: #ede8fb; border-color: #c4b0f0; color: #6b3fd4; }
        .ctrl-on:hover  { background: #e2dbf7; }
        .ctrl-off { background: #fde8e8; border-color: #f5b8b8; color: #dc2626; }
        .ctrl-off:hover { background: #fdd0d0; }

        .join-btn {
          background: linear-gradient(135deg, #6b3fd4, #4a26a0);
          color: white;
          border: none;
          border-radius: 14px;
          padding: 15px;
          width: 100%;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 20px rgba(107,63,212,.32);
          transition: opacity .15s, transform .12s;
          letter-spacing: .2px;
        }
        .join-btn:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); }
        .join-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        .specialty-tag {
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 12px;
          font-weight: 600;
        }
        .privacy-card {
          background: #f9f7ff;
          border: 1.5px solid #ece6fb;
          border-radius: 14px;
          padding: 16px;
        }
        .privacy-item {
          display: flex; align-items: center; gap: 9px;
          margin-bottom: 8px; font-size: 13px; color: #4a3680; font-weight: 500;
        }
        .error-box {
          font-size: 12px; color: #dc2626;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 9px; padding: 8px 12px; line-height: 1.5;
        }
      `}</style>

      <div className="lobby-root">
        <div className="lobby-card">

          {/* Header */}
          <div className="lobby-header">
            <div className="lobby-header-dot" />
            <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Pre-Session Setup</span>
            <span style={{ marginLeft: "auto", color: "rgba(255,255,255,.7)", fontSize: 13 }}>
              Session Code: <strong style={{ color: "white" }}>{sessionCode}</strong>
            </span>
          </div>

          <div className="lobby-body">

            {/* LEFT: Camera & Audio */}
            <div className="lobby-left" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                      <><span style={{ fontSize: 28 }}>⚠️</span><span style={{ fontSize: 12, color: "rgba(255,160,160,.9)", fontWeight: 500, lineHeight: 1.5 }}>{camError}</span></>
                    ) : (
                      <><CamIcon off size={36} /><span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>{camPermission === "idle" ? "Click 'Cam On' to preview" : "Camera is off"}</span></>
                    )}
                  </div>
                )}
                {/* Mic indicator */}
                <div style={{ position: "absolute", bottom: 10, left: 10, background: micActive ? "rgba(34,197,94,.85)" : "rgba(220,38,38,.85)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "white", fontWeight: 600 }}>
                  <MicIcon muted={!micActive} size={10} />
                  {micActive ? "Mic On" : "Mic Off"}
                </div>
              </div>

              {/* Device rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[["📷", "Camera", camActive ? "Active" : "Off"], ["🎤", "Microphone", micActive ? "Active" : "Off"], ["🔊", "Speaker", "Default"]].map(([icon, label, val]) => (
                  <div key={label} className="device-row">
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    <span style={{ fontSize: 12, color: "#9889c8", minWidth: 78, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13, color: "#2d1f5e", fontWeight: 600, flex: 1 }}>{val}</span>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: val === "Active" ? "#22c55e" : "#d1d5db", display: "inline-block" }} />
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className={`ctrl-toggle ${micActive ? "ctrl-on" : "ctrl-off"}`} onClick={toggleMic}>
                  <MicIcon muted={!micActive} size={14} />
                  {micActive ? "Mic On" : "Mic Off"}
                </button>
                <button className={`ctrl-toggle ${camActive ? "ctrl-on" : "ctrl-off"}`} onClick={toggleCam}>
                  <CamIcon off={!camActive} size={14} />
                  {camActive ? "Cam On" : "Cam Off"}
                </button>
              </div>

              {micError && <div className="error-box">🎤 {micError}</div>}
              {joinError && <div className="error-box">❌ {joinError}</div>}

              <button className="join-btn" onClick={handleJoin} disabled={joining}>
                {joining ? "Connecting…" : minutesLeft > 0 ? `Join in ${minutesLeft} min` : "Join Now →"}
              </button>
            </div>

            {/* RIGHT: Therapist & Privacy */}
            <div className="lobby-right" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Therapist card */}
              <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1.5px solid #ece6fb", boxShadow: "0 2px 14px rgba(100,70,200,.06)" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                  <Avatar size={58} initials={therapist.avatarInitials} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#2d1f5e" }}>
                      {therapist.name},{" "}
                      <span style={{ fontWeight: 400, fontSize: 14 }}>{therapist.credentials}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#22c55e", marginTop: 3, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" /></svg>
                      RCI Verified
                    </div>
                    <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                      {therapist.specialties.map((s, i) => (
                        <span key={s} className="specialty-tag" style={{ background: i === 0 ? "#7c4ddb" : "#ede8fb", color: i === 0 ? "white" : "#5a3db5" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 14, color: "#3d2e70", fontWeight: 500, lineHeight: 2 }}>
                    Duration: {sessionMeta.durationMins} mins<br />
                    Starts in <CountdownTimer seconds={timeLeft} />
                  </div>
                  <div style={{ background: "linear-gradient(135deg, #7c4ddb, #9b6bf5)", color: "white", borderRadius: 12, padding: "10px 18px", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 3px 12px rgba(124,77,219,.3)" }}>
                    ⏱ <CountdownTimer seconds={timeLeft} />
                  </div>
                </div>
              </div>

              {/* Privacy grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="privacy-card">
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#2d1f5e", marginBottom: 12 }}>🔐 Secure &amp; Private</div>
                  {[["🔒", "End-to-end encrypted"], ["🎬", "No recording allowed"], ["👤", "Journal stays private"]].map(([icon, text]) => (
                    <div key={text} className="privacy-item"><span style={{ fontSize: 15 }}>{icon}</span>{text}</div>
                  ))}
                </div>
                <div className="privacy-card">
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#2d1f5e", marginBottom: 12 }}>✅ Session Rules</div>
                  {[["✅", "HIPAA compliant"], ["✅", "Confidential session"], ["🚫", "No third-party access"]].map(([icon, text]) => (
                    <div key={text} className="privacy-item"><span style={{ fontSize: 15 }}>{icon}</span>{text}</div>
                  ))}
                </div>
              </div>

              {/* What to expect */}
              <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 14, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0369a1", marginBottom: 10 }}>💡 What to expect</div>
                {["Find a quiet, private space", "Ensure stable internet connection", "Have water nearby if needed", "You can chat with your therapist while waiting"].map(tip => (
                  <div key={tip} style={{ fontSize: 12.5, color: "#0c4a6e", marginBottom: 6, display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <span style={{ color: "#38bdf8", fontWeight: 700, lineHeight: 1.5 }}>→</span> {tip}
                  </div>
                ))}
              </div>

              <button className="join-btn" onClick={handleJoin} disabled={joining}>
                {joining ? "Connecting to session…" : minutesLeft > 0 ? `Join in ${minutesLeft} min` : "Join Session →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}