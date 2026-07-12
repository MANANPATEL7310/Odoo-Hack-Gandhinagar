import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";

/**
 * Middleware to restrict route access to specific roles.
 * Must be placed AFTER requireAuth middleware.
 */
export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError("Access denied: insufficient permissions."),
      );
    }

    return next();
  };
}
