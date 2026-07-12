import {
  apiRoutes,
  authSessionSchema,
  type AuthSession,
  type LoginInput,
  type SignupInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type AuthUser,
} from "@template/shared";
import { apiClient } from "@/services/http/api-client";

export async function login(payload: LoginInput): Promise<AuthSession> {
  const { data } = await apiClient.post(apiRoutes.auth.login.path, payload);
  return authSessionSchema.parse(data.data);
}

export async function signup(payload: SignupInput): Promise<AuthSession> {
  const { data } = await apiClient.post(apiRoutes.auth.signup.path, payload);
  return authSessionSchema.parse(data.data);
}

export async function forgotPassword(payload: ForgotPasswordInput): Promise<{ message: string }> {
  const { data } = await apiClient.post(apiRoutes.auth.forgotPassword.path, payload);
  return data;
}

export async function resetPassword(payload: ResetPasswordInput): Promise<{ message: string }> {
  const { data } = await apiClient.post(apiRoutes.auth.resetPassword.path, payload);
  return data;
}

export async function getMe(): Promise<{ user: AuthUser }> {
  const { data } = await apiClient.get(apiRoutes.auth.me.path);
  return data.data;
}
