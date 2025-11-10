import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthClient from "../hooks/useAuthClient";

export function useTherapistGuard() {
  const { user, therapistDoc, loading } = useAuthClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate("/auth/sign-in");
    } else if (!therapistDoc) {
      navigate("/unauthorized");
    }
  }, [user, therapistDoc, loading, navigate]);

  return { user, therapistDoc, loading };
}
