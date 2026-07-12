import { zodResolver } from "@hookform/resolvers/zod";
import { appRoutes, signupInputSchema, type SignupInput } from "@template/shared";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/auth-service";
import { useAuthStore } from "@/stores/auth-store";

export function useSignupForm() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupInputSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (session) => {
      setSession(session);
      toast.success("Account created successfully! Welcome to your workspace.");
      navigate(appRoutes.dashboard);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errMsg = err.response?.data?.message || err.message || "Failed to sign up.";
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
