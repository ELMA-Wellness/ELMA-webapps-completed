// apps/psych-portal/src/routes/Dashboard.jsx

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  myTodaySessionsCount,
  myUpcomingSessions,
  myEarningsThisMonth,
  myCompletionRateThisMonth,
  myNewClientsThisMonth,
  myAverageRating,
  myNextSession,
  myMonthlySummary,           // NEW: per-month sessions + earnings
} from "@shared-core/therapist-metrics";

import { auth } from "@shared-core/firebase";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@shared-ui/Table.jsx";

// ---------- helpers ----------

const INR = (x) => {
  try {
    return "₹" + Math.round(x || 0).toLocaleString("en-IN");
  } catch {
    return "₹0";
  }
};

const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = v.toDate ? v.toDate() : v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function getTherapist() {
  try {
    return JSON.parse(localStorage.getItem("therapist") || "{}");
  } catch {
    return {};
  }
}

function Card({ title, value, hint, color = "#fff" }) {
  return (
    <div
      style={{
        background: color,
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        minHeight: 88,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ fontSize: 13, color: "#555" }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{value}</div>
      {hint && (
        <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

// ---------- main component ----------

export default function PsychDashboard() {
  const therapist = getTherapist();
  const tid = therapist.id; // stored by AuthSignIn
  const nav = useNavigate();

  // ---- top cards ----
  const qToday = useQuery({
    queryKey: ["tToday", tid],
    queryFn: () => myTodaySessionsCount(tid),
    enabled: !!tid,
  });

  const qEarn = useQuery({
    queryKey: ["tEarn", tid],
    queryFn: () => myEarningsThisMonth(tid),
    enabled: !!tid,
  });

  const qCR = useQuery({
    queryKey: ["tCR", tid],
    queryFn: () => myCompletionRateThisMonth(tid),
    enabled: !!tid,
  });

  const qNew = useQuery({
    queryKey: ["tNew", tid],
    queryFn: () => myNewClientsThisMonth(tid),
    enabled: !!tid,
  });

  const qRating = useQuery({
    queryKey: ["tRating", tid],
    queryFn: () => myAverageRating(tid),
    enabled: !!tid,
  });

  // ---- sessions ----
  const qNext = useQuery({
    queryKey: ["tNext", tid],
    queryFn: () => myNextSession(tid),
    enabled: !!tid,
  });

  const qUpcoming = useQuery({
    queryKey: ["tUpcoming", tid],
    queryFn: () => myUpcomingSessions(tid, 10),
    enabled: !!tid,
  });

  // ---- NEW: monthly breakdown for last 12 months ----
  const qMonthly = useQuery({
    queryKey: ["tMonthlySummary", tid],
    queryFn: () => myMonthlySummary(tid, 12),
    enabled: !!tid,
  });

  // ---- logout ----
  const handleLogout = async () => {
    try {
      if (auth?.signOut) {
        await auth.signOut();
      }
    } catch {
      // ignore firebase signOut error for now
    }
    localStorage.removeItem("therapist");
    nav("/auth/sign-in");
  };

  const monthlyRows = qMonthly.data ?? [];

  return (
    <div
      style={{
        padding: "32px 24px",
        background: "#FAFAFF",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui",
      }}
    >
      {/* header row with logout */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#3A116D",
            margin: 0,
          }}
        >
          Psychologist Dashboard
        </h1>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "none",
            background: "#BA92FF",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>

      {/* top metric cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
        }}
      >
        <Card
          title="Today's Sessions"
          value={qToday.data ?? "—"}
          color="#EDE4FF"
        />
        <Card
          title="Earnings (This Month)"
          value={INR(qEarn.data)}
          color="#FFBBD8"
        />
        <Card
          title="Completion Rate"
          value={(qCR.data?.rate ?? 0) + "%"}
          hint={`✅ ${qCR.data?.completed ?? 0} • ❌ ${
            qCR.data?.cancelled ?? 0
          }`}
          color="#90E0EF"
        />
        <Card
          title="New Clients (This Month)"
          value={qNew.data ?? "—"}
          color="#EDE4FF"
        />
        <Card
          title="Avg Rating"
          value={`${qRating.data?.avg ?? 0} (${
            qRating.data?.count ?? 0
          })`}
          color="#FFBBD8"
        />
      </div>

      {/* next session */}
      <div style={{ marginTop: 26 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#3A116D",
            marginBottom: 10,
          }}
        >
          Next Session
        </h2>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          {qNext.data ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {fmtDateTime(qNext.data.startAt)}
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  User: {qNext.data.userId || "—"} • Mode:{" "}
                  {qNext.data.mode || "—"}
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>
                {INR(qNext.data.therapistPayout || 0)}
              </div>
            </div>
          ) : (
            <div style={{ color: "#777" }}>
              No upcoming confirmed sessions.
            </div>
          )}
        </div>
      </div>

      {/* upcoming sessions */}
      <div style={{ marginTop: 26 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#3A116D",
            marginBottom: 10,
          }}
        >
          Upcoming Sessions
        </h2>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Meet Link</TableHead>
                <TableHead align="right">Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(qUpcoming.data ?? []).length ? (
                qUpcoming.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{fmtDateTime(row.startAt)}</TableCell>
                    <TableCell>{row.userId || "—"}</TableCell>
                    <TableCell>{row.mode || "—"}</TableCell>
                    <TableCell>
                      {row.meetLink ? (
                        <a
                          href={row.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#3A116D", fontSize: 13 }}
                        >
                          Join
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {INR(row.therapistPayout || 0)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>No upcoming sessions.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* NEW: Monthly sessions table */}
      <div style={{ marginTop: 32 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#3A116D",
            marginBottom: 10,
          }}
        >
          Sessions by Month
        </h2>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead align="right">Sessions Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyRows.length ? (
                monthlyRows.map((row) => (
                  <TableRow key={row.monthKey}>
                    <TableCell>{row.monthKey}</TableCell>
                    <TableCell align="right">{row.sessions}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>No completed sessions yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* NEW: Monthly earnings table */}
      <div style={{ marginTop: 24, marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#3A116D",
            marginBottom: 10,
          }}
        >
          Earnings by Month
        </h2>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead align="right">Total Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyRows.length ? (
                monthlyRows.map((row) => (
                  <TableRow key={row.monthKey}>
                    <TableCell>{row.monthKey}</TableCell>
                    <TableCell align="right">
                      {INR(row.earnings || 0)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>No earnings yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
