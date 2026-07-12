import { Link } from "react-router-dom";
import { appRoutes } from "@template/shared";
import { ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSignupForm } from "../hooks/use-signup-form";
import { LogoMark } from "@/components/shared/logo-mark";

export function SignupPage() {
  const { form, isPending, onSubmit } = useSignupForm();

  return (
    <main className="app-shell grid min-h-screen gap-6 lg:grid-cols-2 lg:items-center">
      <Card className="hidden min-h-140 justify-between bg-primary p-8 text-surface lg:flex">
        <LogoMark className="[&_p:first-child]:text-surface/70 [&_p:last-child]:text-surface" />
        <div className="space-y-5">
          <p className="text-sm font-semibold tracking-widest text-surface/80 uppercase">
            Create an Account
          </p>
          <h2 className="text-4xl leading-tight font-semibold">
            Start tracking and managing team resources easily.
          </h2>
          <p className="max-w-xl text-base leading-7 text-surface/80">
            Join the registry platform to book common spaces, allocate devices,
            and request asset transfers smoothly.
          </p>
        </div>
      </Card>

      <div className="flex justify-center">
        <Card className="w-full max-w-md space-y-6 p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-dark">
              <UserPlus className="size-4" />
              Employee Registration
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                Join the Workspace
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your details to create a standard employee account.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="name"
              >
                Full Name
              </label>
              <Input
                id="name"
                placeholder="Jane Doe"
                type="text"
                {...form.register("name")}
              />
              <p className="text-xs text-danger">
                {form.formState.errors.name?.message}
              </p>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="email"
              >
                Email Address
              </label>
              <Input
                id="email"
                placeholder="jane.doe@example.com"
                type="email"
                {...form.register("email")}
              />
              <p className="text-xs text-danger">
                {form.formState.errors.email?.message}
              </p>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                {...form.register("password")}
              />
              <p className="text-xs text-danger">
                {form.formState.errors.password?.message}
              </p>
            </div>

            <Button className="w-full" disabled={isPending} type="submit">
              <span>{isPending ? "Registering..." : "Create Account"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              className="font-medium text-primary hover:text-primary-dark"
              to={appRoutes.login}
            >
              Log in here
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
