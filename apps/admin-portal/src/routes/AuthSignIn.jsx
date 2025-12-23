import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

console.log("✅ AuthSignIn mounted");

export default function AuthSignIn() {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const uid = cred.user.uid;
      await setDoc(doc(db, "users", uid), { lastActiveAt: serverTimestamp() }, { merge: true });
      nav("/dashboard");
    } catch (e) {
      console.error(e);
      setErr(e.message?.replace("Firebase: ", "") || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 380, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>ELMA Admin – Sign in</h1>
      <form onSubmit={onSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{display:"block",width:"100%",padding:10,marginTop:10,border:"1px solid #ddd",borderRadius:8}}
        />
        <input
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e)=>setPass(e.target.value)}
          style={{display:"block",width:"100%",padding:10,marginTop:10,border:"1px solid #ddd",borderRadius:8}}
        />
        {err ? <div style={{color:"#b00020",fontSize:12,marginTop:8}}>{err}</div> : null}
        <button type="submit" disabled={loading}
                style={{marginTop:12,padding:"10px 14px",borderRadius:8,background:"#BA92FF",color:"#fff",border:0}}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
  