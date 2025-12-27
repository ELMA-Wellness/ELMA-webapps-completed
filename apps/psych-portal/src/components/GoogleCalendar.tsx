// src/components/ConnectGoogleCalendar.tsx
import { useGoogleLogin } from "@react-oauth/google";
import axios from 'axios'
import {Calendar1Icon}  from  'lucide-react'




export const ConnectGoogleCalendar = () => {
  const therapist = JSON.parse(localStorage.getItem("therapist") || "{}");
  const therapistId = therapist?.id;

  const login = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/calendar.events",
   
    onSuccess: async (codeResponse) => {

        const url=`https://us-central1-elma-react-native-app.cloudfunctions.net/connectGoogle?therapistId=${therapistId}&code=${codeResponse?.code}`

        const res=await axios.get(url)
      
       console.log("code",res.data)

      alert("Google Calendar connected");
    },
  });

  
  return (
      <button
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
       onClick={() => login()}>
        <Calendar1Icon/>
        
        Connect Google Calendar
      </button>
  );
};
