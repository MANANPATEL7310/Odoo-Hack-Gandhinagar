import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("alice@acme.com"); // default for testing
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data.data;

      setAuth(user, token);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      setError(
        errObj.response?.data?.error || "Failed to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-background" />
      <div
        className="absolute z-0 rounded-full bg-primary/20"
        style={{
          top: "-10%",
          left: "-10%",
          height: "50vh",
          width: "50vh",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute z-0 rounded-full bg-primary/20"
        style={{
          top: "60%",
          right: "-10%",
          height: "40vh",
          width: "40vh",
          filter: "blur(100px)",
        }}
      />

      {/* Login Card */}
      <div className="surface-card relative z-10 w-full max-w-md border-border/50 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <svg
              className="size-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to AssetFlow
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your organization to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="alice@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface/50"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-surface/50"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="border-primary-foreground size-5 animate-spin rounded-full border-2 border-t-transparent" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link
            to="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Mock Accounts (Try these emails):
          <br />
          <span className="font-mono text-xs">alice@acme.com (Admin)</span>
          <br />
          <span className="font-mono text-xs">bob@acme.com (Asset Mgr)</span>
        </div>
      </div>
    </div>
  );
}
