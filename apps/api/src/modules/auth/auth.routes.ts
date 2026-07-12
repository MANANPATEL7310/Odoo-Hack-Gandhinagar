import { validateRequest } from "../../lib/validate-request.js";
import { createRouter } from "../../lib/create-router.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { rateLimiter } from "../../middleware/rate-limiter.js";
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

// Restrict auth endpoints to a maximum of 10 requests per 15 minutes per IP
const authRateLimiter = rateLimiter(15 * 60 * 1000, 10);

authRouter.post(
  "/signup",
  authRateLimiter,
  validateRequest(signupInputSchema),
  signupController,
);

authRouter.post(
  "/login",
  authRateLimiter,
  validateRequest(loginInputSchema),
  loginController,
);

authRouter.post(
  "/forgot-password",
  authRateLimiter,
  validateRequest(forgotPasswordInputSchema),
  forgotPasswordController,
);

authRouter.post(
  "/reset-password",
  authRateLimiter,
  validateRequest(resetPasswordInputSchema),
  resetPasswordController,
);

authRouter.get("/me", requireAuth, getMeController);
