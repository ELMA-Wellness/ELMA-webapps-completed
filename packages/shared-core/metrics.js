// packages/shared-core/metrics.js
import { db } from "./firebase";
import {
  collection as col,
  getDocs,
  getCountFromServer,
  query as fsQuery,
  where,
  Timestamp,
} from "firebase/firestore";

import { getTodayBoundsIST, getMonthKey, daysAgoIST } from "./dates";

// ---------- Small helpers ----------
function ts(date) {
  return Timestamp.fromDate(date);
}

// ---------- Metrics used on the dashboard ----------

// Total users (count)
export async function totalUsers() {
  const snap = await getCountFromServer(col(db, "users"));
  return snap.data().count || 0;
}

// Daily Active Users today (IST) based on users.lastActiveAt
export async function dauToday() {
  const { start, end } = getTodayBoundsIST();
  const qRef = fsQuery(
    col(db, "users"),
    where("lastActiveAt", ">=", ts(start)),
    where("lastActiveAt", "<=", ts(end))
  );
  const snap = await getDocs(qRef);
  return snap.size;
}

// New users created today (IST)
export async function newUsersToday() {
  const { start, end } = getTodayBoundsIST();
  const qRef = fsQuery(
    col(db, "users"),
    where("createdAt", ">=", ts(start)),
    where("createdAt", "<=", ts(end))
  );
  const snap = await getDocs(qRef);
  return snap.size;
}

// Total therapists onboarded
export async function totalTherapists() {
  const snap = await getCountFromServer(col(db, "therapists"));
  return snap.data().count || 0;
}

// Sessions completed (lifetime)
export async function totalSessionsCompleted() {
  const qRef = fsQuery(col(db, "bookings"), where("status", "==", "completed"));
  const snap = await getDocs(qRef);
  return snap.size;
}

// Revenue this month (sum of booking.amount for completed bookings of current month)
export async function sessionsRevenueThisMonth() {
  const monthKey = getMonthKey(new Date());
  let total = 0;

  const qRef = fsQuery(
    col(db, "bookings"),
    where("status", "==", "completed"),
    where("monthKey", "==", monthKey)
  );
  const snap = await getDocs(qRef);
  snap.forEach((d) => {
    const v = Number(d.data().amount || 0);
    if (!Number.isNaN(v)) total += v;
  });

  return total;
}

// Users split: free vs ELMA Plus
export async function usersByPlus() {
  const usersCol = col(db, "users");
  const [plusSnap, totalSnap] = await Promise.all([
    getCountFromServer(fsQuery(usersCol, where("plus", "==", true))),
    getCountFromServer(usersCol),
  ]);
  const plus = plusSnap.data().count || 0;
  const total = totalSnap.data().count || 0;
  const free = Math.max(total - plus, 0);
  return { free, plus, total };
}

// Completion rate this month (completed vs cancelled)
export async function completionRateThisMonth() {
  const monthKey = getMonthKey(new Date());

  const completedSnap = await getDocs(
    fsQuery(
      col(db, "bookings"),
      where("status", "==", "completed"),
      where("monthKey", "==", monthKey)
    )
  );
  const cancelledSnap = await getDocs(
    fsQuery(
      col(db, "bookings"),
      where("status", "==", "cancelled"),
      where("monthKey", "==", monthKey)
    )
  );

  const completed = completedSnap.size;
  const cancelled = cancelledSnap.size;
  const total = completed + cancelled;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { rate, completed, cancelled };
}

// New users in last N days
export async function newUsersLastNDays(n) {
  const from = daysAgoIST(n);
  const qRef = fsQuery(col(db, "users"), where("createdAt", ">=", ts(from)));
  const snap = await getDocs(qRef);
  return snap.size;
}

// WAU (7d) and MAU (30d) by lastActiveAt
export async function wau() {
  const from = daysAgoIST(7);
  const qRef = fsQuery(col(db, "users"), where("lastActiveAt", ">=", ts(from)));
  const snap = await getDocs(qRef);
  return snap.size;
}

export async function mau() {
  const from = daysAgoIST(30);
  const qRef = fsQuery(col(db, "users"), where("lastActiveAt", ">=", ts(from)));
  const snap = await getDocs(qRef);
  return snap.size;
}

// Top therapists this month by completed sessions
export async function topTherapistsThisMonth(topN = 5) {
  const monthKey = getMonthKey(new Date());
  const snap = await getDocs(
    fsQuery(
      col(db, "bookings"),
      where("status", "==", "completed"),
      where("monthKey", "==", monthKey)
    )
  );

  const counts = new Map(); // therapistId -> sessions
  snap.forEach((docSnap) => {
    const d = docSnap.data() || {};
    const t = d.therapistId;
    if (!t) return;
    counts.set(t, (counts.get(t) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([therapistId, sessions]) => ({ therapistId, sessions }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, topN);
}

// ---------- Payouts per therapist for a month ----------

function monthKeyFromDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Sum therapistPayout for completed bookings in the given month
 * Returns: [{ therapistId, sessions, payout }, ...] sorted by payout desc
 * Requires bookings to have: status, monthKey, therapistId, therapistPayout
 */
export async function payoutsForMonth(monthKey = monthKeyFromDate()) {
  const qRef = fsQuery(
    col(db, "bookings"),
    where("status", "==", "completed"),
    where("monthKey", "==", monthKey)
  );
  const snap = await getDocs(qRef);

  const byTher = new Map(); // therapistId -> { sessions, payout }
  snap.forEach((docSnap) => {
    const b = docSnap.data() || {};
    const id = b.therapistId || "unknown";
    const prev = byTher.get(id) || { sessions: 0, payout: 0 };
    byTher.set(id, {
      sessions: prev.sessions + 1,
      payout: prev.payout + (Number(b.therapistPayout) || 0),
    });
  });

  return Array.from(byTher.entries())
    .map(([therapistId, v]) => ({ therapistId, ...v }))
    .sort((a, b) => b.payout - a.payout);
}
// Earnings helper used by the psych portal
// Returns { therapistId, sessions, payout } for a given therapist + month
export async function getTherapistEarnings(
  therapistId,
  monthKey = monthKeyFromDate()
) {
  if (!therapistId) {
    return { therapistId: null, sessions: 0, payout: 0 };
  }

  const qRef = fsQuery(
    col(db, "bookings"),
    where("status", "==", "completed"),
    where("monthKey", "==", monthKey),
    where("therapistId", "==", therapistId)
  );

  const snap = await getDocs(qRef);

  let sessions = 0;
  let payout = 0;

  snap.forEach((docSnap) => {
    const b = docSnap.data() || {};
    sessions += 1;
    payout += Number(b.therapistPayout || 0);
  });

  return { therapistId, sessions, payout };
}
