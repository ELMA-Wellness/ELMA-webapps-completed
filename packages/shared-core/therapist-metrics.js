// packages/shared-core/therapist-metrics.js
import { db } from "./firebase";
import {
  collection, query, where, orderBy, limit, getDocs, Timestamp,
} from "firebase/firestore";
import { getTodayBoundsIST, getMonthKey } from "./dates";

// --- helpers ---
const ts = (d) => (d?.toDate ? d : Timestamp.fromDate(d instanceof Date ? d : new Date(d)));

// --- TODAY: sessions count (confirmed/completed) ---
export async function myTodaySessionsCount(therapistId) {
  if (!therapistId) return 0;
  const { start, end } = getTodayBoundsIST();
  // If you store `status`, we treat confirmed or completed as “today’s sessions”
  const q = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("startAt", ">=", ts(start)),
    where("startAt", "<=", ts(end)),
  );
  const snap = await getDocs(q);
  // filter in-memory by allowed statuses (schema-safe)
  let n = 0;
  snap.forEach(d => {
    const s = d.data()?.status;
    if (s === "confirmed" || s === "completed") n += 1;
  });
  return n;
}

// --- NEXT upcoming session ---
export async function myNextSession(therapistId) {
  if (!therapistId) return null;
  const now = new Date();
  const q = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("startAt", ">=", ts(now)),
    orderBy("startAt", "asc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

// --- UPCOMING list (N) ---
export async function myUpcomingSessions(therapistId, n = 5) {
  if (!therapistId) return [];
  const now = new Date();
  const q = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("startAt", ">=", ts(now)),
    orderBy("startAt", "asc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// --- Earnings this month (sum of therapistPayout on completed bookings) ---
export async function myEarningsThisMonth(therapistId) {
  if (!therapistId) return 0;
  const monthKey = getMonthKey(new Date());
  const q = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("monthKey", "==", monthKey),
    where("status", "==", "completed")
  );
  const snap = await getDocs(q);
  let sum = 0;
  snap.forEach(doc => {
    const v = Number(doc.data()?.therapistPayout || 0);
    if (!Number.isNaN(v)) sum += v;
  });
  return sum;
}

// --- Completion rate (this month) ---
export async function myCompletionRateThisMonth(therapistId) {
  if (!therapistId) return { rate: 0, completed: 0, cancelled: 0 };
  const monthKey = getMonthKey(new Date());

  const q = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("monthKey", "==", monthKey)
  );
  const snap = await getDocs(q);

  let completed = 0, cancelled = 0;
  snap.forEach(d => {
    const s = d.data()?.status;
    if (s === "completed") completed += 1;
    if (s === "cancelled") cancelled += 1;
  });
  const total = completed + cancelled;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { rate, completed, cancelled };
}

// --- New clients this month (distinct userIds from completed sessions in month) ---
export async function myNewClientsThisMonth(therapistId) {
  if (!therapistId) return 0;
  const monthKey = getMonthKey(new Date());
  const q = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("monthKey", "==", monthKey),
    where("status", "==", "completed")
  );
  const snap = await getDocs(q);
  const users = new Set();
  snap.forEach(d => {
    const u = d.data()?.userId;
    if (u) users.add(u);
  });
  return users.size;
}

// --- Average rating (very schema-tolerant) ---
export async function myAverageRating(therapistId) {
  if (!therapistId) return { avg: 0, count: 0 };
  // Adjust collection name if yours differs (“reviews”, “ratings”, “feedback”)
  const q = query(
    collection(db, "reviews"),
    where("therapistId", "==", therapistId)
  );
  const snap = await getDocs(q);
  let sum = 0, cnt = 0;
  snap.forEach(d => {
    const r = Number(d.data()?.rating || 0);
    if (!Number.isNaN(r) && r > 0) { sum += r; cnt += 1; }
  });
  return { avg: cnt ? Math.round((sum / cnt) * 10) / 10 : 0, count: cnt };
}

// --- Unread chats (best-effort; adjust to your schema) ---
export async function myUnreadChats(therapistId) {
  if (!therapistId) return 0;
  // Example approach 1: rooms with a numeric therapistUnread > 0
  const q1 = query(
    collection(db, "chatRooms"),
    where("therapistId", "==", therapistId)
  );
  const s1 = await getDocs(q1);
  let total = 0;
  s1.forEach(d => {
    const n = Number(d.data()?.therapistUnread || 0);
    if (!Number.isNaN(n)) total += n;
  });
  if (total > 0) return total;

  // Example fallback approach 2: chats where unreadFor == "therapist"
  const q2 = query(
    collection(db, "chats"),
    where("therapistId", "==", therapistId),
    where("unreadFor", "==", "therapist")
  );
  const s2 = await getDocs(q2);
  return s2.size; // number of threads
}
// ---- Monthly earnings per therapist (last N months) ----

/**
 * Returns an array like:
 * [{ month: "2025-01", total: 12000 }, ...] sorted ascending by month.
 * Uses bookings where:
 *  - therapistId == therapistId
 *  - status == "completed"
 *  - startAt >= first day of (now - monthsBack + 1) month
 *  - therapistPayout field holds the therapist's share.
 */
export async function myEarningsByMonth(therapistId, monthsBack = 6) {
  if (!therapistId) return [];

  const now = new Date();
  const start = new Date(now);
  // go back N-1 months and clamp to the 1st of that month
  start.setMonth(start.getMonth() - (monthsBack - 1));
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const colRef = collection(db, "bookings");
  const q = query(
    colRef,
    where("therapistId", "==", therapistId),
    where("status", "==", "completed"),
    where("startAt", ">=", Timestamp.fromDate(start))
  );

  const snap = await getDocs(q);

  const buckets = new Map(); // "YYYY-MM" -> totalPayout
  snap.forEach((docSnap) => {
    const b = docSnap.data() || {};
    const ts = b.startAt?.toDate ? b.startAt.toDate() : null;
    if (!ts) return;

    const key = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const prev = buckets.get(key) || 0;
    buckets.set(key, prev + (Number(b.therapistPayout) || 0));
  });

  return Array.from(buckets.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));
}
// Helper: build monthKey "YYYY-MM" from a Date
function monthKeyFromDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Per-month summary of completed sessions for a therapist.
 * Returns [{ monthKey: "YYYY-MM", sessions, earnings }, ...]
 */
export async function myMonthlySummary(therapistId, maxMonths = 12) {
  if (!therapistId) return [];

  const bookingsCol = col(db, "bookings");

  // pull all completed bookings for this therapist, then group client-side
  const qRef = fsQuery(
    bookingsCol,
    where("status", "==", "completed"),
    // handle both therapistId and therapistID (your sample doc used therapistID)
    where("therapistId", "==", therapistId)
  );

  const snap = await getDocs(qRef);

  const byMonth = new Map(); // monthKey -> { monthKey, sessions, earnings }

  snap.forEach((docSnap) => {
    const b = docSnap.data() || {};
    const rawStart =
      b.startAt?.toDate?.() || (b.startAt instanceof Date ? b.startAt : null);
    const mk = b.monthKey || monthKeyFromDate(rawStart || new Date());
    const payout = Number(b.therapistPayout || 0);

    const existing = byMonth.get(mk) || { monthKey: mk, sessions: 0, earnings: 0 };
    existing.sessions += 1;
    if (!Number.isNaN(payout)) existing.earnings += payout;
    byMonth.set(mk, existing);
  });

  return Array.from(byMonth.values())
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey)) // chronological
    .slice(-maxMonths); // last N months
}
