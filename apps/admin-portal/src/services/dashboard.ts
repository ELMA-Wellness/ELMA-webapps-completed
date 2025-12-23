import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const toJSDate = (value: any): Date | null => {
  if (!value) return null;

  // Firestore Timestamp
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  // Already a Date
  if (value instanceof Date) {
    return value;
  }

  // String / number / anything else
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const getDashBoardData = async () => {
  try {
    const now = new Date();

    // ─────────────────────────────
    // Date helpers
    // ─────────────────────────────
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    // ─────────────────────────────
    // USERS & THERAPISTS
    // ─────────────────────────────
    const [usersSnap, therapistSnap] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "therapists")),
    ]);

    const users = usersSnap.docs.map((d) => d.data());

    const therapists = therapistSnap.docs.map((d) => {
      return {
        id: d.id,
        ...d.data(),
      };
    });

    const therapistMap: Record<string, any> = {};
    therapists.forEach((t) => {
      therapistMap[t.uid] = t;
    });

    const total_users = users.length;
    const therapist_count = therapists.length;

    const free_users = users.filter((u) => u?.plan === "free").length;
    const plus_users = users.filter((u) => u?.plan === "plus").length;

    const new_users_today = users.filter((u) => {
      const createdAt = toJSDate(u.createdAt);
      return createdAt && createdAt >= startOfToday;
    }).length;

    const new_users_in_last_7_days = users.filter((u) => {
      const createdAt = toJSDate(u.createdAt);
      return createdAt && createdAt >= last7Days;
    }).length;

    const new_users_in_last_30_days = users.filter((u) => {
      const createdAt = toJSDate(u.createdAt);
      return createdAt && createdAt >= last30Days;
    }).length;

    const dau_users = users.filter((u) => {
      const lastActive = toJSDate(u.updatedAt);
      return lastActive && lastActive >= startOfToday;
    }).length;

    const weekly_active_users = users.filter((u) => {
      const lastActive = toJSDate(u.updatedAt);
      return lastActive && lastActive >= startOfWeek;
    }).length;

    const monthly_active_users = users.filter((u) => {
      const lastActive = toJSDate(u.updatedAt);
      return lastActive && lastActive >= startOfMonth;
    }).length;

    // ─────────────────────────────
    // BOOKINGS (CURRENT MONTH)
    // ─────────────────────────────
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("paymentStatus", "==", "completed"),
      where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
    );
    const bookingsSnap = await getDocs(bookingsQuery);
    const bookings = bookingsSnap.docs.map((d) => d.data());

    const completedBookings = bookings?.filter(
      (i) => i?.sessionCompleted === true
    )?.length;

    const sessions_completed_montly = completedBookings;

    const revenue_this_month = bookings.reduce(
      (sum, b) => sum + (Number(b.amount) || 0),
      0
    );

    // ─────────────────────────────
    // GROUP BY therapistId
    // ─────────────────────────────
    const therapistStats: Record<
      string,
      { sessions: number; earning: number }
    > = {};

    bookings.forEach((b) => {
      if (!b.therapistId) return;

      if (!therapistStats[b.therapistId]) {
        therapistStats[b.therapistId] = {
          sessions: 0,
          earning: 0,
        };
      }

      therapistStats[b.therapistId].sessions += 1;
      therapistStats[b.therapistId].earning += Number(b.amount) || 0;
    });

    const therapist_earning_current_month_group_by_therapist_id =
      Object.entries(therapistStats).map(([therapistId, data]) => ({
        therapistId,
        therapistName: therapists?.find((i) => i.id === therapistId)?.name,
        sessions: data.sessions,
        current_month_earning: data.earning,
      }));

    const therapist_current_payout_month =
      therapist_earning_current_month_group_by_therapist_id.map((t) => ({
        therapistId: t.therapistId,
        therapistName: therapists?.find((i) => i.id === t.therapistId)?.name,
        payout: Math.round(t.current_month_earning), // configurable
      }));

    // ─────────────────────────────
    // Completion rate
    // ─────────────────────────────

    const completion_rate =
      total_users > 0
        ? Number(((completedBookings / bookings?.length) * 100).toFixed(2))
        : 0;

    return {
      total_users,
      dau_users,
      new_users_today,
      therapist_count,
      free_users,
      plus_users,
      sessions_completed_montly,
      revenue_this_month,
      weekly_active_users,
      monthly_active_users,
      completion_rate,
      new_users_in_last_7_days,
      new_users_in_last_30_days,
      therapist_earning_current_month_group_by_therapist_id:
        therapist_earning_current_month_group_by_therapist_id
          ?.sort((a, b) => b.current_month_earning - a.current_month_earning)
          ?.slice(0, 3),
      therapist_current_payout_month,
    };
  } catch (err: any) {
    console.error("getDashBoardData error:", err?.message);
    throw err;
  }
};
