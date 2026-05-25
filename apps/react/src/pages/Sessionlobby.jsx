import { useState, useEffect, useRef, useCallback } from "react";
import { MicIcon, CamIcon, Avatar } from "./Icons";
import { webRTCManager } from "../config/webrtcmanger";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a getUserMedia DOMException to a human-readable, actionable message.
 * NotAllowedError = user denied OR browser/OS blocked (no popup was shown).
 * We distinguish the two by checking the pre-flight permission state.
 */
function mediaErrorMessage(err, deviceLabel, permissionState) {
  switch (err.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      // permissionState "denied"  → user previously denied, popup won't appear again
      // permissionState "prompt"  → user dismissed the popup this time
      // permissionState "unsupported" / undefined → OS-level block or policy header
      if (permissionState === "prompt") {
        return `${deviceLabel} access was dismissed. Please click the button again and press "Allow" in the browser prompt.`;
      }
      return (
        `${deviceLabel} access is blocked. ` +
        `Click the 🔒 lock icon in your browser's address bar → ` +
        `set ${deviceLabel} to "Allow" → refresh the page.`
      );

    case "NotFoundError":
    case "DevicesNotFoundError":
      return `No ${deviceLabel} found. Please connect one and try again.`;

    case "NotReadableError":
    case "TrackStartError":
      return `${deviceLabel} is in use by another application. Please close it and try again.`;

    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return `${deviceLabel} doesn't support the requested quality settings. Retrying with lower quality…`;

    case "SecurityError":
      return (
        `${deviceLabel} access is blocked by a browser security policy. ` +
        `Ensure the page is on HTTPS and is not inside a restricted iframe ` +
        `(the iframe must have the allow="camera; microphone" attribute).`
      );

    case "AbortError":
      return `${deviceLabel} request was interrupted. Please try again.`;

    case "TypeError":
      return `${deviceLabel} API is unavailable. Ensure the page is served over HTTPS.`;

    default:
      return `Could not access ${deviceLabel}: ${err.message || err.name}`;
  }
}

/**
 * Query the Permissions API — purely informational, never blocks the UI.
 * Returns "granted" | "denied" | "prompt" | "unsupported"
 */
async function queryPermission(name) {
  if (!navigator?.permissions) return "unsupported";
  try {
    const result = await navigator.permissions.query({ name });
    return result.state;
  } catch {
    return "unsupported"; // Firefox doesn't support camera/microphone queries
  }
}

/**
 * Try getUserMedia with ideal constraints, fall back to bare minimum
 * on OverconstrainedError so we don't break on restrictive mobile cameras.
 */
