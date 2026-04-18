// apps/psych-portal/src/routes/Dashboard.jsx

import React, { useEffect, useState } from "react";
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
  myMonthlySummary, // NEW: per-month sessions + earnings
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
import { getDashBoardData } from "../services/dashboard";
import LoaderModal from "../components/Loader";
import { EllipsisVerticalIcon } from "lucide-react";
import ConfirmationModal from "../components/modals/ConfirmationPopUp";
import { markSessionAsCompleted } from "../services/bookings";

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
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const[item,setItem]=useState(null)

  console.log("current item",item)


  

  const onShowPopup=(item)=>{
   
    setOpen(true)
     setItem(item)

  }

  const onClose=()=>{
    setOpen(false)
  }

  const [dashBoardData, setDashBoardData] = useState({
    todaySessionCount: 0,
    currentMonthEarning: 0,
    completionRate: 0,
    newClients: 0,
    nextSession: {},
    upcomingSessions: [],
    monthToSessionMap: {},
    monthToPaymentMap: {},
  });

  const setDashBoardDataByFetching = async () => {
    setLoading(true);
    try {
      const res = await getDashBoardData(tid);
      setDashBoardData({
        todaySessionCount: res.todaysSessions,
        currentMonthEarning: res.currentMonthEarning,
        completionRate: res.completionRate,
        newClients: res.newClientsFromUpcomingMonth,
        nextSession: res.nextSession,
        upcomingSessions: res.upcommingSessionsForTodayOnly,
        monthToSessionMap: res.monthToSessionMapYearly,
        monthToPaymentMap: res.monthToPaymentMapYearly,
      });

      console.log(res);
    } catch (err) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDashBoardDataByFetching();
  }, []);

  const onConfirm=async()=>{
    console.log(item)

       await markSessionAsCompleted(item?.id,item?.userId,item?.therapistId)
       await setDashBoardDataByFetching()

        setOpen(false)


  }

  console.log(dashBoardData?.nextSession);

  // ---- top cards ----
  

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

  const handleSetAvailabilty = () => {
    nav("/time-slot");
  };


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
          Psychologist Dashboard<h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#3A116D",
            margin: 0,
            fontStyle:"italic"
            
          }}
          >
            {therapist.name}
          </h1>
        </h1>
        <div>
          <button
            onClick={handleSetAvailabilty}
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
            Set Unavailabilty
          </button>

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
              marginLeft: "4px",
            }}
          >
            Log out
          </button>
        </div>
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
          value={dashBoardData?.todaySessionCount}
          color="#EDE4FF"
        />
        <Card
          title="Earnings (This Month)"
          value={INR(dashBoardData?.currentMonthEarning)}
          color="#FFBBD8"
        />
        <Card
          title="Completion Rate"
          value={(dashBoardData?.completionRate ?? 0) + "%"}
          hint={`✅ ${dashBoardData?.completionRate ?? 0} • ❌ ${
            dashBoardData?.completionRate ?? 0
          }`}
          color="#90E0EF"
        />
        <Card
          title="New Clients (This Month)"
          value={dashBoardData?.newClients ?? "—"}
          color="#EDE4FF"
        />
        <Card
          title="Avg Rating"
          value={`${0 ?? 0} (${0 ?? 0})`}
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
          {dashBoardData?.nextSession ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {fmtDateTime(dashBoardData?.nextSession?.startTime)}
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  User: {dashBoardData?.nextSession?.userId || "—"} • Mode:{" "}
                  {"online" || "—"}
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>
                {INR(dashBoardData?.nextSession?.amount || 0)}
              </div>
            </div>
          ) : (
            <div style={{ color: "#777" }}>No upcoming confirmed sessions.</div>
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
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(dashBoardData?.upcomingSessions ?? []).length ? (
                dashBoardData?.upcomingSessions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{fmtDateTime(row.startTime)}</TableCell>
                    <TableCell>{row?.userId || "—"}</TableCell>
                    <TableCell>{row?.mode || "Online"}</TableCell>
                    <TableCell>
                      {row?.meetingLink ? (
                        <a
                          href={row?.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#3A116D", fontSize: 13 }}
                        >
                          {row?.meetingLink}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="right">{INR(row.amount || 0)}</TableCell>
                    <button onClick={()=>{
                      onShowPopup(row)

                    }}>
                      <TableCell>
                      <EllipsisVerticalIcon/>

                    </TableCell>

                    </button>
                    
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
              {dashBoardData?.monthToSessionMap?.length ? (
                dashBoardData?.monthToSessionMap?.map((row) => (
                  <TableRow key={row.index}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell align="right">{row.session}</TableCell>
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
              {dashBoardData?.monthToSessionMap.length ? (
                dashBoardData?.monthToPaymentMap?.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell align="right">{INR(row.payment || 0)}</TableCell>
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
      <LoaderModal visible={loading} />
      <ConfirmationModal onConfirm={onConfirm} onClose={onClose} isOpen={open}/>
    </div>
  );
}
