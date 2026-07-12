import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { appRoutes } from "@template/shared";
import { Button } from "@/components/ui/button";
import { Animate } from "@/components/ui/animate";

const stats = [
  { icon: Package, value: "7", label: "Asset Lifecycle States" },
  { icon: ShieldCheck, value: "0", label: "Double-Allocations Possible" },
  { icon: CalendarCheck, value: "4", label: "Role-Gated Permission Tiers" },
];

const bullets = [
  "Real-time KPI dashboard per role",
  "Conflict-checked allocation & booking",
  "Automated audit & discrepancy reporting",
];

export function HeroSection() {
  const scrollToFeatures = () => {
    document
      .querySelector("#features")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 md:px-6">
      {/* Decorative background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute rounded-full bg-primary/20"
          style={{
            left: "-20%",
            top: "-10%",
            height: "600px",
            width: "600px",
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute rounded-full bg-secondary/20"
          style={{
            right: "-15%",
            top: "20%",
            height: "500px",
            width: "500px",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute rounded-full bg-primary-light/10"
          style={{
            bottom: "-10%",
            left: "30%",
            height: "400px",
            width: "400px",
            filter: "blur(90px)",
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {/* Badge */}
        <Animate variant="fade-in" delayMs={0}>
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase backdrop-blur-sm">
              <span className="inline-flex size-2 rounded-full bg-primary" />
              Enterprise Asset & Resource Management
            </span>
          </div>
        </Animate>

        {/* Headline */}
        <Animate variant="slide-up" delayMs={100}>
          <h1 className="mx-auto max-w-4xl text-center text-4xl leading-tight font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            The Single Source of Truth for{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
                Every Asset
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-primary/0 via-primary to-primary/0"
              />
            </span>{" "}
            You Own
          </h1>
        </Animate>

        {/* Sub-headline */}
        <Animate variant="slide-up" delayMs={200}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
            Replace spreadsheets and paper logs with a role-gated,
            lifecycle-enforced ERP module. AssetFlow eliminates
            double-allocations, booking conflicts, and missed maintenance — with
            a full audit trail at every step.
          </p>
        </Animate>

        {/* Bullet list */}
        <Animate variant="fade-in" delayMs={300}>
          <ul className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="size-4 shrink-0 text-success" />
                {b}
              </li>
            ))}
          </ul>
        </Animate>

        {/* CTA buttons */}
        <Animate variant="slide-up" delayMs={400}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to={appRoutes.login}>
              <Button size="lg" className="group w-44 min-w-0">
                Get Started Free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <button onClick={scrollToFeatures}>
              <Button variant="outline" size="lg" className="w-44 min-w-0">
                See How It Works
              </Button>
            </button>
          </div>
        </Animate>

        {/* Floating stat cards */}
        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <Animate key={label} variant="slide-up" delayMs={500 + i * 80}>
              <div className="surface-card flex items-center gap-4 p-5 transition-transform hover:-translate-y-1">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </div>
            </Animate>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <Animate variant="fade-in" delayMs={900}>
        <div className="mt-16 flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Scroll to explore
          </span>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1">
            <div className="h-2 w-1 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        </div>
      </Animate>
    </section>
  );
}
