import {
  collection,
  collectionGroup,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/config";

/* ────────────────────────────────────────────────────────────
   FILTERS (kept in sync with Dashboard.jsx cards)
──────────────────────────────────────────────────────────── */

export const filters = [
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

/* ────────────────────────────────────────────────────────────
   GAME KEYS  (replayable exercises stored in users/{uid}/games)
   NOTE: these are the game "name" values written by the mobile
   app. gameOneFinished..gameSixFinished are ONBOARDING steps and
   are tracked separately from these replay counts.
──────────────────────────────────────────────────────────── */

const GAMES: { key: string; label: string }[] = [
  { key: "calm_in_60", label: "Calm in 60" },
  { key: "insight_sicker", label: "Insight Sticker" },
  { key: "strength_builder", label: "Strength Builder" },
];

/* ────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────── */

const toJSDate = (ts: any): Date | null => {
  if (!ts) return null;
  if (typeof ts?.toDate === "function") return ts.toDate();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
};

/** Local calendar day key: YYYY-MM-DD */
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const timeOfDay = (
  d: Date
): "morning" | "afternoon" | "evening" | "night" => {
  const h = d.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
};

const DAY_MS = 24 * 60 * 60 * 1000;
const withinLastDays = (d: Date, n: number) =>
  d.getTime() >= Date.now() - n * DAY_MS;

const round2 = (n: number) => Number(n.toFixed(2));

const getGameCompletionPercent = (u: any) => {
  const games = [
    u.gameOneFinished,
    u.gameTwoFinished,
    u.gameThreeFinished,
    u.gameFourFinished,
    u.gameFiveFinished,
    u.gameSixFinished,
  ];
  return Math.round((games.filter(Boolean).length / 6) * 100);
};

/** Highest CONTIGUOUS onboarding game the user has finished (0–6). */
const furthestOnboardingGame = (u: any) => {
  const flags = [
    u.gameOneFinished,
    u.gameTwoFinished,
    u.gameThreeFinished,
    u.gameFourFinished,
    u.gameFiveFinished,
    u.gameSixFinished,
  ];
  let n = 0;
  for (const f of flags) {
    if (f) n += 1;
    else break;
  }
  return n;
};

/**
 * Best-effort signup method. Firebase Auth provider data is NOT stored on the
 * Firestore user doc, so google vs apple can't be distinguished unless the
 * mobile app writes one of these fields. We read them if present, otherwise
 * fall back to a phone/email heuristic.
 *   → For exact splits, have the app persist `provider` / `signInProvider`
 *     (e.g. "google.com" | "apple.com" | "phone" | "password").
 */
const signupMethod = (
  u: any
): "Phone" | "Email" | "Google" | "Apple" | "Unknown" => {
  const raw = (
    u.provider ||
    u.signInProvider ||
    u.authProvider ||
    u.signUpMethod ||
    ""
  )
    .toString()
    .toLowerCase();

  if (raw.includes("google")) return "Google";
  if (raw.includes("apple")) return "Apple";
  if (raw.includes("phone")) return "Phone";
  if (raw.includes("password") || raw.includes("email")) return "Email";

  // Heuristic fallback
  if (u.phone && !u.email) return "Phone";
  if (u.email) return "Email";
  return "Unknown";
};

/* ────────────────────────────────────────────────────────────
   PATH RESOLUTION for collectionGroup "messages" docs
   users/{uid}/{conversations|voiceConversations}/{cid}/messages/{mid}
   → { uid, type: "conversations" | "voiceConversations", cid }
──────────────────────────────────────────────────────────── */

const messageOwner = (
  docSnap: any
): { uid: string | null; type: string | null; cid: string | null } => {
  const ref = docSnap?.ref;
  const convDoc = ref?.parent?.parent; // {cid}
  const convCol = convDoc?.parent; // conversations | voiceConversations
  const userDoc = convCol?.parent; // {uid}
  return {
    uid: userDoc?.id ?? null,
    type: convCol?.id ?? null,
    cid: convDoc?.id ?? null,
  };
};

/* ────────────────────────────────────────────────────────────
   PER-USER AGGREGATE SHAPE
──────────────────────────────────────────────────────────── */

interface UserAgg {
  // mood
  moodTotal: number;
  moodDays: Set<string>;
  moodDayCounts: Record<string, number>;
  moodDaysLast7: Set<string>;
  // energy
  energyTotal: number;
  energyDays: Set<string>;
  energyDayCounts: Record<string, number>;
  energyDaysLast7: Set<string>;
  // journal
  journalTotal: number;
  journalDays: Set<string>;
  journalTimeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  // games (replay)
  gamePlays: Record<string, number>;
  // ai chat (text)
  chatUserMsgs: number;
  chatAiMsgs: number;
  chatConversations: Set<string>;
  // ai handsfree (voice)
  voiceMsgs: number;
  voiceSessions: Map<string, { min: number; max: number }>;
  // bookings
  bookingInitiated: number;
  bookingCompleted: number;
  sessionCompleted: number;
}

const emptyAgg = (): UserAgg => ({
  moodTotal: 0,
  moodDays: new Set(),
  moodDayCounts: {},
  moodDaysLast7: new Set(),
  energyTotal: 0,
  energyDays: new Set(),
  energyDayCounts: {},
  energyDaysLast7: new Set(),
  journalTotal: 0,
  journalDays: new Set(),
  journalTimeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
  gamePlays: {},
  chatUserMsgs: 0,
  chatAiMsgs: 0,
  chatConversations: new Set(),
  voiceMsgs: 0,
  voiceSessions: new Map(),
  bookingInitiated: 0,
  bookingCompleted: 0,
  sessionCompleted: 0,
});

/* ────────────────────────────────────────────────────────────
   MAIN: single-pass end-to-end analytics
   Returns BOTH per-user rows AND cumulative cohort/segment stats.
──────────────────────────────────────────────────────────── */

export const getUserAnalytics = async () => {
  // 1) Top-level collections
  const [usersSnap, bookingsSnap, therapistsSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "bookings")),
    getDocs(collection(db, "therapists")),
  ]);

  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));

  const therapistName: Record<string, string> = {};
  therapistsSnap.docs.forEach((d) => {
    const t = d.data() as any;
    therapistName[t.uid || d.id] = t.name || t.fullName || d.id;
  });

  // 2) Seed aggregate map from users (so users with no sub-docs still appear)
  const agg = new Map<string, UserAgg>();
  users.forEach((u) => agg.set(u.id, emptyAgg()));
  const ensure = (uid: string | null): UserAgg | null => {
    if (!uid) return null;
    let a = agg.get(uid);
    if (!a) {
      a = emptyAgg();
      agg.set(uid, a);
    }
    return a;
  };

  // 3) Bookings → per-user counts
  bookingsSnap.docs.forEach((d) => {
    const b = d.data() as any;
    const a = ensure(b.userId);
    if (!a) return;
    a.bookingInitiated += 1;
    if (b.status === "completed") a.bookingCompleted += 1;
    if (b.sessionCompleted === true || b.status === "completed")
      a.sessionCompleted += 1;
  });

  // 4) Per-user subcollections via EXPLICIT nested paths.
  //    Path shape (confirmed): users/{uid}/moodLogs, /energyLogs, /journals,
  //    /games. Read in batches so we don't open thousands of sockets at once.
  const BATCH_SIZE = 20;

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (u) => {
        const uid = u.id;
        const a = agg.get(uid)!;

        try {
          const [moodS, energyS, journalS, gamesS] = await Promise.all([
            getDocs(collection(db, "users", uid, "moodLogs")),
            getDocs(collection(db, "users", uid, "energyLogs")),
            getDocs(collection(db, "users", uid, "journals")),
            getDocs(collection(db, "users", uid, "games")),
          ]);

          // Mood logs
          moodS.docs.forEach((doc) => {
            const dt = toJSDate((doc.data() as any).createdAt);
            a.moodTotal += 1;
            if (dt) {
              const k = dayKey(dt);
              a.moodDays.add(k);
              a.moodDayCounts[k] = (a.moodDayCounts[k] || 0) + 1;
              if (withinLastDays(dt, 7)) a.moodDaysLast7.add(k);
            }
          });

          // Energy logs
          energyS.docs.forEach((doc) => {
            const dt = toJSDate((doc.data() as any).createdAt);
            a.energyTotal += 1;
            if (dt) {
              const k = dayKey(dt);
              a.energyDays.add(k);
              a.energyDayCounts[k] = (a.energyDayCounts[k] || 0) + 1;
              if (withinLastDays(dt, 7)) a.energyDaysLast7.add(k);
            }
          });

          // Journals
          journalS.docs.forEach((doc) => {
            const dt = toJSDate((doc.data() as any).createdAt);
            a.journalTotal += 1;
            if (dt) {
              a.journalDays.add(dayKey(dt));
              a.journalTimeOfDay[timeOfDay(dt)] += 1;
            }
          });

          // Games (replay) — grouped by `name`
          gamesS.docs.forEach((doc) => {
            const data = doc.data() as any;
            const name = data.name || data.gameName;
            if (!name) return;
            a.gamePlays[name] = (a.gamePlays[name] || 0) + 1;
          });
        } catch (e) {
          console.error("Subcollection fetch failed for user", uid, e);
        }
      })
    );
  }

  // 5) Messages (chat vs handsfree) — one collection-group read.
  //    Proven-safe in this project (see dashboard.ts getTotalAIMessages).
  //    Wrapped so a failure degrades gracefully instead of crashing the page.
  try {
    const messagesSnap = await getDocs(collectionGroup(db, "messages"));
    messagesSnap.docs.forEach((d) => {
      const { uid, type, cid } = messageOwner(d);
      const a = ensure(uid);
      if (!a || !cid) return;
      const m = d.data() as any;

      if (type === "voiceConversations") {
        a.voiceMsgs += 1;
        const t = toJSDate(m.createdAt)?.getTime() ?? Date.now();
        const s = a.voiceSessions.get(cid) || { min: t, max: t };
        s.min = Math.min(s.min, t);
        s.max = Math.max(s.max, t);
        a.voiceSessions.set(cid, s);
      } else {
        // conversations (text chat)
        a.chatConversations.add(cid);
        if (m.sender === "ai") a.chatAiMsgs += 1;
        else a.chatUserMsgs += 1;
      }
    });
  } catch (e) {
    console.error("messages collectionGroup failed (AI metrics skipped):", e);
  }

  // 6) Per-user rows
  const rows = users.map((u) => {
    const a = agg.get(u.id)!;

    const multiPerDayMood = Object.values(a.moodDayCounts).some((c) => c >= 2);
    const multiPerDayEnergy = Object.values(a.energyDayCounts).some(
      (c) => c >= 2
    );

    // voice duration (sum of session spans, seconds)
    let voiceSeconds = 0;
    a.voiceSessions.forEach((s) => (voiceSeconds += (s.max - s.min) / 1000));
    const voiceSessionCount = a.voiceSessions.size;

    const usedChat = a.chatUserMsgs + a.chatAiMsgs > 0;
    const usedVoice = a.voiceMsgs > 0;

    return {
      userId: u.id,
      name: u.name || "Elma User",
      email: u.email || "",
      phone: u.phone || "",
      signup_method: signupMethod(u),

      app_open: u.appOpenCount || 0,

      // Onboarding
      onboarding_completed: u.onBoradingFinished ? "Yes" : "No",
      onboarding_games_completed: furthestOnboardingGame(u),
      profile_percent: getGameCompletionPercent(u),

      // Assessment
      assessment_started: u.assesmentStarted ? "Yes" : "No",
      assessment_completed: u.assesmentCompleted ? "Yes" : "No",

      // Mood
      mood_logged: a.moodTotal,
      mood_days: a.moodDays.size,
      mood_multi_per_day: multiPerDayMood ? "Yes" : "No",
      mood_days_last7: a.moodDaysLast7.size,

      // Energy
      energy_logged: a.energyTotal,
      energy_days: a.energyDays.size,
      energy_multi_per_day: multiPerDayEnergy ? "Yes" : "No",
      energy_days_last7: a.energyDaysLast7.size,

      // Journal
      journal_entries: a.journalTotal,
      journal_days: a.journalDays.size,
      journal_time_of_day: a.journalTimeOfDay,

      // Games (replay counts)
      calm_in_60: a.gamePlays["calm_in_60"] || 0,
      insight_sicker: a.gamePlays["insight_sicker"] || 0,
      strength_builder: a.gamePlays["strength_builder"] || 0,

      // AI usage
      ai_chat_opened: u.aiChatOpened || 0,
      ai_chat_msgs: a.chatUserMsgs,
      ai_chat_conversations: a.chatConversations.size,
      handsfree_msgs: a.voiceMsgs,
      handsfree_sessions: voiceSessionCount,
      handsfree_minutes: round2(voiceSeconds / 60),
      handsfree_avg_session_min: round2(
        voiceSessionCount ? voiceSeconds / 60 / voiceSessionCount : 0
      ),
      ai_usage_type:
        usedChat && usedVoice
          ? "Both"
          : usedChat
          ? "Chat only"
          : usedVoice
          ? "Handsfree only"
          : "None",

      // Experts / therapists
      therapist_profile_viewed: u.therapistProfileViewCount || 0,
      booking_initiated: a.bookingInitiated,
      booking_completed: a.bookingCompleted,
      session_completed: a.sessionCompleted,

      // raw for filters
      _raw: u,
    };
  });

  /* ──────────────────────────────────────────────────────────
     7) CUMULATIVE COHORTS / SEGMENTS
  ────────────────────────────────────────────────────────── */

  const total = users.length;

  // Onboarding funnel
  const finished = (k: string) => users.filter((u) => u[k]).length;
  const onboarding = {
    total,
    game1: finished("gameOneFinished"),
    game2: finished("gameTwoFinished"),
    game3: finished("gameThreeFinished"),
    game4: finished("gameFourFinished"),
    game5: finished("gameFiveFinished"),
    game6: finished("gameSixFinished"),
    completed: users.filter((u) => u.onBoradingFinished).length,
    till_game4: finished("gameFourFinished"),
    till_game5: finished("gameFiveFinished"),
    till_game6: finished("gameSixFinished"),
  };

  // Signup split
  const signup: Record<string, number> = {
    Phone: 0,
    Email: 0,
    Google: 0,
    Apple: 0,
    Unknown: 0,
  };
  users.forEach((u) => (signup[signupMethod(u)] += 1));

  // Games cohorts
  const games = GAMES.map(({ key, label }) => {
    let players = 0;
    let plays = 0;
    agg.forEach((a) => {
      const c = a.gamePlays[key] || 0;
      if (c > 0) players += 1;
      plays += c;
    });
    return {
      key,
      label,
      players,
      totalPlays: plays,
      avgPerPlayer: players ? round2(plays / players) : 0,
    };
  });

  // Mood / Energy cohorts
  const cohort = (kind: "mood" | "energy") => {
    let taggers = 0;
    let daily = 0; // logged all 7 of the last 7 days
    let multi = 0; // 2+ on some day
    let totalLogs = 0;
    const dist = [0, 0, 0, 0, 0, 0, 0, 0]; // index 0..7 = distinct days in last 7
    agg.forEach((a) => {
      const totalKey = kind === "mood" ? a.moodTotal : a.energyTotal;
      const last7 =
        kind === "mood" ? a.moodDaysLast7.size : a.energyDaysLast7.size;
      const counts = kind === "mood" ? a.moodDayCounts : a.energyDayCounts;
      if (totalKey > 0) taggers += 1;
      if (last7 >= 7) daily += 1;
      if (Object.values(counts).some((c) => c >= 2)) multi += 1;
      totalLogs += totalKey;
      dist[Math.min(last7, 7)] += 1;
    });
    return {
      taggers,
      daily,
      multiPerDay: multi,
      totalLogs,
      last7Distribution: dist,
    };
  };

  const mood = cohort("mood");
  const energy = cohort("energy");

  // Journal cohort
  let journalWriters = 0;
  let journalTotal = 0;
  const journalTOD = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  agg.forEach((a) => {
    if (a.journalTotal > 0) journalWriters += 1;
    journalTotal += a.journalTotal;
    journalTOD.morning += a.journalTimeOfDay.morning;
    journalTOD.afternoon += a.journalTimeOfDay.afternoon;
    journalTOD.evening += a.journalTimeOfDay.evening;
    journalTOD.night += a.journalTimeOfDay.night;
  });

  // AI usage cohorts
  let chatUsers = 0;
  let voiceUsers = 0;
  let chatOnly = 0;
  let voiceOnly = 0;
  let both = 0;
  let none = 0;
  let totalChatMsgs = 0;
  let totalVoiceMsgs = 0;
  let totalVoiceSessions = 0;
  let totalVoiceSeconds = 0;
  agg.forEach((a) => {
    const c = a.chatUserMsgs + a.chatAiMsgs > 0;
    const v = a.voiceMsgs > 0;
    if (c) chatUsers += 1;
    if (v) voiceUsers += 1;
    if (c && v) both += 1;
    else if (c) chatOnly += 1;
    else if (v) voiceOnly += 1;
    else none += 1;
    totalChatMsgs += a.chatUserMsgs + a.chatAiMsgs;
    totalVoiceMsgs += a.voiceMsgs;
    totalVoiceSessions += a.voiceSessions.size;
    a.voiceSessions.forEach((s) => (totalVoiceSeconds += (s.max - s.min) / 1000));
  });

  const ai = {
    chatUsers,
    voiceUsers,
    chatOnly,
    voiceOnly,
    both,
    none,
    totalChatMsgs,
    totalVoiceMsgs,
    totalVoiceSessions,
    avgVoiceMinutesPerSession: totalVoiceSessions
      ? round2(totalVoiceSeconds / 60 / totalVoiceSessions)
      : 0,
    avgVoiceMinutesPerUser: voiceUsers
      ? round2(totalVoiceSeconds / 60 / voiceUsers)
      : 0,
    avgVoiceSessionsPerUser: voiceUsers
      ? round2(totalVoiceSessions / voiceUsers)
      : 0,
  };

  // Therapist / experts
  let totalProfileViews = 0;
  let usersViewedProfiles = 0;
  users.forEach((u) => {
    const v = u.therapistProfileViewCount || 0;
    totalProfileViews += v;
    if (v > 0) usersViewedProfiles += 1;
  });

  // Per-psychologist views (only if the app writes therapistProfileViews docs)

  

  const segments = {
    totalUsers: total,
    onboarding,
    signup,
    games,
    mood,
    energy,
    journal: {
      writers: journalWriters,
      totalEntries: journalTotal,
      timeOfDay: journalTOD,
    },
    ai,
    consistency: {
      // index 1..7 = number of users who logged mood/energy on that many
      // distinct days in the last 7 days
      mood: mood.last7Distribution,
      energy: energy.last7Distribution,
    },
    therapist: {
      totalProfileViews,
      usersViewedProfiles,
    },
  };

  return { rows, segments };
};

