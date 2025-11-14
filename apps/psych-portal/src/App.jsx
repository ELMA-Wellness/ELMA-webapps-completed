import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PsychAuthSignIn from "./routes/AuthSignIn.jsx";
import Dashboard from "./routes/Dashboard.jsx";
import Bookings from "./routes/Bookings.jsx";
import Earnings from "./routes/Earnings.jsx";

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
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/auth/sign-in" element={<PsychAuthSignIn />} />

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
