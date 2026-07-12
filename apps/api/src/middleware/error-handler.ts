import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { httpStatus } from "../constants/http.js";
import { DomainError } from "../lib/errors.js";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return res.status(httpStatus.badRequest).json({
      success: false,
      message: "Validation error.",
      issues: error.flatten(),
    });
  }

  if (error instanceof DomainError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  logger.error({ error, method: req.method, url: req.originalUrl });

  return res.status(httpStatus.internalServerError).json({
    success: false,
    message: "Internal server error.",
  });
}
