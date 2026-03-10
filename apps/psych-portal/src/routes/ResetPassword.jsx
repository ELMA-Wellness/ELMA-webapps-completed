import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Mail, Loader, CheckCircle, AlertCircle, Lock, } from "lucide-react";
import { auth } from "../firebase/config";

const ResetPassword = () => {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      setSuccess("Password reset email sent. Please check your inbox.");
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="reset-container">
        <div className="reset-card">

          <div className="icon-wrapper">
            <Lock size={40} />
          </div>

          <h2>Reset Password</h2>
          <p className="subtitle">
            Enter your email to receive a password reset link.
          </p>

          <form onSubmit={handleReset}>

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="spin" size={18} />
                 
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

          </form>

          {success && (
            <div className="message success">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          {error && (
            <div className="message error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

        </div>
      </div>

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
        padding:40px;
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
    </>
  );
};

export default ResetPassword;