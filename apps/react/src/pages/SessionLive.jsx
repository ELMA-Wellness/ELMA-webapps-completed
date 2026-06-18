/**
 * SessionLive.jsx  (LiveKit edition)
 *
 * Live video call screen.
 *
 * Layout:
 *   sl-root (flex column, 100vh)
 *   └── sl-stage (flex: 1, position: relative)  ← ALL overlays live here
 *       ├── sl-remote-container                  ← LiveKit video element injected
 *       ├── sl-remote-placeholder                ← shown when no video
 *       ├── sl-hud                               ← top bar overlay
 *       ├── sl-pip                               ← self view, bottom-right overlay
 *       ├── sl-controls                          ← bottom controls overlay
 *       ├── .peer-left-banner
 *       ├── .media-error-toast
 *       └── sl-chat-overlay                      ← right-side chat panel
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { MicIcon, CamIcon, PhoneOff, SendIcon, ChatIcon, LockIcon, ExpandIcon, Avatar, SignalIcon } from "./Icons";
import { livekitManager } from "../config/livekitmanager";
import { getInitials, formatFirebaseTimestamp } from "../utils/helper";
import SessionNotesModal from "../components/modals/SessionNotesModal";
import { CgNotes } from "react-icons/cg";
import { FcEndCall } from "react-icons/fc";
import { playSessionEndMusic, playSessionStartSoundOnce, stopSessionEndMusic } from "../utils/audio";
import DeviceSwitch from "../components/modals/SwitchDevice";

export default function SessionLive({
  therapist,
  sessionMeta,
  onLeave,
  role,
  name,
  patientName,
  therapistName,
  notes,
  setNotes,
  therapistPhoto,
  patientPhoto,
  isDeviceSwitched,
  onCloseDeviceSwitch,
  setIsDeviceSwitched,
}) {
  const th = therapist || {
    name: "Dr. Sarah Mitchell",
    credentials: "PhD",
    specialties: ["Anxiety", "Relationships"],
    avatarInitials: "SM",
  };
  const sm = sessionMeta || { durationMins: 50, startTime: "10:00 AM" };
  const image=role==='therapist'?therapistPhoto:patientPhoto;

  const remoteImage=role==='therapist'?patientPhoto:therapistPhoto;


  // ── Refs ─────────────────────────────────────────────────────────────────
  const remoteVideoContainerRef = useRef(null);
  const selfVideoContainerRef   = useRef(null);
  const chatEndRef               = useRef(null);
  const peerLeftTimer            = useRef(null);

  // ── Derived names ────────────────────────────────────────────────────────
  const remoteParticipantName     = role === "therapist" ? patientName    : therapistName;
  const remoteParticipantInitials = role === "therapist" ? getInitials(patientName) : getInitials(therapistName);
  const selfInitials              = role === "therapist" ? getInitials(therapistName) : getInitials(patientName);

  // ── Initial media state from lobby ───────────────────────────────────────
  const initMic = localStorage.getItem("micActive") === "true";
  const initCam = localStorage.getItem("camActive") === "true";

  // ── State ─────────────────────────────────────────────────────────────────
  const [chatMsg,       setChatMsg]       = useState("");
  const [messages,      setMessages]      = useState([]);
  const [sessionSecs,   setSessionSecs]   = useState(0);
  const [muted,         setMuted]         = useState(!initMic);
  const [camOff,        setCamOff]        = useState(!initCam);
  const [chatOpen,      setChatOpen]      = useState(true);
  const [connState,     setConnState]     = useState("connected");
  const [peerLeft,      setPeerLeft]      = useState(false);
  const [remoteMuted,   setRemoteMuted]   = useState(false);
  const [remoteCamOff,  setRemoteCamOff]  = useState(false);
  const [pipExpanded,   setPipExpanded]   = useState(false);
  const [mediaError,    setMediaError]    = useState(null);
  const [busy,          setBusy]          = useState(false);
  const [hasRemoteVideo,setHasRemoteVideo]= useState(false);
  const [isNotesOpen,   setIsNotesOpen]   = useState(false);

  // ── Attach remote video ───────────────────────────────────────────────────
  const attachRemoteVideo = useCallback(() => {
    const media     = livekitManager.remoteMedia;
    const container = remoteVideoContainerRef.current;
    if (!media.videoTrack || !container) return;
    media.videoTrack.detach();
    const el = media.videoTrack.attach();
    Object.assign(el.style, {
      width: "100%", height: "100%",
      objectFit: "cover", display: "block",
      background: "#0b0f1a",
    });
    container.innerHTML = "";
    container.appendChild(el);
    setHasRemoteVideo(true);
  }, []);

  // ── Attach local (self) video ─────────────────────────────────────────────
  const attachLocalVideo = useCallback(() => {
    const track     = livekitManager.localVideoTrack;
    const container = selfVideoContainerRef.current;
    if (!track || !container) return;
    track.detach();
    const el = track.attach();
    Object.assign(el.style, {
      width: "100%", height: "100%",
      objectFit: "cover", display: "block",
      transform: "scaleX(-1)",
    });
    container.innerHTML = "";
    container.appendChild(el);
  }, []);

  // ── Wire LiveKit callbacks ────────────────────────────────────────────────
  useEffect(() => {
    if (livekitManager.remoteMedia.videoTrack) attachRemoteVideo();
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

      onMessages:        (msgs)   => setMessages(msgs),
      onConnectionStatus:(status) => setConnState(status),

      onPeerJoined: async() => {
        // Peer reconnected — drop the "disconnected" banner immediately so the
        // rejoin is seamless instead of lingering for the timeout.
        clearTimeout(peerLeftTimer.current);
        setPeerLeft(false);
        await Promise.all([playSessionStartSoundOnce(),stopSessionEndMusic()])
      },

      onPeerLeft: async() => {
        setPeerLeft(true);
        clearTimeout(peerLeftTimer.current);
        await playSessionEndMusic()
       // peerLeftTimer.current = setTimeout(() => setPeerLeft(false), 8000);
      },

      onDeviceSwitched:()=>{
        setIsDeviceSwitched(true)
      }
    };

    return async() => {
      livekitManager.callbacks.onRemoteMedia       = undefined;
      livekitManager.callbacks.onLocalVideoTrack   = undefined;
      livekitManager.callbacks.onRemoteMediaState  = undefined;
      livekitManager.callbacks.onMessages          = undefined;
      livekitManager.callbacks.onConnectionStatus  = undefined;
      livekitManager.callbacks.onPeerJoined        = undefined;
      livekitManager.callbacks.onPeerLeft          = undefined;
      clearTimeout(peerLeftTimer.current);
      await stopSessionEndMusic()
    };
  }, [attachRemoteVideo, attachLocalVideo, initCam, camOff]);

  // Re-attach local video when cam turns back on
  useEffect(() => {
    if (!camOff) attachLocalVideo();
  }, [camOff, attachLocalVideo]);

  // ── Session timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setSessionSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Auto-scroll chat ──────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Broadcast media state ─────────────────────────────────────────────────
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
    const enabling = muted;
    setBusy(true); setMediaError(null);
    try {
      await livekitManager.toggleMute(!enabling);
      setMuted(!enabling);
      localStorage.setItem("micActive", String(enabling));
    } catch (err) {
      setMediaError(
        err?.name === "NotAllowedError"
          ? "Microphone blocked. Allow it in the address-bar lock and retry."
          : "Could not toggle microphone."
      );
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
      setMediaError(
        err?.name === "NotAllowedError"
          ? "Camera blocked. Allow it in the address-bar lock and retry."
          : "Could not toggle camera."
      );
    } finally { setBusy(false); }
  };

  const handleLeave = () => { livekitManager.hangup(); onLeave?.(); };

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    livekitManager.sendChatMessage(chatMsg.trim());
    setChatMsg("");
  };

  // ── Derived UI values ─────────────────────────────────────────────────────
  const em = String(Math.floor(sessionSecs / 60)).padStart(2, "0");
  const es = String(sessionSecs % 60).padStart(2, "0");
  const isConnected        = connState === "connected";
  const connBadgeColor     = isConnected ? "#22c55e" : connState === "failed" ? "#ef4444" : "#f59e0b";
  const showRemotePlaceholder = !hasRemoteVideo || peerLeft || remoteCamOff;

  const controls = [
    {
      icon:  <MicIcon muted={muted} size={20} />,
      label: muted ? "Unmute" : "Mute",
      onClick: handleToggleMic,
      isOff: muted,
    },
    {
      icon:  <CamIcon off={camOff} size={20} />,
      label: camOff ? "Cam off" : "Camera",
      onClick: handleToggleCam,
      isOff: camOff,
    },
    ...(role === "therapist"
      ? [{
          icon:    <CgNotes size={20} />,
          label:   "Notes",
          onClick: () => setIsNotesOpen(true),
          isOff:   false,
        }]
      : []),
    {
      icon:    <FcEndCall size={28} />,
      label:   "End call",
      onClick: handleLeave,
      isOff:   true,
      isDanger: true,
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeInDown   { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        @keyframes pulse-live   { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.45); } 50% { box-shadow: 0 0 0 7px rgba(34,197,94,0); } }
        @keyframes blink        { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes rotate-dashed { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        /* ── Root: full-viewport column ─────────────────────────────────── */
        .sl-root {
          height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #0b0f1a;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          color: white;
        }

        /* ── Stage: video + all overlays ────────────────────────────────── */
        /*
          This is the single stacking context for every overlay.
          flex: 1 makes it fill all remaining height after any sibling rows.
          position: relative is essential — all absolute children reference it.
        */
        .sl-stage {
          flex: 1;
          position: relative;
          min-height: 0;       /* allow flex child to shrink below content size */
          background: #0b0f1a;
          overflow: hidden;
        }

        /* ── Remote video container ─────────────────────────────────────── */
        /*
          position: absolute + inset: 0 fills the entire stage.
          LiveKit injects a <video> element here via track.attach().
        */
        .sl-remote-container {
          position: absolute;
          inset: 0;
          background: #0b0f1a;
          transition: opacity 0.4s ease;
        }
        .sl-remote-container video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── Remote placeholder (no video / cam off / peer left) ─────────── */
        .sl-remote-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: #0b0f1a;
          z-index: 2;
          transition: all 0.4s ease;
        }
        .peer-offline-ring {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 2.5px dashed rgba(239, 68, 68, 0.5);
          animation: rotate-dashed 10s linear infinite;
        }

        /* ── HUD: top gradient bar ─────────────────────────────────────── */
        .sl-hud {
          position: absolute;
          top: 0; left: 0; right: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: linear-gradient(to bottom, rgba(11,15,26,.92) 0%, transparent 100%);
          z-index: 10;
        }

        /* ── Controls bar: bottom gradient ──────────────────────────────── */
        .sl-controls {
          position: absolute;
          bottom: 0; left: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 10px;
          padding: 32px 20px 24px;
          background: linear-gradient(to top, rgba(11,15,26,.95) 0%, transparent 100%);
          z-index: 10;
          transition: right .2s ease;
        }
        .ctrl-wrap  { display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .ctrl-lbl   { font-size: 10px; color: rgba(255,255,255,.35); font-weight: 500; white-space: nowrap; }
        .ctrl-btn   {
          width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s, transform .1s;
          outline: none;
        }
        .ctrl-btn:active { transform: scale(.92); }
        .ctrl-btn:disabled { opacity: .45; cursor: wait; }
        .ctrl-active { background: rgba(255,255,255,.12); color: white; border: 1px solid rgba(255,255,255,.14); }
        .ctrl-active:hover { background: rgba(255,255,255,.2); }
        .ctrl-off    { background: rgba(239,68,68,.18); color: #f87171; border: 1px solid rgba(239,68,68,.3); }
        .ctrl-off:hover { background: rgba(239,68,68,.28); }
        .ctrl-danger { background: rgba(220,38,38,.85); color: white; border: 1px solid transparent; box-shadow: 0 4px 18px rgba(220,38,38,.4); }
        .ctrl-danger:hover { background: #dc2626; }

        /* ── Self PiP ────────────────────────────────────────────────────── */
        /*
          position: absolute places it relative to .sl-stage.
          z-index: 15 sits above video (z 0) and placeholder (z 2)
          but below HUD / controls (z 10) — raise if you want it above controls.
          bottom / right push it to the bottom-right corner of the stage.
          The chat panel shift is handled inline via right: chatOpen ? 336px : 20px.
        */
        .sl-pip {
          position: absolute;
          bottom: 100px;           /* clear the controls bar */
          right: 20px;             /* default; overridden inline when chat open */
          width: 160px;
          height: 118px;
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,.16);
          box-shadow: 0 6px 28px rgba(0,0,0,.65);
          background: #111827;
          cursor: pointer;
          transition: width .18s ease, height .18s ease, right .2s ease, bottom .2s ease;
          z-index: 15;
          flex-shrink: 0;
        }
        .sl-pip.expanded { width: 240px; height: 178px; }
        .sl-pip video {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transform: scaleX(-1);
        }
        /* fill container when LiveKit attaches a <video> into selfVideoContainerRef */
        .sl-pip-video-mount {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .sl-pip-video-mount video {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transform: scaleX(-1);
        }

        /* ── Peer-left banner ─────────────────────────────────────────────── */
        .peer-left-banner {
          position: absolute;
          top: 88px; left: 50%; transform: translateX(-50%);
          background: rgba(245,158,11,.92);
          color: white; border-radius: 10px;
          padding: 10px 20px; font-size: 13px; font-weight: 600;
          z-index: 20; white-space: nowrap;
          animation: fadeInDown .25s ease;
          backdrop-filter: blur(8px);
          display: flex; align-items: center; gap: 8px;
        }

        /* ── Media error toast ───────────────────────────────────────────── */
        .media-error-toast {
          position: absolute;
          bottom: 110px; left: 50%; transform: translateX(-50%);
          background: rgba(220,38,38,.92);
          color: white; border-radius: 10px;
          padding: 10px 16px; font-size: 12px; font-weight: 500;
          max-width: 340px; text-align: center; line-height: 1.5;
          z-index: 20; backdrop-filter: blur(8px);
        }

        /* ── Chat overlay ────────────────────────────────────────────────── */
        .sl-chat-overlay {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 316px;
          background: rgba(15,20,35,.97);
          backdrop-filter: blur(24px);
          display: flex; flex-direction: column;
          z-index: 12;
          border-left: 1px solid rgba(255,255,255,.06);
          animation: slideInRight .2s ease;
          box-shadow: -6px 0 40px rgba(0,0,0,.45);
        }
        .chat-msgs {
          flex: 1; overflow-y: auto; padding: 14px;
          display: flex; flex-direction: column; gap: 11px; min-height: 0;
        }
        .chat-msgs::-webkit-scrollbar       { width: 4px; }
        .chat-msgs::-webkit-scrollbar-track  { background: transparent; }
        .chat-msgs::-webkit-scrollbar-thumb  { background: rgba(255,255,255,.1); border-radius: 4px; }
        .msg-self {
          background: linear-gradient(135deg, #7c4ddb, #9b6bf5);
          color: white; border-radius: 14px 14px 4px 14px;
          padding: 9px 13px; font-size: 13px; line-height: 1.5;
          align-self: flex-end; max-width: 84%; word-break: break-word;
        }
        .msg-other {
          background: #f3f0ff; color: #2d1f5e;
          border-radius: 14px 14px 14px 4px;
          padding: 9px 13px; font-size: 13px; line-height: 1.5;
          align-self: flex-start; max-width: 84%; word-break: break-word;
        }
        .chat-input-row {
          padding: 10px 12px;
          border-top: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: center; gap: 8px;
        }
        .chat-input {
          flex: 1; border: 1px solid rgba(255,255,255,.1); border-radius: 8px;
          padding: 8px 12px; font-size: 13px; color: rgba(255,255,255,.8);
          outline: none; background: rgba(255,255,255,.05); font-family: inherit;
          transition: border-color .15s;
        }
        .chat-input:focus { border-color: rgba(124,77,219,.5); }
        .send-btn {
          background: linear-gradient(135deg, #7c4ddb, #9b6bf5);
          border: none; border-radius: 8px;
          width: 34px; height: 34px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
          transition: opacity .15s;
        }
        .send-btn:hover { opacity: .88; }

        /* ── Responsive ──────────────────────────────────────────────────── */
        @media (max-width: 580px) {
          .sl-chat-overlay { width: 100%; }
          .sl-pip { width: 120px; height: 90px; bottom: 88px; right: 12px; }
          .sl-pip.expanded { width: 180px; height: 136px; }
        }
      `}</style>

      <div className="sl-root">

        {/* ════════════════════════════════════════════════════════════════
            STAGE  —  all video + overlays live inside here
            ════════════════════════════════════════════════════════════ */}
        <div className="sl-stage">

          {/* ── Remote video container ─────────────────────────────────── */}
          {/*
            Always rendered so LiveKit's attached <video>/<audio> elements
            survive re-renders (audio keeps playing even when placeholder
            is shown on top).
          */}
          <div
            ref={remoteVideoContainerRef}
            className="sl-remote-container"
            style={{ display: showRemotePlaceholder ? "none" : "block" }}
          />

          {/* ── Remote Muted Overlay (when camera is ON) ── */}
          {!showRemotePlaceholder && remoteMuted && (
            <div style={{
              position: "absolute",
              bottom: 110,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(11, 15, 26, 0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: "8px 18px",
              borderRadius: "40px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              zIndex: 5,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              animation: "fadeInDown 0.4s ease",
            }}>
              <div style={{ 
                background: "#dc2626", borderRadius: "50%", width: 24, height: 24, 
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.4)"
              }}>
                <MicIcon muted size={12} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>
                {remoteParticipantName} is muted
              </span>
            </div>
          )}

          {/* ── Remote placeholder ─────────────────────────────────────── */}
          {showRemotePlaceholder && (
            <div className="sl-remote-placeholder">
              <div style={{ position: "relative" }}>
                {peerLeft && <div className="peer-offline-ring" />}
                <Avatar
                  size={100}
                  initials={remoteParticipantInitials}
                  image={remoteImage}
                  extraStyle={{ 
                    border: peerLeft ? "3px solid #ef4444" : "3px solid rgba(255,255,255,.15)",
                    animation: peerLeft ? "pulse-red 2s infinite" : "none",
                    transition: "all 0.3s ease"
                  }}
                />
                {remoteMuted && !peerLeft && (
                  <div style={{
                    position: "absolute", bottom: 2, right: 2,
                    background: "#dc2626", borderRadius: "50%",
                    width: 28, height: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #0b0f1a",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                  }}>
                    <MicIcon muted size={12} />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ color: "white", fontSize: 16, fontWeight: 600 }}>
                  {remoteParticipantName}
                </div>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: 6, 
                  background: peerLeft ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)", 
                  padding: "4px 12px", borderRadius: 20,
                  border: peerLeft ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  color: peerLeft ? "#f87171" : "rgba(255,255,255,0.5)",
                  fontSize: 13, fontWeight: 500
                }}>
                  {peerLeft ? (
                    "Connection interrupted…"
                  ) : remoteMuted ? (
                    <><MicIcon muted size={12} /> Muted</>
                  ) : remoteCamOff ? (
                    "Camera off"
                  ) : (
                    "Connecting…"
                  )}
                </div>
              </div>
              {!peerLeft && !remoteCamOff && !remoteMuted && (
                <div style={{ color: "rgba(255,255,255,.2)", fontSize: 11, animation: "blink 1.4s infinite" }}>
                  Please wait
                </div>
              )}
            </div>
          )}

          {/* ── HUD ─────────────────────────────────────────────────────── */}
          <div className="sl-hud">
            <Avatar
              size={34}
              initials={th.avatarInitials}
              image={remoteImage}
              extraStyle={{ border: "2px solid rgba(255,255,255,.18)", flexShrink: 0 }}
            />
            <div>
              <div style={{ color: "rgba(255,255,255,.88)", fontWeight: 700, fontSize: 13 }}>{th.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: connBadgeColor, display: "inline-block",
                  animation: isConnected ? "pulse-live 2s infinite" : undefined,
                }} />
                <span style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>
                  {isConnected ? "Live" : "Reconnecting…"}
                </span>
              </div>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              {/* Timer */}
              <div style={{
                background: "rgba(255,255,255,.07)", backdropFilter: "blur(8px)",
                borderRadius: 8, padding: "5px 12px",
                display: "flex", alignItems: "center", gap: 6,
                border: "1px solid rgba(255,255,255,.07)",
              }}>
                <span style={{ fontSize: 12 }}>🔴</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "white", fontFamily: "DM Mono, monospace" }}>
                  {em}:{es}
                </span>
              </div>

              {/* Chat toggle */}
              <button
                onClick={() => setChatOpen((v) => !v)}
                style={{
                  background: chatOpen ? "rgba(124,77,219,.18)" : "rgba(255,255,255,.07)",
                  border: chatOpen ? "1px solid rgba(124,77,219,.35)" : "1px solid rgba(255,255,255,.1)",
                  borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                  color: chatOpen ? "#b48ef5" : "rgba(255,255,255,.55)",
                  fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "inherit", transition: "all .15s",
                }}
              >
                <ChatIcon size={13} />
                {chatOpen ? "Hide" : "Chat"}
                {messages.length > 0 && !chatOpen && (
                  <span style={{
                    background: "#7c4ddb", color: "white",
                    borderRadius: "50%", width: 16, height: 16,
                    fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700,
                  }}>
                    {messages.length > 9 ? "9+" : messages.length}
                  </span>
                )}
              </button>

              {/* Encrypted badge */}
              <div style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 7, padding: "4px 9px",
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 500,
              }}>
                <LockIcon size={10} /> Encrypted
              </div>
            </div>
          </div>

          {/* ── Self PiP ────────────────────────────────────────────────── */}
          {/*
            Positioned absolutely inside .sl-stage.
            right shifts when chat is open so the PiP is never hidden behind
            the chat panel. bottom clears the controls bar (~88–100px).
          */}
          <div
            className={`sl-pip${pipExpanded ? " expanded" : ""}`}
            style={{ right: chatOpen ? 336 : 20 }}
            onClick={() => setPipExpanded((v) => !v)}
          >
            {!camOff ? (
              /* mount point for LiveKit track.attach() */
              <div ref={selfVideoContainerRef} className="sl-pip-video-mount" />
            ) : (
              <div style={{
                position: "absolute", inset: pipExpanded ?90:60,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "#111827", gap: 4,
              }}>
                <Avatar
                  size={pipExpanded ? 60 : 40}
                  initials={selfInitials}
                  image={image}
                  extraStyle={{ border: "2px solid rgba(255,255,255,.14)" }}
                />
              </div>
            )}

            {/* "You" label */}
            <div style={{
              position: "absolute", top: 5, left: 6,
              background: "rgba(0,0,0,.6)", color: "white",
              fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600,
              pointerEvents: "none",
            }}>
              You
            </div>

            {/* Expand icon */}
            <div style={{
              position: "absolute", top: 5, right: 6,
              color: "rgba(255,255,255,.35)",
              pointerEvents: "none",
            }}>
              <ExpandIcon size={9} />
            </div>

            {/* Muted indicator */}
            {muted && (
              <div style={{
                position: "absolute", bottom: 5, right: 6,
                background: "#dc2626", borderRadius: "50%",
                width: 18, height: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white",
              }}>
                <MicIcon muted size={8} />
              </div>
            )}
          </div>

          {/* ── Controls ─────────────────────────────────────────────────── */}
          <div
            className="sl-controls"
            style={{ right: chatOpen ? 316 : 0 }}
          >
            {controls.map(({ icon, label, onClick, isOff, isDanger }, i) => (
              <div key={i} className="ctrl-wrap">
                <button
                  onClick={onClick}
                  disabled={busy}
                  className={`ctrl-btn ${isDanger ? "ctrl-danger" : isOff ? "ctrl-off" : "ctrl-active"}`}
                >
                  {icon}
                </button>
                <span className="ctrl-lbl">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Peer-left banner ─────────────────────────────────────────── */}
          {peerLeft && (
            <div className="peer-left-banner">
              ⚠️ {remoteParticipantName} disconnected — waiting to reconnect…
            </div>
          )}

          {/* ── Media error toast ─────────────────────────────────────────── */}
          {mediaError && (
            <div className="media-error-toast">{mediaError}</div>
          )}

          {/* ── Chat overlay ─────────────────────────────────────────────── */}
          {chatOpen && (
            <div className="sl-chat-overlay">
              {/* Header */}
              <div style={{
                padding: "15px 14px 12px",
                borderBottom: "1px solid rgba(255,255,255,.06)",
                display: "flex", alignItems: "center", gap: 8,
                marginTop:20
              }}>
                <ChatIcon size={13} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,.7)", flex: 1 }}>
                  Chat
                </span>
                <button
                  onClick={() => setChatOpen(false)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,.3)", fontSize: 20, lineHeight: 1,
                    padding: "0 2px",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Messages */}
              <div className="chat-msgs">
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 12, marginTop: 24 }}>
                    No messages yet. 👋
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      alignSelf: m.role === "patient" ? "flex-end" : "flex-start",
                    }}>
                     
                        <Avatar image={m.role==='patient' ? patientPhoto : therapistPhoto} size={20} initials={getInitials(m?.senderName)} extraStyle={{ border: "none" }} />
                      
                      <span style={{ fontWeight: 600, fontSize: 11, color: "#9b80e8" }}>{m?.senderName}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,.28)" }}>
                        {formatFirebaseTimestamp(m?.createdAt)}
                      </span>
                    </div>
                    <div className={m.role === "patient" ? "msg-self" : "msg-other"}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input-row">
                <input
                  className="chat-input"
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                  placeholder="Type a message…"
                />
                <button className="send-btn" onClick={sendMsg}>
                  <SendIcon size={12} />
                </button>
              </div>

              {/* Session info footer */}
              <div style={{
                padding: "12px 14px",
                borderTop: "1px solid rgba(255,255,255,.05)",
                background: "rgba(255,255,255,.02)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Avatar image={remoteImage} size={30} initials={th.avatarInitials} extraStyle={{ border: "none" }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,.55)" }}>{th.name}</div>
                    {
                      role==='patient' &&
                    
                    (<div style={{ fontSize: 10, color: "rgba(255,255,255,.28)" }}>{th.specialties.join(" · ")}</div>)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.22)", marginBottom: 2 }}>Duration</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>
                      {sm.durationMins} mins
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.22)", marginBottom: 2 }}>Elapsed</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#b48ef5", fontFamily: "DM Mono, monospace" }}>
                      {em}:{es}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>{/* end .sl-stage */}

        {/* ── Session Notes Modal (outside stage so it can be full-screen) ── */}
        <SessionNotesModal
          visible={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          notesText={notes}
          setNotesText={setNotes}
        />
      </div>
      <DeviceSwitch
        visible={isDeviceSwitched}
        onContinue={onCloseDeviceSwitch}
        toDevice="mobile"
        onClose={()=>{setIsDeviceSwitched(false)}}
      />
    </>
  );
}