import React, { useState } from "react";
import "./Therapits.css";
import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection, writeBatch } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { hasOverlap } from "../utils/helper";
import { useNavigate } from "react-router-dom";

type Slot = {
    startTime: Date;
    endTime: Date;
};

export default function TherapistTimeSelector() {
    const [adding, setAdding] = useState(false);
    const [date, setDate] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [slots, setSlots] = useState<Slot[]>([]);

    const navigate=useNavigate()

    // 🔥 Firestore-style formatter
    const formatFirestoreStyle = (date: Date) => {
        const longDate = date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });

        const time = date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
        });

        const offsetMinutes = date.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
        const offsetMins = Math.abs(offsetMinutes) % 60;
        const sign = offsetMinutes <= 0 ? "+" : "-";

        const timezone = `UTC${sign}${offsetHours}:${offsetMins
            .toString()
            .padStart(2, "0")}`;

        return `${longDate} at ${time} ${timezone}`;
    };

    const saveSlot = () => {
        if (!date || !start || !end) return alert("Please select all fields");

        const s = new Date(`${date}T${start}`);
        const e = new Date(`${date}T${end}`);

        if (s >= e) {
            alert("End time must be greater than start time.");
            return;
        }

        setSlots([...slots, { startTime: s, endTime: e }]);
        setStart("");
        setEnd("");
        setAdding(false);
    };

    const formatTime = (timestamp: any) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };
    const formatDateTime = (timestamp: any) => {
        const date = new Date(timestamp);

        return date.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",  // Jan, Feb, Mar...
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).replace(",", "");
    };
   

    const handleSubmit = async () => {
        
        try {
            const therapistDataString = localStorage.getItem("therapist");
            const therapist = therapistDataString
                ? JSON.parse(therapistDataString)
                : null;

            const uid = therapist?.id || "X2pNVdjtRBpBfEoEKaE3";

            if (!slots || slots.length === 0) {
                console.warn("No slots to add");
                return;
            }

            // ❌ STOP if overlapping slots
           

            const batch = writeBatch(db);
            const availabilityRef = collection(db, "therapistAvailabilty");

            slots.forEach((slot) => {
                const docRef = doc(availabilityRef);
                batch.set(docRef, {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    therapistId: uid,
                    status: "free",
                    createdAt: new Date(),
                });
            });

            await batch.commit();
            console.log("✅ Availability updated successfully!");
            navigate('/')
            setSlots([])
            
        } catch (error) {
            console.error("❌ Error updating availability:", error);
        }
    };



    console.log(slots)


    return (
        <div className="page-container">
            {/* Main Page */}
            {!adding && (
                <div className="card">
                    <h1 className="title">Therapist Availability</h1>

                    <div className="form-group">
                        <label>Select Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <button
                        className={`primary-btn ${!date ? "disabled" : ""}`}
                        disabled={!date}
                        onClick={() => setAdding(true)}
                    >
                        Add time slot for unavailability
                    </button>

                    <div className="slots-section">
                        <h2 className="section-title">Added Time Slots</h2>

                        {slots.length === 0 && <p className="empty">No slots added yet.</p>}

                        {slots.map((slot, i) => (
                            <div className="slot-card" key={i}>
                                <p>
                                    <strong>Start:</strong>{" "}
                                    {formatDateTime(slot.startTime)}
                                </p>
                                <p>
                                    <strong>End:</strong> {formatDateTime(slot.endTime)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <button onClick={handleSubmit} className="submit-btn">Confirm</button>
                </div>
            )}

            {/* Add Slot Page */}
            {adding && (
                <div className="slide-card">
                    <h2 className="title-small">Add Time Slot</h2>

                    <div className="form-group">
                        <label>Start Time</label>
                        <input
                            type="time"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>End Time</label>
                        <input
                            type="time"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </div>

                    <button className="primary-btn" onClick={saveSlot}>
                        Save Slot
                    </button>

                    <button className="cancel-btn" onClick={() => setAdding(false)}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}


