import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { LogoMark } from "../../components/shared/logo-mark";
import { ArrowRight, BadgeCheck, Building2, UserPlus } from "lucide-react";

export function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      const { user, accessToken } = response.data.data;

      setAuth(user, accessToken);
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
    <div className="auth-backdrop relative min-h-screen overflow-hidden px-4 py-6">
      <div className="fine-grid pointer-events-none absolute inset-0 opacity-55" />

      <div
        className="auth-split-layout surface-card relative z-10 mx-auto w-full max-w-6xl overflow-hidden p-0"
        style={{ minHeight: "calc(100vh - 3rem)" }}
      >
        <section className="hidden flex-col justify-between border-r border-white/40 p-8 lg:flex dark:border-white/10">
          <LogoMark />
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              <BadgeCheck className="size-4" />
              Employee onboarding
            </p>
            <h1 className="mt-6 max-w-xl text-5xl leading-tight font-semibold">
              Start with clean access from day one.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              New teammates get a clear workspace for requests, assigned assets,
              bookings, and returns.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Role", "Employee"],
              ["Access", "Instant"],
              ["Audit", "Ready"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-white/50 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-lg font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <LogoMark className="mb-8 lg:hidden" />

            <div className="mb-8">
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-lg border border-white/50 bg-white/45 text-primary dark:border-white/10 dark:bg-white/5">
                <UserPlus className="size-6" />
              </div>
              <h2 className="text-3xl font-semibold">Create an account</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Join AssetFlow as a new employee.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? (
                  <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Sign up</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Already have an account?
              </span>
              <Link to="/login" className="font-medium text-primary">
                Sign in
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/50 bg-white/35 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
              <Building2 className="size-5 text-secondary" />
              <span>New users enter with employee-level access.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
