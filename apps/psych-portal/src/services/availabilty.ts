import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface TherapistAvailability {
  id: string;
  therapistId: string;
  startTime: Date;
  endTime: Date;
  status: "free" | "busy";
  createdAt?: Date;
}

export const getAvailability = async (
  therapistId: string
): Promise<TherapistAvailability[]> => {
  try {
    const q = query(
      collection(db, "therapistAvailabilty"),
      where("therapistId", "==", therapistId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        therapistId: data.therapistId,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        createdAt: data.createdAt?.toDate(),
      };
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
};
