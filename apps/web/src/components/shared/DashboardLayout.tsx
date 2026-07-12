import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { getOrgRepository } from "@/services/data/repositories";
import type { Employee } from "@/services/data/types/domain";
import {
  LayoutDashboard,
  Users,
  Box,
  ArrowRightLeft,
  Calendar,
  Wrench,
  ShieldCheck,
  FileBarChart,
  Bell,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  RadioTower,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { LogoMark } from "./logo-mark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const NAV_LINKS = [
  { name: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard },
  { name: "Org Setup", path: "/app/org-setup", icon: Users, roles: ["ADMIN"] },
  { name: "Assets", path: "/app/assets", icon: Box },
  { name: "Allocations", path: "/app/allocations", icon: ArrowRightLeft },
  { name: "Bookings", path: "/app/bookings", icon: Calendar },
  { name: "Maintenance", path: "/app/maintenance", icon: Wrench },
  {
    name: "Audits",
    path: "/app/audits",
    icon: ShieldCheck,
    roles: ["ADMIN", "ASSET_MANAGER"],
  },
  {
    name: "Reports",
    path: "/app/reports",
    icon: FileBarChart,
    roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  },
];

export function DashboardLayout() {
  const orgRepository = getOrgRepository();
  const { user, setAuth, logout } = useAuthStore();
  const [users, setUsers] = React.useState<Employee[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(
    document.documentElement.classList.contains("dark"),
  );

  React.useEffect(() => {
    async function loadUsers() {
      try {
        const data = await orgRepository.listEmployees();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users for role switch", error);
      }
    }

    loadUsers();
  }, [orgRepository]);

  // This replaces the traditional login screen for testing purposes
  const handleRoleSwitch = (newUser: Employee) => {
    setAuth(newUser, "mock-jwt-token");
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!user) {
    return null; // Should be caught by ProtectedRoute, but just in case
  }

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.roles || link.roles.includes(user.role),
  );
  const firstName = user.name.split(" ")[0] ?? user.name;

  const ThemeIcon = isDark ? Sun : Moon;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fine-grid pointer-events-none fixed inset-0 -z-10 opacity-50" />

      <div className="dashboard-shell">
        {/* SIDEBAR ON THE LEFT */}
        <aside
          className="surface-card sticky top-4 hidden flex-col overflow-hidden p-5 lg:flex"
          style={{ height: "calc(100vh - 2rem)" }}
        >
          <LogoMark />

          <div className="mt-6 border-t border-white/40 pt-5 dark:border-white/10">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Signed in as
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-white shadow-lg shadow-primary/20">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={isDark ? "Use light mode" : "Use dark mode"}
            >
              <ThemeIcon className="size-4" />
            </Button>
            <Button variant="outline" size="icon" title="Notifications">
              <Bell className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" title="Switch role">
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
                  Switch Dev Role
                </DropdownMenuLabel>
                {users.map((u) => (
                  <DropdownMenuItem
                    key={u.id}
                    onClick={() => handleRoleSwitch(u)}
                  >
                    {u.name} ({u.role})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto border-t border-white/40 pt-5 dark:border-white/10">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group flex items-center justify-between rounded-lg p-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-white/45 hover:text-foreground dark:hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-4" />
                    {link.name}
                  </span>
                  <span
                    className={`size-1.5 rounded-full transition-opacity ${
                      isActive
                        ? "bg-white opacity-100"
                        : "bg-primary opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/40 pt-5 dark:border-white/10">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Asset health</span>
                <span className="font-semibold text-secondary">98%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/50 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: "98%" }}
                />
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Inventory, bookings, and maintenance queues are ready for the
                next check-in.
              </p>
            </div>

            <Button
              variant="outline"
              className="mt-5 w-full justify-center"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="min-w-0 space-y-4 lg:space-y-5">
          <header className="surface-card sticky top-4 z-20 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between lg:hidden">
            <LogoMark />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={isDark ? "Use light mode" : "Use dark mode"}
              >
                <ThemeIcon className="size-5" />
              </Button>
              <Button variant="ghost" size="icon" title="Notifications">
                <Bell className="size-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="size-10 rounded-lg bg-primary text-white hover:bg-primary/90"
                  >
                    {user.name.charAt(0)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm leading-none font-medium">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
                    Switch Dev Role
                  </DropdownMenuLabel>
                  {users.map((u) => (
                    <DropdownMenuItem
                      key={u.id}
                      onClick={() => handleRoleSwitch(u)}
                    >
                      {u.name} ({u.role})
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <nav className="surface-card sticky top-28 z-10 flex gap-2 overflow-x-auto p-2 lg:hidden">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
                  }`}
                >
                  <Icon className="size-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <header className="surface-card hidden items-center justify-between gap-4 p-5 lg:flex">
            <div>
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                Asset command center
              </p>
              <h1 className="mt-1 text-2xl font-semibold">
                Welcome back, {firstName}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/40 px-3 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <RadioTower className="size-4 text-secondary" />
                Live workspace
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white/40 px-3 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <Sparkles className="size-4 text-warning" />
                {user.role.replace("_", " ")}
              </span>
            </div>
          </header>

          <main className="pb-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