async function getUserMediaWithFallback(ideal, fallback) {
  try {
    return await navigator.mediaDevices.getUserMedia(ideal);
  } catch (err) {
    if (
      (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") &&
      fallback
    ) {
      return await navigator.mediaDevices.getUserMedia(fallback);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// CountdownTimer
// ---------------------------------------------------------------------------
function CountdownTimer({ seconds }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{mins}:{secs}</span>;
}

// ---------------------------------------------------------------------------
// SessionLobby
// ---------------------------------------------------------------------------
export default function SessionLobby({
  sessionCode = "69a54abd29c99c56303ea5f6",
  userId     = "696f408b2ff51b82b1cee0e6",
  role       = "patient",
  therapist  = {
    name: "Dr. Sarah Mitchell",
    credentials: "PhD",
    specialties: ["Anxiety", "Relationships"],
    avatarInitials: "SM",
  },
  sessionMeta = {
    durationMins: 50,
    // safe default: 5 min from now — avoids NaN countdown when startTime is missing
    startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  },
  onJoined,
}) {
  // ── Countdown ──────────────────────────────────────────────────────────────
  const targetTime     = new Date(sessionMeta.startTime).getTime();
  const initialSeconds = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []); // start once on mount only

  // ── Device state ───────────────────────────────────────────────────────────
  const [micActive, setMicActive] = useState(false);
  const [camActive, setCamActive] = useState(false);

  const [micError,      setMicError]      = useState(null);
  const [camError,      setCamError]      = useState(null);

  // "idle" | "checking" | "granted" | "denied" | "prompt" | "unsupported"
  // Used only for display hints — NEVER used to block button clicks
  const [micPermState,  setMicPermState]  = useState("idle");
  const [camPermState,  setCamPermState]  = useState("idle");

  const [joining,   setJoining]   = useState(false);
  const [joinError, setJoinError] = useState(null);

  const videoRef    = useRef(null);
  const streamRef   = useRef(null);   // camera stream (local preview)
  const micStreamRef = useRef(null);  // mic stream (local preview)
  const mountedRef  = useRef(true);

  // ── Sync webRTCManager once on mount ───────────────────────────────────────
  useEffect(() => {
    webRTCManager.toggleMute(true);   // start muted
    webRTCManager.toggleCamera(true); // start camera off
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current    = null;
      micStreamRef.current = null;
    };
  }, []);

  // ── Mic toggle ─────────────────────────────────────────────────────────────
  const toggleMic = useCallback(async () => {
    // ── Turn OFF ──
    if (micActive) {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
      webRTCManager.toggleMute(true);
      localStorage.setItem("micActive", "false");
      if (mountedRef.current) setMicActive(false);
      return;
    }

    // ── Turn ON ──
    if (!mountedRef.current) return;
    setMicError(null);
    setMicPermState("checking");

    // Guard: API unavailable (http:// context or sandboxed iframe)
    if (!navigator?.mediaDevices?.getUserMedia) {
      if (mountedRef.current) {
        setMicError("Microphone API is unavailable. Ensure the page is served over HTTPS.");
        setMicPermState("unsupported");
      }
      return;
    }

    // Snapshot permission state BEFORE calling getUserMedia so we can give
    // the right error message in the catch block (dismissed vs hard-denied)
    const beforeState = await queryPermission("microphone");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

      micStreamRef.current = stream;
      webRTCManager.toggleMute(false);
      localStorage.setItem("micActive", "true");
      setMicPermState("granted");
      setMicActive(true);
      setMicError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      // Re-query so the state reflects what the browser decided
      const afterState = await queryPermission("microphone");
      setMicPermState(afterState);
      setMicError(mediaErrorMessage(err, "Microphone", beforeState));
    }
  }, [micActive]);

  // ── Camera toggle ──────────────────────────────────────────────────────────
  const toggleCam = useCallback(async () => {
    // ── Turn OFF ──
    if (camActive) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      webRTCManager.toggleCamera(true);
      localStorage.setItem("camActive", "false");
      if (mountedRef.current) setCamActive(false);
      return;
    }

    // ── Turn ON ──
    if (!mountedRef.current) return;
    setCamError(null);
    setCamPermState("checking");

    // Guard: API unavailable
    if (!navigator?.mediaDevices?.getUserMedia) {
      if (mountedRef.current) {
        setCamError("Camera API is unavailable. Ensure the page is served over HTTPS.");
        setCamPermState("unsupported");
      }
      return;
    }

    // Snapshot permission state BEFORE the prompt appears
    const beforeState = await queryPermission("camera");

    try {
      const stream = await getUserMediaWithFallback(
        // Ideal — uses ideal: so browser can relax constraints automatically
        { video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } } },
        // Fallback — bare minimum, avoids OverconstrainedError on restricted cams
        { video: true }
      );

      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

      streamRef.current = stream;
      webRTCManager.toggleCamera(false);
      localStorage.setItem("camActive", "true");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {}); // safe to ignore autoplay errors
      }

      setCamPermState("granted");
      setCamActive(true);
      setCamError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      const afterState = await queryPermission("camera");
      setCamPermState(afterState);
      setCamError(mediaErrorMessage(err, "Camera", beforeState));
    }
  }, [camActive]);

  // ── Join ───────────────────────────────────────────────────────────────────
  const handleJoin = useCallback(async () => {
    if (!mountedRef.current) return;
    setJoining(true);
    setJoinError(null);

    // Hand active preview tracks to webRTCManager so join does not ask again.
    const initialStream = new MediaStream();

    if (micActive && micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach(track => initialStream.addTrack(track));
      micStreamRef.current = null;
    } else {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }

    if (camActive && streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => initialStream.addTrack(track));
      streamRef.current = null;
    } else {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;

    try {
      localStorage.setItem("camActive", String(camActive));
      localStorage.setItem("micActive", String(micActive));

      await webRTCManager.initialize(sessionCode, userId, role, micActive, camActive, initialStream);
      onJoined?.();
    } catch (err) {
      if (!mountedRef.current) return;
      let msg;
      if (err.name === "NotAllowedError") {
        msg =
          'Camera/microphone access denied. Click the 🔒 icon in your address bar ' +
          '→ allow Camera & Microphone → refresh and try again.';
      } else if (err.name === "SecurityError") {
        msg =
          "Session blocked by browser security policy. " +
          "Ensure the page is on HTTPS and not inside a restricted iframe.";
      } else {
        msg = "Failed to start session: " + (err.message || err.name || "Unknown error");
      }
      setJoinError(msg);
      setJoining(false);
    }
  }, [sessionCode, userId, role, micActive, camActive, onJoined]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const minutesLeft = Math.ceil(timeLeft / 60);

  // Status label for device rows
  const camStatusLabel = camActive ? "Active" : camPermState === "denied" ? "Blocked" : "Off";
  const micStatusLabel = micActive ? "Active" : micPermState === "denied" ? "Blocked" : "Off";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        .lobby-root {
          min-height: 100vh;
          background: linear-gradient(145deg, #f0ecff 0%, #e8e2fb 40%, #f5f2ff 100%);
          font-family: 'Sora', 'Segoe UI', sans-serif;
          padding: 72px 24px 40px;
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
          50%       { box-shadow: 0 0 0 6px rgba(74,222,128,.1); }
        }
        .lobby-body {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
        }
        @media (max-width: 760px) {
          .lobby-body { grid-template-columns: 1fr; }
          .lobby-right { border-left: none !important; border-top: 1.5px solid #ede8fb; }
        }
        .lobby-left  { padding: 24px; }
        .lobby-right { padding: 24px; border-left: 1.5px solid #ede8fb; }

        .device-row {
          background: #f7f4fe;
          border: 1.5px solid #e8e2f8;
          border-radius: 10px;
          padding: 9px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
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
        .ctrl-on        { background: #ede8fb; border-color: #c4b0f0; color: #6b3fd4; }
        .ctrl-on:hover  { background: #e2dbf7; }
        .ctrl-off       { background: #fde8e8; border-color: #f5b8b8; color: #dc2626; }
        .ctrl-off:hover { background: #fdd0d0; }
        .ctrl-checking  { background: #f1f5f9; border-color: #cbd5e1; color: #64748b; cursor: wait; }

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

            {/* LEFT */}
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
                  <div style={{
                    position: "absolute", inset: 0,
                    background: camError ? "linear-gradient(160deg,#4a1a1a,#2d0f0f)" : "linear-gradient(160deg,#2d1f5e,#1a1030)",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 12, padding: 20, textAlign: "center", borderRadius: 14,
                  }}>
                    {camError ? (
                      <>
                        <span style={{ fontSize: 28 }}>⚠️</span>
                        <span style={{ fontSize: 11.5, color: "rgba(255,160,160,.9)", fontWeight: 500, lineHeight: 1.6 }}>{camError}</span>
                      </>
                    ) : camPermState === "checking" ? (
                      <>
                        <span style={{ fontSize: 24 }}>⏳</span>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>Waiting for permission…</span>
                      </>
                    ) : (
                      <>
                        <CamIcon off size={36} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>
                          Click "Cam On" to preview
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Mic indicator */}
                <div style={{
                  position: "absolute", bottom: 10, left: 10,
                  background: micActive ? "rgba(34,197,94,.85)" : "rgba(220,38,38,.85)",
                  borderRadius: 20, padding: "4px 10px",
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 11, color: "white", fontWeight: 600,
                }}>
                  <MicIcon muted={!micActive} size={10} />
                  {micActive ? "Mic On" : "Mic Off"}
                </div>
              </div>

              {/* Device rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  ["📷", "Camera",     camStatusLabel],
                  ["🎤", "Microphone", micStatusLabel],
                  ["🔊", "Speaker",    "Default"],
                ].map(([icon, label, val]) => (
                  <div key={label} className="device-row">
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    <span style={{ fontSize: 12, color: "#9889c8", minWidth: 78, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 13, color: val === "Blocked" ? "#dc2626" : "#2d1f5e", fontWeight: 600, flex: 1 }}>{val}</span>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: val === "Active" ? "#22c55e" : val === "Blocked" ? "#dc2626" : "#d1d5db",
                      display: "inline-block",
                    }} />
                  </div>
                ))}
              </div>

              {/* Controls — ALWAYS clickable, never disabled by permission state */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className={`ctrl-toggle ${micPermState === "checking" ? "ctrl-checking" : micActive ? "ctrl-on" : "ctrl-off"}`}
                  onClick={toggleMic}
                  disabled={micPermState === "checking"}
                >
                  <MicIcon muted={!micActive} size={14} />
                  {micPermState === "checking" ? "Requesting…" : micActive ? "Mic On" : "Mic Off"}
                </button>

                <button
                  className={`ctrl-toggle ${camPermState === "checking" ? "ctrl-checking" : camActive ? "ctrl-on" : "ctrl-off"}`}
                  onClick={toggleCam}
                  disabled={camPermState === "checking"}
                >
                  <CamIcon off={!camActive} size={14} />
                  {camPermState === "checking" ? "Requesting…" : camActive ? "Cam On" : "Cam Off"}
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
            <div className="lobby-right" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Therapist card */}
              <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1.5px solid #ece6fb", boxShadow: "0 2px 14px rgba(100,70,200,.06)" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                  <Avatar size={58} initials={therapist.avatarInitials} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#2d1f5e" }}>
                      {therapist.name}
                      {role === "patient" && (
                        <span style={{ fontWeight: 400, fontSize: 14 }}>, {therapist.credentials}</span>
                      )}
                    </div>
                    {role === "patient" && (
                      <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
                        {therapist.specialties.map((s, i) => (
                          <span key={s} className="specialty-tag" style={{ background: i === 0 ? "#7c4ddb" : "#ede8fb", color: i === 0 ? "white" : "#5a3db5" }}>{s}</span>
                        ))}
                      </div>
                    )}
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
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#2d1f5e", marginBottom: 12 }}>🛡️ Session Rules</div>
                  {[["🔐", "HIPAA compliant"], ["🤝", "Confidential session"], ["🚷", "No third-party access"]].map(([icon, text]) => (
                    <div key={text} className="privacy-item"><span style={{ fontSize: 15 }}>{icon}</span>{text}</div>
                  ))}
                </div>
              </div>

              {/* What to expect */}
              <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 14, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0369a1", marginBottom: 10 }}>💡 What to expect</div>
                {[
                  "Find a quiet, private space",
                  "Ensure stable internet connection",
                  "Have water nearby if needed",
                  "You can chat with your therapist while waiting",
                ].map(tip => (
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
