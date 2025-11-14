// packages/shared-core/dates.js

// --- Base helper: convert any Date to IST (UTC+5:30) -----------------
function toIST(date = new Date()) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  return new Date(utcMs + 5.5 * 60 * 60 * 1000);
}

// Today 00:00–23:59 IST
export function getTodayBoundsIST() {
  const now = toIST();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Month key "YYYY-MM" in IST
export function getMonthKey(d = new Date()) {
  const ist = toIST(d);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// Date N days ago (00:00 IST)
export function daysAgoIST(n) {
  const now = toIST();
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Nicely format a Date / Firestore Timestamp to IST string
export function formatDate(value, options = {}) {
  if (!value) return "";

  let d;

  // Firestore Timestamp has .toDate()
  if (value instanceof Date) {
    d = value;
  } else if (value && typeof value.toDate === "function") {
    d = value.toDate();
  } else {
    d = new Date(value);
  }

  const fmt = {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
    ...options,
  };

  try {
    return d.toLocaleString("en-IN", fmt);
  } catch {
    // Fallback – should rarely be needed
    return d.toISOString();
  }
}
// --- Pretty-print a date/time in IST for UI (used by Bookings.jsx) ---
export function formatDateTimeIST(value) {
  if (!value) return "—";

  let d;

  // Firestore Timestamp
  if (value.toDate) {
    d = value.toDate();
  }
  // Already a JS Date
  else if (value instanceof Date) {
    d = value;
  }
  // ISO string / millis etc.
  else {
    d = new Date(value);
  }

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
