import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "shared-core/auth";
import useAuthClient from "../hooks/useAuthClient";
import Button from "shared-ui/Button";

export default function AuthSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { user: signedInUser, error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else if (signedInUser) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-elma-sky via-elma-purple to-elma-pink flex items-center justify-center p-4">
      <div className="bg-elma-white rounded-xl2 shadow-soft p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-elma-ink mb-2">ELMA Psychologist</h1>
          <p className="text-elma-ink/60">Sign in to access your portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-elma-ink mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-elma-ink/20 rounded-xl2 focus:outline-none focus:ring-2 focus:ring-elma-sky"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-elma-ink mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-elma-ink/20 rounded-xl2 focus:outline-none focus:ring-2 focus:ring-elma-sky"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl2 text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
