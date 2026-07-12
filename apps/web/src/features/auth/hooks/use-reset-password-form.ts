import { appRoutes } from "@template/shared";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPassword } from "../api/auth-service";

export function useResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const form = useForm<{ newPassword: string }>({
    defaultValues: {
      newPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(
        data.message || "Password updated successfully! You can now log in.",
      );
      navigate(appRoutes.login);
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password.";
      toast.error(errMsg);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (!token) {
      toast.error("Password reset token is missing from the link URL.");
      return;
    }
    mutation.mutate({
      token,
      newPassword: values.newPassword,
    });
  });

  return {
    form,
    onSubmit,
    isPending: mutation.isPending,
    hasToken: !!token,
  };
}
