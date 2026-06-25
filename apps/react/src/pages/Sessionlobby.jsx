/**
 * SessionLobby.jsx  (LiveKit edition)
 *
 * Pre-session setup screen.
 * – Camera preview via LiveKit createLocalVideoTrack
 * – Microphone via createLocalAudioTrack (routes through Bluetooth if connected)
 * – On "Join" → livekitManager.initialize() → onJoined()
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { createLocalAudioTrack, createLocalVideoTrack } from "livekit-client";
import { MicIcon, CamIcon, Avatar } from "./Icons";
import { livekitManager } from "../config/livekitmanager";
import { setFirebaseAuth } from "../firebase/config";

// ── Permission helpers ────────────────────────────────────────────────────────

function mediaErrorMessage(err, deviceLabel, permissionState) {
  switch (err.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return permissionState === "prompt"
        ? `${deviceLabel} access was dismissed. Click the button again and press "Allow".`
        : `${deviceLabel} access is blocked. Click the 🔒 icon → set ${deviceLabel} to "Allow" → refresh.`;
    case "NotFoundError":
    case "DevicesNotFoundError":
      return `No ${deviceLabel} found. Please connect one and try again.`;
    case "NotReadableError":
    case "TrackStartError":
      return `${deviceLabel} is in use by another app. Close it and try again.`;
    case "SecurityError":
      return `${deviceLabel} blocked by security policy. Ensure HTTPS and iframe has allow="camera; microphone".`;
    case "AbortError":
      return `${deviceLabel} request interrupted. Please try again.`;
    default:
      return `Could not access ${deviceLabel}: ${err.message || err.name}`;
  }
}

async function queryPermission(name) {
  if (!navigator?.permissions) return "unsupported";
  try {
    const r = await navigator.permissions.query({ name });
    return r.state;
  } catch { return "unsupported"; }
}

function CountdownTimer({ seconds }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{mins}:{secs}</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SessionLobby({
  sessionCode = "69a54abd29c99c56303ea5f6",
  userId      = "696f408b2ff51b82b1cee0e6",
  role        = "patient",
  userName    = "User",
  therapist   = { name: "Dr. Sarah Mitchell", credentials: "PhD", specialties: ["Anxiety", "Relationships"], avatarInitials: "SM" },
  sessionMeta = { durationMins: 50, startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString() },
  onJoined,
  therapistPhoto,
  patientPhoto
}) {
  // ── Countdown ──────────────────────────────────────────────────────────────
  const targetTime     = new Date(sessionMeta.startTime).getTime();
  const initialSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Device state ───────────────────────────────────────────────────────────
  const [micActive,    setMicActive]    = useState(false);
  const [camActive,    setCamActive]    = useState(false);
  const [micError,     setMicError]     = useState(null);
  const [camError,     setCamError]     = useState(null);
  const [micPermState, setMicPermState] = useState("idle");
  const [camPermState, setCamPermState] = useState("idle");
  const [joining,      setJoining]      = useState(false);
  const [joinError,    setJoinError]    = useState(null);

  // LiveKit local tracks for preview
  const localAudioRef = useRef(null); // LocalAudioTrack
  const localVideoRef = useRef(null); // LocalVideoTrack
  const videoContainerRef = useRef(null);
  const mountedRef    = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Stop preview tracks that were NOT handed to livekitManager
      localAudioRef.current?.stop();
      localVideoRef.current?.stop();
      localVideoRef.current?.detach();
    };
  }, []);

  // ── Attach local video preview ─────────────────────────────────────────────
  useEffect(() => {
    if (camActive && localVideoRef.current && videoContainerRef.current) {
      const el = localVideoRef.current.attach();
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.objectFit = "cover";
      el.style.transform = "scaleX(-1)";
      videoContainerRef.current.innerHTML = "";
      videoContainerRef.current.appendChild(el);
    }
  }, [camActive]);

  // ── Mic toggle ─────────────────────────────────────────────────────────────
  const toggleMic = useCallback(async () => {
    if (micActive) {
      localAudioRef.current?.stop();
      localAudioRef.current = null;
      localStorage.setItem("micActive", "false");
      if (mountedRef.current) { setMicActive(false); setMicError(null); }
      return;
    }
    if (!mountedRef.current) return;
    setMicError(null);
    setMicPermState("checking");

    if (!navigator?.mediaDevices?.getUserMedia) {
      setMicError("Microphone API unavailable. Ensure HTTPS.");
      setMicPermState("unsupported");
      return;
    }
    const beforeState = await queryPermission("microphone");
    try {
      const track = await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      if (!mountedRef.current) { track.stop(); return; }
      localAudioRef.current = track;
      localStorage.setItem("micActive", "true");
      setMicPermState("granted");
      setMicActive(true);
    } catch (err) {
      if (!mountedRef.current) return;
      const afterState = await queryPermission("microphone");
      setMicPermState(afterState);
      setMicError(mediaErrorMessage(err, "Microphone", beforeState));
    }
  }, [micActive]);

  // ── Camera toggle ──────────────────────────────────────────────────────────
  const toggleCam = useCallback(async () => {
    if (camActive) {
      localVideoRef.current?.stop();
      localVideoRef.current?.detach();
      localVideoRef.current = null;
      if (videoContainerRef.current) videoContainerRef.current.innerHTML = "";
      localStorage.setItem("camActive", "false");
      if (mountedRef.current) { setCamActive(false); setCamError(null); }
      return;
    }
    if (!mountedRef.current) return;
    setCamError(null);
    setCamPermState("checking");

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCamError("Camera API unavailable. Ensure HTTPS.");
      setCamPermState("unsupported");
      return;
    }
    const beforeState = await queryPermission("camera");
    try {
      const track = await createLocalVideoTrack({
        facingMode: "user",
        resolution: { width: 640, height: 480, frameRate: 30 },
      });
      if (!mountedRef.current) { track.stop(); return; }
      localVideoRef.current = track;
      localStorage.setItem("camActive", "true");
      setCamPermState("granted");
      setCamActive(true);
    } catch (err) {
      if (!mountedRef.current) return;
      const afterState = await queryPermission("camera");
      setCamPermState(afterState);
      setCamError(mediaErrorMessage(err, "Camera", beforeState));
    }
  }, [camActive]);

  // ── Join ───────────────────────────────────────────────────────────────────
  const handleJoin = useCallback(async () => {
    if (!mountedRef.current || joining) return;
    setJoining(true);
    setJoinError(null);

    // Transfer preview tracks ownership → livekitManager (no re-acquire)
    // We stop them here; livekitManager.initialize() acquires fresh ones to
    // publish into the room with proper signaling.
    localAudioRef.current?.stop();
    localVideoRef.current?.stop();
    localVideoRef.current?.detach();
    if (videoContainerRef.current) videoContainerRef.current.innerHTML = "";
    localAudioRef.current = null;
    localVideoRef.current = null;

    localStorage.setItem("camActive", String(camActive));
    localStorage.setItem("micActive", String(micActive));

    try {

      await Promise.all([
        setFirebaseAuth(),
        livekitManager.initialize(sessionCode, userId, role, userName, micActive, camActive)

      ])
      
      onJoined?.();
    } catch (err) {
      if (!mountedRef.current) return;
      setJoinError(
        err.name === "NotAllowedError"
          ? "Camera/mic access denied. Allow in address-bar → refresh."
          : "Failed to start session: " + (err.message || err.name || "Unknown error")
      );
      setJoining(false);
    }
  }, [sessionCode, userId, role, userName, micActive, camActive, onJoined, joining]);

  const minutesLeft    = Math.ceil(timeLeft / 60);
  const camStatusLabel = camActive ? "Active" : camPermState === "denied" ? "Blocked" : "Off";
  const micStatusLabel = micActive ? "Active" : micPermState === "denied" ? "Blocked" : "Off";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lobby-root {
          height: 100vh;
          height: 100dvh;
          background: linear-gradient(145deg, #f0ecff 0%, #e8e2fb 40%, #f5f2ff 100%);
          font-family: 'Sora', 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .lobby-card {
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .lobby-header {
          background: linear-gradient(90deg, #6b3fd4 0%, #8b5cf6 100%);
          padding: 22px 32px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          z-index: 5;
        }
        .lobby-header-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,.25);
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 3px rgba(74,222,128,.25); }
          50%       { box-shadow: 0 0 0 6px rgba(74,222,128,.1); }
        }
        .lobby-body {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          min-height: 0;
        }
        @media (max-width: 900px) {
          .lobby-body { grid-template-columns: 1fr; overflow-y: auto; }
          .lobby-root { height: auto; overflow: visible; min-height: 100vh; }
          .lobby-right { border-left: none !important; border-top: 1.5px solid #ede8fb; }
        }
        .lobby-left  { padding: clamp(24px, 5vw, 60px); overflow-y: auto; background: rgba(255, 255, 255, 0.4); }
        .lobby-right { padding: clamp(24px, 5vw, 60px); border-left: 1.5px solid #ede8fb; overflow-y: auto; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); }

        .preview-wrap {
          border-radius: 20px; overflow: hidden;
          aspect-ratio: 4/3; position: relative;
          background: #1a152e;
          border: 2px solid #ede8fb;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        }
        .preview-placeholder {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; color: rgba(255,255,255,.4);
          font-size: 13px; font-weight: 500;
        }

        .device-row {
          background: #f7f4fe;
          border: 1.5px solid #e8e2f8;
          border-radius: 10px;
          padding: 9px 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .device-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        .ctrl-toggle {
          border-radius: 10px; padding: 9px 16px;
          cursor: pointer; display: flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600; font-family: inherit;
          transition: all .16s; border: 1.5px solid transparent; outline: none;
          flex: 1; justify-content: center;
        }
        .ctrl-on        { background: #ede8fb; border-color: #c4b0f0; color: #6b3fd4; }
        .ctrl-on:hover  { background: #e2dbf7; }
        .ctrl-off       { background: #fde8e8; border-color: #f5b8b8; color: #dc2626; }
        .ctrl-off:hover { background: #fdd0d0; }
        .ctrl-checking  { background: #f1f5f9; border-color: #cbd5e1; color: #64748b; cursor: wait; }

        .join-btn {
          background: linear-gradient(135deg, #6b3fd4, #4a26a0);
          color: white; border: none; border-radius: 14px;
          padding: 18px; width: 100%;
          font-size: 16px; font-weight: 700; cursor: pointer;
          font-family: inherit; letter-spacing: .2px;
          box-shadow: 0 4px 20px rgba(107,63,212,.32);
          transition: opacity .15s, transform .12s;
        }
        .join-btn:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); }
        .join-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        .specialty-tag {
          border-radius: 20px; padding: 4px 14px;
          font-size: 13px; font-weight: 600;
        }
        .privacy-card {
          background: #f9f7ff; border: 1.5px solid #ece6fb;
          border-radius: 14px; padding: 16px;
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
        .tip-row {
          font-size: 12px; color: #6b5eaa;
          margin-bottom: 5px; display: flex; gap: 7px; line-height: 1.6;
        }
      `}</style>

      <div className="lobby-root">
        <div className="lobby-card">

          {/* Header */}
           <div className="lobby-header">
            <div className="lobby-header-dot" />
            <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>Pre-Session Setup</span>
            <span style={{ marginLeft: "auto", color: "rgba(255,255,255,.7)", fontSize: 14 }}>
              Session Code: <strong style={{ color: "white" }}>{sessionCode}</strong>
            </span>
          </div>

          <div className="lobby-body">

            {/* LEFT */}
            <div className="lobby-left" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6b5eaa", letterSpacing: "1px", textTransform: "uppercase" }}>
                Camera &amp; Audio
              </div>

              {/* Video preview */}
              <div className="preview-wrap">
                <div
                  ref={videoContainerRef}
                  style={{ width: "100%", height: "100%", display: camActive ? "block" : "none" }}
                />
                {!camActive && (
                  <div className="preview-placeholder">
                    {camPermState === "checking"
                      ? <><span style={{ fontSize: 22 }}>⏳</span><span>Requesting permission…</span></>
                      : camError
                      ? <><span style={{ fontSize: 22 }}>⚠️</span><span style={{ color: "#f87171", fontSize: 11, textAlign: "center", padding: "0 16px" }}>{camError}</span></>
                      : <><CamIcon off size={32} /><span>Click "Camera" to preview</span></>
                    }
                  </div>
                )}
                {/* Mic badge */}
                <div style={{
                  position: "absolute", bottom: 10, left: 10,
                  background: micActive ? "rgba(34,197,94,.8)" : "rgba(239,68,68,.75)",
                  borderRadius: 20, padding: "3px 10px",
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 12, color: "white", fontWeight: 600, backdropFilter: "blur(6px)",
                }}>
                  <MicIcon muted={!micActive} size={11} />
                  {micActive ? "Mic On" : "Mic Off"}
                </div>
              </div>

              {/* Device rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["📷", "Camera",     camStatusLabel],
                  ["🎤", "Microphone", micStatusLabel],
                  ["🔊", "Speaker",    "Default"],
                ].map(([icon, label, val]) => (
                  <div key={label} className="device-row">
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: "#9889c8", minWidth: 90, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 14, color: val === "Blocked" ? "#dc2626" : "#2d1f5e", fontWeight: 600, flex: 1 }}>{val}</span>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: val === "Active" ? "#22c55e" : val === "Blocked" ? "#dc2626" : "#d1d5db",
                      display: "inline-block",
                    }} />
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  className={`ctrl-toggle ${micPermState === "checking" ? "ctrl-checking" : micActive ? "ctrl-on" : "ctrl-off"}`}
                  onClick={toggleMic} disabled={micPermState === "checking"}
                >
                  <MicIcon muted={!micActive} size={16} />
                  {micPermState === "checking" ? "Requesting…" : micActive ? "Microphone On" : "Microphone Off"}
                </button>
                <button
                  className={`ctrl-toggle ${camPermState === "checking" ? "ctrl-checking" : camActive ? "ctrl-on" : "ctrl-off"}`}
                  onClick={toggleCam} disabled={camPermState === "checking"}
                >
                  <CamIcon off={!camActive} size={16} />
                  {camPermState === "checking" ? "Requesting…" : camActive ? "Camera On" : "Camera Off"}
                </button>
              </div>

              {micError  && <div className="error-box">🎤 {micError}</div>}
              {camError  && <div className="error-box">📷 {camError}</div>}
              {joinError && <div className="error-box">❌ {joinError}</div>}

              <button className="join-btn" onClick={handleJoin} disabled={joining}>
                {joining ? "Connecting…" : minutesLeft > 0 ? `Join in ${minutesLeft} min` : "Join Now →"}
              </button>
            </div>

            {/* RIGHT */}
            <div className="lobby-right" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Therapist card */}
              <div className="privacy-card" style={{ background: "white" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                  <Avatar image={role==='patient'?therapistPhoto:patientPhoto} size={64} initials={therapist.avatarInitials} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#2d1f5e" }}>
                      {therapist.name}
                      {role === "patient" && <span style={{ fontWeight: 400, fontSize: 13, color: "#6b5eaa" }}>, {therapist.credentials}</span>}
                    </div>
                    {role === "patient" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        {therapist.specialties.map((s, i) => (
                          <span key={s} className="specialty-tag" style={{ background: i === 0 ? "#ede8fb" : "#f7f4fe", color: i === 0 ? "#6b3fd4" : "#6b5eaa" }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 15, color: "#3d2e70", fontWeight: 500, lineHeight: 2 }}>
                    Duration: {sessionMeta.durationMins} mins<br />
                    Starts in <CountdownTimer seconds={timeLeft} />
                  </div>
                  <div style={{ background: "linear-gradient(135deg, #7c4ddb, #9b6bf5)", color: "white", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 3px 12px rgba(124,77,219,.3)" }}>
                    ⏱ <CountdownTimer seconds={timeLeft} />
                  </div>
                </div>
              </div>

              {/* Privacy grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { title: "🔐 Secure & Private", items: [["🔒", "E2E encrypted"], ["🎬", "No recording"], ["👤", "Journal stays private"]] },
                  { title: "🛡️ Session Rules",    items: [["🔐", "HIPAA compliant"], ["🤝", "Confidential"], ["🚷", "No third-party access"]] },
                ].map(({ title, items }) => (
                  <div key={title} className="privacy-card">
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#6b5eaa", marginBottom: 10 }}>{title}</div>
                    {items.map(([icon, text]) => (
                      <div key={text} className="privacy-item"><span style={{ fontSize: 14 }}>{icon}</span>{text}</div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div style={{ background: "#f9f7ff", border: "1.5px solid #ece6fb", borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#6b3fd4", marginBottom: 10, letterSpacing: ".5px" }}>💡 BEFORE YOU JOIN</div>
                {["Find a quiet, private space", "Ensure a stable internet connection", "Bluetooth headphones are supported", "Chat with your therapist while waiting"].map(tip => (
                  <div key={tip} className="tip-row"><span style={{ color: "#6b3fd4", fontWeight: 700, lineHeight: 1.5 }}>→</span>{tip}</div>
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