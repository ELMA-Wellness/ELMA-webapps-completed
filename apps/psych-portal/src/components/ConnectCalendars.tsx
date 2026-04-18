// src/components/ConnectCalendars.tsx
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { FaMicrosoft } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";

const CONNECT_OUTLOOK_URL =
  
  "https://us-central1-elma-react-native-app.cloudfunctions.net/connectOutlook";

export const ConnectCalendars = () => {
  const therapist = JSON.parse(localStorage.getItem("therapist") || "{}");
  const therapistId = therapist?.id;

  const loginGoogle = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    onSuccess: async (codeResponse) => {
      const url = `https://us-central1-elma-react-native-app.cloudfunctions.net/connectGoogle?therapistId=${therapistId}&code=${codeResponse?.code}`;
      const res = await axios.get(url);
      console.log(res.data);
      alert("Google Calendar connected");
    },
  });

  const connectTeams = () => {
    if (!therapistId) {
      alert("Therapist session not found. Please log in again.");
      return;
    }

    // Store the current path so CalendarConnectedPage can redirect back here
    sessionStorage.setItem("calendarReturnPath", window.location.pathname);

    // Full-page redirect → Firebase function handles Microsoft OAuth flow
    window.location.href = `${CONNECT_OUTLOOK_URL}?therapistId=${encodeURIComponent(therapistId)}`;
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        alignItems: "center",
      }}
    >
      {/* Google Calendar Button */}
      <button
        onClick={() => loginGoogle()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 18px",
          backgroundColor: "#1a73e8",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(26,115,232,0.3)",
        }}
      >
        <FaGoogle size={18} />
        Connect Google Calendar
      </button>

      {/* Microsoft Teams Calendar Button */}
      <button
        onClick={connectTeams}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 18px",
          backgroundColor: "#6264A7",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(98,100,167,0.35)",
        }}
      >
        <FaMicrosoft size={18} />
        Connect Teams Calendar
      </button>
    </div>
  );
};