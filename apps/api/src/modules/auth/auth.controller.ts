import type { Request, Response } from "express";
import { sendOk, sendError } from "../../lib/response.js";
import { authService, AuthError } from "./auth.service.js";
import type { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "@template/shared";

async function handleAuthAction(res: Response, action: () => Promise<any>) {
  try {
    const result = await action();
    return sendOk(res, result);
  } catch (error) {
    if (error instanceof AuthError) {
      return sendError(res, error.status, error.message);
    }
    console.error("Auth controller error:", error);
    return sendError(res, 500, "Internal Server Error");
  }
}

export async function signupController(req: Request, res: Response) {
  return handleAuthAction(res, () => authService.signup(req.body as SignupInput));
}

export async function loginController(req: Request, res: Response) {
  return handleAuthAction(res, () => authService.login(req.body as LoginInput));
}

export async function forgotPasswordController(req: Request, res: Response) {
  return handleAuthAction(res, () => authService.forgotPassword(req.body as ForgotPasswordInput));
}

export async function resetPasswordController(req: Request, res: Response) {
  return handleAuthAction(res, () => authService.resetPassword(req.body as ResetPasswordInput));
}

export async function getMeController(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    return sendError(res, 401, "Unauthorized");
  }
  return handleAuthAction(res, () => authService.getMe(userId));
}
