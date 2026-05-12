import { useState, useRef } from "react";
import SessionLobby from "./Sessionlobby";
import SessionWaiting from "./Sessionwaiting";
import SessionLive from "./SessionLive";
import SessionEnded from "./Sessionended";
import { webRTCManager } from "../config/webrtcmanger";
import { useSearchParams } from "react-router-dom";

/**
 * Session flow:
 *   lobby → waiting → live → ended
 *
 * Configure these before deployment:
 */




export default function App() {
  const [screen, setScreen] = useState("lobby");   // lobby | waiting | live | ended
  const [remoteStream, setRemoteStream] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionStartRef = useRef(null);

    const [params] = useSearchParams();

    const sessionCode = params.get("sessionCode");
    const userId = params.get("userId");
    const role = params.get("role");
    const name = params.get("name")
    const profession=params.get("profession")
    const startTime = params.get("startTime");

    const skills =
  JSON.parse(
    decodeURIComponent(params.get("skills") || "[]")
  );

    


  


  const getInitials = (name = "") => {
    return name?.trim()
      .split(" ")
      .filter(Boolean)
      .map(word => word[0].toUpperCase())
      .join("");
  };





  const SESSION_CONFIG = {
    sessionCode: sessionCode,
    userId: userId ,
    role: role,           // "patient" | "therapist"
  };

  const THERAPIST_INFO = {
    name: name,
    credentials: profession,
    specialties: skills,
    avatarInitials: getInitials(name),
  };

  const SESSION_META = {
    durationMins: 45,
    startTime: startTime,
  };

  // ── Lobby → Waiting ──────────────────────────────────────────────────────
  const handleLobbyJoined = () => {
    sessionStartRef.current = Date.now();
    setScreen("waiting");
  };

  // ── Waiting → Live (remote peer joined) ──────────────────────────────────
  const handlePeerJoined = (stream) => {
    setRemoteStream(stream);
    setScreen("live");
  };

  // ── Leave from Waiting ────────────────────────────────────────────────────
  const handleLeaveWaiting = () => {
    webRTCManager.hangup();
    setScreen("lobby");
  };

  // ── Leave from Live ───────────────────────────────────────────────────────
  const handleLeaveCall = () => {
    const secs = sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;
    setSessionDuration(Math.ceil(secs / 60));
    setRemoteStream(null);
    // hangup already called inside SessionLive before this fires
    setScreen("ended");
  };

  // ── Ended → Lobby ─────────────────────────────────────────────────────────
  const handleDone = () => {
    setScreen("lobby");
  };

  const handleBookAgain = () => {
    // Navigate to booking page in your app
    console.log("[App] Book again clicked");
    setScreen("lobby");
  };

  return (
    <>
      {screen === "lobby" && (
        <SessionLobby
          sessionCode={SESSION_CONFIG.sessionCode}
          userId={SESSION_CONFIG.userId}
          role={SESSION_CONFIG.role}
          therapist={THERAPIST_INFO}
          sessionMeta={SESSION_META}
          onJoined={handleLobbyJoined}
        />
      )}

      {screen === "waiting" && (
        <SessionWaiting
          therapist={THERAPIST_INFO}
          sessionMeta={SESSION_META}
          onLeave={handleLeaveWaiting}
          onPeerJoined={handlePeerJoined}
        />
      )}

      {screen === "live" && (
        <SessionLive
          therapist={THERAPIST_INFO}
          sessionMeta={SESSION_META}
          remoteStream={remoteStream}
          onLeave={handleLeaveCall}
        />
      )}

      {screen === "ended" && (
        <SessionEnded
          therapist={THERAPIST_INFO}
          duration={sessionDuration || 52}
          onDone={handleDone}
          onBookAgain={handleBookAgain}
        />
      )}
    </>
  );
}
