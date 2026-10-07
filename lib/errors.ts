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

/**
 * What to log for an unexpected error, without personal data: Prisma errors embed the query and
 * its arguments (emails, message text, hashes) in their message, so only their name and code are kept.
 */
export function loggableError(error: unknown) {
  if (!(error instanceof Error)) return { error: typeof error };
  const code = (error as { code?: unknown }).code;
  if (error.name.startsWith("PrismaClient")) return { name: error.name, code };
  return { name: error.name, code, message: error.message.slice(0, 500), stack: error.stack?.split("\n").slice(1, 6).join("\n") };
}
