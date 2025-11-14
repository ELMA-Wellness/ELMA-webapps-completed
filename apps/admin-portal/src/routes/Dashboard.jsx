import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  totalUsers, dauToday, newUsersToday, totalTherapists,
  totalSessionsCompleted, sessionsRevenueThisMonth,
  usersByPlus, topTherapistsThisMonth, completionRateThisMonth,
  newUsersLastNDays, wau, mau, payoutsForMonth
} from "@shared-core/metrics";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@shared-ui/Table.jsx";

function INR(x){ try{ return "₹" + Math.round(x||0).toLocaleString("en-IN"); } catch { return "₹0"; } }

function StatCard({ label, value, hint, color="#fff" }) {
  return (
    <div style={{
      background: color,
      borderRadius: 16,
      padding: 22,
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      color: "#111",
      transition: "all 0.2s ease-in-out",
    }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#555" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{value ?? "—"}</div>
      {hint && <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  // --- Queries
  const qTotalUsers = useQuery({ queryKey: ["totalUsers"], queryFn: totalUsers });
  const qDAU        = useQuery({ queryKey: ["dau"], queryFn: dauToday });
  const qNewToday   = useQuery({ queryKey: ["newToday"], queryFn: newUsersToday });
  const qTher       = useQuery({ queryKey: ["therapists"], queryFn: totalTherapists });

  const qSessComp   = useQuery({ queryKey: ["sessComp"], queryFn: totalSessionsCompleted });
  const qRevMonth   = useQuery({ queryKey: ["revMonth"], queryFn: sessionsRevenueThisMonth });

  const qWAU        = useQuery({ queryKey: ["wau"], queryFn: wau });
  const qMAU        = useQuery({ queryKey: ["mau"], queryFn: mau });

  const qCompRate   = useQuery({ queryKey: ["compRate"], queryFn: completionRateThisMonth });
  const qNew7       = useQuery({ queryKey: ["new7"], queryFn: () => newUsersLastNDays(7) });
  const qNew30      = useQuery({ queryKey: ["new30"], queryFn: () => newUsersLastNDays(30) });

  const qTopTher    = useQuery({ queryKey: ["topTher"], queryFn: () => topTherapistsThisMonth(5) });

  // NEW: Free vs Plus + Payouts
  const qPlusSplit  = useQuery({ queryKey: ["plusSplit"], queryFn: usersByPlus });
  const qPayouts    = useQuery({ queryKey: ["payoutsMonth"], queryFn: () => payoutsForMonth() });

  // Pretty month label for payouts section
  const monthLabel = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div style={{ padding: "40px 32px", background: "#FAFAFF", minHeight: "100vh", fontFamily: "Inter, system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20, color: "#3A116D" }}>
        ELMA Admin Dashboard
      </h1>
      <div style={{ height: 4, width: 80, background: "#BA92FF", borderRadius: 2, marginBottom: 30 }}></div>

      {/* 👥 User Metrics */}
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#3A116D", marginBottom: 14 }}>👥 User Overview</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard label="Total Users" value={qTotalUsers.data ?? "—"} color="#EDE4FF" />
        <StatCard label="DAU (Today)" value={qDAU.data ?? "—"} color="#EDE4FF" />
        <StatCard label="New Users Today" value={qNewToday.data ?? "—"} color="#EDE4FF" />
        <StatCard label="Therapists" value={qTher.data ?? "—"} color="#EDE4FF" />
      </div>

      {/* 👤 Free vs ELMA Plus */}
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#3A116D", marginTop: 24, marginBottom: 10 }}>🧮 Free vs ELMA Plus</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <StatCard label="Free Users" value={qPlusSplit.data?.free ?? "—"} color="#EFE9FF" />
        <StatCard label="Plus Users" value={qPlusSplit.data?.plus ?? "—"} color="#EFE9FF" />
      </div>

      {/* 💗 Sessions & Revenue */}
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#6B007A", marginTop: 40, marginBottom: 14 }}>💗 Sessions & Revenue</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard label="Sessions Completed" value={qSessComp.data ?? "—"} color="#FFBBD8" />
        <StatCard label="Revenue This Month" value={INR(qRevMonth.data)} color="#FFBBD8" />
        <StatCard label="Weekly Active Users" value={qWAU.data ?? "—"} color="#FFBBD8" />
        <StatCard label="Monthly Active Users" value={qMAU.data ?? "—"} color="#FFBBD8" />
      </div>

      {/* 📈 Engagement */}
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#006684", marginTop: 40, marginBottom: 14 }}>📈 Engagement</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
        <StatCard
          label="Completion Rate"
          value={(qCompRate.data?.rate ?? 0) + "%"}
          hint={`✅ ${qCompRate.data?.completed ?? 0}  •  ❌ ${qCompRate.data?.cancelled ?? 0}`}
          color="#90E0EF"
        />
        <StatCard label="New Users (7d)" value={qNew7.data ?? "—"} color="#90E0EF" />
        <StatCard label="New Users (30d)" value={qNew30.data ?? "—"} color="#90E0EF" />
      </div>

      {/* 👑 Top Therapists */}
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#3A116D", marginTop: 40, marginBottom: 14 }}>👑 Top Therapists (This Month)</h2>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        overflow: "hidden",
        marginTop: 10,
      }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Therapist ID</TableHead>
              <TableHead align="right">Sessions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(qTopTher.data ?? []).length ? (
              qTopTher.data.map((r, i) => (
                <TableRow key={r.therapistId}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{r.therapistId}</TableCell>
                  <TableCell align="right">{r.sessions}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={3}>No data yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 💸 Therapist Payouts */}
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#3A116D", marginTop: 40, marginBottom: 6 }}>
        💸 Therapist Payouts — {monthLabel}
      </h2>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        overflow: "hidden",
        marginTop: 10,
      }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Therapist ID</TableHead>
              <TableHead align="right">Sessions</TableHead>
              <TableHead align="right">Payout (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(qPayouts.data ?? []).length ? (
              qPayouts.data.map((r, i) => (
                <TableRow key={r.therapistId}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{r.therapistId}</TableCell>
                  <TableCell align="right">{r.sessions}</TableCell>
                  <TableCell align="right">{Math.round(r.payout).toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4}>No completed sessions this month.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
