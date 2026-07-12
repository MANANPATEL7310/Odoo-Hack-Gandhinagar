import type { Response } from "express";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function sendOk<T>(res: Response, data: T, message?: string) {
  return res
    .status(200)
    .json({ success: true, data, message } satisfies ApiResponse<T>);
}

export function sendCreated<T>(
  res: Response,
  data: T,
  message = "Created successfully",
) {
  return res
    .status(201)
    .json({ success: true, data, message } satisfies ApiResponse<T>);
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  code = "INTERNAL_ERROR",
  details?: unknown,
) {
  return res.status(status).json({
    success: false,
    error: { code, message, details },
  } satisfies ApiResponse<never>);
}

export function sendNotFound(res: Response, entity = "Resource") {
  return res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `${entity} not found.`,
    },
  } satisfies ApiResponse<never>);
}
