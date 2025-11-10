import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTherapistGuard } from "../lib/guards";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Section from "shared-ui/Section";
import Button from "shared-ui/Button";
import { signOut, changePassword } from "shared-core/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "shared-core/firebase";

export default function Profile() {
  const { loading: authLoading, user } = useTherapistGuard();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { data: therapistData } = useQuery({
    queryKey: ["therapist", user?.uid],
    queryFn: async () => {
      const docRef = doc(db, "therapists", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || "");
        return data;
      }
      return null;
    },
    enabled: !!user,
  });

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameError("");
    setNameSuccess(false);
    setUpdatingName(true);

    try {
      const docRef = doc(db, "therapists", user.uid);
      await updateDoc(docRef, { name });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (error) {
      setNameError(error.message);
    }

    setUpdatingName(false);
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
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
        <Topbar title="Profile" />
        <main className="p-8 max-w-2xl">
          <Section title="Profile Information">
            <div className="bg-elma-white rounded-xl2 shadow-soft p-6">
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-elma-ink mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-elma-ink/20 rounded-xl2 focus:outline-none focus:ring-2 focus:ring-elma-sky"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-elma-ink/60 mb-1">
                    Email
                  </label>
                  <p className="text-elma-ink">{user?.email}</p>
                </div>

                {nameError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl2 text-red-600 text-sm">
                    {nameError}
                  </div>
                )}

                {nameSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl2 text-green-600 text-sm">
                    Profile updated successfully!
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={updatingName}
                >
                  {updatingName ? "Updating..." : "Update Profile"}
                </Button>
              </form>
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
                    className="w-full px-4 py-2 border border-elma-ink/20 rounded-xl2 focus:outline-none focus:ring-2 focus:ring-elma-sky"
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
                    className="w-full px-4 py-2 border border-elma-ink/20 rounded-xl2 focus:outline-none focus:ring-2 focus:ring-elma-sky"
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

          <Section title="Account Actions">
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
