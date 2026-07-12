import { validateRequest } from "../../lib/validate-request.js";
import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import {
  signupController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  getMeController,
} from "./auth.controller.js";
import {
  signupInputSchema,
  loginInputSchema,
  forgotPasswordInputSchema,
  resetPasswordInputSchema,
} from "@template/shared";

export const authRouter = createRouter();

authRouter.post("/signup", validateRequest(signupInputSchema), signupController);
authRouter.post("/login", validateRequest(loginInputSchema), loginController);
authRouter.post("/forgot-password", validateRequest(forgotPasswordInputSchema), forgotPasswordController);
authRouter.post("/reset-password", validateRequest(resetPasswordInputSchema), resetPasswordController);
authRouter.get("/me", requireAuth, getMeController);
