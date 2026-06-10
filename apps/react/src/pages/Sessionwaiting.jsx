/**
 * SessionWaiting.jsx  (LiveKit edition)
 *
 * Shows the local camera PiP (via LiveKit track.attach()) and waits for
 * a remote participant to join the LiveKit room. When any remote media
 * arrives → calls onPeerJoined().
 *
 * Bluetooth headphones: LiveKit routes audio automatically through
 * whatever device the OS has selected. No extra code needed on web.
 * On mobile (React Native SDK), set AudioSession to allowBluetooth.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { MicIcon, CamIcon, PhoneOff, SendIcon, ChatIcon, ShieldIcon, LockIcon, Avatar } from "./Icons";
import { livekitManager } from "../config/livekitmanager";
import { getInitials, formatFirebaseTimestamp } from "../utils/helper";

export default function SessionWaiting({
  therapist,
  sessionMeta,
  onLeave,
  onPeerJoined,
  role,
  name,
  therapistNameInitial,
  patientNameInitial,
  therapistPhoto,
  patientPhoto
}) {
  const th = therapist || { name: "Dr. Sarah Mitchell", credentials: "PhD", specialties: ["Anxiety", "Relationships"], avatarInitials: "SM" };
  const sm = sessionMeta || { durationMins: 50, startTime: "10:00 AM" };

  const image=role==='therapist'?therapistPhoto:patientPhoto;
  const remoteImage=role==='therapist'?patientPhoto:therapistPhoto;


  const localVideoContainerRef = useRef(null);
  const movedToLiveRef = useRef(false);
  const chatEndRef = useRef(null);

  const cameraon = localStorage.getItem("camActive") === "true";
  const micon = localStorage.getItem("micActive") === "true";

  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [micActive, setMicActive] = useState(micon);
  const [camActive, setCamActive] = useState(cameraon);
  const [connState, setConnState] = useState("connecting");
  const [mediaError, setMediaError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // ── Move to live ────────────────────────────────────────────────────────────
  const moveToLive = useCallback(() => {
    if (movedToLiveRef.current) return;
    movedToLiveRef.current = true;
    onPeerJoined?.();
  }, [onPeerJoined]);

  // ── Attach local video track ────────────────────────────────────────────────
  const attachLocalVideo = useCallback(() => {
    const track = livekitManager.localVideoTrack;
    const container = localVideoContainerRef.current;
    if (!track || !container) return;
    const el = track.attach();
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.objectFit = "cover";
    el.style.transform = "scaleX(-1)";
    container.innerHTML = "";
    container.appendChild(el);
  }, []);

  // ── Wire livekitManager callbacks ───────────────────────────────────────────
  useEffect(() => {
    // Attach existing local video (acquired during lobby)
    if (camActive) attachLocalVideo();

    livekitManager.callbacks = {
      ...livekitManager.callbacks,

      onLocalVideoTrack: (track) => {
        if (track && camActive) attachLocalVideo();
      },

      onRemoteMedia: (media) => {
        // Any subscribed remote track → peer has joined, move to live
        if (media.videoTrack || media.audioTrack) moveToLive();
      },

      onPeerJoined: () => moveToLive(),

      onMessages: (msgs) => setMessages(msgs),

      onConnectionStatus: (status) => {
        setConnState(status);
        if (status === "connected") {
          // Peer may already be in the room
          if (livekitManager.remoteMedia.videoTrack || livekitManager.remoteMedia.audioTrack) {
            moveToLive();
          }
        }
      },

      onPeerLeft: () => {
        console.log("[Waiting] Peer disconnected, staying in waiting room");
      },

      onRemoteMediaState: () => {
        // A media-state update advances us to live ONLY when a peer is actually
        // present. Without this guard the replay-on-mount default (no peer yet,
        // mic/cam = false) would fire moveToLive() immediately and skip the
        // waiting screen entirely.
        if (livekitManager.peerReady) moveToLive();
      },
    };

    return () => {
      livekitManager.callbacks.onLocalVideoTrack = undefined;
      livekitManager.callbacks.onRemoteMedia = undefined;
      livekitManager.callbacks.onPeerJoined = undefined;
      livekitManager.callbacks.onMessages = undefined;
      livekitManager.callbacks.onConnectionStatus = undefined;
      livekitManager.callbacks.onPeerLeft = undefined;
      livekitManager.callbacks.onRemoteMediaState = undefined;
    };
  }, [moveToLive, attachLocalVideo, camActive]);

  // Re-attach when camActive changes
  useEffect(() => {
    if (camActive) attachLocalVideo();
    else if (localVideoContainerRef.current) localVideoContainerRef.current.innerHTML = "";
  }, [camActive, attachLocalVideo]);

  // ── Session timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setSessionSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Auto-scroll chat ─────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Toggles ──────────────────────────────────────────────────────────────────
  const handleToggleMic = async () => {
    if (busy) return;
    const next = !micActive;
    setBusy(true); setMediaError(null);
    try {
      await livekitManager.toggleMute(!next);
      setMicActive(next);
      localStorage.setItem("micActive", String(next));
    } catch (err) {
      setMediaError(err?.name === "NotAllowedError"
        ? "Microphone blocked. Allow it in the address-bar lock and retry."
        : "Could not toggle microphone.");
    } finally { setBusy(false); }
  };

  const handleToggleCam = async () => {
    if (busy) return;
    const next = !camActive;
    setBusy(true); setMediaError(null);
    try {
      await livekitManager.toggleCamera(!next);
      setCamActive(next);
      localStorage.setItem("camActive", String(next));
    } catch (err) {
      setMediaError(err?.name === "NotAllowedError"
        ? "Camera blocked. Allow it in the address-bar lock and retry."
        : "Could not toggle camera.");
    } finally { setBusy(false); }
  };

  // Back from the waiting room is a NON-terminal leave: full teardown, but no
  // end/leave signal — so the peer is informed only via LiveKit presence
  // ("waiting to reconnect…") and the session stays rejoinable for both parties.
  const handleLeave = () => { livekitManager.leaveSession(); onLeave?.(); };

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    livekitManager.sendChatMessage(chatMsg.trim());
    setChatMsg("");
  };

  const em = String(Math.floor(sessionSecs / 60)).padStart(2, "0");
  const es = String(sessionSecs % 60).padStart(2, "0");

  const connLabel = {
    disconnected: "Disconnected", connecting: "Connecting…",
    connected: "Connected", reconnecting: "Reconnecting…", failed: "Connection failed",
  }[connState] || connState;
  const connColor = connState === "connected" ? "#22c55e" : connState === "failed" ? "#ef4444" : "#f59e0b";

  const ctrlBtn = (active) => ({
    width: 48, height: 48, borderRadius: "50%", border: "none", cursor: "pointer",
    background: active ? "#3b2a7a" : "#fee2e2",
    color: active ? "white" : "#dc2626",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all .18s", flexShrink: 0,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.8); } }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(34,211,238,.35); } 100% { box-shadow: 0 0 0 20px rgba(34,211,238,0); } }

        .sw-root {
          min-height: 100vh; background: #0b0f1a;
          font-family: 'DM Sans', sans-serif;
          display: flex; flex-direction: column;
        }
        .sw-topbar {
          background: rgba(17,24,39,.95); backdrop-filter: blur(16px);
          display: flex; align-items: center; gap: 14px;
          padding: 14px 24px; border-bottom: 1px solid rgba(255,255,255,.06);
          flex-wrap: wrap; position: sticky; top: 0; z-index: 10;
        }
        .sw-main {
          flex: 1; display: grid; grid-template-columns: 1fr 300px; min-height: 0;
        }
        @media (max-width: 860px) {
          .sw-main { grid-template-columns: 1fr; }
          .sw-chat-panel { border-left: none !important; border-top: 1px solid rgba(255,255,255,.06); max-height: 340px; }
        }
        .sw-left {
          position: relative; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: #0b0f1a; padding: 36px 24px 120px;
          border-right: 1px solid rgba(255,255,255,.06);
        }
        .sw-controls-bar {
          position: absolute; bottom: 20px; left: 0; right: 0;
          display: flex; align-items: flex-end; justify-content: center;
          gap: 14px; padding: 0 20px; flex-wrap: wrap;
        }
        .ctrl-item { display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .ctrl-label { font-size: 10px; color: rgba(255,255,255,.3); font-weight: 500; }
        .leave-btn {
          height: 46px; padding: 0 20px; border-radius: 28px; border: none; cursor: pointer;
          background: #dc2626; color: white; display: flex; align-items: center;
          gap: 7px; font-size: 13px; font-weight: 700; font-family: inherit;
          box-shadow: 0 3px 16px rgba(220,38,38,.4); white-space: nowrap;
        }
        .sw-pip {
          position: absolute; bottom: 88px; right: 18px;
          width: 148px; height: 110px; border-radius: 12px; overflow: hidden;
          border: 2px solid rgba(255,255,255,.12);
          box-shadow: 0 4px 24px rgba(0,0,0,.5); background: #111827;
        }
        .sw-chat-panel {
          display: flex; flex-direction: column; background: #111827;
          border-left: 1px solid rgba(255,255,255,.06); overflow: hidden;
        }
        .chat-messages { flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
        .chat-input-row { padding: 10px 12px; border-top: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; gap: 8px; }
        .chat-input {
          flex: 1; border: 1px solid rgba(255,255,255,.1); border-radius: 8px;
          padding: 8px 12px; font-size: 13px; color: rgba(255,255,255,.8);
          outline: none; background: rgba(255,255,255,.05); font-family: inherit;
          transition: border-color .15s;
        }
        .chat-input:focus { border-color: rgba(34,211,238,.4); }
        .send-btn {
          background: linear-gradient(135deg, #7c4ddb, #9b6bf5); color: white;
          border: none; border-radius: 8px;
          width: 34px; height: 34px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; color: #0b0f1a; flex-shrink: 0;
        }
        .msg-self  { background: linear-gradient(135deg, #22d3ee, #0ea5e9); color: #0b0f1a; border-radius: 12px 12px 4px 12px; padding: 8px 12px; font-size: 13px; align-self: flex-end; max-width: 82%; word-break: break-word; }
        .msg-other { background: rgba(255,255,255,.07); color: rgba(255,255,255,.8); border-radius: 12px 12px 12px 4px; padding: 8px 12px; font-size: 13px; align-self: flex-start; max-width: 82%; word-break: break-word; }
        .info-section { border-top: 1px solid rgba(255,255,255,.06); padding: 12px 14px; }
         .msg-bubble-self {
          background: linear-gradient(135deg, #7c4ddb, #9b6bf5); color: white;
          border-radius: 14px 14px 4px 14px; padding: 9px 13px;
          font-size: 13px; line-height: 1.5; align-self: flex-end;
          max-width: 82%; word-break: break-word;
        }
        .msg-bubble-other {
          background: #f3f0ff; color: #2d1f5e;
          border-radius: 14px 14px 14px 4px; padding: 9px 13px;
          font-size: 13px; line-height: 1.5; align-self: flex-start;
          max-width: 82%; word-break: break-word;
        }
      `}</style>

      <div className="sw-root">

        {/* TOP BAR */}
        <div className="sw-topbar">
          <Avatar image={image} size={42} initials={th.avatarInitials} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,.85)" }}>
              {th.name}<span style={{ fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,.4)" }}>, {th.credentials}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={{ color: connColor, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: connColor, display: "inline-block" }} />
                {connLabel}
              </span>
              {th.specialties.map(s => (
                <span key={s} style={{ background: "rgba(34,211,238,.1)", color: "#22d3ee", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Duration: {sm.durationMins} mins</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.05)", borderRadius: 8, padding: "6px 14px", border: "1px solid rgba(255,255,255,.07)" }}>
              <span style={{ fontSize: 14 }}>🕐</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#22d3ee", fontFamily: "DM Mono, monospace" }}>{em}:{es}</span>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="sw-main">

          {/* LEFT */}
          <div className="sw-left">
            <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.4)" }}>
              <LockIcon /> Encrypted
            </div>

            {/* Animated avatar */}
            <div style={{ position: "relative", marginBottom: 24 }}>
              <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: "1.5px dashed rgba(34,211,238,.3)", animation: "spin 14s linear infinite" }} />
              <div style={{ position: "absolute", inset: -26, borderRadius: "50%", border: "1px dotted rgba(255,255,255,.1)" }} />
              <Avatar image={remoteImage} size={88} initials={th.avatarInitials} extraStyle={{ border: "3px solid rgba(34,211,238,.3)", animation: "pulse-ring 2.5s infinite" }} />
            </div>

            <div style={{ fontSize: 17, color: "rgba(255,255,255,.8)", marginBottom: 8, textAlign: "center", lineHeight: 1.4, fontWeight: 600 }}>
              Waiting for <strong style={{ color: "#fff" }}>{th.name}</strong>…
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.35)", textAlign: "center", marginBottom: 20, maxWidth: 380, lineHeight: 1.7 }}>
              {role === "therapist" ? "Client" : "Therapist"} will join shortly. Session is end-to-end encrypted.
            </div>

            {/* Dots */}
            <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
              {[0, 0.3, 0.6].map((delay, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c4ddb", opacity: 0.4, animation: `pulse-dot 1.4s ${delay}s infinite` }} />
              ))}
            </div>

            {/* Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 10 }}>
              {[{ icon: <LockIcon />, label: "Encrypted" }, { icon: <span>🚫</span>, label: "No Recording" }, { icon: <ShieldIcon />, label: "Private" }].map(({ icon, label }) => (
                <div key={label} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "5px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.45)", fontWeight: 500 }}>
                  {icon} {label}
                </div>
              ))}
            </div>

            {mediaError && (
              <div style={{ position: "absolute", bottom: 96, left: "50%", transform: "translateX(-50%)", background: "rgba(239,68,68,.9)", color: "white", border: "1px solid rgba(239,68,68,.4)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, maxWidth: 340, textAlign: "center", lineHeight: 1.5, backdropFilter: "blur(8px)" }}>
                {mediaError}
              </div>
            )}

            {/* Controls */}
            <div className="sw-controls-bar">
              {[
                { icon: <MicIcon muted={!micActive} size={18} />, label: micActive ? "Mute" : "Unmute", onClick: handleToggleMic, active: micActive },
                { icon: <CamIcon off={!camActive} size={18} />, label: "Camera", onClick: handleToggleCam, active: camActive },
                { icon: <ChatIcon size={18} />, label: "Chat", onClick: () => setChatOpen(p => !p), active: chatOpen },
              ].map(({ icon, label, onClick, active }, i) => (
                <div key={i} className="ctrl-item">
                  <button onClick={onClick} disabled={busy} style={{ ...ctrlBtn(active), opacity: busy ? 0.5 : 1 }}>{icon}</button>
                  <span className="ctrl-label">{label}</span>
                </div>
              ))}
              <div className="ctrl-item" style={{ marginLeft: 6 }}>
                <button className="leave-btn" onClick={handleLeave}><PhoneOff size={14} /> Leave</button>
                <span className="ctrl-label" style={{ visibility: "hidden" }}>·</span>
              </div>
            </div>

            {/* Self PiP */}
            <div className="sw-pip">
              {camActive
                ? <div ref={localVideoContainerRef} style={{ width: "100%", height: "100%" }} />
                : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#111827" }}>
                  <Avatar image={image} size={48} initials={role === "therapist" ? therapistNameInitial : patientNameInitial} extraStyle={{ border: "2px solid rgba(255,255,255,.12)" }} />
                </div>
              }
              <div style={{ position: "absolute", top: 5, right: 6, background: "rgba(0,0,0,.6)", color: "white", fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>You</div>
              <div style={{ position: "absolute", bottom: 5, left: 5, background: micActive ? "rgba(34,197,94,.85)" : "rgba(220,38,38,.8)", borderRadius: 20, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "white", fontWeight: 600 }}>
                <MicIcon muted={!micActive} size={7} /> {micActive ? "On" : "Off"}
              </div>
            </div>
          </div>

          {/* RIGHT: Chat */}
          <div className="sw-chat-panel">
            {chatOpen && (<>
              <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 8 }}>
                <ChatIcon size={13} />
                <span style={{ fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,.7)" }}>Chat</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,.2)" }}>End-to-end encrypted</span>
              </div>
              <div className="chat-messages">
                {messages.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 12, marginTop: 20 }}>No messages yet. Say hello! 👋</div>}
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      alignSelf: m.role === "patient" ? "flex-end" : "flex-start",
                    }}>
                     
                        <Avatar image={m.role==='patient' ? patientPhoto : therapistPhoto} size={20} initials={getInitials(m?.senderName)} extraStyle={{ border: "none" }} />
                      
                      <span style={{ fontWeight: 600, fontSize: 11, color: "#7c6aaa" }}>{m?.senderName}</span>
                      <span style={{ fontSize: 10, color: "#c0b8da" }}>{formatFirebaseTimestamp(m?.createdAt)}</span>
                    </div>
                    <div className={m.role === "patient" ? "msg-bubble-self" : "msg-bubble-other"}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-row">
                <input className="chat-input" value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Type a message…" />
                <button className="send-btn" onClick={sendMsg}><SendIcon size={12} /></button>
              </div>
            </>)}

            {/* Session info */}
            <div className="info-section">
              <div style={{ fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 10 }}>Session Info</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <Avatar image={remoteImage} size={32} initials={th.avatarInitials} extraStyle={{ border: "none" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,.7)" }}>{th.name}, {th.credentials}</div>
                 {role==='patient' && (<div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{th.specialties.join(" · ")}</div>)}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {[["Duration", `${sm.durationMins} min`], ["Start Time", sm.startTime || "10:00 AM"]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="info-section" style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 8, padding: 8, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.4)", cursor: "pointer", fontFamily: "inherit" }}>🛡 Safety Guide</button>
              <button style={{ flex: 1, background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.15)", borderRadius: 8, padding: 8, fontSize: 11, fontWeight: 600, color: "#f87171", cursor: "pointer", fontFamily: "inherit" }}>❤️ Get Help</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}