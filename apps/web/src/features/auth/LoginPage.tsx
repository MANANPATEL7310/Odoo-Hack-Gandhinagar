import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { LogoMark } from "../../components/shared/logo-mark";
import { ArrowRight, Boxes, Fingerprint, ShieldCheck } from "lucide-react";

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
    <div className="auth-backdrop relative min-h-screen overflow-hidden px-4 py-6">
      <div className="fine-grid pointer-events-none absolute inset-0 opacity-55" />

      <div
        className="auth-split-layout surface-card relative z-10 mx-auto w-full max-w-6xl overflow-hidden p-0"
        style={{ minHeight: "calc(100vh - 3rem)" }}
      >
        <section className="hidden flex-col justify-between border-r border-white/40 p-8 lg:flex dark:border-white/10">
          <LogoMark />
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2 text-sm font-medium text-secondary">
              <ShieldCheck className="size-4" />
              Secured operations
            </p>
            <h1 className="mt-6 max-w-xl text-5xl leading-tight font-semibold">
              Track every device from request to return.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              AssetFlow keeps assignments, bookings, maintenance, and audits
              close to the teams that need them.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["3", "Assets live"],
              ["0", "Overdue"],
              ["98%", "Health"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-white/50 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-2xl font-semibold">{value}</p>
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
                <Fingerprint className="size-6" />
              </div>
              <h2 className="text-3xl font-semibold">Welcome back</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to open your asset operations workspace.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
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
                    <span>Sign in</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?
              </span>
              <Link to="/signup" className="font-medium text-primary">
                Sign up
              </Link>
            </div>

            <div className="mt-6 rounded-lg border border-white/50 bg-white/35 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <Boxes className="size-4 text-primary" />
                Demo access
              </div>
              <p className="font-mono text-xs">alice@acme.com / password123</p>
              <p className="mt-1 font-mono text-xs">
                bob@acme.com / password123
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
