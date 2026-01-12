import {
  Timestamp,
} from "firebase/firestore";
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
export const hasOverlap = (slots: {
  startTime: Timestamp;
  endTime: Timestamp;
}[]): boolean => {
  const sorted = [...slots].sort(
    (a, b) => a.startTime.toMillis() - b.startTime.toMillis()
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].endTime.toMillis();
    const nextStart = sorted[i + 1].startTime.toMillis();

    if (nextStart < currentEnd) {
      return true; // ❌ overlapping
    }
  }
  return false;
};
