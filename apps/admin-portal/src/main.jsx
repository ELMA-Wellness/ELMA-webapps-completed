import React from "react";
import { createRoot } from "react-dom/client";  // <-- this import was missing
import App from "./App.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

const rootEl = document.getElementById("root");
if (!rootEl) {
  // helpful log if the HTML ever breaks
  console.error("❌ Root #root not found in index.html");
}

createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
