import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthSignIn from "./routes/AuthSignIn";
import Dashboard from "./routes/Dashboard";
import Payouts from "./routes/Payouts";
import Revenue from "./routes/Revenue";
import Settings from "./routes/Settings";
import Unauthorized from "./routes/Unauthorized";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/sign-in" element={<AuthSignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
