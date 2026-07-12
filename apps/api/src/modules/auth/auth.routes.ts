import { validateRequest } from "../../lib/validate-request.js";
import { createRouter } from "../../lib/create-router.js";
import { rateLimiter } from "../../middleware/rate-limiter.js";
import { loginController, signupController } from "./auth.controller.js";
import { loginInputSchema, signupInputSchema } from "./auth.schema.js";

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