/* ────────────────────────────────────────────────────────────
   FILTERING (client-side, mirrors Dashboard cards)
──────────────────────────────────────────────────────────── */

export const filterRows = (rows: any[], filter: string) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  switch (filter) {
    case "Active Users":
      return rows.filter((r) => {
        const d = toJSDate(r._raw?.updatedAt);
        return d && d >= startOfToday;
      });
    case "New Users Today":
      return rows.filter((r) => {
        const d = toJSDate(r._raw?.createdAt);
        return d && d >= startOfToday;
      });
    case "Completed Onbording Users":
      return rows.filter((r) => r._raw?.onBoradingFinished === true);
    case "Partially Onbording Users":
      return rows.filter(
        (r) =>
          (r._raw?.name || r._raw?.ageGroup) &&
          (!r._raw?.gender || !r._raw?.sleepStyle || !r._raw?.stressLevel)
      );
    case "Non Onbording Users":
      return rows.filter((r) => !r._raw?.name || !r._raw?.ageGroup);
    case "One Game Finished Users":
      return rows.filter((r) => r._raw?.gameOneFinished);
    case "Two Game Finished Users":
      return rows.filter((r) => r._raw?.gameTwoFinished);
    case "Three Game Finished Users":
      return rows.filter((r) => r._raw?.gameThreeFinished);
    case "Four Game Finished Users":
      return rows.filter((r) => r._raw?.gameFourFinished);
    case "Five Game Finished Users":
      return rows.filter((r) => r._raw?.gameFiveFinished);
    case "Six Game Finished Users":
      return rows.filter((r) => r._raw?.gameSixFinished);
    default:
      return rows;
  }
};

/* ────────────────────────────────────────────────────────────
   BACK-COMPAT WRAPPER
   Old signature kept so nothing else breaks. Prefer getUserAnalytics.
──────────────────────────────────────────────────────────── */

export const getAllUserAnalytics = async (
  limit = 20,
  page = 1,
  filter: string = "Total Users"
) => {
  try {
    const { rows, segments } = await getUserAnalytics();
    const filtered = filterRows(rows, filter);
    const start = (page - 1) * limit;
    return {
      page,
      limit,
      totalUsers: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      data: filtered.slice(start, start + limit),
      segments,
    };
  } catch (error) {
    console.error("Error getting analytics:", error);
    return {
      page,
      limit,
      totalUsers: 0,
      totalPages: 0,
      data: [],
      segments: null,
    };
  }
};
