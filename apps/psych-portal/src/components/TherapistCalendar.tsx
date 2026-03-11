import React, { useMemo, useCallback, useState } from "react";
import { Calendar, dateFnsLocalizer, SlotInfo } from "react-big-calendar";
import { format, startOfWeek, getDay, format as dateFnsFormat } from "date-fns";
import { enUS } from "date-fns/locale";
import { serverTimestamp, Timestamp } from "firebase/firestore";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

const locales = { "en-US": enUS };

// ─── Custom Event Renderer ────────────────────────────────────────────────────
// Keeps event blocks simple — interaction is handled via onSelectEvent
const CustomEvent = ({ event }: { event: any }) => {
  const iconMap: Record<string, string> = {
    booked: "📅",
    cancelled: "✕",
    unavailable: "🚫",
    selected: "✎",
  };

  return (
    <div className={`cal-event cal-event--${event.status}`}>
      <span className="cal-event__icon">{iconMap[event.status] ?? ""}</span>
      
    </div>
  );
};

// ─── Localizer ────────────────────────────────────────────────────────────────
const localizer = dateFnsLocalizer({ format, startOfWeek, getDay, locales });

// ─── Types ────────────────────────────────────────────────────────────────────
interface Availability {
  id: string;
  therapistId: string;
  startTime: any;
  endTime: any;
  status: "free" | "booked" | "cancelled" | "unavailable";
}

