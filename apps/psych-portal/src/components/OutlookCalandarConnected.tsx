/**
 * CalendarConnectedPage.tsx
 *
 * Landing page for the OAuth redirect:
 *   http://yourdomain.com/calendar-connected?provider=outlook
 *   http://yourdomain.com/calendar-connected?error=access_denied
 *
 * Register this route in your React Router / Next.js setup:
 *
 *   React Router v6:
 *     <Route path="/calendar-connected" element={<CalendarConnectedPage />} />
 *
 *   Next.js App Router  →  app/calendar-connected/page.tsx
 *   Next.js Pages Router →  pages/calendar-connected.tsx
 */

import React, { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState = "loading" | "success" | "error";

interface StatusInfo {
  state: PageState;
  provider?: string;
  errorReason?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const OutLookCalendarConnectedPage: React.FC = () => {
  const [info, setInfo] = useState<StatusInfo>({ state: "loading" });
  const [countdown, setCountdown] = useState(4);

  // ── Parse URL params on mount ──────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get("provider");
    const error = params.get("error");
    const errorDesc = params.get("error_description");

    if (error) {
      setInfo({
        state: "error",
        errorReason:
          errorDesc ||
          (error === "access_denied"
            ? "You cancelled the connection request."
            : `OAuth error: ${error}`),
      });
    } else if (provider) {
      setInfo({ state: "success", provider });
    } else {
      // No recognisable params – treat as unknown error
      setInfo({ state: "error", errorReason: "Unknown redirect state." });
    }
  }, []);

  // ── Auto-redirect countdown (success only) ────────────────────────────────
  useEffect(() => {
    if (info.state !== "success") return;

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          // Navigate back to the settings / dashboard page
          const returnPath =
            sessionStorage.getItem("calendarReturnPath") || "/dashboard";
          window.location.href = returnPath;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [info.state]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {info.state === "loading" && <LoadingView />}
        {info.state === "success" && (
          <SuccessView provider={info.provider!} countdown={countdown} />
        )}
        {info.state === "error" && (
          <ErrorView reason={info.errorReason || "Unknown error."} />
        )}
      </div>
    </div>
  );
};

// ─── Sub-views ────────────────────────────────────────────────────────────────

const LoadingView: React.FC = () => (
  <div style={centerStyle}>
    <Spinner />
    <p style={bodyTextStyle}>Finalising connection…</p>
  </div>
);

const SuccessView: React.FC<{ provider: string; countdown: number }> = ({
  provider,
  countdown,
}) => (
  <div style={centerStyle}>
    <div style={iconCircleStyle("#dcfce7")}>
      <CheckSVG />
    </div>

    <h1 style={headingStyle}>Calendar Connected!</h1>

    <p style={bodyTextStyle}>
      Your{" "}
      <strong style={{ textTransform: "capitalize" }}>
        {providerLabel(provider)}
      </strong>{" "}
      calendar is now synced. Busy times will automatically block appointment
      slots.
    </p>

    <div style={countdownBadgeStyle}>
      Redirecting in {countdown}s…
    </div>

    <button
      style={primaryButtonStyle}
      onClick={() => {
        const returnPath =
          sessionStorage.getItem("calendarReturnPath") || "/dashboard";
        window.location.href = returnPath;
      }}
    >
      Go to Dashboard now
    </button>
  </div>
);

const ErrorView: React.FC<{ reason: string }> = ({ reason }) => (
  <div style={centerStyle}>
    <div style={iconCircleStyle("#fee2e2")}>
      <ErrorSVG />
    </div>

    <h1 style={{ ...headingStyle, color: "#dc2626" }}>Connection Failed</h1>

    <p style={{ ...bodyTextStyle, color: "#6b7280" }}>{reason}</p>

    <button
      style={{ ...primaryButtonStyle, background: "#0078d4" }}
      onClick={() => window.history.back()}
    >
      Go Back & Try Again
    </button>
  </div>
);

// ─── Helper ───────────────────────────────────────────────────────────────────

function providerLabel(provider: string): string {
  const map: Record<string, string> = {
    outlook: "Microsoft Outlook / Teams",
    google: "Google Calendar",
  };
  return map[provider] ?? provider;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const CheckSVG: React.FC = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#16a34a"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ErrorSVG: React.FC = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#dc2626"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Spinner: React.FC = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0078d4"
    strokeWidth="2"
    style={{ animation: "spin 0.8s linear infinite" }}
  >
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc",
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  padding: "24px",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "48px 40px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  maxWidth: "420px",
  width: "100%",
};

const centerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "16px",
};

const iconCircleStyle = (bg: string): React.CSSProperties => ({
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  background: bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 600,
  color: "#111827",
};

const bodyTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "14px",
  color: "#4b5563",
  lineHeight: 1.6,
  maxWidth: "320px",
};

const countdownBadgeStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  background: "#f3f4f6",
  borderRadius: "20px",
  padding: "4px 14px",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: "8px",
  padding: "10px 24px",
  fontSize: "14px",
  fontWeight: 500,
  color: "#fff",
  background: "#16a34a",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

export default OutLookCalendarConnectedPage;