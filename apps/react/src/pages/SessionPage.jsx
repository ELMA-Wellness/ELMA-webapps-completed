import { useState } from "react";
import SessionLobby from "./Sessionlobby";
import SessionWaiting from "./Sessionwaiting";
import SessionEnded from "./SessionEnded";

/**
 * SessionPage — rendered at /session route in your App.jsx
 *
 * Views:
 *   "lobby"   → SessionLobby   (camera/audio setup + join)
 *   "waiting" → SessionWaiting (in-session waiting room)
 *   "ended"   → SessionEnded   (post-session summary, rating & feedback)
 */
export default function SessionPage() {
  const [view, setView]               = useState("lobby");
  const [sessionData, setSessionData] = useState({});
  const [sessionDuration, setSessionDuration] = useState(0);

  const handleJoin = ({ camStream, micActive, camActive }) => {
    setSessionData({ camStream, micActive, camActive, startTime: Date.now() });
    setView("waiting");
  };

  const handleLeave = () => {
    // Stop all media tracks
    sessionData.camStream?.getTracks().forEach(t => t.stop());

    // Calculate how many minutes the session lasted
    const elapsed = sessionData.startTime
      ? Math.round((Date.now() - sessionData.startTime) / 60000)
      : 52; // fallback demo value

    setSessionDuration(elapsed || 1); // at least 1 min
    setSessionData({});
    setView("ended");
  };

  const handleDone = () => {
    // Navigate back to lobby (or you can route elsewhere e.g. navigate("/"))
    setView("lobby");
  };

  const handleBookAgain = () => {
    setView("lobby");
  };

  if (view === "waiting") {
    return (
      <SessionWaiting
        onLeave={handleLeave}
        camStream={sessionData.camStream}
        micActiveInit={sessionData.micActive}
        camActiveInit={sessionData.camActive}
      />
    );
  }

  if (view === "ended") {
    return (
      <SessionEnded
        duration={sessionDuration}
        onDone={handleDone}
        onBookAgain={handleBookAgain}
      />
    );
  }

  return <SessionLobby onJoin={handleJoin} />;
}