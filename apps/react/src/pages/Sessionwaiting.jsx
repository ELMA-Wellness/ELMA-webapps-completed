import { useState, useEffect, useRef } from "react";
import {
  MicIcon, CamIcon, PhoneOff, SendIcon,
  ChatIcon, ShieldIcon, LockIcon, DotsIcon, Avatar,
} from "./Icons";

export default function SessionWaiting({ onLeave, camStream, micActiveInit, camActiveInit }) {
  const selfVideoRef = useRef(null);
  const localMicRef  = useRef(null);
  const localCamRef  = useRef(camStream || null);

  const [chatMsg, setChatMsg]         = useState("");
  const [messages, setMessages]       = useState([
    { from: "you", name: "You",       time: "10:02 AM", text: "Hello! I'm ready." },
    { from: "dr",  name: "Dr. Sarah", time: "10:03 AM", text: "Thanks for joining. I'll be with you in a moment." },
  ]);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [muted,  setMuted]  = useState(!micActiveInit);
  const [camOff, setCamOff] = useState(!camActiveInit);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setSessionSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (selfVideoRef.current && camStream && !camOff) {
      selfVideoRef.current.srcObject = camStream;
      selfVideoRef.current.play().catch(() => {});
    }
  }, [camStream, camOff]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggleMic = async () => {
    if (!muted) {
      localMicRef.current?.getTracks().forEach(t => t.stop());
      localMicRef.current = null;
      setMuted(true);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        localMicRef.current = s;
        setMuted(false);
      } catch { setMuted(true); }
    }
  };

  const handleToggleCam = async () => {
    if (!camOff) {
      localCamRef.current?.getTracks().forEach(t => t.stop());
      localCamRef.current = null;
      if (selfVideoRef.current) selfVideoRef.current.srcObject = null;
      setCamOff(true);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        localCamRef.current = s;
        if (selfVideoRef.current) { selfVideoRef.current.srcObject = s; selfVideoRef.current.play(); }
        setCamOff(false);
      } catch { setCamOff(true); }
    }
  };

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(m => [...m, { from: "you", name: "You", time, text: chatMsg.trim() }]);
    setChatMsg("");
  };

  const em = String(Math.floor(sessionSecs / 60)).padStart(2, "0");
  const es = String(sessionSecs % 60).padStart(2, "0");

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
        @keyframes spin { to { transform: rotate(360deg); } }

        .sw-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #f3f0ff 0%, #ede8fb 50%, #f8f5ff 100%);
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Therapist info bar ── */
        .sw-info-bar {
          background: white;
          display: flex;
          align-items: center;
          gap: 14px;
          // padding: 22px 32px;
          padding-top: 20px;
          padding-bottom: 22px;
          border-bottom: 1.5px solid #f0ebff;
          flex-wrap: wrap;
        }
        .sw-info-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        /* ── Main grid ── */
        .sw-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 320px;
          min-height: 0;
        }
        @media (max-width: 900px) {
          .sw-main { grid-template-columns: 1fr; }
          .sw-chat-panel { border-left: none !important; border-top: 1.5px solid #f0ebff; max-height: 420px; }
          .sw-info-bar { padding: 12px 16px; }
          .sw-controls-bar { padding: 0 12px 16px; gap: 10px; }
        }
        @media (max-width: 600px) {
          .sw-info-right { flex-basis: 100%; margin-left: 0; }
          .sw-controls-bar { gap: 8px; }
        }

        /* ── Left waiting area ── */
        .sw-left {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8f5ff;
          padding: 36px 24px 110px;
          border-right: 1.5px solid #ede8fb;
        }

        /* ── Controls bar pinned to bottom ── */
        .sw-controls-bar {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 14px;
          padding: 0 20px;
        }
        .ctrl-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .ctrl-label {
          font-size: 10px;
          color: #7c6aaa;
          font-weight: 500;
          font-family: inherit;
        }
        .leave-btn {
          height: 48px;
          padding: 0 20px;
          border-radius: 28px;
          border: none;
          cursor: pointer;
          background: #e53935;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          box-shadow: 0 3px 16px rgba(229,57,53,.42);
          white-space: nowrap;
          transition: opacity .15s;
        }
        .leave-btn:hover { opacity: .88; }

        /* ── Self-cam PiP ── */
        .sw-pip {
          position: absolute;
          bottom: 88px;
          right: 18px;
          width: 150px;
          height: 110px;
          border-radius: 14px;
          overflow: hidden;
          border: 2.5px solid white;
          box-shadow: 0 3px 20px rgba(0,0,0,.24);
          background: #1a1030;
        }

        /* ── Chat panel ── */
        .sw-chat-panel {
          display: flex;
          flex-direction: column;
          background: white;
          border-left: 1.5px solid #f0ebff;
          overflow: hidden;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-height: 0;
        }
        .chat-input-row {
          padding: 10px 14px;
          border-top: 1.5px solid #f0ebff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chat-input {
          flex: 1;
          border: 1.5px solid #e0d8f8;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 13px;
          color: #2d1f5e;
          outline: none;
          background: #faf8ff;
          font-family: inherit;
          transition: border-color .15s;
        }
        .chat-input:focus { border-color: #a78bfa; }
        .send-btn {
          background: #7c4ddb;
          border: none;
          border-radius: 10px;
          width: 34px;
          height: 34px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          transition: background .15s;
        }
        .send-btn:hover { background: #6b3fd4; }

        /* ── Session / quick-help sections ── */
        .info-section {
          border-top: 1.5px solid #f0ebff;
          padding: 12px 16px;
        }
        .info-section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-weight: 700;
          font-size: 13px;
          color: #2d1f5e;
        }
        .safety-btn {
          width: 100%;
          background: #f3f0ff;
          border: 1.5px solid #e0d8f8;
          border-radius: 10px;
          padding: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #5a3db5;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: inherit;
          transition: background .15s;
        }
        .safety-btn:hover { background: #e8e2fb; }
        .help-btn {
          flex: 1;
          background: #fef3f2;
          border: 1.5px solid #fde8e8;
          border-radius: 10px;
          padding: 7px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #dc2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-family: inherit;
          transition: background .15s;
        }
        .help-btn:hover { background: #fee8e8; }
      `}</style>

      <div className="sw-root">

        {/* ── THERAPIST INFO BAR ── */}
        <div className="sw-info-bar">
          <Avatar size={48} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#2d1f5e" }}>
              Dr. Sarah Mitchell, <span style={{ fontWeight: 400, fontSize: 13 }}>PhD</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
              <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                RCI Verified
              </span>
              <span style={{ background: "#ede8fb", color: "#5a3db5", borderRadius: 20, padding: "2px 12px", fontSize: 11, fontWeight: 600 }}>
                Relationships
              </span>
            </div>
          </div>
          <div className="sw-info-right">
            <span style={{ fontSize: 13, color: "#7c6aaa" }}>Duration: 50 mins</span>
            <div style={{ width: 120, height: 6, background: "#ede8fb", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: "30%", height: "100%", background: "linear-gradient(90deg,#7c4ddb,#a78bfa)", borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#f3f0ff", borderRadius: 10, padding: "6px 14px" }}>
              <span style={{ fontSize: 16 }}>🕐</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#3b2a7a", fontVariantNumeric: "tabular-nums" }}>
                {em}:{es}
              </span>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="sw-main">

          {/* ── LEFT: Waiting Area ── */}
          <div className="sw-left">

            {/* Secure Session badge */}
            <div style={{ position: "absolute", top: 16, right: 16, background: "white", border: "1.5px solid #e0d8f8", borderRadius: 10, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#5a3db5" }}>
              <LockIcon /> Secure Session
            </div>
            {/* Green live dot */}
            <div style={{ position: "absolute", top: 22, right: 148, width: 9, height: 9, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,.22)" }} />

            {/* Doctor avatar with orbit ring */}
            <div style={{ position: "relative", marginBottom: 22 }}>
              <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: "2px dashed #c4b5f0", animation: "spin 12s linear infinite" }} />
              <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: "1.5px dotted #e0d8f8" }} />
              <Avatar size={86} extraStyle={{ border: "3px solid white", boxShadow: "0 4px 24px rgba(124,77,219,.3)" }} />
              <div style={{ position: "absolute", bottom: 2, right: 2, background: "#7c4ddb", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <MicIcon muted={false} size={14} />
              </div>
            </div>

            <div style={{ fontSize: 18, color: "#2d1f5e", marginBottom: 8, textAlign: "center", lineHeight: 1.4 }}>
              Waiting for <strong>Dr. Sarah Mitchell</strong> to join...
            </div>
            <div style={{ fontSize: 13, color: "#7c6aaa", textAlign: "center", marginBottom: 22, maxWidth: 420 }}>
              She's ready and will join soon. You can relax or type a message.
            </div>

            {/* Pulse dots */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i === 1 ? "#7c4ddb" : "#d6cdf5", transform: i === 1 ? "scale(1.3)" : "scale(1)" }} />
              ))}
            </div>

            {/* Security pills */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
              {[
                { icon: <LockIcon />, label: "Encrypted Session" },
                {
                  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>,
                  label: "No Recording",
                },
                { icon: <ShieldIcon />, label: "Private & Safe" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ background: "white", border: "1.5px solid #e8e2f8", borderRadius: 20, padding: "6px 16px", display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#5a3db5", fontWeight: 500 }}>
                  {icon} {label}
                </div>
              ))}
            </div>

            {/* ── CONTROLS BAR ── */}
            <div className="sw-controls-bar">
              {[
                { icon: <MicIcon muted={muted} size={18} />,  label: muted ? "Unmute" : "Mute", onClick: handleToggleMic, active: !muted },
                { icon: <CamIcon off={camOff} size={18} />,   label: "Camera",                   onClick: handleToggleCam, active: !camOff },
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>,
                  label: "Audio", onClick: () => {}, active: true,
                },
                { icon: <ChatIcon size={18} />, label: "Chat", onClick: () => {}, active: true },
                { icon: <DotsIcon size={18} />, label: "More",     onClick: () => {}, active: true },
              ].map(({ icon, label, onClick, active }, i) => (
                <div key={i} className="ctrl-item">
                  <button onClick={onClick} style={ctrlBtn(active)}>{icon}</button>
                  <span className="ctrl-label" style={{ visibility: label ? "visible" : "hidden" }}>
                    {label || "·"}
                  </span>
                </div>
              ))}

              {/* Leave */}
              <div className="ctrl-item" style={{ marginLeft: 4 }}>
                <button className="leave-btn" onClick={onLeave}>
                  <PhoneOff size={15} /> Leave
                </button>
                <span className="ctrl-label" style={{ visibility: "hidden" }}>·</span>
              </div>
            </div>

            {/* Self-cam PiP */}
            <div className="sw-pip">
              {!camOff ? (
                <video ref={selfVideoRef} autoPlay muted playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.3)" }}>
                  <CamIcon off size={24} />
                </div>
              )}
              <div style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,.55)", color: "white", fontSize: 9, borderRadius: 5, padding: "2px 6px", fontWeight: 600 }}>You</div>
              {muted && (
                <div style={{ position: "absolute", bottom: 5, right: 5, background: "#e53935", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <MicIcon muted size={9} />
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Chat + Session Info ── */}
          <div className="sw-chat-panel">

            {/* Chat header */}
            <div style={{ padding: "14px 16px 10px", borderBottom: "1.5px solid #f0ebff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: "#2d1f5e" }}>
                <ChatIcon size={15} /> Chat <span style={{ fontSize: 14 }}>☺</span>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9889c8" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <Avatar size={28} initials={m.from === "you" ? "Y" : "SM"} extraStyle={{ border: "none" }} />
                    <span style={{ fontWeight: 700, fontSize: 12, color: "#2d1f5e" }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: "#c0b8da", marginLeft: "auto" }}>{m.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#4a3680", lineHeight: 1.6, paddingLeft: 36 }}>{m.text}</div>
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
                placeholder="Type a message..."
              />
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#b0a8d0", fontSize: 17, padding: "0 2px" }}>📎</button>
              <button className="send-btn" onClick={sendMsg}>
                <SendIcon size={13} />
              </button>
            </div>

            {/* Session Info */}
            <div className="info-section">
              <div className="info-section-title">
                Session Info <span style={{ color: "#9889c8", fontSize: 14, cursor: "pointer" }}>›</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <Avatar size={36} extraStyle={{ border: "none" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#2d1f5e" }}>Dr. Sarah Mitchell, PhD</div>
                  <div style={{ fontSize: 11, color: "#7c6aaa" }}>Anxiety · Relationships</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[["Duration", "50 mins"], ["Start Time", "10:00 AM"]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: "#9889c8", fontWeight: 500, marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2d1f5e" }}>{v}</div>
                  </div>
                ))}
              </div>
              <button className="safety-btn">
                <ShieldIcon /> Safety Guide
              </button>
            </div>

            {/* Quick Help */}
            <div className="info-section">
              <div className="info-section-title">
                Quick Help <span style={{ color: "#9889c8", fontSize: 14 }}>›</span>
              </div>
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