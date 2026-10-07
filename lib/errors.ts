/**
 * Expected business error. Its message is safe to show to the user.
 * Thrown from server code; converted to an HTTP status by `route()` and to
 * `{ success: false, message }` by `action()`.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const unauthorized = (message = "Authentification requise") => new AppError(message, 401);
export const forbidden = (message = "Accès refusé") => new AppError(message, 403);
export const notFound = (message = "Ressource introuvable") => new AppError(message, 404);
