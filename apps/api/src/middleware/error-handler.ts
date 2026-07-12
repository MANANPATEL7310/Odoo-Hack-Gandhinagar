import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { httpStatus } from "../constants/http.js";
import { DomainError } from "../lib/errors.js";
import { sendError } from "../lib/response.js";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    const details = error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return sendError(
      res,
      httpStatus.badRequest,
      "Validation error.",
      "VALIDATION_ERROR",
      details,
    );
  }

  if (error instanceof DomainError) {
    return sendError(
      res,
      error.statusCode,
      error.message,
      error.code,
      error.details,
    );
  }

  logger.error({ error, method: req.method, url: req.originalUrl });

  return sendError(
    res,
    httpStatus.internalServerError,
    "Internal server error.",
    "INTERNAL_ERROR",
  );
}
