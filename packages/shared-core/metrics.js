import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { getTodayBoundsIST, getMonthKey } from "./dates.js";

// Users
export async function countUsers() {
  const q = query(collection(db, "users"));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function countNewUsersToday() {
  const { start, end } = getTodayBoundsIST();
  const q = query(
    collection(db, "users"),
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<=", Timestamp.fromDate(end))
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function countNewUsers7d() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, "users"),
    where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function countNewUsers30d() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, "users"),
    where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function countDAU() {
  const { start, end } = getTodayBoundsIST();
  const q = query(
    collection(db, "users"),
    where("lastActiveAt", ">=", Timestamp.fromDate(start)),
    where("lastActiveAt", "<=", Timestamp.fromDate(end))
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function countWAU() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, "users"),
    where("lastActiveAt", ">=", Timestamp.fromDate(sevenDaysAgo))
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function countMAU() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, "users"),
    where("lastActiveAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function countUsersByPlus() {
  const q = query(collection(db, "users"));
  const snapshot = await getDocs(q);
  let free = 0,
    plus = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.plus) plus++;
    else free++;
  });
  return { free, plus };
}

// Therapists
export async function countTherapists() {
  const q = query(collection(db, "therapists"));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

// Bookings
export async function countCompletedSessions() {
  const q = query(collection(db, "bookings"), where("status", "==", "completed"));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function sumSessionsRevenueMonth(monthKey) {
  const q = query(
    collection(db, "bookings"),
    where("monthKey", "==", monthKey),
    where("status", "==", "completed")
  );
  const snapshot = await getDocs(q);
  let total = 0;
  snapshot.forEach((doc) => {
    total += doc.data().amount || 0;
  });
  return total;
}

export async function getSessionCompletionRate() {
  const qCompleted = query(collection(db, "bookings"), where("status", "==", "completed"));
  const qCancelled = query(collection(db, "bookings"), where("status", "==", "cancelled"));
  
  const [completedSnap, cancelledSnap] = await Promise.all([
    getDocs(qCompleted),
    getDocs(qCancelled),
  ]);
  
  const completed = completedSnap.size;
  const cancelled = cancelledSnap.size;
  const total = completed + cancelled;
  
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// Therapist stats
export async function therapistStatsForMonth(monthKey) {
  const therapistsSnap = await getDocs(collection(db, "therapists"));
  const stats = [];

  for (const therapistDoc of therapistsSnap.docs) {
    const therapistId = therapistDoc.id;
    const therapistData = therapistDoc.data();

    // Month stats
    const qMonth = query(
      collection(db, "bookings"),
      where("therapistId", "==", therapistId),
      where("monthKey", "==", monthKey),
      where("status", "==", "completed")
    );
    const monthSnap = await getDocs(qMonth);
    let monthSessions = monthSnap.size;
    let monthPayout = 0;
    monthSnap.forEach((doc) => {
      monthPayout += doc.data().therapistPayout || 0;
    });

    // Lifetime stats
    const qLifetime = query(
      collection(db, "bookings"),
      where("therapistId", "==", therapistId),
      where("status", "==", "completed")
    );
    const lifetimeSnap = await getDocs(qLifetime);
    let lifetimeSessions = lifetimeSnap.size;
    let lifetimePayout = 0;
    lifetimeSnap.forEach((doc) => {
      lifetimePayout += doc.data().therapistPayout || 0;
    });

    stats.push({
      therapistId,
      name: therapistData.name,
      monthSessions,
      monthPayout,
      lifetimeSessions,
      lifetimePayout,
    });
  }

  return stats;
}

export async function topTherapistsBySessions(monthKey, limitCount = 5) {
  const stats = await therapistStatsForMonth(monthKey);
  return stats
    .sort((a, b) => b.monthSessions - a.monthSessions)
    .slice(0, limitCount);
}

// Therapist-specific queries
export async function getTherapistBookings(therapistId, filterType = "all") {
  let q;
  const { start, end } = getTodayBoundsIST();
  const monthKey = getMonthKey();

  switch (filterType) {
    case "today":
      q = query(
        collection(db, "bookings"),
        where("therapistId", "==", therapistId),
        where("startAt", ">=", Timestamp.fromDate(start)),
        where("startAt", "<=", Timestamp.fromDate(end)),
        orderBy("startAt", "asc")
      );
      break;
    case "week":
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      q = query(
        collection(db, "bookings"),
        where("therapistId", "==", therapistId),
        where("startAt", ">=", Timestamp.fromDate(weekAgo)),
        orderBy("startAt", "desc")
      );
      break;
    case "month":
      q = query(
        collection(db, "bookings"),
        where("therapistId", "==", therapistId),
        where("monthKey", "==", monthKey),
        orderBy("startAt", "desc")
      );
      break;
    default:
      q = query(
        collection(db, "bookings"),
        where("therapistId", "==", therapistId),
        orderBy("startAt", "desc"),
        limit(50)
      );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getTherapistEarnings(therapistId) {
  const monthKey = getMonthKey();

  // Monthly earnings
  const qMonth = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("monthKey", "==", monthKey),
    where("status", "==", "completed")
  );
  const monthSnap = await getDocs(qMonth);
  let monthly = 0;
  monthSnap.forEach((doc) => {
    monthly += doc.data().therapistPayout || 0;
  });

  // Lifetime earnings
  const qLifetime = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("status", "==", "completed")
  );
  const lifetimeSnap = await getDocs(qLifetime);
  let lifetime = 0;
  lifetimeSnap.forEach((doc) => {
    lifetime += doc.data().therapistPayout || 0;
  });

  return { monthly, lifetime };
}

export async function getTherapistTodaySessions(therapistId) {
  const { start, end } = getTodayBoundsIST();
  const q = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("startAt", ">=", Timestamp.fromDate(start)),
    where("startAt", "<=", Timestamp.fromDate(end)),
    orderBy("startAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getTherapistCompletedCount(therapistId) {
  const q = query(
    collection(db, "bookings"),
    where("therapistId", "==", therapistId),
    where("status", "==", "completed")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}
