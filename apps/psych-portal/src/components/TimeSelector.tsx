import React, { useEffect, useState } from "react";
import "./Therapits.css";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  addDoc,
  collection,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { hasOverlap } from "../utils/helper";
import { useNavigate } from "react-router-dom";
import { ConnectGoogleCalendar } from "./GoogleCalendar";
import TherapistCalendar from "./TherapistCalendar";
import { getAvailability } from "../services/availabilty";

type Slot = {
  startTime: Date;
  endTime: Date;
};

export default function TherapistTimeSelector() {
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [events, setEvents] = useState([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const therapistDataString = localStorage.getItem("therapist");
  const therapist = therapistDataString
    ? JSON.parse(therapistDataString)
    : null;

  const tid = therapist.id;
  const navigate = useNavigate();

  const setEventsByfetching = async () => {
    try {
      const res = await getAvailability(tid);
      setEvents(res);
    } catch (err) {}
  };

  useEffect(() => {
    setEventsByfetching();
  }, []);

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

  const formatDateTime = (timestamp: any) => {
    const date = new Date(timestamp);
    return date
      .toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "");
  };

  const handleSubmit = async () => {
    try {
      const therapistDataString = localStorage.getItem("therapist");
      const therapist = therapistDataString
        ? JSON.parse(therapistDataString)
        : null;

      const uid = therapist?.id || "X2pNVdjtRBpBfEoEKaE3";

      if (!slots || slots.length === 0) return;

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
      navigate("/");
      setSlots([]);
    } catch (error) {
      console.error("❌ Error updating availability:", error);
    }
  };

  const handleCreateUnavailable = async (payload: {
    therapistId: string;
    startTime: any;
    endTime: any;
    status: "unavailable";
    createdAt: any;
  }) => {
    try {
      await addDoc(collection(db, "therapistAvailabilty"), payload);
      console.log("✅ Unavailability saved");
    } catch (err) {
      console.error("❌ Failed to save unavailability", err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="top-bar">
        <h1>Therapist Schedule</h1>
        <ConnectGoogleCalendar />
      </div>

      {/* Calendar Section */}
      <div className="calendar-section">
        <TherapistCalendar therapistId={tid} onCreateUnavailable={handleCreateUnavailable} availabilities={events} />
      </div>

      
    </div>
  );
}
