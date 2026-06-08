/**
 * SessionLive.jsx  (LiveKit edition)
 *
 * Live video call screen.
 *
 * Key points:
 * ─ Remote video track: livekitManager.remoteMedia.videoTrack.attach()
 *   renders the track into a <div> container. LiveKit handles:
 *     • H.264 / VP8 decoding on Android WebView, iOS WKWebView, desktop
 *     • Adaptive bitrate (simulcast downgrade on poor connections)
 *     • Audio played via auto-attached <audio> element (no srcObject juggling)
 *
 * ─ Self PiP: local video track rendered via track.attach()
 *
 * ─ Bluetooth headphones: browser selects audio output based on OS routing;
 *   LiveKit's audio stack uses Web Audio API which respects the current
 *   default audio output device (BT headphones, AirPods, etc.).
 *
 * ─ Web → Mobile rendering: LiveKit server transcodes/relays as needed.
 *   The remote side (Android / iOS SDK) subscribes to the VP8 simulcast
 *   layer best matching their screen size.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { MicIcon, CamIcon, PhoneOff, SendIcon, ChatIcon, LockIcon, ExpandIcon, Avatar, SignalIcon } from "./Icons";
import { livekitManager } from "../config/livekitManager";
import { getInitials, formatFirebaseTimestamp } from "../utils/helper";

export default function SessionLive({
  therapist,
  sessionMeta,
  onLeave,
  role,
  name,
  patientName,
  therapistName,
}) {
  const th = therapist || { name: "Dr. Sarah Mitchell", credentials: "PhD", specialties: ["Anxiety", "Relationships"], avatarInitials: "SM" };
  const sm = sessionMeta || { durationMins: 50, startTime: "10:00 AM" };

  const remoteVideoContainerRef = useRef(null);
  const selfVideoContainerRef   = useRef(null);
  const chatEndRef              = useRef(null);
  const peerLeftTimer           = useRef(null);

  const remoteParticipantName     = role === "therapist" ? patientName    : therapistName;
  const remoteParticipantInitials = role === "therapist" ? getInitials(patientName) : getInitials(therapistName);
  const selfInitials              = role === "therapist" ? getInitials(therapistName) : getInitials(patientName);

  // Initial media state from localStorage (set in lobby)
  const initMic = localStorage.getItem("micActive") === "true";
  const initCam = localStorage.getItem("camActive") === "true";

  const [chatMsg,      setChatMsg]      = useState("");
  const [messages,     setMessages]     = useState([]);
  const [sessionSecs,  setSessionSecs]  = useState(0);
  const [muted,        setMuted]        = useState(!initMic);
  const [camOff,       setCamOff]       = useState(!initCam);
  const [chatOpen,     setChatOpen]     = useState(true);
  const [connState,    setConnState]    = useState("connected");
  const [peerLeft,     setPeerLeft]     = useState(false);
  const [remoteMuted,  setRemoteMuted]  = useState(false);
  const [remoteCamOff, setRemoteCamOff] = useState(false);
  const [pipExpanded,  setPipExpanded]  = useState(false);
  const [mediaError,   setMediaError]   = useState(null);
  const [busy,         setBusy]         = useState(false);
  // Whether a remote video track is subscribed
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  // ── Attach remote video track ─────────────────────────────────────────────
  const attachRemoteVideo = useCallback(() => {
    const media     = livekitManager.remoteMedia;
    const container = remoteVideoContainerRef.current;
    if (!media.videoTrack || !container) return;
    media.videoTrack.detach(); // detach from any old element
    const el = media.videoTrack.attach();
    el.style.width      = "100%";
    el.style.height     = "100%";
    el.style.objectFit  = "cover";
    el.style.display    = "block";
    el.style.background = "#0b0f1a";
    container.innerHTML = "";
    container.appendChild(el);
    setHasRemoteVideo(true);
  }, []);

  // ── Attach self (local) video ─────────────────────────────────────────────
  const attachLocalVideo = useCallback(() => {
    const track     = livekitManager.localVideoTrack;
    const container = selfVideoContainerRef.current;
    if (!track || !container) return;
    track.detach();
    const el = track.attach();
    el.style.width      = "100%";
    el.style.height     = "100%";
    el.style.objectFit  = "cover";
    el.style.transform  = "scaleX(-1)";
    container.innerHTML = "";
    container.appendChild(el);
  }, []);

  // ── Wire livekitManager callbacks ──────────────────────────────────────────
  useEffect(() => {
    // Attach any already-subscribed tracks from before this component mounted
    const currentMedia = livekitManager.remoteMedia;
    if (currentMedia.videoTrack) attachRemoteVideo();
    if (!initCam && livekitManager.localVideoTrack) attachLocalVideo();

    livekitManager.callbacks = {
      ...livekitManager.callbacks,

      onRemoteMedia: (media) => {
        if (media.videoTrack) {
          attachRemoteVideo();
          setHasRemoteVideo(true);
        } else {
          setHasRemoteVideo(false);
          if (remoteVideoContainerRef.current) remoteVideoContainerRef.current.innerHTML = "";
        }
        setRemoteCamOff(!media.videoTrack);
      },

      onLocalVideoTrack: (track) => {
        if (track && !camOff) attachLocalVideo();
      },

      onRemoteMediaState: (state) => {
        setRemoteMuted(!state.micEnabled);
        setRemoteCamOff(!state.cameraEnabled);
        if (!state.cameraEnabled) {
          setHasRemoteVideo(false);
          if (remoteVideoContainerRef.current) remoteVideoContainerRef.current.innerHTML = "";
        }
      },

      onMessages: (msgs) => setMessages(msgs),

      onConnectionStatus: (status) => setConnState(status),

      onPeerLeft: () => {
        setPeerLeft(true);
        clearTimeout(peerLeftTimer.current);
        peerLeftTimer.current = setTimeout(() => setPeerLeft(false), 8000);
      },
    };

    return () => {
      livekitManager.callbacks.onRemoteMedia      = undefined;
      livekitManager.callbacks.onLocalVideoTrack  = undefined;
      livekitManager.callbacks.onRemoteMediaState = undefined;
      livekitManager.callbacks.onMessages         = undefined;
      livekitManager.callbacks.onConnectionStatus = undefined;
      livekitManager.callbacks.onPeerLeft         = undefined;
      clearTimeout(peerLeftTimer.current);
    };
  }, [attachRemoteVideo, attachLocalVideo, initCam, camOff]);

  // Re-attach local video when cam toggles back on
  useEffect(() => {
    if (!camOff) attachLocalVideo();
  }, [camOff, attachLocalVideo]);

  // ── Session timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setSessionSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Auto-scroll chat ──────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Broadcast media state on change ───────────────────────────────────────
  useEffect(() => {
    livekitManager.sendMessage({
      type: "media_state_updated",
      micEnabled: !muted,
      cameraEnabled: !camOff,
    });
  }, [muted, camOff]);

  // ── Toggles ───────────────────────────────────────────────────────────────
  const handleToggleMic = async () => {
    if (busy) return;
    const next = muted; // enabling = was muted
    setBusy(true); setMediaError(null);
    try {
      await livekitManager.toggleMute(!next);
      setMuted(!next);
      localStorage.setItem("micActive", String(next));
    } catch (err) {
      setMediaError(err?.name === "NotAllowedError"
        ? "Microphone blocked. Allow it in the address-bar lock and retry."
        : "Could not toggle microphone.");
    } finally { setBusy(false); }
  };

  const handleToggleCam = async () => {
    if (busy) return;
    const enabling = camOff;
    setBusy(true); setMediaError(null);
    setCamOff(!enabling);
    localStorage.setItem("camActive", String(enabling));
    try {
      await livekitManager.toggleCamera(!enabling);
    } catch (err) {
      setCamOff(true);
      localStorage.setItem("camActive", "false");
      setMediaError(err?.name === "NotAllowedError"
        ? "Camera blocked. Allow it in the address-bar lock and retry."
        : "Could not toggle camera.");
    } finally { setBusy(false); }
  };

  const handleLeave = () => { livekitManager.hangup(); onLeave?.(); };

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    livekitManager.sendChatMessage(chatMsg.trim());
    setChatMsg("");
  };

  const em = String(Math.floor(sessionSecs / 60)).padStart(2, "0");
  const es = String(sessionSecs % 60).padStart(2, "0");
  const isConnected    = connState === "connected";
  const connBadgeColor = isConnected ? "#22c55e" : connState === "failed" ? "#ef4444" : "#f59e0b";

  const showRemotePlaceholder = !hasRemoteVideo || peerLeft || remoteCamOff;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        @keyframes pulse-live { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.45); } 50% { box-shadow: 0 0 0 7px rgba(34,197,94,0); } }
        @keyframes reconnecting { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .sl-root {
          height: 100vh; max-height: 100vh; overflow: hidden;
          display: flex; flex-direction: column;
          background: #0b0f1a;
          font-family: 'DM Sans', sans-serif; position: relative;
        }
        .sl-hud {
          position: absolute; top: 0; left: 0; right: 0;
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          background: linear-gradient(to bottom, rgba(11,15,26,.95) 0%, transparent 100%);
          z-index: 20;
        }
        .sl-remote-wrap {
          flex: 1; position: relative; min-height: 0; display: flex;
        }
        .sl-remote-container {
          width: 100%; height: 100%;
          background: #0b0f1a;
        }
        .sl-remote-placeholder {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 14px; background: #0b0f1a;
        }
        .sl-controls {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(11,15,26,.98) 0%, transparent 100%);
          display: flex; align-items: flex-end; justify-content: center;
          gap: 12px; padding: 24px 20px 28px; z-index: 20;
          transition: right .2s;
        }
        .ctrl-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .ctrl-lbl  { font-size: 10px; color: rgba(255,255,255,.35); font-weight: 500; white-space: nowrap; }
        .ctrl-btn  {
          width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .18s, transform .1s; outline: none;
        }
        .ctrl-btn:active { transform: scale(.93); }
        .ctrl-active { background: rgba(255,255,255,.12); color: white; border: 1px solid rgba(255,255,255,.15); }
        .ctrl-active:hover { background: rgba(255,255,255,.2); }
        .ctrl-muted  { background: rgba(239,68,68,.2); color: #f87171; border: 1px solid rgba(239,68,68,.35); }
        .ctrl-muted:hover { background: rgba(239,68,68,.3); }
        .ctrl-leave {
          height: 52px; padding: 0 24px; border-radius: 28px; border: none; cursor: pointer;
          background: #dc2626; color: white; display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; font-family: inherit;
          box-shadow: 0 4px 20px rgba(220,38,38,.45); transition: opacity .15s;
        }
        .ctrl-leave:hover { opacity: .88; }
        .sl-pip {
          position: absolute; bottom: 110px; right: 20px;
          width: 156px; height: 116px; border-radius: 12px; overflow: hidden;
          border: 2px solid rgba(255,255,255,.18);
          box-shadow: 0 4px 24px rgba(0,0,0,.6); background: #111827;
          cursor: pointer; transition: width .2s, height .2s; z-index: 15;
        }
        .sl-pip.expanded { width: 234px; height: 174px; }
        .sl-chat-overlay {
          position: absolute; top: 0; right: 0; bottom: 0;
          width: 316px; max-width: 100%;
          background: rgba(17,24,39,.97); backdrop-filter: blur(20px);
          display: flex; flex-direction: column;
          z-index: 25; border-left: 1px solid rgba(255,255,255,.06);
          animation: slideInRight .22s ease;
          box-shadow: -4px 0 40px rgba(0,0,0,.4);
        }
        @media (max-width: 580px) {
          .sl-chat-overlay { width: 100%; }
          .sl-pip { bottom: 92px; right: 10px; width: 126px; height: 94px; }
        }
        .chat-msgs {
          flex: 1; overflow-y: auto; padding: 14px 14px;
          display: flex; flex-direction: column; gap: 12px; min-height: 0;
        }
        .msg-self  { background: linear-gradient(135deg,#22d3ee,#0ea5e9); color: #0b0f1a; border-radius: 12px 12px 4px 12px; padding: 9px 12px; font-size: 13px; line-height: 1.5; align-self: flex-end; max-width: 82%; word-break: break-word; }
        .msg-other { background: rgba(255,255,255,.07); color: rgba(255,255,255,.8); border-radius: 12px 12px 12px 4px; padding: 9px 12px; font-size: 13px; line-height: 1.5; align-self: flex-start; max-width: 82%; word-break: break-word; }
        .chat-input-row {
          padding: 10px 12px; border-top: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: center; gap: 8px;
        }
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
        .peer-left-banner {
          position: absolute; top: 72px; left: 50%; transform: translateX(-50%);
          background: rgba(245,158,11,.9); color: white; border-radius: 10px;
          padding: 10px 20px; font-size: 13px; font-weight: 600; z-index: 30;
          animation: fadeIn .3s ease; display: flex; align-items: center; gap: 8px;
          backdrop-filter: blur(8px); white-space: nowrap;
        }
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

      <div className="sl-root">

        {/* ── HUD ── */}
        <div className="sl-hud">
          <Avatar size={34} initials={th.avatarInitials} extraStyle={{ border: "2px solid rgba(255,255,255,.2)" }} />
          <div>
            <div style={{ color: "rgba(255,255,255,.85)", fontWeight: 700, fontSize: 13 }}>{th.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: connBadgeColor, display: "inline-block", animation: isConnected ? "pulse-live 2s infinite" : undefined }} />
              <span style={{ color: "rgba(255,255,255,.45)", fontSize: 11 }}>{isConnected ? "Live" : "Reconnecting…"}</span>
            </div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,.07)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "6px 14px", display: "flex", alignItems: "center", gap: 7, border: "1px solid rgba(255,255,255,.07)" }}>
              <span style={{ fontSize: 13 }}>🔴</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: "white", fontFamily: "DM Mono, monospace" }}>{em}:{es}</span>
            </div>

            <button onClick={() => setChatOpen(v => !v)} style={{ background: chatOpen ? "rgba(34,211,238,.15)" : "rgba(255,255,255,.08)", border: chatOpen ? "1px solid rgba(34,211,238,.3)" : "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: chatOpen ? "#22d3ee" : "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", transition: "all .15s" }}>
              <ChatIcon size={13} />
              {chatOpen ? "Hide Chat" : "Chat"}
              {messages.length > 0 && !chatOpen && (
                <span style={{ background: "#22d3ee", color: "#0b0f1a", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{messages.length > 9 ? "9+" : messages.length}</span>
              )}
            </button>

            <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 7, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>
              <LockIcon size={10} /> Encrypted
            </div>
          </div>
        </div>

        {/* ── REMOTE VIDEO ── */}
        <div className="sl-remote-wrap">
          {/*
            The container <div> is ALWAYS rendered.
            LiveKit attaches a <video> element into it via track.attach().
            This means audio continues to play (through the attached <audio>
            element LiveKit created when subscribing the audio track) even
            when the remote camera is off and we overlay the placeholder.
            We never unmount the container so the video element is stable.
          */}
          <div
            ref={remoteVideoContainerRef}
            className="sl-remote-container"
            style={{ display: showRemotePlaceholder ? "none" : "block" }}
          />
          {showRemotePlaceholder && (
            <div className="sl-remote-placeholder">
              <div style={{ position: "relative" }}>
                <Avatar size={96} initials={remoteParticipantInitials} extraStyle={{ border: "3px solid rgba(255,255,255,.1)" }} />
                {remoteMuted && (
                  <div style={{ position: "absolute", bottom: 4, right: 4, background: "#dc2626", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0b0f1a" }}>
                    <MicIcon muted size={12} />
                  </div>
                )}
              </div>
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 14, textAlign: "center", fontWeight: 500, maxWidth: 260, lineHeight: 1.5 }}>
                {peerLeft
                  ? "Connection interrupted…"
                  : remoteCamOff
                  ? `${remoteParticipantName} has turned off their camera`
                  : `Connecting to ${remoteParticipantName}…`}
              </div>
              {!peerLeft && !remoteCamOff && (
                <div style={{ color: "rgba(255,255,255,.2)", fontSize: 12, animation: "reconnecting 1.5s infinite" }}>Please wait</div>
              )}
            </div>
          )}
        </div>

        {/* ── PEER LEFT BANNER ── */}
        {peerLeft && (
          <div className="peer-left-banner">
            ⚠️ {th.name.split(" ").pop()} disconnected. Waiting for reconnection…
          </div>
        )}

        {/* ── SELF PiP ── */}
        <div className={`sl-pip${pipExpanded ? " expanded" : ""}`} onClick={() => setPipExpanded(v => !v)}>
          {!camOff
            ? <div ref={selfVideoContainerRef} style={{ width: "100%", height: "100%" }} />
            : <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111827", gap: 4 }}>
                <Avatar size={pipExpanded ? 60 : 40} initials={selfInitials} extraStyle={{ border: "2px solid rgba(255,255,255,.15)" }} />
              </div>
          }
          <div style={{ position: "absolute", top: 5, left: 6, background: "rgba(0,0,0,.6)", color: "white", fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>You</div>
          <div style={{ position: "absolute", top: 5, right: 6, color: "rgba(255,255,255,.4)" }}><ExpandIcon size={9} /></div>
          {muted && (
            <div style={{ position: "absolute", bottom: 5, right: 6, background: "#dc2626", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <MicIcon muted size={8} />
            </div>
          )}
        </div>

        {/* ── MEDIA ERROR TOAST ── */}
        {mediaError && (
          <div style={{ position: "absolute", bottom: 106, left: "50%", transform: "translateX(-50%)", background: "rgba(220,38,38,.9)", color: "white", border: "1px solid rgba(220,38,38,.5)", borderRadius: 10, padding: "10px 16px", fontSize: 12, fontWeight: 500, maxWidth: 360, textAlign: "center", lineHeight: 1.5, zIndex: 25, backdropFilter: "blur(8px)" }}>
            {mediaError}
          </div>
        )}

        {/* ── CONTROLS ── */}
        <div className="sl-controls" style={{ right: chatOpen ? 316 : 0 }}>
          {[
            { icon: <MicIcon muted={muted} size={20} />, label: muted ? "Unmute" : "Mute",       onClick: handleToggleMic, isOff: muted   },
            { icon: <CamIcon off={camOff}  size={20} />, label: camOff ? "Cam Off" : "Camera",   onClick: handleToggleCam, isOff: camOff  },
          ].map(({ icon, label, onClick, isOff }, i) => (
            <div key={i} className="ctrl-wrap">
              <button onClick={onClick} disabled={busy} className={`ctrl-btn ${isOff ? "ctrl-muted" : "ctrl-active"}`} style={{ opacity: busy ? 0.5 : 1, cursor: busy ? "wait" : "pointer" }}>{icon}</button>
              <span className="ctrl-lbl">{label}</span>
            </div>
          ))}
         
            <div className="ctrl-wrap" style={{ marginLeft: 8 }}>
              <button className="ctrl-leave" onClick={handleLeave}><PhoneOff size={16} /> End Call</button>
              <span className="ctrl-lbl" style={{ visibility: "hidden" }}>·</span>
            </div>
          
        </div>

        {/* ── CHAT OVERLAY ── */}
        {chatOpen && (
          <div className="sl-chat-overlay">
            <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 8 }}>
              <ChatIcon size={13} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,.7)", flex: 1 }}>Chat</span>
              <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.3)", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>

            <div className="chat-msgs">
              {messages.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 12, marginTop: 20 }}>No messages yet. 👋</div>}
               {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    alignSelf: m.role === "patient" ? "flex-end" : "flex-start",
                  }}>
                    {m.role === "therapist" && (
                      <Avatar size={20} initials={getInitials(m?.senderName)} extraStyle={{ border: "none" }} />
                    )}
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

            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar size={30} initials={th.avatarInitials} extraStyle={{ border: "none" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,.6)" }}>{th.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{th.specialties.join(" · ")}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginBottom: 2 }}>Duration</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.55)" }}>{sm.durationMins} mins</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginBottom: 2 }}>Session Time</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#22d3ee", fontFamily: "DM Mono, monospace" }}>{em}:{es}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}