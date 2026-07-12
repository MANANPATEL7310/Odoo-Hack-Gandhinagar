import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { appRoutes } from "@template/shared";
import { Button } from "@/components/ui/button";
import { Animate } from "@/components/ui/animate";

export function CtaSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 md:px-6">
      <Animate variant="slide-up">
        <div className="surface-card relative overflow-hidden p-12 text-center md:p-20">
          {/* Inner glow blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -left-20 size-60 rounded-full bg-primary/20"
            style={{ filter: "blur(80px)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-20 size-60 rounded-full bg-secondary/20"
            style={{ filter: "blur(80px)" }}
          />

          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
              <Sparkles className="size-3" />
              Odoo Hackathon — Gandhinagar 2026
            </span>
          </div>

          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Ready to take control of{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              every asset you own?
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            From registration to audit — AssetFlow enforces every business rule
            so your organization stops losing track and starts gaining trust in
            its data.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to={appRoutes.login}>
              <Button size="lg" className="group w-48">
                Get Started Now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to={appRoutes.login}>
              <Button variant="outline" size="lg" className="w-48">
                Sign In to Your Account
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required · Single-org deployment · Full lifecycle on
            day one
          </p>
        </div>
      </Animate>
    </section>
  );
}
