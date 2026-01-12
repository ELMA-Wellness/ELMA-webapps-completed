
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@shared-ui/Table.jsx";
import { getDashBoardData } from "../services/dashboard";
import { formatDate } from "date-fns";
import LoaderModal from "../components/Loader";

// --- Fetch all bookings for this therapist (or all, for now) ----------


export default function Bookings() {

  function getTherapist() {
  try {
    return JSON.parse(localStorage.getItem("therapist") || "{}");
  } catch {
    return {};
  }
}

  const therapist = getTherapist();
  const tid = therapist.id; // st



  const [loading, setLoading] = useState(false);


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
        upcomingSessions: res?.bookings,
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






  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>My Bookings</h1>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead align="right">Amount (₹)</TableHead>
              <TableHead align="right">Therapist Payout (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashBoardData?.upcomingSessions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No bookings yet.</TableCell>
              </TableRow>
            ) : (
              dashBoardData?.upcomingSessions?.map((b) => (
                <TableRow key={b?.id}>
                  <TableCell>{b?.userId}</TableCell>
                  <TableCell style={{ textTransform: "capitalize" }}>
                    {b?.status ?? '--'}
                  </TableCell>
                  <TableCell>
                    {b?.bookingDate ?? "—"}
                  </TableCell>
                  <TableCell align="right">
                    {b?.amount ? `₹${b?.amount}` : "—"}
                  </TableCell>
                  <TableCell align="right">
                    {b?.payoutId ? `₹${b?.payoutId}` : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <LoaderModal visible={loading}/>
    </div>
  );
}