interface Props {
  therapistId: string;
  availabilities: Availability[];
  onCreateUnavailable: (payload: {
    therapistId: string;
    startTime: Timestamp;
    endTime: Timestamp;
    status: "unavailable";
    createdAt: any;
  }) => void;
  onRemoveUnavailable: (availabilityId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toDate = (value: any): Date => {
  if (!value) return new Date();
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const now = () => new Date();

const fmtTime = (d: Date) => dateFnsFormat(d, "EEE d MMM, h:mm a");

// ─── Component ────────────────────────────────────────────────────────────────
const TherapistCalendar: React.FC<Props> = ({
  therapistId,
  availabilities,
  onCreateUnavailable,
  onRemoveUnavailable,
}) => {
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
  const [pendingRemove, setPendingRemove] = useState<{ id: string; start: Date; end: Date } | null>(null);

  // ── Events ──────────────────────────────────────────────────────────────
  const events = useMemo(() => {
    const base = availabilities
      .filter((a) => a.status !== "free")
      .map((a) => ({
        id: a.id,
        title:
          a.status === "booked" ? "Booked" :
          a.status === "cancelled" ? "Cancelled" : "Unavailable",
        start: toDate(a.startTime),
        end: toDate(a.endTime),
        status: a.status,
      }));

    if (selectedRange) {
      base.push({
        id: "selected-preview",
        title: "Selected",
        start: selectedRange.start,
        end: selectedRange.end,
        status: "selected",
      } as any);
    }

    return base;
  }, [availabilities, selectedRange]);

  // ── Overlap guard ────────────────────────────────────────────────────────
  const isOverlapping = useCallback(
    (start: Date, end: Date) =>
      events.some((e: any) => {
        if (e.status !== "booked" && e.status !== "unavailable") return false;
        return start < e.end && end > e.start;
      }),
    [events]
  );

  // ── Draw new slot ────────────────────────────────────────────────────────
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      setPendingRemove(null);
      const start = slotInfo.start as Date;
      const end = slotInfo.end as Date;
      if (start < now()) return;
      if (start < startOfToday()) return;
      if (end <= start) return;
      if (isOverlapping(start, end)) return;
      setSelectedRange({ start, end });
    },
    [isOverlapping]
  );

  // ── Click existing event (the reliable way) ──────────────────────────────
  const handleSelectEvent = useCallback((event: any) => {
    if (event.status !== "unavailable") return;
    if (event.end < now()) return;
    setSelectedRange(null);
    setPendingRemove({ id: event.id, start: event.start, end: event.end });
  }, []);

  // ── Confirm: mark unavailable ────────────────────────────────────────────
  const confirmUnavailable = useCallback(() => {
    if (!selectedRange) return;
    onCreateUnavailable({
      therapistId,
      startTime: Timestamp.fromDate(selectedRange.start),
      endTime: Timestamp.fromDate(selectedRange.end),
      status: "unavailable",
      createdAt: serverTimestamp(),
    });
    setSelectedRange(null);
  }, [selectedRange, therapistId, onCreateUnavailable]);

  // ── Confirm: make available ───────────────────────────────────────────────
  const confirmMakeAvailable = useCallback(() => {
    if (!pendingRemove) return;
    onRemoveUnavailable(pendingRemove.id);
    setPendingRemove(null);
  }, [pendingRemove, onRemoveUnavailable]);

  // ── Event styles ─────────────────────────────────────────────────────────
  const eventStyleGetter = useCallback((event: any) => {
    if (event.end < now()) {
      return { style: { opacity: 0.4, pointerEvents: "none" as const } };
    }
    const styles: Record<string, React.CSSProperties> = {
      booked:      { backgroundColor: "#E8F0FE", color: "#1A73E8", borderLeft: "4px solid #1A73E8" },
      cancelled:   { backgroundColor: "#FCE8E6", color: "#A50E0E", borderLeft: "4px solid #EA4335", textDecoration: "line-through" },
      unavailable: { backgroundColor: "#F3F4F6", color: "#374151", borderLeft: "4px solid #9CA3AF", cursor: "pointer" },
      selected:    { backgroundColor: "#FEF3C7", color: "#92400E", border: "2px dashed #F59E0B" },
    };
    return { style: styles[event.status] ?? {} };
  }, []);

  // ── Day styles ───────────────────────────────────────────────────────────
  const dayPropGetter = useCallback((date: Date) => {
    if (date < startOfToday()) {
      return { style: { backgroundColor: "#F9FAFB", pointerEvents: "none" as const, opacity: 0.5 } };
    }
    return {};
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["week", "day"]}
        defaultView="week"
        defaultDate={new Date()}
        step={30}
        timeslots={2}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onNavigate={(date) => { if (date < startOfToday()) return; }}
        dayPropGetter={dayPropGetter}
        eventPropGetter={eventStyleGetter}
        scrollToTime={new Date()}
        style={{ height: "100%" }}
        components={{ event: (props: any) => <CustomEvent {...props} /> }}
      />

      {/* ── Mark unavailable confirm bar ── */}
      {selectedRange && !pendingRemove && (
        <div className="confirm-bar confirm-bar--mark">
          <div className="confirm-bar__info">
            <span className="confirm-bar__label">Mark as unavailable?</span>
            <span className="confirm-bar__time">
              {fmtTime(selectedRange.start)} → {fmtTime(selectedRange.end)}
            </span>
          </div>
          <div className="confirm-bar__actions">
            <button className="confirm-bar__btn confirm-bar__btn--primary" onClick={confirmUnavailable}>
              Confirm
            </button>
            <button className="confirm-bar__btn confirm-bar__btn--ghost" onClick={() => setSelectedRange(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Make available confirm bar ── */}
      {pendingRemove && !selectedRange && (
        <div className="confirm-bar confirm-bar--free">
          <div className="confirm-bar__info">
            <span className="confirm-bar__label">Make this time available?</span>
            <span className="confirm-bar__time">
              {fmtTime(pendingRemove.start)} → {fmtTime(pendingRemove.end)}
            </span>
          </div>
          <div className="confirm-bar__actions">
            <button className="confirm-bar__btn confirm-bar__btn--green" onClick={confirmMakeAvailable}>
              Make Available
            </button>
            <button className="confirm-bar__btn confirm-bar__btn--ghost" onClick={() => setPendingRemove(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistCalendar;