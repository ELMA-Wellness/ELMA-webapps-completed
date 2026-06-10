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
import SessionLobby from "./Sessionlobby";
import SessionWaiting from "./Sessionwaiting";
import SessionLive from "./SessionLive";
import SessionEnded from "./Sessionended";
import SessionExpiredWeb from "./SessionExpired";
import CompleteSessionConfirmationModal from "../components/modals/CompleteSessionConfirmation";
import { livekitManager } from "../config/livekitmanager";
import { updateById } from "../firebase/firestore";
import { isSessionExpired, getInitials } from "../utils/helper";
import { createAndDownloadPDF } from "../utils/createAndDownLoadPDF";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/config";

function normalizeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  if (["therapist", "expert", "psych", "psychologist", "doctor", "provider",
    "counsellor", "counselor", "professional"].includes(role)) return "therapist";
  return "patient";
}

export default function App() {
  const [screen, setScreen] = useState("lobby");
  const [sessionDuration, setSessionDuration] = useState(0);
  const sessionStartRef = useRef(null);
  const [notes, setNotes] = useState("")
  const [confirmationPopUpOpen, setIsConfirmationPopUpOpen] = useState(false)
  const [loader, setIsLoader] = useState(false)
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [params] = useSearchParams();

  // ── URL params ─────────────────────────────────────────────────────────────
  const sessionCode = params.get("sessionCode");
  const userId = params.get("userId");
  const role = normalizeRole(params.get("role"));
  const name = params.get("name");
  const profession = params.get("profession");
  const startTime = params.get("startTime");

  const skills = (() => {
    try { return JSON.parse(decodeURIComponent(params.get("skills") || "[]")); }
    catch { return []; }
  })();

  const therapistPhoto = params.get("therapistPhoto");
  const clientPhoto = params.get("patientPhoto");
  const tname = params.get("therapistName");
  const cname = params.get("patientName");
  const temail = params.get("therapistEmail");
  const cemail = params.get("patientEmail");
  const tid = params.get("therapistId");
  const[error,setError]=useState(null)


  // The display name for the current user (used as LiveKit participant name)
  const ownDisplayName = role === "therapist" ? tname : cname;

  // ── Config objects ─────────────────────────────────────────────────────────
  const THERAPIST_INFO = {
    name: name,
    credentials: profession,
    specialties: skills,
    avatarInitials: getInitials(name),
  };

  const SESSION_META = {
    durationMins: 45,
    startTime,
  };

  // ── Session ended event from WS ────────────────────────────────────────────
  useEffect(() => {
    livekitManager.callbacks.onSessionEnded = () => {
      setIsConfirmationPopUpOpen(true)

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
  // SessionWaiting already performed a non-terminal leaveSession() teardown, so
  // we only navigate here — no second hangup (which would send a terminal
  // signal and defeat the rejoinable-session behaviour).
  const handleLeaveWaiting = () => {
    setScreen("lobby");
  };

  // ── Leave from Live ────────────────────────────────────────────────────────
  const handleLeaveCall = () => {
    const secs = sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;
    setSessionDuration(Math.ceil(secs / 60));
    if (role === 'therapist') {
      localStorage.setItem("notes", notes)
    }
    // SessionLive.handleLeave already called livekitManager.hangup() (which sent
    // the terminal signal + tore down). Don't call it again here.
    setIsConfirmationPopUpOpen(true)
  };

  // ── Ended flow ─────────────────────────────────────────────────────────────
  const handleDone = () => setScreen("lobby");
  const handleBookAgain = () => setScreen("lobby");

  const onMarkComplete = async () => {
  setIsLoader(true);
  setError("");

  try {
    await Promise.all([
      updateById("bookings", sessionCode, {
        status: "completed",
        sessionCompleted: true,
      }),

      axios.post(
        "https://asia-south1-elma-react-native-app.cloudfunctions.net/sendSessionCompletionEmail",
        {
          name: cname,
          to: "user",
          therapistName: tname,
          userName: cname,
          therapistEmail: temail,
          userEmail: cemail,
        }
      ),

      axios.post(
        "https://asia-south1-elma-react-native-app.cloudfunctions.net/sendSessionCompletionEmail",
        {
          name: tname,
          to: "therapist",
          therapistName: tname,
          userName: cname,
          therapistEmail: temail,
          userEmail: cemail,
        }
      ),
    ]);

    setIsConfirmationPopUpOpen(false);
    setScreen("ended");
  } catch (error) {
    console.error("Session completion failed:", error);

    if (axios.isAxiosError(error)) {
      if (!error.response) {
        setError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else if (error.response.status >= 500) {
        setError(
          "A server error occurred while completing the session. Please try again in a few minutes."
        );
      } else {
        setError(
          error.response.data?.message ||
            "Unable to complete the session. Please try again."
        );
      }
    } else {
      setError(
        "Something went wrong while marking the session as complete. Please try again."
      );
    }
  } finally {
    setIsLoader(false);
  }
};
  const onSkip = () => {
    setScreen("lobby")
    setIsConfirmationPopUpOpen(false)
  };


  const addTherapistRating = async () => {
    try {
      await addDoc(collection(db, "therapists", tid, "ratings"), {
        rating: rating,
        feedback: feedback,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  const handleDownLoad = async () => {
    await createAndDownloadPDF({
      therapistName: tname,
      patientName: cname,

      sessionCode,
      notes: localStorage.getItem("notes"),
      date: startTime,
      duration: 45

    })
    localStorage.removeItem("notes")
  }

  // Patient sees confirmation modal on ended
  if (role === "patient" && confirmationPopUpOpen) {
    return <CompleteSessionConfirmationModal loader={loader} error={error} onMarkAsComplete={onMarkComplete} onSkip={onSkip} visible />;
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
          therapistPhoto={therapistPhoto}
          patientPhoto={clientPhoto}
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
          therapistPhoto={therapistPhoto}
          patientPhoto={clientPhoto}
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
          therapistPhoto={therapistPhoto}
          patientPhoto={clientPhoto}
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
          therapistPhoto={therapistPhoto}
          patientPhoto={clientPhoto}
          feedback={feedback}
          rating={rating}
          setFeedback={setFeedback}
          setRating={setRating}
          addRating={addTherapistRating}
        />
      )}
    </>
  );
}