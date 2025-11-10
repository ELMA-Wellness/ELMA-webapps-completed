// IST helpers (UTC+5:30)

function toIST(date = new Date()) {
  // Convert to IST by adding offset
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 60 * 60 * 1000);
}

export function getTodayBoundsIST() {
  const nowIST = toIST();
  const start = new Date(nowIST);
  start.setHours(0, 0, 0, 0);
  const end = new Date(nowIST);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getMonthKey(d = new Date()) {
  const ist = toIST(d);
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function formatDate(date) {
  return toIST(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date) {
  return toIST(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
