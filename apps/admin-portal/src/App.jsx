import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthSignIn from "./routes/AuthSignIn.jsx";
import Dashboard from "./routes/Dashboard.jsx";
import Payouts from "./routes/Payouts.jsx";
import UserAnalyticsTable from "./routes/UserTableInformation.jsx";

export default function App() {
  console.log("✅ App.jsx rendering");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="/auth/sign-in" element={<AuthSignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/user-analytics" element={<UserAnalyticsTable />} />
        

                <Route path="/admin-payouts" element={<Payouts />} />

        <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
