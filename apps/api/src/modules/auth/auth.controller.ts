import type { Request, Response } from "express";
import { sendOk, sendCreated, sendError } from "../../lib/response.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authService } from "./auth.service.js";
import type { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "@template/shared";

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await authService.login(req.body as LoginInput);
    return sendOk(res, session, "Login successful.");
  },
);

export const signupController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await authService.signup(req.body as SignupInput);
    return sendCreated(res, session, "Registration successful.");
  },
);

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body as ForgotPasswordInput);
    return sendOk(res, result, "Password reset request processed.");
  },
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body as ResetPasswordInput);
    return sendOk(res, result, "Password reset successful.");
  },
);

export const getMeController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.sub;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }
    const result = await authService.getMe(userId);
    return sendOk(res, result);
  },
);
