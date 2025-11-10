import { useState, useEffect } from "react";
import { listen, getClaims } from "shared-core/auth";
import { auth } from "shared-core/firebase";

export default function useAuthClient() {
  const [user, setUser] = useState(auth.currentUser);
  const [claims, setClaims] = useState({ admin: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listen(async (u) => {
      setUser(u);
      if (u) {
        const userClaims = await getClaims();
        setClaims(userClaims);
      } else {
        setClaims({ admin: false });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, claims, loading };
}
