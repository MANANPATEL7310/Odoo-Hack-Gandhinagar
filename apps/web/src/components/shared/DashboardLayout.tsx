import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { useMockDb, type User } from "../../stores/mock-db";
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
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const NAV_LINKS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Org Setup", path: "/org-setup", icon: Users, roles: ["ADMIN"] },
  { name: "Assets", path: "/assets", icon: Box },
  { name: "Allocations", path: "/allocations", icon: ArrowRightLeft },
  { name: "Bookings", path: "/bookings", icon: Calendar },
  { name: "Maintenance", path: "/maintenance", icon: Wrench },
  {
    name: "Audits",
    path: "/audits",
    icon: ShieldCheck,
    roles: ["ADMIN", "ASSET_MANAGER"],
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileBarChart,
    roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  },
];

export function DashboardLayout() {
  const { user, setAuth, logout } = useAuthStore();
  const { users } = useMockDb();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(
    document.documentElement.classList.contains("dark"),
  );

  // This replaces the traditional login screen for testing purposes
  const handleRoleSwitch = (newUser: User) => {
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-surface/50 backdrop-blur-xl lg:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">AssetFlow</h1>
        </div>
        <nav className="space-y-1 px-4">
          {NAV_LINKS.filter(
            (link) => !link.roles || link.roles.includes(user.role),
          ).map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-surface/50 px-6 backdrop-blur-xl">
          <div className="flex items-center lg:hidden">
            <span className="text-lg font-bold">AssetFlow</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="size-5 text-muted-foreground" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-9 rounded-full bg-primary/10"
                >
                  {user.name.charAt(0)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
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

        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
