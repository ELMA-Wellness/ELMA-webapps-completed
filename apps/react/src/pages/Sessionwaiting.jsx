import { useState, useEffect, useRef } from "react";
import { MicIcon, CamIcon, PhoneOff, SendIcon, ChatIcon, ShieldIcon, LockIcon, DotsIcon, Avatar } from "./Icons";
import { webRTCManager } from "../config/webrtcmanger";

/**
 * SessionWaiting
 * Shows local video (from webRTCManager), waits for remote stream.
 * When remote stream arrives → calls onPeerJoined(remoteStream)
 *
 * Props:
 *   therapist     – { name, credentials, specialties, avatarInitials }
 *   sessionMeta   – { durationMins, startTime }
 *   onLeave       – () => void
 *   onPeerJoined  – (remoteStream) => void
 */
export default function SessionWaiting({ therapist, sessionMeta, onLeave, onPeerJoined }) {
  const selfVideoRef = useRef(null);

  const [chatMsg, setChatMsg]         = useState("");
  const [messages, setMessages]       = useState([]);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [muted, setMuted]             = useState(false);
  const [camOff, setCamOff]           = useState(false);
  const [connState, setConnState]     = useState("connecting");
  const chatEndRef                    = useRef(null);

  // Defaults
  const th = therapist || { name: "Dr. Sarah Mitchell", credentials: "PhD", specialties: ["Anxiety", "Relationships"], avatarInitials: "SM" };
  const sm = sessionMeta || { durationMins: 50, startTime: "10:00 AM" };

  // Session timer
  useEffect(() => {
    const t = setInterval(() => setSessionSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Wire up webRTCManager callbacks
  useEffect(() => {
    // Local stream → show in PiP
    webRTCManager.onLocalStreamChanged = (stream) => {
      if (selfVideoRef.current) {
        selfVideoRef.current.srcObject = stream;
        if (stream) selfVideoRef.current.play().catch(() => {});
      }
    };

    // Remote stream → transition to live
    webRTCManager.onRemoteStreamChanged = (stream) => {
      if (stream) {
        onPeerJoined?.(stream);
      }
    };

    // Chat
    webRTCManager.onMessagesChanged = (msgs) => {
      setMessages(msgs);
    };

    // Connection state
    webRTCManager.onConnectionStateChanged = (state) => {
      setConnState(state);
    };

    // Peer disconnect while waiting — just stay on this screen
    webRTCManager.onPeerDisconnect = () => {
      console.log('[Waiting] Peer disconnected, staying in waiting room');
    };

    return () => {
      // Clear only if still assigned to us (avoid overwriting next screen's callbacks)
      if (webRTCManager.onLocalStreamChanged)    webRTCManager._onLocalStreamChanged    = null;
      if (webRTCManager.onRemoteStreamChanged)   webRTCManager._onRemoteStreamChanged   = null;
      if (webRTCManager.onMessagesChanged)       webRTCManager._onMessagesChanged       = null;
      if (webRTCManager.onConnectionStateChanged)webRTCManager._onConnectionStateChanged= null;
      webRTCManager.onPeerDisconnect = null;
    };
  }, [onPeerJoined]);

  const handleToggleMic = () => {
    const next = !muted;
    setMuted(next);
    webRTCManager.toggleMute(next);
  };

  const handleToggleCam = () => {
    const next = !camOff;
    setCamOff(next);
    webRTCManager.toggleCamera(next);
  };

  const handleLeave = () => {
    webRTCManager.hangup();
    onLeave?.();
  };

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    webRTCManager.sendChatMessage(chatMsg.trim());
    setChatMsg("");
  };

  const em = String(Math.floor(sessionSecs / 60)).padStart(2, "0");
  const es = String(sessionSecs % 60).padStart(2, "0");

  const connLabel = {
    new: "Setting up…",
    checking: "Checking connection…",
    connected: "Connected",
    completed: "Connected",
    disconnected: "Reconnecting…",
    failed: "Connection failed",
    connecting: "Connecting…",
  }[connState] || connState;

  const connColor = ["connected", "completed"].includes(connState) ? "#22c55e" : connState === "failed" ? "#ef4444" : "#f59e0b";

  const ctrlBtn = (active) => ({
    width: 48, height: 48, borderRadius: "50%", border: "none", cursor: "pointer",
    background: active ? "#3b2a7a" : "#fee2e2",
    color: active ? "white" : "#dc2626",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: active ? "0 3px 12px rgba(59,42,122,.28)" : "none",
    transition: "all 0.18s", flexShrink: 0,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(.85); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(124,77,219,.35); }
          100% { box-shadow: 0 0 0 18px rgba(124,77,219,0); }
        }

        .sw-root {
          min-height: 100vh;
          background: linear-gradient(145deg, #f0ecff, #e8e2fb 50%, #f5f2ff);
          font-family: 'Sora', 'Segoe UI', sans-serif;
          display: flex; flex-direction: column;
        }
        .sw-topbar {
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(16px);
          display: flex; align-items: center; gap: 14px;
          padding: 14px 28px;
          border-bottom: 1.5px solid #f0ebff;
          flex-wrap: wrap;
          position: sticky; top: 0; z-index: 10;
        }
        .sw-main {
          flex: 1; display: grid; grid-template-columns: 1fr 320px; min-height: 0;
        }
        @media (max-width: 900px) {
          .sw-main { grid-template-columns: 1fr; }
          .sw-chat-panel { border-left: none !important; border-top: 1.5px solid #f0ebff; max-height: 380px; }
        }
        .sw-left {
          position: relative; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: #f8f5ff; padding: 36px 24px 120px;
          border-right: 1.5px solid #ede8fb;
        }
        .sw-controls-bar {
          position: absolute; bottom: 20px; left: 0; right: 0;
          display: flex; align-items: flex-end; justify-content: center;
          gap: 14px; padding: 0 20px; flex-wrap: wrap;
        }
        .ctrl-item { display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; }
        .ctrl-label { font-size: 10px; color: #7c6aaa; font-weight: 500; font-family: inherit; }
        .leave-btn {
          height: 46px; padding: 0 20px; border-radius: 28px; border: none; cursor: pointer;
          background: #e53935; color: white; display: flex; align-items: center; justify-content: center;
          gap: 7px; font-size: 13px; font-weight: 700; font-family: inherit;
          box-shadow: 0 3px 16px rgba(229,57,53,.42); white-space: nowrap; transition: opacity .15s;
        }
        .leave-btn:hover { opacity: .88; }
        .sw-pip {
          position: absolute; bottom: 88px; right: 18px;
          width: 152px; height: 112px; border-radius: 14px; overflow: hidden;
          border: 2.5px solid white; box-shadow: 0 3px 20px rgba(0,0,0,.24); background: #1a1030;
        }
        .sw-chat-panel {
          display: flex; flex-direction: column; background: white;
          border-left: 1.5px solid #f0ebff; overflow: hidden;
        }
        .chat-messages {
          flex: 1; overflow-y: auto; padding: 14px 16px;
          display: flex; flex-direction: column; gap: 14px; min-height: 0;
        }
        .chat-input-row {
          padding: 10px 14px; border-top: 1.5px solid #f0ebff;
          display: flex; align-items: center; gap: 8px;
        }
        .chat-input {
          flex: 1; border: 1.5px solid #e0d8f8; border-radius: 10px;
          padding: 8px 12px; font-size: 13px; color: #2d1f5e; outline: none;
          background: #faf8ff; font-family: inherit; transition: border-color .15s;
        }
        .chat-input:focus { border-color: #a78bfa; }
        .send-btn {
          background: #7c4ddb; border: none; border-radius: 10px;
          width: 34px; height: 34px; cursor: pointer; display: flex;
          align-items: center; justify-content: center; color: white;
          flex-shrink: 0; transition: background .15s;
        }
        .send-btn:hover { background: #6b3fd4; }
        .msg-bubble-self {
          background: linear-gradient(135deg, #7c4ddb, #9b6bf5);
          color: white; border-radius: 14px 14px 4px 14px;
          padding: 9px 13px; font-size: 13px; line-height: 1.5;
          align-self: flex-end; max-width: 82%; word-break: break-word;
        }
        .msg-bubble-other {
          background: #f3f0ff; color: #2d1f5e;
          border-radius: 14px 14px 14px 4px;
          padding: 9px 13px; font-size: 13px; line-height: 1.5;
          align-self: flex-start; max-width: 82%; word-break: break-word;
        }
        .info-section { border-top: 1.5px solid #f0ebff; padding: 12px 16px; }
        .safety-btn {
          width: 100%; background: #f3f0ff; border: 1.5px solid #e0d8f8;
          border-radius: 10px; padding: 8px; font-size: 12px; font-weight: 600; color: #5a3db5;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          font-family: inherit; transition: background .15s;
        }
        .safety-btn:hover { background: #e8e2fb; }
        .help-btn {
          flex: 1; background: #fef3f2; border: 1.5px solid #fde8e8; border-radius: 10px;
          padding: 7px 8px; font-size: 11px; font-weight: 600; color: #dc2626;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 5px; font-family: inherit; transition: background .15s;
        }
        .help-btn:hover { background: #fee8e8; }
      `}</style>

      <div className="sw-root">

        {/* TOP BAR */}
        <div className="sw-topbar">
          <Avatar size={44} initials={th.avatarInitials} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#2d1f5e" }}>{th.name}, <span style={{ fontWeight: 400, fontSize: 13 }}>{th.credentials}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={{ color: connColor, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: connColor, display: "inline-block" }} />
                {connLabel}
              </span>
              {th.specialties.map(s => (
                <span key={s} style={{ background: "#ede8fb", color: "#5a3db5", borderRadius: 20, padding: "2px 11px", fontSize: 11, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#7c6aaa" }}>Duration: {sm.durationMins} mins</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#f3f0ff", borderRadius: 10, padding: "6px 14px" }}>
              <span style={{ fontSize: 15 }}>🕐</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#3b2a7a", fontVariantNumeric: "tabular-nums" }}>{em}:{es}</span>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="sw-main">

          {/* LEFT: Waiting */}
          <div className="sw-left">

            {/* Secure badge */}
            <div style={{ position: "absolute", top: 16, right: 16, background: "white", border: "1.5px solid #e0d8f8", borderRadius: 10, padding: "5px 13px", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#5a3db5" }}>
              <LockIcon /> Secure Session
            </div>

            {/* Animated avatar */}
            <div style={{ position: "relative", marginBottom: 24 }}>
              <div style={{ position: "absolute", inset: -14, borderRadius: "50%", border: "2px dashed #c4b5f0", animation: "spin 14s linear infinite" }} />
              <div style={{ position: "absolute", inset: -26, borderRadius: "50%", border: "1.5px dotted #e0d8f8" }} />
              <Avatar size={88} initials={th.avatarInitials} extraStyle={{ border: "3px solid white", boxShadow: "0 4px 24px rgba(124,77,219,.28)", animation: "pulse-ring 2.5s infinite" }} />
              <div style={{ position: "absolute", bottom: 2, right: 2, background: "#7c4ddb", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <MicIcon muted={false} size={13} />
              </div>
            </div>

            <div style={{ fontSize: 18, color: "#2d1f5e", marginBottom: 8, textAlign: "center", lineHeight: 1.4, fontWeight: 600 }}>
              Waiting for <strong>{th.name}</strong> to join…
            </div>
            <div style={{ fontSize: 13, color: "#7c6aaa", textAlign: "center", marginBottom: 20, maxWidth: 400, lineHeight: 1.6 }}>
              She'll join soon. Your session is private and encrypted.
            </div>

            {/* Animated dots */}
            <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
              {[0, 0.3, 0.6].map((delay, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c4ddb", opacity: 0.4, animation: `pulse-dot 1.4s ${delay}s infinite` }} />
              ))}
            </div>

            {/* Security pills */}
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", justifyContent: "center", marginBottom: 10 }}>
              {[{ icon: <LockIcon />, label: "Encrypted" }, { icon: <span style={{ fontSize: 11 }}>🚫</span>, label: "No Recording" }, { icon: <ShieldIcon />, label: "Private & Safe" }].map(({ icon, label }) => (
                <div key={label} style={{ background: "white", border: "1.5px solid #e8e2f8", borderRadius: 20, padding: "5px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5a3db5", fontWeight: 500 }}>
                  {icon} {label}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="sw-controls-bar">
              {[
                { icon: <MicIcon muted={muted} size={18} />, label: muted ? "Unmute" : "Mute", onClick: handleToggleMic, active: !muted },
                { icon: <CamIcon off={camOff} size={18} />, label: "Camera", onClick: handleToggleCam, active: !camOff },
                { icon: <ChatIcon size={18} />, label: "Chat", onClick: () => {}, active: true },
                { icon: <DotsIcon size={18} />, label: "More", onClick: () => {}, active: true },
              ].map(({ icon, label, onClick, active }, i) => (
                <div key={i} className="ctrl-item">
                  <button onClick={onClick} style={ctrlBtn(active)}>{icon}</button>
                  <span className="ctrl-label">{label}</span>
                </div>
              ))}
              <div className="ctrl-item" style={{ marginLeft: 6 }}>
                <button className="leave-btn" onClick={handleLeave}><PhoneOff size={14} /> Leave</button>
                <span className="ctrl-label" style={{ visibility: "hidden" }}>·</span>
              </div>
            </div>

            {/* PiP self-view */}
            <div className="sw-pip">
              {!camOff ? (
                <video ref={selfVideoRef} autoPlay muted playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)" }}>
                  <CamIcon off size={22} />
                </div>
              )}
              <div style={{ position: "absolute", top: 5, right: 6, background: "rgba(0,0,0,.55)", color: "white", fontSize: 9, borderRadius: 5, padding: "2px 6px", fontWeight: 600 }}>You</div>
              {muted && (
                <div style={{ position: "absolute", bottom: 5, right: 5, background: "#e53935", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <MicIcon muted size={8} />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Chat + Info */}
          <div className="sw-chat-panel">
            {/* Chat header */}
            <div style={{ padding: "13px 16px 10px", borderBottom: "1.5px solid #f0ebff", display: "flex", alignItems: "center", gap: 8 }}>
              <ChatIcon size={14} />
              <span style={{ fontWeight: 700, fontSize: 13, color: "#2d1f5e" }}>Chat</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#9889c8" }}>Messages are encrypted</span>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#c0b8da", fontSize: 12, marginTop: 20 }}>
                  No messages yet. Say hello! 👋
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, alignSelf: m.role==='therapist' ? "flex-end" : "flex-start" }}>
                    {m.role==='therapist' && <Avatar size={22} initials={th.avatarInitials} extraStyle={{ border: "none" }} />}
                    <span style={{ fontWeight: 600, fontSize: 11, color: "#7c6aaa" }}>{m.isSelf ? "You" : th.name}</span>
                    <span style={{ fontSize: 10, color: "#c0b8da" }}>{m.time}</span>
                  </div>
                  <div className={m.role==='patient' ? "msg-bubble-self" : "msg-bubble-other"}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="chat-input-row">
              <input
                className="chat-input"
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()}
                placeholder="Type a message…"
              />
              <button className="send-btn" onClick={sendMsg}><SendIcon size={12} /></button>
            </div>

            {/* Session Info */}
            <div className="info-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#2d1f5e" }}>Session Info</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <Avatar size={34} initials={th.avatarInitials} extraStyle={{ border: "none" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#2d1f5e" }}>{th.name}, {th.credentials}</div>
                  <div style={{ fontSize: 11, color: "#7c6aaa" }}>{th.specialties.join(" · ")}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[["Duration", `${sm.durationMins} mins`], ["Start Time", sm.startTime || "10:00 AM"]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: "#9889c8", fontWeight: 500, marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2d1f5e" }}>{v}</div>
                  </div>
                ))}
              </div>
              <button className="safety-btn"><ShieldIcon /> Safety Guide</button>
            </div>

            {/* Quick Help */}
            <div className="info-section">
              <div style={{ fontWeight: 700, fontSize: 13, color: "#2d1f5e", marginBottom: 10 }}>Quick Help</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="help-btn"><LockIcon size={11} /> Report Issue</button>
                <button className="help-btn">❤️ Safety Support</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}