/** French message for a better-auth client error (`{ code, message, status }`). */
const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect",
  USER_ALREADY_EXISTS: "Cet email est déjà utilisé",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Cet email est déjà utilisé",
  NAME_TAKEN: "Ce pseudo est déjà utilisé",
  PASSWORD_TOO_SHORT: "Le mot de passe est trop court",
  PASSWORD_TOO_LONG: "Le mot de passe est trop long",
  INVALID_OTP: "Code invalide",
  OTP_EXPIRED: "Code expiré, demandez-en un nouveau",
  TOO_MANY_ATTEMPTS: "Trop de tentatives, demandez un nouveau code",
};

export function authErrorMessage(error: { code?: string; status?: number } | null | undefined) {
  if (error?.status === 429) return "Trop de tentatives, réessayez dans quelques instants";
  return (error?.code && messages[error.code]) || "Une erreur est survenue";
}
