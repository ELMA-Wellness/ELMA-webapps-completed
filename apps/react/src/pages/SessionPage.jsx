/**
 * App.jsx  (LiveKit edition)
 *
 * Session flow orchestrator:
 *   lobby → waiting → live → ended
 *
 * livekitManager.initialize() is the single entry point for all media.
 * All screens read/write via the singleton livekitManager.
 */
import { useState, useEffect, useRef } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import SessionLobby   from "./SessionLobby";
import SessionWaiting from "./SessionWaiting";
import SessionLive    from "./SessionLive";
import SessionEnded   from "./Sessionended";
import SessionExpiredWeb from "./SessionExpired";
import CompleteSessionConfirmationModal from "../components/modals/CompleteSessionConfirmation";
import { livekitManager } from "../config/livekitManager";
import { updateById }      from "../firebase/firestore";
import { isSessionExpired, getInitials } from "../utils/helper";
import { createAndDownloadPDF } from "../utils/createAndDownLoadPDF";

function normalizeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  if (["therapist", "expert", "psych", "psychologist", "doctor", "provider",
       "counsellor", "counselor", "professional"].includes(role)) return "therapist";
  return "patient";
}

export default function App() {
  const [screen,          setScreen]          = useState("lobby");
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionStartRef = useRef(null);
   const [notes, setNotes] = useState("")

  const [params] = useSearchParams();

  // ── URL params ─────────────────────────────────────────────────────────────
  const sessionCode = params.get("sessionCode");
  const userId      = params.get("userId");
  const role        = normalizeRole(params.get("role"));
  const name        = params.get("name");
  const profession  = params.get("profession");
  const startTime   = params.get("startTime");

  const skills = (() => {
    try { return JSON.parse(decodeURIComponent(params.get("skills") || "[]")); }
    catch { return []; }
  })();

  const therapistPhoto = params.get("therapistPhoto");
  const clientPhoto    = params.get("patientPhoto");
  const tname          = params.get("therapistName");
  const cname          = params.get("patientName");
  const temail         = params.get("therapistEmail");
  const cemail         = params.get("patientEmail");

  // The display name for the current user (used as LiveKit participant name)
  const ownDisplayName = role === "therapist" ? tname : cname;

  // ── Config objects ─────────────────────────────────────────────────────────
  const THERAPIST_INFO = {
    name:           name,
    credentials:    profession,
    specialties:    skills,
    avatarInitials: getInitials(name),
  };

  const SESSION_META = {
    durationMins: 45,
    startTime,
  };

  // ── Session ended event from WS ────────────────────────────────────────────
  useEffect(() => {
    livekitManager.callbacks.onSessionEnded = () => {setScreen("ended")
     
    };
    return () => { livekitManager.callbacks.onSessionEnded = undefined; };
  }, []);

  // ── Guard: expired session ─────────────────────────────────────────────────
  if (isSessionExpired(startTime)) {
    return <Navigate to="/session/expired" />;
  }

  // ── Lobby → Waiting ────────────────────────────────────────────────────────
  const handleLobbyJoined = () => {
    sessionStartRef.current = Date.now();
    setScreen("waiting");
  };

  // ── Waiting → Live ─────────────────────────────────────────────────────────
  // LiveKit-based: no remoteStream arg needed — SessionLive reads from livekitManager directly
  const handlePeerJoined = () => {
    setScreen("live");
  };

  // ── Leave from Waiting ─────────────────────────────────────────────────────
  const handleLeaveWaiting = () => {
    livekitManager.hangup();
    setScreen("lobby");
  };

  // ── Leave from Live ────────────────────────────────────────────────────────
  const handleLeaveCall = () => {
    const secs = sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;
    setSessionDuration(Math.ceil(secs / 60));
     if(role==='therapist'){
      localStorage.setItem("notes",notes)
    }
    livekitManager.hangup()
    // livekitManager.hangup() was already called inside SessionLive
    setScreen("ended");
  };

  // ── Ended flow ─────────────────────────────────────────────────────────────
  const handleDone      = () => setScreen("lobby");
  const handleBookAgain = () => setScreen("lobby");

  const onMarkComplete = async () => {
    await updateById("bookings", sessionCode, { status: "completed", sessionCompleted: true });
    setScreen("lobby");
  };
  const onSkip = () => setScreen("lobby");

  const handleDownLoad=async()=>{
    await createAndDownloadPDF({
      therapistName:tname,
      patientName:cname,
      
      sessionCode,
      notes: localStorage.getItem("notes"),
      date:startTime,
      duration:45

    })
    localStorage.removeItem("notes")
  }

  // Patient sees confirmation modal on ended
  if (role === "patient" && screen === "ended") {
    return <CompleteSessionConfirmationModal onMarkAsComplete={onMarkComplete} onSkip={onSkip} visible />;
  }

  return (
    <>
      {screen === "lobby" && (
        <SessionLobby
          sessionCode={sessionCode}
          userId={userId}
          role={role}
          userName={ownDisplayName || userId}
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
          role={role}
          name={name}
          therapistNameInitial={getInitials(tname)}
          patientNameInitial={getInitials(cname)}
        />
      )}

      {screen === "live" && (
        <SessionLive
          therapist={THERAPIST_INFO}
          sessionMeta={SESSION_META}
          onLeave={handleLeaveCall}
          role={role}
          name={name}
          therapistName={tname}
          patientName={cname}
          notes={notes}
          setNotes={setNotes}
        />
      )}

      {screen === "ended" && (
        <SessionEnded
          therapist={THERAPIST_INFO}
          duration={sessionDuration || 52}
          onDone={handleDone}
          onBookAgain={handleBookAgain}
          name={THERAPIST_INFO.name}
          role={role}
          profession={profession}
          onDownLoadNotes={handleDownLoad}
        />
      )}
    </>
  );
}