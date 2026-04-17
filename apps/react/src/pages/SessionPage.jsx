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

  const getSessionQueryParams = () => {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    const sessionCode = params.get("sessionCode");
    const userId = params.get("userId");
    const role = params.get("role");
    const name = params.get('name')
    const skills = params.get("skills")
      ? JSON.parse(decodeURIComponent(params.get("skills")))
      : [];

    // ✅ decode time string
    const startTime = params.get("startTime")
      ? decodeURIComponent(params.get("startTime"))
      : "";

    return {
      sessionCode,
      userId,
      role,
      name,
      skills,
      startTime
    };
  }


  const {
    sessionCode,
    userId,
    role,
    name,
    skills,
    startTime
  } = getSessionQueryParams();





  const SESSION_CONFIG = {
    sessionCode: sessionCode || "69a54abd29c99c56303ea5f6",
    userId: userId || "696f408b2ff51b82b1cee0e6",
    role: role,           // "patient" | "therapist",
    name,
    skills,
    startTime
  };

  const THERAPIST_INFO = {
    name,
    credentials: "PhD",
    specialties: skills,
    avatarInitials: "SM",
  };

  const SESSION_META = {
  durationMins: 50,
  startTime,
};

  console.log(SESSION_CONFIG)

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
