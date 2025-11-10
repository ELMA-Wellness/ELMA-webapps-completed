import { useNavigate } from "react-router-dom";
import { signOut } from "shared-core/auth";
import Button from "shared-ui/Button";

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  return (
    <div className="min-h-screen bg-elma-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-elma-ink mb-2">Access Denied</h1>
        <p className="text-elma-ink/60 mb-6">
          You don't have a therapist profile. Please contact an administrator.
        </p>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
