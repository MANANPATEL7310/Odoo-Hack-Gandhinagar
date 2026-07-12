import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordInputSchema, type ForgotPasswordInput } from "@template/shared";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { forgotPassword } from "../api/auth-service";

export function useForgotPasswordForm() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordInputSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      toast.success(data.message || "Request submitted successfully.");
      form.reset();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errMsg = err.response?.data?.message || err.message || "Failed to submit request.";
      toast.error(errMsg);
    },
  });

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(values),
  );

  return {
    form,
    onSubmit,
    isPending: mutation.isPending,
  };
}
