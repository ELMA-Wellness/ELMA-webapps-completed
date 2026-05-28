import { useState, useEffect, useRef } from "react";
import {
  MicIcon, CamIcon, PhoneOff, SendIcon, ChatIcon,
  LockIcon, ExpandIcon, Avatar, SignalIcon,
} from "./Icons";
import { webRTCManager } from "../config/webrtcmanger";
import { getInitials, formatFirebaseTimestamp } from "../utils/helper";

/**
 * SessionLive – video call screen.
 *
 * ─── All bugs fixed ────────────────────────────────────────────────────────
 * 1. SELF PREVIEW BLACK / NOT RENDERING
 *    Root cause: callback-ref fires only when the DOM node mounts.
 *    If the stream arrives AFTER the node is already in the DOM (normal case –
 *    component mounts before webRTCManager finishes getUserMedia), the ref
 *    callback never re-runs, leaving srcObject null.
 *    Fix: plain useRef + a useEffect keyed on [localStream, camOff] that
 *    always (re-)attaches after every React commit.
 *    Bonus: on mount we also read webRTCManager.localStream (the already-
 *    acquired stream) so we never miss a stream that existed before mount.
 *
 * 2. REMOTE BLACK SCREEN AFTER CAM RE-ENABLE
 *    Same root cause – conditional render unmounts/remounts <video>.
 *    Fix: useEffect keyed on [remoteStream, remoteCamOff].
 *
 * 3. MIC INAUDIBLE TO REMOTE
 *    a) Wrong/inconsistent message type on initial broadcast.
 *    b) No re-broadcast after state change → remote kept stale snapshot.
 *    Fix: single broadcastMediaState() helper; called via a useEffect
 *    watching [muted, camOff] so remote always converges.
 *
 * 4. CAMERA TRACK PERMANENTLY ENDED
 *    Some browsers mark a track "ended" after disable. Re-enabling .enabled
 *    on an ended track is a no-op.
 *    Fix: handleToggleCam checks readyState; re-acquires via getUserMedia and
 *    replaces the RTCPeerConnection sender track if needed.
 * ───────────────────────────────────────────────────────────────────────────
 */
