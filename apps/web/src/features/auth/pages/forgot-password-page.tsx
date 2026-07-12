import { Link } from "react-router-dom";
import { appRoutes } from "@template/shared";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForgotPasswordForm } from "../hooks/use-forgot-password-form";
import { LogoMark } from "@/components/shared/logo-mark";

export function ForgotPasswordPage() {
  const { form, isPending, onSubmit } = useForgotPasswordForm();

  return (
    <main className="app-shell grid min-h-screen gap-6 lg:grid-cols-2 lg:items-center">
      <Card className="hidden min-h-140 justify-between bg-primary p-8 text-surface lg:flex">
        <LogoMark className="[&_p:first-child]:text-surface/70 [&_p:last-child]:text-surface" />
        <div className="space-y-5">
          <p className="text-sm font-semibold tracking-widest text-surface/80 uppercase">
            Recover Password
          </p>
          <h2 className="text-4xl leading-tight font-semibold">
            Regain access to your workspace securely.
          </h2>
          <p className="max-w-xl text-base leading-7 text-surface/80">
            Submit your registered email address and we will provide a secure password reset link to recover your credentials.
          </p>
        </div>
      </Card>

      <div className="flex justify-center">
        <Card className="w-full max-w-md space-y-6 p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-dark">
              <KeyRound className="size-4" />
              Password Reset
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                Forgot Password?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email address to request a reset link.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
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

            <Button className="w-full" disabled={isPending} type="submit">
              <span>{isPending ? "Submitting..." : "Send Reset Link"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link className="font-medium text-primary hover:text-primary-dark" to={appRoutes.login}>
              Log in here
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
