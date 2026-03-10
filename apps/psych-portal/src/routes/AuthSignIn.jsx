// apps/psych-portal/src/routes/AuthSignIn.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs, query, where } from "@firebase/firestore";
export default function PsychAuthSignIn() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);

      const user = res.user;

      const therapistRef = collection(db, "therapists");

      const q = query(therapistRef, where("email", "==", email.trim()));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log("❌ No therapist found");
        return;
      }

      const therapistDoc = snapshot.docs[0];
      console.log("therapist", therapistDoc.id);

      // Store minimal therapist info for the dashboard
      localStorage.setItem(
        "therapist",
        JSON.stringify({
          id: therapistDoc.id,
          email: user.email || email.trim(),
          name :therapistDoc.data().name
        })
      );

      // Go to psych dashboard
      nav("/dashboard");
    } catch (e) {
      setErr(e.message?.replace("Firebase: ", "") || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 380,
        margin: "80px auto",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 8, color: "#3A116D" }}>
        ELMA Psychologist – Sign in
      </h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
        Use your registered ELMA psychologist email & password.
      </p>

      <form onSubmit={onSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: 10,
            marginTop: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        />
        <input
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: 10,
            marginTop: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        />

        {err ? (
          <div
            style={{
              color: "#b00020",
              fontSize: 12,
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            {err}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 8,
            background: "#BA92FF",
            color: "#fff",
            border: 0,
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
