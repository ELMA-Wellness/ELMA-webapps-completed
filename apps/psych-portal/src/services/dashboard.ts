import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
const today = new Date().toISOString().split("T")[0];

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;

const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-01`;

const yearStart = `${year}-01-01`;
const yearEnd = `${year + 1}-01-01`;

export const getDashBoardData = async (therapistId: string) => {
  const ref = collection(db, "bookings");

  console.log();
  const now = Timestamp.now();

  const allQ = query(ref, where("therapistId", "==", therapistId));

  // 1️⃣ Today's sessions
  const todayQ = query(
    ref,
    where("therapistId", "==", therapistId),
    where("bookingDate", "==", today)
  );

  // 2️⃣ Upcoming today
  const upcomingTodayQ = query(
    ref,
    where("therapistId", "==", therapistId),
    where("startTime", ">", now),
    orderBy("startTime", "asc")
  );

  // 3️⃣ Next session
  const nextSessionQ = query(
    ref,
    where("therapistId", "==", therapistId),
    where("startTime", ">", now),
    orderBy("startTime", "asc"),
    limit(1)
  );

  // 4️⃣ Current month earnings
  const currentMonthQ = query(
    ref,
    where("therapistId", "==", therapistId),
    where("bookingDate", ">=", monthStart),
    where("bookingDate", "<", monthEnd),
    where("paymentStatus", "==", "completed")
  );

  // 5️⃣ Completion rate
  const completedQ = query(
    ref,
    where("therapistId", "==", therapistId),
    where("sessionCompleted", "==", true)
  );

  // 6️⃣ Yearly sessions
  const yearlyQ = query(
    ref,
    where("therapistId", "==", therapistId),
    where("bookingDate", ">=", yearStart),
    where("bookingDate", "<", yearEnd)
  );

  const [
    todaySnap,
    upcomingTodaySnap,
    nextSessionSnap,
    currentMonthSnap,
    completedSnap,
    yearlySnap,
    allSnap,
  ] = await Promise.all([
    getDocs(todayQ),
    getDocs(upcomingTodayQ),
    getDocs(nextSessionQ),
    getDocs(currentMonthQ),
    getDocs(completedQ),
    getDocs(yearlyQ),
    getDocs(allQ),
  ]);

  // 🔹 initialize fixed 12-size arrays
  const monthToSessionMapYearly = Array(12).fill(0);
  const monthToPaymentMapYearly = Array(12).fill(0);

  const map = currentMonthSnap?.docs?.map((i) => {
    return {
      id: i.data()?.userId,
    };
  });
  console.log("map", map);

  // 🔹 aggregate yearly data
  yearlySnap.docs.forEach((doc) => {
    const d = doc.data();

    if (!d.startTime) return;

    const date = d.startTime.toDate();
    const monthIndex = date.getMonth(); // 0 = Jan, 11 = Dec

    // count sessions
    monthToSessionMapYearly[monthIndex] += 1;

    // sum earnings (only completed payments)
    if (d.paymentStatus === "completed" && typeof d.amount === "number") {
      monthToPaymentMapYearly[monthIndex] += d.amount;
    }
  });
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const sessionByMonthFormatted = MONTHS.map((month, index) => ({
    month,
    session: monthToSessionMapYearly[index] || 0,
  }));
  const paymentByMonthFormatted = MONTHS.map((month, index) => ({
    month,
    payment: monthToPaymentMapYearly[index] || 0,
  }));

  return {
    todaysSessions: todaySnap.size,

    upcommingSessionsForTodayOnly: upcomingTodaySnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })),

    nextSession: nextSessionSnap.docs[0]
      ? { id: nextSessionSnap.docs[0].id, ...nextSessionSnap.docs[0].data() }
      : null,

    currentMonthEarning: currentMonthSnap.docs.reduce(
      (sum, d) => sum + (d.data().amount || 0),
      0
    ),

    completionRate:
      yearlySnap.size === 0
        ? 0
        : Math.round((completedSnap.size / yearlySnap.size) * 100),

    newClientsFromUpcomingMonth: new Set(
      currentMonthSnap?.docs?.map((d) => d.data()?.userId) ?? []
    ).size,
    monthToSessionMapYearly: sessionByMonthFormatted,
    monthToPaymentMapYearly: paymentByMonthFormatted,
    bookings: allSnap?.docs?.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })),
  };
};
