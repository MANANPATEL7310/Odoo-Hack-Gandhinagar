import { Link } from "react-router-dom";
import { LayoutDashboard, Github } from "lucide-react";
import { appRoutes } from "@template/shared";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Roles", href: "#roles" },
  { label: "Why AssetFlow", href: "#problem" },
];

export function LandingFooter() {
  const handleAnchor = (href: string) => {
    document
      .querySelector(href)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-white/10 bg-surface/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/40">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  AssetFlow
                </span>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Centralize, enforce, and audit every asset and shared resource
              your organization owns — in one role-gated platform.
            </p>
            <p className="text-xs text-muted-foreground">
              Built for{" "}
              <span className="font-semibold text-primary">
                Odoo Hackathon — Gandhinagar 2026
              </span>
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Navigation
            </p>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleAnchor(link.href)}
                  className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Account links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Account
            </p>
            <nav className="flex flex-col gap-2">
              <Link
                to={appRoutes.login}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                to={appRoutes.login}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Get Started
              </Link>
              <Link
                to={appRoutes.dashboard}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          {/* Theme + GitHub */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Preferences
            </p>
            <ThemeToggle />
            <a
              href="https://github.com/MANANPATEL7310/Odoo-Hack-Gandhinagar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 AssetFlow · Odoo Hackathon, Gandhinagar
          </p>
          <p className="text-xs text-muted-foreground">
            Built with React · Vite · TailwindCSS v4 · TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
}
