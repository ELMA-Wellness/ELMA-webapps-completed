import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PsychAuthSignIn from "./routes/AuthSignIn.jsx";
import Dashboard from "./routes/Dashboard.jsx";
import Bookings from "./routes/Bookings.jsx";
import Earnings from "./routes/Earnings.jsx";
import TherapistTimeSelector from "./components/TimeSelector.js";
import { getDashBoardData } from "./services/dashboard.js";
import ResetPassword from "./routes/ResetPassword.jsx";

// Small helper
function getTherapist() {
  try {
    return JSON.parse(localStorage.getItem("therapist") || "{}");
  } catch {
    return {};
  }
}

// Auth guard
function RequireTherapist({ children }) {
  const t = getTherapist();
  if (!t.id) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  return children;
}

export default function App() {
  const setDashBoardDataByFetching=async()=>{
  
      const res=await getDashBoardData('X2pNVdjtRBpBfEoEKaE3')
  
      console.log(res.upcommingSessionsForTodayOnly)
  
    }
  
  
    useEffect(()=>{
      setDashBoardDataByFetching()
    },[])
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/auth/sign-in" element={<PsychAuthSignIn />} />

         <Route path="/auth/reset-pwd" element={<ResetPassword />} />

        <Route path="/time-slot" element={<TherapistTimeSelector/>} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <RequireTherapist>
              <Dashboard />
            </RequireTherapist>
          }
        />

        <Route
          path="/bookings"
          element={
            <RequireTherapist>
              <Bookings />
            </RequireTherapist>
          }
        />

        <Route
          path="/earnings"
          element={
            <RequireTherapist>
              <Earnings />
            </RequireTherapist>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
