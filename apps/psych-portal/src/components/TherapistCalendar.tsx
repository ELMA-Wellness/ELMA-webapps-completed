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
                <button className="confirm-btn" onClick={onConfirm}>
                    Mark Unavailable
                </button>
                <button className="cancel-btn" onClick={onCancel}>✕</button>
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

// 🔒 SAFE DATE NORMALIZER
const toDate = (value: any): Date => {
    if (!value) return new Date();
    if (typeof value.toDate === "function") return value.toDate();
    if (value instanceof Date) return value;
    return new Date(value);
};

const TherapistCalendar: React.FC<Props> = ({
    therapistId,
    availabilities,
    onCreateUnavailable,
}) => {
    // 🔥 Temporary selected range (UI only)
    const [selectedRange, setSelectedRange] = useState<{
        start: Date;
        end: Date;
    } | null>(null);

    // 📌 Existing events
    const events = useMemo(() => {
        const baseEvents = availabilities.map((a) => ({
            id: a.id,
            title:
                a.status === "free"
                    ? "Available"
                    : a.status === "booked"
                        ? "Booked"
                        : a.status === "cancelled"
                            ? "Cancelled"
                            : "Unavailable",
            start: toDate(a.startTime),
            end: toDate(a.endTime),
            status: a.status,
        }));

        // 👇 Add preview selected event
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

    // 🖱️ Handle interval selection
    const handleSelectSlot = useCallback(
        (slotInfo: SlotInfo) => {
            const start = slotInfo.start as Date;
            const end = slotInfo.end as Date;

            if (end <= start) return;

            if (isOverlapping(start, end, events)) {
                console.warn("🚫 Slot overlaps unavailable/booked");
                return;
            }

            setSelectedRange({ start, end });
        },
        [events]
    );


    // 💾 Save selected interval
    const confirmUnavailable = () => {
        if (!selectedRange) return;

        onCreateUnavailable({
            therapistId,
            startTime: Timestamp.fromDate(selectedRange.start),
            endTime: Timestamp.fromDate(selectedRange.end),
            status: "unavailable",
            createdAt: serverTimestamp(),
        });

        setSelectedRange(null); // clear preview
    };

    // 🎨 Event styling
    const eventStyleGetter = (event: any) => {
        switch (event.status) {
            case "free":
                return {
                    style: {
                        backgroundColor: "#E6F4EA",
                        color: "#137333",
                        borderLeft: "4px solid #34A853",
                    },
                };
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

    const isOverlapping = (
        start: Date,
        end: Date,
        events: any[]
    ): boolean => {
        return events.some((e) => {
            if (e.status !== "unavailable" && e.status !== "booked") return false;

            return start < e.end && end > e.start;
        });
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
                step={30}
                timeslots={2}
                selectable={(slotInfo: { start: Date; end: Date; }) => {
                    return !isOverlapping(
                        slotInfo.start as Date,
                        slotInfo.end as Date,
                        events
                    );
                }}
                onSelectSlot={handleSelectSlot}
                eventPropGetter={eventStyleGetter}
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
