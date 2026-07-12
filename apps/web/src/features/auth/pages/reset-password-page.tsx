import { Link } from "react-router-dom";
import { appRoutes } from "@template/shared";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useResetPasswordForm } from "../hooks/use-reset-password-form";
import { LogoMark } from "@/components/shared/logo-mark";

export function ResetPasswordPage() {
  const { form, isPending, onSubmit, hasToken } = useResetPasswordForm();

  return (
    <main className="app-shell grid min-h-screen gap-6 lg:grid-cols-2 lg:items-center">
      <Card className="hidden min-h-140 justify-between bg-primary p-8 text-surface lg:flex">
        <LogoMark className="[&_p:first-child]:text-surface/70 [&_p:last-child]:text-surface" />
        <div className="space-y-5">
          <p className="text-sm font-semibold tracking-widest text-surface/80 uppercase">
            Reset Password
          </p>
          <h2 className="text-4xl leading-tight font-semibold">
            Define your new secure password credential.
          </h2>
          <p className="max-w-xl text-base leading-7 text-surface/80">
            Once submitted, your account will be updated immediately. Please use
            a strong combination of characters.
          </p>
        </div>
      </Card>

      <div className="flex justify-center">
        <Card className="w-full max-w-md space-y-6 p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-dark">
              <KeyRound className="size-4" />
              Password Reset Confirmation
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                Set New Password
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your new password below to finalize recovery.
              </p>
            </div>
          </div>

          {!hasToken ? (
            <div className="rounded border border-danger/15 bg-danger/10 p-4 text-sm text-danger-dark">
              Warning: Password reset token is missing from the link URL. Please
              request a new link from the forgot password page.
            </div>
          ) : (
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="newPassword"
                >
                  New Password
                </label>
                <Input
                  id="newPassword"
                  placeholder="••••••••"
                  type="password"
                  {...form.register("newPassword")}
                />
              </div>

              <Button className="w-full" disabled={isPending} type="submit">
                <span>{isPending ? "Resetting..." : "Save Password"}</span>
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}

          <p className="text-sm text-muted-foreground">
            Return to{" "}
            <Link
              className="font-medium text-primary hover:text-primary-dark"
              to={appRoutes.login}
            >
              Log in page
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