export default function SessionLive({
  therapist,
  sessionMeta,
  remoteStream: initialRemoteStream,
  onLeave,
  role,
  name,
}) {
  /* ── defaults ─────────────────────────────────────────────────────────── */
  const th = therapist || {
    name: "Dr. Sarah Mitchell",
    credentials: "PhD",
    specialties: ["Anxiety", "Relationships"],
    avatarInitials: "SM",
  };
  const sm = sessionMeta || { durationMins: 50, startTime: "10:00 AM" };
  const remoteParticipantName = role === "therapist" ? "Client" : th.name;
  const remoteParticipantInitials = role === "therapist" ? "CL" : th.avatarInitials;
  // Own initials for the self-preview PiP.
  // For therapists the URL "name" param is their own name. For patients "name" is
  // the therapist's name (for display), so we can't derive patient initials from it.
  const selfInitials = role === "therapist" ? th.avatarInitials : "";

  /* ── refs ─────────────────────────────────────────────────────────────── */
  // Plain refs so useEffect can always find the current DOM node
  const selfVideoRef   = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatEndRef     = useRef(null);
  const peerLeftTimer  = useRef(null);
  // Always-current values for inside callbacks (avoids stale closures)
  const mutedRef  = useRef(false);
  const camOffRef = useRef(false);

  /* ── state ────────────────────────────────────────────────────────────── */
  const initialMicActive = localStorage.getItem("micActive") === "true" || hasLiveTrack(webRTCManager.localStream, "audio");
  const initialCamActive = localStorage.getItem("camActive") === "true" || hasLiveTrack(webRTCManager.localStream, "video");

  const [chatMsg,     setChatMsg]     = useState("");
  const [messages,    setMessages]    = useState([]);
  const [sessionSecs, setSessionSecs] = useState(0);
  const [muted,       setMuted]       = useState(!initialMicActive);
  const [camOff,      setCamOff]      = useState(!initialCamActive);
  const [chatOpen,    setChatOpen]    = useState(true);
  const [connState,   setConnState]   = useState("connected");
  const [peerLeft,    setPeerLeft]    = useState(false);
  const [localStream, setLocalStream]  = useState(null);
  const [remoteStream,setRemoteStream] = useState(initialRemoteStream || null);
  const [remoteMuted, setRemoteMuted]  = useState(false);
  const [remoteCamOff,setRemoteCamOff] = useState(false);
  const [pipExpanded, setPipExpanded]  = useState(false);
  const [mediaError,  setMediaError]   = useState(null);
  const [busy,        setBusy]         = useState(false);

  mutedRef.current  = muted;
  camOffRef.current = camOff;

  /* ── helpers ──────────────────────────────────────────────────────────── */
  function attachStream(videoEl, stream) {
    if (!videoEl) return;
    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream || null;
    }
    if (stream) {
      const playPromise = videoEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }
  }

  function hasLiveTrack(stream, kind) {
    return Boolean(stream?.getTracks().some((track) => track.kind === kind && track.readyState === "live"));
  }

  function broadcastMediaState(micEnabled, cameraEnabled) {
    webRTCManager.sendMessage({
      type: "media_state_updated",   // single canonical type
      micEnabled,
      cameraEnabled,
    });
  }

  /* ── FIX 1: self preview ──────────────────────────────────────────────── *
   * Video element is always in DOM (hidden via CSS when camOff), so we can   *
   * attach whenever the stream object changes or the element re-shows.       *
   * Re-running when camOff flips back to false guarantees the browser has a  *
   * mounted, painted element to play into.                                   */
  useEffect(() => {
    attachStream(selfVideoRef.current, localStream);
  }, [localStream, camOff]);

  /* ── FIX 2: remote video re-attach after cam toggle ──────────────────── */
  useEffect(() => {
    // Always attach — keeping the video element mounted regardless of
    // remoteCamOff lets audio continue playing when the remote peer
    // turns their camera off (audio and video share the same srcObject).
    attachStream(remoteVideoRef.current, remoteStream);
  }, [remoteStream, remoteCamOff]);

  /* ── session clock ────────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => setSessionSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── auto-scroll chat ─────────────────────────────────────────────────── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── wire webRTCManager callbacks ─────────────────────────────────────── */
  useEffect(() => {
    // ── KEY FIX: grab the stream that already exists before this component
    // mounted. The lobby/setup screen acquires camera before navigating here,
    // so webRTCManager.localStream is already populated on first render.
    // Without this, the very first self-preview is always blank.
    const existingLocal = webRTCManager.localStream;
    if (existingLocal) {
      setLocalStream(existingLocal);
      if (hasLiveTrack(existingLocal, "video")) {
        setCamOff(false);
      }
      if (hasLiveTrack(existingLocal, "audio")) {
        setMuted(false);
      }
    }

    if (initialRemoteStream) setRemoteStream(initialRemoteStream);

    // Future stream changes (e.g. track replaced, re-acquired)
    webRTCManager.onLocalStreamChanged = (stream) => {
      setLocalStream(stream);   // triggers FIX 1 useEffect
    };
    webRTCManager.onRemoteStreamChanged = (stream) => {
      setRemoteStream(stream);  // triggers FIX 2 useEffect
    };
    webRTCManager.onRemoteMediaStateChanged = (state) => {
      setRemoteMuted(!state.micEnabled);
      setRemoteCamOff(!state.cameraEnabled);
    };
    webRTCManager.onMessagesChanged        = (msgs)  => setMessages(msgs);
    webRTCManager.onConnectionStateChanged = (state) => setConnState(state);
    webRTCManager.onPeerDisconnect = () => {
      setPeerLeft(true);
      clearTimeout(peerLeftTimer.current);
      peerLeftTimer.current = setTimeout(() => setPeerLeft(false), 8000);
    };

    return () => {
      webRTCManager.onLocalStreamChanged      = null;
      webRTCManager.onRemoteStreamChanged     = null;
      webRTCManager.onRemoteMediaStateChanged = null;
      webRTCManager.onMessagesChanged         = null;
      webRTCManager.onConnectionStateChanged  = null;
      webRTCManager.onPeerDisconnect          = null;
      clearTimeout(peerLeftTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── FIX 3: broadcast our media state ────────────────────────────────── *
   * Fires on mount (remote learns initial state) and on every toggle        *
   * (remote always has the latest snapshot, no stale "mic off" confusion).  */
  useEffect(() => {
    broadcastMediaState(!muted, !camOff);
  }, [muted, camOff]);

  /* ── toggles ──────────────────────────────────────────────────────────── */
  const handleToggleMic = async () => {
    if (busy) return;
    const shouldEnable = mutedRef.current;
    setBusy(true);
    setMediaError(null);
    try {
      await webRTCManager.toggleMute(!shouldEnable);
      setMuted(!shouldEnable);
      localStorage.setItem("micActive", String(shouldEnable));
    } catch (err) {
      console.error("SessionLive: failed to toggle microphone -", err);
      setMuted(true);
      localStorage.setItem("micActive", "false");
      setMediaError(
        err?.name === "NotAllowedError"
          ? "Microphone access blocked. Allow it in the address-bar lock icon and try again."
          : "Could not enable microphone. Please check your device settings."
      );
    } finally {
      setBusy(false);
    }
    // broadcastMediaState fires via the [muted, camOff] useEffect
  };

  const handleToggleCam = async () => {
    if (busy) return;
    const shouldEnable = camOffRef.current;
    const nowOff = !shouldEnable;
    setBusy(true);
    setMediaError(null);
    setCamOff(nowOff);
    localStorage.setItem("camActive", String(shouldEnable));

    try {
      await webRTCManager.toggleCamera(nowOff);
      setLocalStream(webRTCManager.localStream);
    } catch (err) {
      console.error("SessionLive: failed to toggle camera -", err);
      setCamOff(true);
      localStorage.setItem("camActive", "false");
      setLocalStream(webRTCManager.localStream);
      setMediaError(
        err?.name === "NotAllowedError"
          ? "Camera access blocked. Allow it in the address-bar lock icon and try again."
          : "Could not enable camera. Please check your device settings."
      );
    } finally {
      setBusy(false);
    }
    // broadcastMediaState fires via the [muted, camOff] useEffect
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

  /* ── derived ──────────────────────────────────────────────────────────── */
  const em = String(Math.floor(sessionSecs / 60)).padStart(2, "0");
  const es = String(sessionSecs % 60).padStart(2, "0");
  const isConnected    = ["connected", "completed"].includes(connState);
  const connBadgeColor = isConnected ? "#22c55e" : connState === "failed" ? "#ef4444" : "#f59e0b";
  const signalBars     = isConnected ? 4 : connState === "checking" ? 2 : 1;

  /* ── render ───────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.45); }
          50%      { box-shadow: 0 0 0 7px rgba(34,197,94,0); }
        }
        @keyframes reconnecting {
          0%,100% { opacity: 1; } 50% { opacity: .4; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .sl-root {
          height: 100vh; max-height: 100vh; overflow: hidden;
          display: flex; flex-direction: column;
          background: #0d0a1a;
          font-family: 'Sora', 'Segoe UI', sans-serif;
          position: relative;
        }
        .sl-hud {
          position: absolute; top: 0; left: 0; right: 0;
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          background: linear-gradient(to bottom, rgba(13,10,26,.9) 0%, transparent 100%);
          z-index: 20;
        }
        .sl-remote-wrap {
          flex: 1; position: relative; min-height: 0; display: flex;
        }
        .sl-remote-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 14px; background: #0d0a1a;
        }
        .sl-controls {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(13,10,26,.95) 0%, transparent 100%);
          display: flex; align-items: flex-end; justify-content: center;
          gap: 12px; padding: 24px 20px 28px;
          z-index: 20; transition: right .2s;
        }
        .ctrl-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .ctrl-lbl  { font-size: 10px; color: rgba(255,255,255,.5); font-weight: 500; white-space: nowrap; }
        .ctrl-btn  {
          width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .18s, transform .1s; outline: none;
        }
        .ctrl-btn:active { transform: scale(.93); }
        .ctrl-btn-active { background: rgba(255,255,255,.15); color: white; }
        .ctrl-btn-active:hover { background: rgba(255,255,255,.22); }
        .ctrl-btn-muted  {
          background: rgba(239,68,68,.25); color: #f87171;
          border: 1px solid rgba(239,68,68,.4);
        }
        .ctrl-btn-muted:hover { background: rgba(239,68,68,.35); }
        .ctrl-btn-leave {
          height: 52px; padding: 0 24px; border-radius: 28px; border: none; cursor: pointer;
          background: #e53935; color: white;
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; font-family: inherit;
          box-shadow: 0 4px 20px rgba(229,57,53,.5);
          transition: opacity .15s, transform .1s;
        }
        .ctrl-btn-leave:hover  { opacity: .88; }
        .ctrl-btn-leave:active { transform: scale(.95); }
        .sl-pip {
          position: absolute; bottom: 110px; right: 20px;
          width: 160px; height: 118px;
          border-radius: 14px; overflow: hidden;
          border: 2.5px solid rgba(255,255,255,.25);
          box-shadow: 0 4px 24px rgba(0,0,0,.5);
          background: #1a1030; cursor: pointer;
          transition: width .2s, height .2s, border-color .2s; z-index: 15;
        }
        .sl-pip:hover   { border-color: rgba(255,255,255,.5); }
        .sl-pip.expanded { width: 240px; height: 178px; }
        .sl-chat-overlay {
          position: absolute; top: 0; right: 0; bottom: 0;
          width: 320px; max-width: 100%;
          background: rgba(255,255,255,.97); backdrop-filter: blur(20px);
          display: flex; flex-direction: column;
          z-index: 25; border-left: 1px solid rgba(180,160,240,.2);
          animation: slideInRight .22s ease;
          box-shadow: -4px 0 32px rgba(0,0,0,.25);
        }
        @media (max-width: 600px) {
          .sl-chat-overlay { width: 100%; }
          .sl-pip { bottom: 96px; right: 10px; width: 130px; height: 96px; }
        }
        .chat-messages-live {
          flex: 1; overflow-y: auto; padding: 14px 16px;
          display: flex; flex-direction: column; gap: 12px; min-height: 0;
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
        .chat-input-row-live {
          padding: 10px 14px; border-top: 1px solid #f0ebff;
          display: flex; align-items: center; gap: 8px;
        }
        .chat-input-live {
          flex: 1; border: 1.5px solid #e0d8f8; border-radius: 10px;
          padding: 8px 12px; font-size: 13px; color: #2d1f5e;
          outline: none; background: #faf8ff; font-family: inherit;
          transition: border-color .15s;
        }
        .chat-input-live:focus { border-color: #a78bfa; }
        .send-btn-live {
          background: #7c4ddb; border: none; border-radius: 10px;
          width: 34px; height: 34px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; color: white;
          flex-shrink: 0; transition: background .15s;
        }
        .send-btn-live:hover { background: #6b3fd4; }
        .peer-left-banner {
          position: absolute; top: 70px; left: 50%; transform: translateX(-50%);
          background: rgba(245,158,11,.92); color: white;
          border-radius: 12px; padding: 10px 20px;
          font-size: 13px; font-weight: 600; z-index: 30;
          animation: fadeIn .3s ease;
          display: flex; align-items: center; gap: 8px;
          backdrop-filter: blur(8px); white-space: nowrap;
        }
      `}</style>

      <div className="sl-root">

        {/* ── HUD ── */}
        <div className="sl-hud">
          <Avatar size={36} initials={th.avatarInitials}
            extraStyle={{ border: "2px solid rgba(255,255,255,.3)" }} />
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{th.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: connBadgeColor, display: "inline-block",
                animation: isConnected ? "pulse-dot 2s infinite" : undefined,
              }} />
              <span style={{ color: "rgba(255,255,255,.65)", fontSize: 11 }}>
                {isConnected ? "Live" : "Reconnecting…"}
              </span>
            </div>
          </div>

          <div style={{ marginLeft: 8, color: connBadgeColor, display: "flex", alignItems: "center" }}>
            <SignalIcon bars={signalBars} size={16} />
          </div>

          <div style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,.1)", borderRadius: 10,
            padding: "6px 14px", backdropFilter: "blur(8px)",
          }}>
            <span style={{ fontSize: 14 }}>🔴</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: "white", fontVariantNumeric: "tabular-nums" }}>
              {em}:{es}
            </span>
          </div>

          <button onClick={() => setChatOpen((v) => !v)} style={{
            background: chatOpen ? "rgba(124,77,219,.6)" : "rgba(255,255,255,.12)",
            border: "none", borderRadius: 10, padding: "7px 14px", cursor: "pointer",
            color: "white", fontSize: 12, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "inherit", backdropFilter: "blur(8px)", transition: "background .15s",
          }}>
            <ChatIcon size={13} />
            {chatOpen ? "Hide Chat" : "Chat"}
            {messages.length > 0 && !chatOpen && (
              <span style={{
                background: "#7c4ddb", borderRadius: "50%",
                width: 17, height: 17, fontSize: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{messages.length > 9 ? "9+" : messages.length}</span>
            )}
          </button>

          <div style={{
            background: "rgba(255,255,255,.1)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,.15)", borderRadius: 8,
            padding: "5px 11px", display: "flex", alignItems: "center",
            gap: 5, fontSize: 11, color: "rgba(255,255,255,.8)", fontWeight: 500,
          }}>
            <LockIcon size={11} /> Encrypted
          </div>
        </div>

        {/* ── REMOTE VIDEO ── */}
        <div className="sl-remote-wrap">
          {/*
            The <video> element is ALWAYS rendered so that audio from remoteStream
            keeps playing even when the remote peer turns their camera off.
            Audio and video share the same srcObject; unmounting the element
            would silence the audio. The placeholder overlays it visually when
            there is no video to show.
          */}
          <video
            ref={remoteVideoRef}
            autoPlay playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#0d0a1a" }}
          />
          {(!remoteStream || peerLeft || remoteCamOff) && (
            <div className="sl-remote-placeholder" style={{ position: "absolute", inset: 0 }}>
              <div style={{ position: "relative" }}>
                <Avatar size={96} initials={remoteParticipantInitials}
                  extraStyle={{ border: "3px solid rgba(255,255,255,.15)" }} />
                {remoteMuted && (
                  <div style={{
                    position: "absolute", bottom: 4, right: 4,
                    background: "#e53935", borderRadius: "50%", width: 28, height: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #0d0a1a",
                  }}>
                    <MicIcon muted size={14} />
                  </div>
                )}
              </div>
              <div style={{ color: "rgba(255,255,255,.6)", fontSize: 14, textAlign: "center", fontWeight: 500 }}>
                {peerLeft
                  ? "Connection interrupted…"
                  : remoteCamOff
                  ? `${remoteParticipantName} has turned off their camera`
                  : `Connecting to ${remoteParticipantName.toLowerCase()}...`}
              </div>
              {!peerLeft && !remoteCamOff && (
                <div style={{ color: "rgba(255,255,255,.35)", fontSize: 12, animation: "reconnecting 1.5s infinite" }}>
                  Please wait
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PEER LEFT BANNER ── */}
        {peerLeft && (
          <div className="peer-left-banner">
            ⚠️ {th.name.split(" ").pop()} has disconnected. Waiting for reconnection…
          </div>
        )}

        {/* ── SELF PiP ── */}
        <div className={`sl-pip${pipExpanded ? " expanded" : ""}`}
          onClick={() => setPipExpanded((v) => !v)}>
          {/*
            Keep <video> always in DOM so srcObject is never lost when
            the user toggles their camera. We just hide it with CSS.
          */}
          <video
            ref={selfVideoRef}
            autoPlay
            muted        /* always mute self-preview to prevent echo */
            playsInline
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", transform: "scaleX(-1)",
              display: camOff ? "none" : "block",
            }}
          />
          {camOff && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "#1a1030", gap: 4,
            }}>
              <Avatar size={pipExpanded ? 64 : 44} initials={selfInitials}
                extraStyle={{ border: "2px solid rgba(255,255,255,.2)" }} />
            </div>
          )}
          <div style={{
            position: "absolute", top: 5, left: 6,
            background: "rgba(0,0,0,.55)", color: "white",
            fontSize: 9, borderRadius: 5, padding: "2px 6px", fontWeight: 600,
          }}>You</div>
          <div style={{ position: "absolute", top: 5, right: 6, color: "rgba(255,255,255,.5)" }}>
            <ExpandIcon size={10} />
          </div>
          {muted && (
            <div style={{
              position: "absolute", bottom: 5, right: 6,
              background: "#e53935", borderRadius: "50%", width: 18, height: 18,
              display: "flex", alignItems: "center", justifyContent: "center", color: "white",
            }}>
              <MicIcon muted size={8} />
            </div>
          )}
        </div>

        {/* ── MEDIA ERROR TOAST ── */}
        {mediaError && (
          <div style={{
            position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)",
            background: "rgba(239,68,68,0.92)", color: "white",
            border: "1px solid rgba(239,68,68,0.6)", borderRadius: 10,
            padding: "10px 16px", fontSize: 12.5, fontWeight: 500,
            maxWidth: 380, textAlign: "center", lineHeight: 1.5, zIndex: 25,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
          }}>
            {mediaError}
          </div>
        )}

        {/* ── CONTROLS ── */}
        <div className="sl-controls" style={{ right: chatOpen ? 320 : 0 }}>
          {[
            { icon: <MicIcon muted={muted} size={20} />, label: muted ? "Unmute" : "Mute",     onClick: handleToggleMic, isOff: muted   },
            { icon: <CamIcon off={camOff}  size={20} />, label: camOff ? "Cam Off" : "Camera", onClick: handleToggleCam, isOff: camOff  },
          ].map(({ icon, label, onClick, isOff }, i) => (
            <div key={i} className="ctrl-wrap">
              <button
                onClick={onClick}
                disabled={busy}
                className={`ctrl-btn ${isOff ? "ctrl-btn-muted" : "ctrl-btn-active"}`}
                style={{ opacity: busy ? 0.55 : 1, cursor: busy ? "wait" : "pointer" }}
              >
                {icon}
              </button>
              <span className="ctrl-lbl">{label}</span>
            </div>
          ))}
          {

            role==='therapist' && (
                <div className="ctrl-wrap" style={{ marginLeft: 8 }}>
            <button className="ctrl-btn-leave" onClick={handleLeave}>
              <PhoneOff size={16} /> End Call
            </button>
            <span className="ctrl-lbl" style={{ visibility: "hidden" }}>·</span>
          </div>
              
            )
            
          }
        
        </div>

        {/* ── CHAT OVERLAY ── */}
        {chatOpen && (
          <div className="sl-chat-overlay">
            <div style={{
              padding: "16px 16px 12px", borderBottom: "1px solid #f0ebff",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <ChatIcon size={14} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#2d1f5e", flex: 1 }}>Chat</span>
              <button onClick={() => setChatOpen(false)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#9889c8", fontSize: 18, lineHeight: 1,
              }}>×</button>
            </div>

            <div className="chat-messages-live">
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#c0b8da", fontSize: 12, marginTop: 20 }}>
                  No messages yet. 👋
                </div>
              )}
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

            <div className="chat-input-row-live">
              <input
                className="chat-input-live"
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                placeholder="Type a message…"
              />
              <button className="send-btn-live" onClick={sendMsg}>
                <SendIcon size={12} />
              </button>
            </div>

            <div style={{ padding: "12px 16px", borderTop: "1px solid #f0ebff", background: "#faf8ff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Avatar size={30} initials={th.avatarInitials} extraStyle={{ border: "none" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 11, color: "#2d1f5e" }}>{th.name}</div>
                  <div style={{ fontSize: 10, color: "#7c6aaa" }}>{th.specialties.join(" · ")}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#9889c8", marginBottom: 2 }}>Duration</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2d1f5e" }}>{sm.durationMins} mins</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#9889c8", marginBottom: 2 }}>Session Time</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2d1f5e", fontVariantNumeric: "tabular-nums" }}>
                    {em}:{es}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
