import { createElement } from "react";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware, isAPIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./lib/argon2";
import { CLIENT_IP_HEADER } from "./lib/client-ip";
import { rateLimiter } from "./lib/rate-limit";
import { disconnectUserSockets } from "./server/realtime/emitter";
import { sendEmail } from "./emails/send-email";
import { WelcomeEmail } from "./emails/account-emails";
import { VerificationCodeEmail } from "./emails/verification-code-email";

const OTP_EXPIRES_IN_MINUTES = 10;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Per-account lockout: 10 failed password sign-ins in 15 minutes lock the account for the rest of the window. */
const signInFailures = rateLimiter("sign-in-failures", { max: 10, windowMs: 15 * 60_000 });
const signInEmailOf = (body: unknown) =>
  String((body as { email?: unknown } | undefined)?.email ?? "").trim().toLowerCase();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    password: { hash: hashPassword, verify: verifyPassword },
  },
  socialProviders: {
    github: {
      prompt: "select_account",
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  // In memory (one process). The IP is the one resolved by server.ts, never a raw client header.
  rateLimit: { enabled: true, window: 10, max: 100 },
  advanced: { ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER] } },
  // Unused by the app and weaker than its own actions (no password check, no notification, any
  // avatar URL): profile, email and password changes only go through features/settings/actions.ts.
  disabledPaths: ["/update-user", "/change-password", "/change-email"],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const email = signInEmailOf(ctx.body);
      if (email && !signInFailures.peek(email).ok) {
        throw APIError.from("TOO_MANY_REQUESTS", {
          code: "ACCOUNT_LOCKED",
          message: "Trop de tentatives sur ce compte, réessayez dans 15 minutes",
        });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const email = signInEmailOf(ctx.body);
      if (!email) return;
      if (isAPIError(ctx.context.returned)) signInFailures.hit(email);
      else signInFailures.reset(email);
    }),
  },
  // OAuth errors (e.g. account not linked) land on a French page instead of better-auth's default.
  onAPIError: { errorURL: "/auth/error" },
  databaseHooks: {
    session: {
      delete: {
        // Sign-out (or an expired session): its open sockets stop receiving events at once.
        after: async (session) => {
          await disconnectUserSockets(session.userId, session.id).catch(() => undefined);
        },
      },
    },
    user: {
      create: {
        // `name` is unique in the database: reject a taken name on sign-up,
        // and make it unique for social sign-ins (where the user did not choose it).
        before: async (user, ctx) => {
          const taken = await prisma.user.findUnique({ where: { name: user.name }, select: { id: true } });
          if (!taken) return;
          if (ctx?.path === "/sign-up/email") {
            throw APIError.from("BAD_REQUEST", { code: "NAME_TAKEN", message: "Ce pseudo est déjà utilisé" });
          }
          return { data: { ...user, name: `${user.name}-${crypto.randomUUID().slice(0, 6)}` } };
        },
        after: async (user) => {
          await sendEmail({
            to: user.email,
            subject: "Bienvenue sur FootHubGo",
            email: createElement(WelcomeEmail, { name: user.name }),
          });
        },
      },
    },
  },
  plugins: [
    // Password reset by emailed code: hashed in the `verification` table,
    // 3 attempts max, rate limited, no user enumeration.
    emailOTP({
      otpLength: 6,
      expiresIn: OTP_EXPIRES_IN_MINUTES * 60,
      allowedAttempts: 3,
      storeOTP: "hashed",
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "forget-password") return;
        await sendEmail({
          to: email,
          subject: "Réinitialisation du mot de passe",
          email: createElement(VerificationCodeEmail, {
            code: otp,
            title: "Réinitialisation du mot de passe",
            expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
          }),
        });
      },
    }),
    nextCookies(), // must stay last
  ],
});
