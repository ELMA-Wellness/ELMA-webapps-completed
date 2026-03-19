import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  limit as limitFn,
  getDocs,
  startAfter
} from "firebase/firestore";

import { db } from "../firebase/config";

const filters = [
  "Total Users",
  "Active Users",
  "New Users Today",
  "Completed Onbording Users",
  "Partially Onbording Users",
  "Non Onbording Users",
  "One Game Finished Users",
  "Two Game Finished Users",
  "Three Game Finished Users",
  "Four Game Finished Users",
  "Five Game Finished Users",
  "Six Game Finished Users",
];

const getGameCompletionPercent = (data: any) => {
  const games = [
    data.gameOneFinished,
    data.gameTwoFinished,
    data.gameThreeFinished,
    data.gameFourFinished,
    data.gameFiveFinished,
    data.gameSixFinished,
  ];

  const finishedCount = games.filter(Boolean).length;

  return Math.round((finishedCount / 6) * 100);
};
const toJSDate = (ts: any) => {
  if (!ts) return null;
  return ts?.toDate ? ts.toDate() : new Date(ts);
};

const getUserByFilter = (users: any[], filter: string) => {

  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);

  switch (filter) {

    case "Active Users":
      return users.filter(u => {
        const lastActive = toJSDate(u.updatedAt);
        return lastActive && lastActive >= startOfToday;
      });

    case "New Users Today":
      return users.filter(u => {
        const createdAt = toJSDate(u.createdAt);
        return createdAt && createdAt >= startOfToday;
      });

    case "Completed Onbording Users":
      return users.filter(u => u.onBoradingFinished === true);

    case "Partially Onbording Users":
      return users.filter(
        u =>
          (u.name || u.ageGroup) &&
          (!u.gender || !u.sleepStyle || !u.stressLevel) 
      );

    case "Non Onbording Users":
      return users.filter(u => !u.name || !u.ageGroup);

    case "One Game Finished Users":
      return users.filter(u => u.gameOneFinished);

    case "Two Game Finished Users":
      return users.filter(u => u.gameTwoFinished);

    case "Three Game Finished Users":
      return users.filter(u => u.gameThreeFinished);

    case "Four Game Finished Users":
      return users.filter(u => u.gameFourFinished);

    case "Five Game Finished Users":
      return users.filter(u => u.gameFiveFinished);

    case "Six Game Finished Users":
      return users.filter(u => u.gameSixFinished);

    default:
      return users;
  }
};

export const getAllUserAnalytics = async (
  limit = 10,
  page = 1,
  filter: string = "Total Users"
) => {

  try {

    // ─────────────────────────────
    // GET ALL USERS
    // ─────────────────────────────
    const usersSnap = await getDocs(
      query(collection(db, "users"), orderBy("createdAt", "desc"))
    );

    const users = usersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));


    // ─────────────────────────────
    // APPLY FILTER
    // ─────────────────────────────
    const filteredUsers = getUserByFilter(users, filter);


    // ─────────────────────────────
    // PAGINATION
    // ─────────────────────────────
    const start = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(start, start + limit);


    const result: any[] = [];


    // ─────────────────────────────
    // ANALYTICS
    // ─────────────────────────────
    for (const user of paginatedUsers) {

      const userId = user.id;

      const [
        moodSnap,
        aiSnap,
        bookingSnap,
        bookingCompletedSnap,
        sessionCompletedSnap,
        conversationSnap
      ] = await Promise.all([

        getDocs(query(
          collection(db, "moodLogs"),
          where("userId", "==", userId)
        )),

        getDocs(query(
          collectionGroup(db, "messages"),
          where("sender", "==", "ai"),
          where("userId", "==", userId)
        )),

        

        getDocs(query(
          collection(db, "bookings"),
          where("userId", "==", userId)
        )),

        getDocs(query(
          collection(db, "bookings"),
          where("userId", "==", userId),
          where("status", "==", "booked")
        )),

        getDocs(query(
          collection(db, "bookings"),
          where("userId", "==", userId),
          where("status", "==", "completed")
        )),
        getDocs(query(
          collection(db, "conversations"),
          where("userId", "==", userId)
        ))


      ]);


      result.push({

        userId,
        name: user.name || "",
        email: user.email || "",

        app_open: user.appOpenCount || 0,
        profile_percent : getGameCompletionPercent(user),


        onboarding_started: user.onboardingStarted || 0,
        onboarding_completed: user.onBoradingFinished ? "Yes" : "No",

        assessment_started: user.assessmentStarted || 0,
        assessment_completed: user.assessmentCompleted || 0,

        mood_logged: moodSnap.size,

        ai_chat_opened: conversationSnap.size || 0,
        ai_message_sent: aiSnap.size,

        therapist_profile_viewed: user.therapistViewCount ||   0,

        booking_initiated: bookingSnap.size,
        booking_completed: bookingCompletedSnap.size,

        session_completed: sessionCompletedSnap.size

      });

    }


    return {

      page,
      limit,
      totalUsers: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit),
      data: result

    };

  } catch (error) {

    console.error("Error getting analytics:", error);

    return {
      page,
      limit,
      totalUsers: 0,
      totalPages: 0,
      data: []
    };

  }
};