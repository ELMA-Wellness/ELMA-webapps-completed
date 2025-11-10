import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminGuard } from "../lib/guards";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Section from "shared-ui/Section";
import Button from "shared-ui/Button";
import { signOut, changePassword } from "shared-core/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "shared-core/firebase";

export default function Settings() {
  const { loading: authLoading, user } = useAdminGuard();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    const { error } = await changePassword(newPassword);
    setChangingPassword(false);

    if (error) {
      setPasswordError(error);
    } else {
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-elma-ink/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="Settings" />
        <main className="p-8 max-w-2xl">
          <Section title="Account Information">
            <div className="bg-elma-white rounded-xl2 shadow-soft p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-elma-ink/60 mb-1">
                  Email
                </label>
                <p className="text-elma-ink font-medium">{user?.email}</p>
              </div>
            </div>
          </Section>

          <Section title="Change Password">
            <div className="bg-elma-white rounded-xl2 shadow-soft p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-elma-ink mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-elma-ink/20 rounded-xl2 focus:outline-none focus:ring-2 focus:ring-elma-purple"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-elma-ink mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-elma-ink/20 rounded-xl2 focus:outline-none focus:ring-2 focus:ring-elma-purple"
                    required
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl2 text-red-600 text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl2 text-green-600 text-sm">
                    Password changed successfully!
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={changingPassword}
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </div>
          </Section>

          <Section title="Danger Zone">
            <div className="bg-elma-white rounded-xl2 shadow-soft p-6">
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
