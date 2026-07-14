/**
 * Standard operational error. Skip this file if your project already has an
 * equivalent (e.g. utils/AppError.ts) — just update the imports in the
 * Section 5 services to point at yours.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
