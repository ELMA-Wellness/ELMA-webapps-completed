// apps/psych-portal/src/pages/Earnings.jsx
import React, { useEffect, useState } from "react";
import { getDashBoardData } from "../services/dashboard";

function INR(x) {
  try {
    return "₹" + Math.round(x || 0).toLocaleString("en-IN");
  } catch {
    return "₹0";
  }
}

export default function Earnings() {
  function getTherapist() {
    try {
      return JSON.parse(localStorage.getItem("therapist") || "{}");
    } catch {
      return {};
    }
  }

  const therapist = getTherapist();
  const tid = therapist.id;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    earningsTotal: 0,
    sessionsTotal: 0,
    yearMap: [],
  });

  const setDashBoardDataByFetching = async () => {
    setLoading(true);
    try {
      const res = await getDashBoardData(tid);

      setData({
        earningsTotal: res.bookings?.reduce(
          (sum, row) => sum + (row?.amount || 0),
          0
        ),
        sessionsTotal: res.bookings?.length || 0,
        yearMap: res.monthToPaymentMapYearly || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tid) setDashBoardDataByFetching();
  }, [tid]);

  return (
    <div style={{ padding: 32, background: "#FAFAFF", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
        Earnings Overview
      </h1>

      {/* Lifetime stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{ background: "#FFBBD8", borderRadius: 16, padding: 22 }}>
          <div>Total Earnings (Lifetime)</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {INR(data.earningsTotal)}
          </div>
        </div>

        <div style={{ background: "#EDE4FF", borderRadius: 16, padding: 22 }}>
          <div>Total Sessions (Lifetime)</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {data.sessionsTotal}
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: 32 }}>Earnings by Month (last 12 months)</h2>

      {!loading && (
        <table style={{ width: "100%", marginTop: 16 }}>
          <thead>
            <tr>
              <th>Month</th>
              <th>Sessions</th>
              <th>Earnings</th>
            </tr>
          </thead>
          <tbody>
            {data.yearMap.map((row) => (
              <tr key={row?.month}>
                <td>{row?.month}</td>
                <td>{row?.sessions || 0}</td>
                <td>{INR(row.payment)}</td>
              </tr>
            ))}

            {data.yearMap.length === 0 && (
              <tr>
                <td colSpan={3}>No earnings data yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
