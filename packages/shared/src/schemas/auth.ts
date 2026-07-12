import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["EMPLOYEE", "DEPARTMENT_HEAD", "ASSET_MANAGER", "ADMIN"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  departmentId: z.string().nullable().optional(),
});

export const loginInputSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password must be under 64 characters."),
  rememberMe: z.boolean().default(true),
});

export const signupInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password must be under 64 characters."),
});

export const forgotPasswordInputSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const resetPasswordInputSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password must be under 64 characters."),
});

export const authSessionSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type SignupInput = z.infer<typeof signupInputSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
