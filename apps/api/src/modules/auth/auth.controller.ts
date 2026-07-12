import type { Request, Response } from "express";
import { sendOk, sendCreated } from "../../lib/response.js";
import { asyncHandler } from "../../lib/async-handler.js";
import type { LoginInput, SignupInput } from "./auth.schema.js";
import { loginService, signupService } from "./auth.service.js";

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await loginService(req.body as LoginInput);
    return sendOk(res, session, "Login successful.");
  },
);

export const signupController = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await signupService(req.body as SignupInput);
    return sendCreated(res, session, "Registration successful.");
  },
);
