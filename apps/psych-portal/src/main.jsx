// apps/psych-portal/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// React Query client (one per app)
const queryClient = new QueryClient();
const CLIENT_ID = '697733851259-jvdmvpa44v4lmjn0hlae56ubemm56cd4.apps.googleusercontent.com'

const clientId = CLIENT_ID

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
     <GoogleOAuthProvider clientId={clientId}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    </GoogleOAuthProvider>
    
  </React.StrictMode>
);
