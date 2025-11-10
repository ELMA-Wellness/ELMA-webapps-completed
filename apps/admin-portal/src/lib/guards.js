import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthClient from "../hooks/useAuthClient";

export function useAdminGuard() {
  const { user, claims, loading } = useAuthClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate("/auth/sign-in");
    } else if (!claims.admin) {
      navigate("/unauthorized");
    }
  }, [user, claims, loading, navigate]);

  return { user, claims, loading };
}
