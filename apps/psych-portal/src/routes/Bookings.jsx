function fmt(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts.seconds * 1000).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

import { db } from "@shared-core/firebase";
import { formatDateTimeIST } from "@shared-core/dates";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@shared-ui/Table.jsx";

// --- Fetch all bookings for this therapist (or all, for now) ----------
async function fetchBookings() {
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data() || {};
    return {
      id: doc.id,
      userName: data.userName || data.clientName || "Unknown",
      therapistId: data.therapistId || "—",
      status: data.status || "pending",
      amount: Number(data.amount || 0),
      createdAt: data.createdAt || null,
      // If you later add therapistPayout / period_end etc., we can show them safely
      therapistPayout: Number(data.therapistPayout || 0),
    };
  });
}

export default function Bookings() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["psychBookings"],
    queryFn: fetchBookings,
  });

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading bookings…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "#b00020" }}>
        Error loading bookings: {String(error.message || error)}
      </div>
    );
  }

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
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No bookings yet.</TableCell>
              </TableRow>
            ) : (
              data.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.userName}</TableCell>
                  <TableCell style={{ textTransform: "capitalize" }}>
                    {b.status}
                  </TableCell>
                  <TableCell>
                    {b.createdAt ? formatDate(b.createdAt) : "—"}
                  </TableCell>
                  <TableCell align="right">
                    {b.amount ? `₹${b.amount}` : "—"}
                  </TableCell>
                  <TableCell align="right">
                    {b.therapistPayout ? `₹${b.therapistPayout}` : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
