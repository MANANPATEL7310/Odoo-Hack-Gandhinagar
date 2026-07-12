import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      const { user, token } = response.data.data;

      setAuth(user, token);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      setError(
        errObj.response?.data?.error || "Failed to sign up. Please try again.",
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

      {/* Signup Card */}
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create an Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join AssetFlow as a new employee
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="text-destructive bg-destructive/10 border-destructive/20 rounded-md border p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-surface/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?{" "}
          </span>
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
