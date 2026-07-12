import { httpStatus } from "../constants/http.js";

export abstract class DomainError extends Error {
  abstract readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, code = "DOMAIN_ERROR", details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends DomainError {
  readonly statusCode = httpStatus.notFound;
  constructor(message: string, code = "NOT_FOUND", details?: unknown) {
    super(message, code, details);
  }
}

export class ConflictError extends DomainError {
  readonly statusCode = httpStatus.conflict;
  constructor(message: string, code = "CONFLICT", details?: unknown) {
    super(message, code, details);
  }
}

export class BadRequestError extends DomainError {
  readonly statusCode = httpStatus.badRequest;
  constructor(message: string, code = "BAD_REQUEST", details?: unknown) {
    super(message, code, details);
  }
}

export class UnauthorizedError extends DomainError {
  readonly statusCode = httpStatus.unauthorized;
  constructor(message: string, code = "UNAUTHORIZED", details?: unknown) {
    super(message, code, details);
  }
}

export class ForbiddenError extends DomainError {
  readonly statusCode = httpStatus.forbidden;
  constructor(message: string, code = "FORBIDDEN", details?: unknown) {
    super(message, code, details);
  }
}
