// apps/psych-portal/src/pages/Earnings.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@shared-core/firebase";
import { getTherapistEarnings } from "@shared-core/metrics";

function INR(x) {
  try {
    return "₹" + Math.round(x || 0).toLocaleString("en-IN");
  } catch {
    return "₹0";
  }
}

// Build a list of month keys like "2025-11", "2025-10", ... for last N months
function buildMonthKeys(n = 12) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const key = `${y}-${m}`;
    const label = d.toLocaleString("en-IN", { month: "short", year: "numeric" });
    out.push({ key, label });
  }
  return out;
}

export default function Earnings() {
  const therapistId = auth.currentUser?.uid || null;
  const months = React.useMemo(() => buildMonthKeys(12), []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["psychEarningsByMonth", therapistId],
    enabled: !!therapistId,
    queryFn: async () => {
      const rows = await Promise.all(
        months.map(async (m) => {
          const stats = await getTherapistEarnings(therapistId, m.key);
          return {
            monthKey: m.key,
            label: m.label,
            sessions: stats.sessions || 0,
            payout: stats.payout || 0,
          };
        })
      );
      return rows;
    },
  });

  const lifetimeEarnings =
    data?.reduce((sum, row) => sum + (row.payout || 0), 0) || 0;
  const lifetimeSessions =
    data?.reduce((sum, row) => sum + (row.sessions || 0), 0) || 0;

  return (
    <div
      style={{
        padding: "32px",
        background: "#FAFAFF",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui",
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 20,
          color: "#3A116D",
        }}
      >
        Earnings Overview
      </h1>

      {/* Lifetime stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            background: "#FFBBD8",
            borderRadius: 16,
            padding: 22,
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 14, color: "#555" }}>Total Earnings (Lifetime)</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
            {INR(lifetimeEarnings)}
          </div>
        </div>

        <div
          style={{
            background: "#EDE4FF",
            borderRadius: 16,
            padding: 22,
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 14, color: "#555" }}>Total Sessions (Lifetime)</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
            {lifetimeSessions}
          </div>
        </div>
      </div>

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#3A116D",
          marginBottom: 12,
        }}
      >
        Earnings by Month (last 12 months)
      </h2>

      {isLoading && <div>Loading earnings...</div>}
      {error && <div style={{ color: "#b00020" }}>Failed to load earnings.</div>}

      {!isLoading && !error && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F4F2FF", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontSize: 13 }}>Month</th>
                <th style={{ padding: "12px 16px", fontSize: 13 }}>Sessions</th>
                <th style={{ padding: "12px 16px", fontSize: 13 }}>Earnings</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((row) => (
                <tr key={row.monthKey}>
                  <td style={{ padding: "10px 16px", fontSize: 14 }}>{row.label}</td>
                  <td style={{ padding: "10px 16px", fontSize: 14 }}>
                    {row.sessions}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 14 }}>
                    {INR(row.payout)}
                  </td>
                </tr>
              ))}
              {(!data || data.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ padding: "10px 16px", fontSize: 14 }}>
                    No earnings data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
