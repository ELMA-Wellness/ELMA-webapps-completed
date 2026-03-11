// apps/psych-portal/src/routes/AuthSignIn.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { Loader } from "lucide-react";
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

  const onResetPassword = () => {
    nav('/auth/reset-pwd')
  }


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

      <form  onSubmit={onSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
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
          {loading ? <Loader className="spin"/> : "Sign in"}
        </button>
        <button
          onClick={onResetPassword}

          style={{
            marginTop: 14,
            padding: 10,
            borderRadius: 0,
            background: "none",
            color: "#6366f1",
            border: "none",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            textDecoration: "underline",
            display: "inline",
          }}
        >
          Reset Password
        </button>
      </form>
         <style>{`

      body {
        margin:0;
        font-family: Arial, Helvetica, sans-serif;
      }

      .reset-container{
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
      }

      .reset-card{
        width:400px;
        background:white;
        padding:20px;
        border-radius:14px;
        box-shadow:0 10px 30px rgba(0,0,0,0.15);
        text-align:center;
      }

      .icon-wrapper{
        width:70px;
        height:70px;
        margin:auto;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        background:linear-gradient(135deg,#6366f1,#8b5cf6);
        color:white;
        margin-bottom:20px;
      }

      h2{
        margin:0;
        font-size:26px;
        font-weight:600;
      }

      .subtitle{
        margin-top:8px;
        font-size:14px;
        color:#666;
      }

      form{
        margin-top:25px;
      }

      .input-group{
        position:relative;
        margin-bottom:18px;
      }

      .input-group input{
        width:100%;
        padding:12px 12px 12px 40px;
        border:1px solid #ddd;
        border-radius:8px;
        font-size:14px;
        outline:none;
      }

      .input-group input:focus{
        border-color:#6366f1;
        box-shadow:0 0 0 2px rgba(99,102,241,0.2);
      }

      .input-icon{
        position:absolute;
        left:12px;
        top:50%;
        transform:translateY(-50%);
        color:#888;
      }

      button{
        width:100%;
        padding:12px;
        border:none;
        border-radius:8px;
        font-size:15px;
        font-weight:600;
        cursor:pointer;
        background:linear-gradient(135deg,#6366f1,#8b5cf6);
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:8px;
      }

      button:hover{
        opacity:0.95;
      }

      button:disabled{
        opacity:0.7;
        cursor:not-allowed;
      }

      .message{
        margin-top:18px;
        padding:10px;
        border-radius:6px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:6px;
        font-size:14px;
      }

      .success{
        background:#ecfdf5;
        color:#065f46;
      }

      .error{
        background:#fef2f2;
        color:#991b1b;
      }

      .spin{
        animation:spin 1s linear infinite;
      }

      @keyframes spin{
        from{transform:rotate(0deg)}
        to{transform:rotate(360deg)}
      }

      @media(max-width:450px){
        .reset-card{
          width:90%;
          padding:30px;
        }
      }
        

      `}</style>
    </div>
  );
}
