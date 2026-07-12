import { httpStatus } from "../constants/http.js";

export abstract class DomainError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends DomainError {
  readonly statusCode = httpStatus.notFound;
}

export class ConflictError extends DomainError {
  readonly statusCode = httpStatus.conflict;
}

export class BadRequestError extends DomainError {
  readonly statusCode = httpStatus.badRequest;
}

export class UnauthorizedError extends DomainError {
  readonly statusCode = httpStatus.unauthorized;
}

export class ForbiddenError extends DomainError {
  readonly statusCode = httpStatus.forbidden;
}
