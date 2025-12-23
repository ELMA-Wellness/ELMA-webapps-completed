import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  totalUsers,
  dauToday,
  newUsersToday,
  totalTherapists,
  totalSessionsCompleted,
  sessionsRevenueThisMonth,
  usersByPlus,
  topTherapistsThisMonth,
  completionRateThisMonth,
  newUsersLastNDays,
  wau,
  mau,
  payoutsForMonth,
} from "@shared-core/metrics";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@shared-ui/Table.jsx";
import { getDashBoardData } from "../services/dashboard";
import LoaderModal from "../components/Loader";

function INR(x) {
  try {
    return "₹" + Math.round(x || 0).toLocaleString("en-IN");
  } catch {
    return "₹0";
  }
}

function StatCard({ label, value, hint, color = "#fff" }) {
  return (
    <div
      style={{
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
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, color: "#555" }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>
        {value ?? "—"}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

export default function Dashboard() {
  // --- Queries
  const qTotalUsers = useQuery({
    queryKey: ["totalUsers"],
    queryFn: totalUsers,
  });
  const qDAU = useQuery({ queryKey: ["dau"], queryFn: dauToday });
  const qNewToday = useQuery({
    queryKey: ["newToday"],
    queryFn: newUsersToday,
  });
  const qTher = useQuery({
    queryKey: ["therapists"],
    queryFn: totalTherapists,
  });

  const qSessComp = useQuery({
    queryKey: ["sessComp"],
    queryFn: totalSessionsCompleted,
  });
  const qRevMonth = useQuery({
    queryKey: ["revMonth"],
    queryFn: sessionsRevenueThisMonth,
  });

  const qWAU = useQuery({ queryKey: ["wau"], queryFn: wau });
  const qMAU = useQuery({ queryKey: ["mau"], queryFn: mau });

  const qCompRate = useQuery({
    queryKey: ["compRate"],
    queryFn: completionRateThisMonth,
  });
  const qNew7 = useQuery({
    queryKey: ["new7"],
    queryFn: () => newUsersLastNDays(7),
  });
  const qNew30 = useQuery({
    queryKey: ["new30"],
    queryFn: () => newUsersLastNDays(30),
  });

  const qTopTher = useQuery({
    queryKey: ["topTher"],
    queryFn: () => topTherapistsThisMonth(5),
  });

  // NEW: Free vs Plus + Payouts
  const qPlusSplit = useQuery({
    queryKey: ["plusSplit"],
    queryFn: usersByPlus,
  });
  const qPayouts = useQuery({
    queryKey: ["payoutsMonth"],
    queryFn: () => payoutsForMonth(),
  });

  // Pretty month label for payouts section
  const monthLabel = new Date().toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const initialDashboardState = {
    total_users: 0,
    dau_users: 0,
    new_users_today: 0,
    therapist_count: 0,
    free_users: 0,
    plus_users: 0,
    sessions_completed_montly: 0,
    revenue_this_month: 0,
    weekly_active_users: 0,
    monthly_active_users: 0,
    completion_rate: 0,
    new_users_in_last_7_days: 0,
    new_users_in_last_30_days: 0,
    therapist_earning_current_month_group_by_therapist_id: [],
    therapist_current_payout_month: [],
  };

  const [dashData, setDashData] = useState(initialDashboardState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setDashBoardMetricsByFetching = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getDashBoardData();

      if (!res) {
        throw new Error("No dashboard data returned");
      }

      setDashData(res);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDashBoardMetricsByFetching();
  }, []);

  return (
    <div
      style={{
        padding: "40px 32px",
        background: "#FAFAFF",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 20,
          color: "#3A116D",
        }}
      >
        ELMA Admin Dashboard
      </h1>
      <div
        style={{
          height: 4,
          width: 80,
          background: "#BA92FF",
          borderRadius: 2,
          marginBottom: 30,
        }}
      ></div>

      {/* 👥 User Metrics */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#3A116D",
          marginBottom: 14,
        }}
      >
        👥 User Overview
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          label="Total Users"
          value={dashData?.total_users ?? "—"}
          color="#EDE4FF"
        />
        <StatCard
          label="DAU (Today)"
          value={dashData?.dau_users ?? "—"}
          color="#EDE4FF"
        />
        <StatCard
          label="New Users Today"
          value={dashData?.new_users_today ?? "—"}
          color="#EDE4FF"
        />
        <StatCard
          label="Therapists"
          value={dashData?.therapist_count ?? "—"}
          color="#EDE4FF"
        />
      </div>

      {/* 👤 Free vs ELMA Plus */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#3A116D",
          marginTop: 24,
          marginBottom: 10,
        }}
      >
        🧮 Free vs ELMA Plus
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          label="Free Users"
          value={dashData?.free_users ?? "—"}
          color="#EFE9FF"
        />
        <StatCard
          label="Plus Users"
          value={dashData?.plus_users ?? "—"}
          color="#EFE9FF"
        />
      </div>

      {/* 💗 Sessions & Revenue */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#6B007A",
          marginTop: 40,
          marginBottom: 14,
        }}
      >
        💗 Sessions & Revenue
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          label="Sessions Completed"
          value={dashData?.sessions_completed_montly ?? "—"}
          color="#FFBBD8"
        />
        <StatCard
          label="Revenue This Month"
          value={INR(dashData?.revenue_this_month)}
          color="#FFBBD8"
        />
        <StatCard
          label="Weekly Active Users"
          value={dashData?.weekly_active_users ?? "—"}
          color="#FFBBD8"
        />
        <StatCard
          label="Monthly Active Users"
          value={dashData?.monthly_active_users ?? "—"}
          color="#FFBBD8"
        />
      </div>

      {/* 📈 Engagement */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#006684",
          marginTop: 40,
          marginBottom: 14,
        }}
      >
        📈 Engagement
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          label="Completion Rate"
          value={(qCompRate.data?.rate ?? 0) + "%"}
          hint={`✅ ${qCompRate.data?.completed ?? 0}  •  ❌ ${
            qCompRate.data?.cancelled ?? 0
          }`}
          color="#90E0EF"
        />
        <StatCard
          label="New Users (7d)"
          value={dashData?.new_users_in_last_7_days ?? "—"}
          color="#90E0EF"
        />
        <StatCard
          label="New Users (30d)"
          value={dashData?.new_users_in_last_30_days ?? "—"}
          color="#90E0EF"
        />
      </div>

      {/* 👑 Top Therapists */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#3A116D",
          marginTop: 40,
          marginBottom: 14,
        }}
      >
        👑 Top Therapists (This Month)
      </h2>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          overflow: "hidden",
          marginTop: 10,
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Therapist ID</TableHead>
              <TableHead align="right">Sessions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(dashData?.therapist_earning_current_month_group_by_therapist_id ?? []).length ? (
              dashData?.therapist_earning_current_month_group_by_therapist_id?.map((r, i) => (
                <TableRow key={r.therapistId}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{r.therapistName}</TableCell>
                  <TableCell align="right">{r.sessions}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>No data yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 💸 Therapist Payouts */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#3A116D",
          marginTop: 40,
          marginBottom: 6,
        }}
      >
        💸 Therapist Payouts — {monthLabel}
      </h2>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          overflow: "hidden",
          marginTop: 10,
        }}
      >
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
            {(dashData?.therapist_current_payout_month ?? []).length ? (
              dashData?.therapist_current_payout_month.map((r, i) => (
                <TableRow key={r.therapistId}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{r.therapistName}</TableCell>
                  <TableCell align="right">{r.sessions}</TableCell>
                  <TableCell align="right">
                    {Math.round(r.payout).toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  No completed sessions this month.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {
        <LoaderModal visible={loading}/>
      }
    </div>
  );
}
