import { useState, useEffect } from "react";
import { listen } from "shared-core/auth";
import { auth } from "shared-core/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "shared-core/firebase";

export default function useAuthClient() {
  const [user, setUser] = useState(auth.currentUser);
  const [therapistDoc, setTherapistDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listen(async (u) => {
      setUser(u);
      if (u) {
        // Check if therapist doc exists
        const docRef = doc(db, "therapists", u.uid);
        const docSnap = await getDoc(docRef);
        setTherapistDoc(docSnap.exists() ? docSnap.data() : null);
      } else {
        setTherapistDoc(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, therapistDoc, loading };
}
