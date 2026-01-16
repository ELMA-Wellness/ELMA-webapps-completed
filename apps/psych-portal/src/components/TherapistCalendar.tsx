import React, { useMemo, useCallback, useState } from "react";
import { Calendar, dateFnsLocalizer, SlotInfo } from "react-big-calendar";
import { format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { serverTimestamp, Timestamp } from "firebase/firestore";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

const locales = { "en-US": enUS };

const CustomEvent = ({ event, onConfirm, onCancel }: any) => {
  if (event.status !== "selected") {
    return <span>{event.title}</span>;
  }

  return (
    <div className="selected-event">
      <div className="selected-label">Selected</div>

      <div className="selected-actions">
        <button
          className="confirm-btn"
          onClick={(e) => {
            e.stopPropagation(); // 🔥 REQUIRED
            onConfirm();
          }}
        >
          Mark Unavailable
        </button>

        <button
          className="cancel-btn"
          onClick={(e) => {
            e.stopPropagation(); // 🔥 REQUIRED
            onCancel();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};


const localizer = dateFnsLocalizer({
  format,
  startOfWeek,
  getDay,
  locales,
});

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
}

// 🔒 Safe Date Normalizer
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

const TherapistCalendar: React.FC<Props> = ({
  therapistId,
  availabilities,
  onCreateUnavailable,
}) => {
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  // 📌 EVENTS (HIDE FREE)
  const events = useMemo(() => {
    const baseEvents = availabilities
      .filter((a) => a.status !== "free") // 🚫 hide free
      .map((a) => ({
        id: a.id,
        title:
          a.status === "booked"
            ? "Booked"
            : a.status === "cancelled"
            ? "Cancelled"
            : "Unavailable",
        start: toDate(a.startTime),
        end: toDate(a.endTime),
        status: a.status,
      }));

    if (selectedRange) {
      baseEvents.push({
        id: "selected-preview",
        title: "Selected",
        start: selectedRange.start,
        end: selectedRange.end,
        status: "selected",
      } as any);
    }

    return baseEvents;
  }, [availabilities, selectedRange]);

  // 🧠 OVERLAP CHECK
  const isOverlapping = (start: Date, end: Date) => {
    return events.some((e: any) => {
      if (e.status !== "booked" && e.status !== "unavailable") return false;
      return start < e.end && end > e.start;
    });
  };

  // 🖱️ SLOT SELECTION
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const start = slotInfo.start as Date;
      const end = slotInfo.end as Date;

      if (start < now()) return; // 🚫 past time
      if (start < startOfToday()) return; // 🚫 past day
      if (end <= start) return;
      if (isOverlapping(start, end)) return;

      setSelectedRange({ start, end });
    },
    [events]
  );

  // 💾 SAVE
  const confirmUnavailable = () => {
    if (!selectedRange) return;

    onCreateUnavailable({
      therapistId,
      startTime: Timestamp.fromDate(selectedRange.start),
      endTime: Timestamp.fromDate(selectedRange.end),
      status: "unavailable",
      createdAt: serverTimestamp(),
    });

    setSelectedRange(null);
  };

  // 🎨 EVENT STYLE
  const eventStyleGetter = (event: any) => {
    if (event.end < now()) {
      return {
        style: {
          opacity: 0.4,
          pointerEvents: "none",
        },
      };
    }

    switch (event.status) {
      case "booked":
        return {
          style: {
            backgroundColor: "#E8F0FE",
            color: "#1A73E8",
            borderLeft: "4px solid #1A73E8",
          },
        };
      case "cancelled":
        return {
          style: {
            backgroundColor: "#FCE8E6",
            color: "#A50E0E",
            borderLeft: "4px solid #EA4335",
            textDecoration: "line-through",
          },
        };
      case "unavailable":
        return {
          style: {
            backgroundColor: "#F3F4F6",
            color: "#374151",
            borderLeft: "4px solid #9CA3AF",
          },
        };
      case "selected":
        return {
          style: {
            backgroundColor: "#FEF3C7",
            color: "#92400E",
            border: "2px dashed #F59E0B",
          },
        };
      default:
        return {};
    }
  };

  // 📅 DISABLE PAST DAYS UI
  const dayPropGetter = (date: Date) => {
    if (date < startOfToday()) {
      return {
        style: {
          backgroundColor: "#F9FAFB",
          pointerEvents: "none",
          opacity: 0.5,
        },
      };
    }
    return {};
  };

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
        selectable={(slotInfo: { start: Date; end: Date }) => {
          if (slotInfo.start < startOfToday()) return false;
          if (slotInfo.start < now()) return false;
          return !isOverlapping(slotInfo.start, slotInfo.end);
        }}
        onSelectSlot={handleSelectSlot}
        onNavigate={(date) => {
          if (date < startOfToday()) return; // 🚫 block past navigation
        }}
        dayPropGetter={dayPropGetter}
        eventPropGetter={eventStyleGetter}
        scrollToTime={new Date()}
        style={{ height: "100%" }}
        components={{
                    event: (props) => (
                        <CustomEvent
                            {...props}
                            onConfirm={confirmUnavailable}
                            onCancel={() => setSelectedRange(null)}
                        />
                    ),
                }}
      />

      {selectedRange && (
        <div className="confirm-bar">
          <button onClick={confirmUnavailable}>Mark Unavailable</button>
          <button onClick={() => setSelectedRange(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default TherapistCalendar;
