import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config"; // adjust path

export const getAllTherapistInformation = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const bookingsRef = collection(db, "bookings");

    const bookingsQuery = query(
      bookingsRef,
      where("paymentStatus", "==", "completed")
    );

    const bookingsSnap = await getDocs(bookingsQuery);

    const therapistMap: Record<string, any> = {};

    bookingsSnap.forEach((docSnap) => {
      const booking = docSnap.data();

      const therapistId = booking.therapistId;
      const amount = booking.amount || 0;
      const bookingDate = new Date(booking.bookingDate);

      if (!therapistMap[therapistId]) {
        therapistMap[therapistId] = {
          therapistId,
          monthSessions: 0,
          lifetimeSessions: 0,
          monthPayout: 0,
          lifetimePayout: 0,
        };
      }

      // Lifetime
      therapistMap[therapistId].lifetimeSessions += 1;
      therapistMap[therapistId].lifetimePayout += amount;

      // Monthly
      if (
        bookingDate >= startOfMonth &&
        bookingDate <= endOfMonth
      ) {
        therapistMap[therapistId].monthSessions += 1;
        therapistMap[therapistId].monthPayout += amount;
      }
    });

    // Fetch therapist names
    const therapistIds = Object.keys(therapistMap);

    const therapistPromises = therapistIds.map(async (id) => {
      const therapistRef = doc(db, "therapists", id);
      const therapistSnap = await getDoc(therapistRef);

      return {
        ...therapistMap[id],
        name: therapistSnap.exists()
          ? therapistSnap.data().name
          : "Unknown Therapist",
      };
    });

    const result = await Promise.all(therapistPromises);

    return result;
  } catch (err) {
    console.error("Error fetching therapist payouts:", err);
    throw err;
  }
};
