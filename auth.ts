import { createElement } from "react";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware, isAPIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./lib/argon2";
import { CLIENT_IP_HEADER, clientIpFrom } from "./lib/client-ip";
import { rateLimiter } from "./lib/rate-limit";
import { disconnectUserSockets } from "./server/realtime/emitter";
import { sendEmail } from "./emails/send-email";
import { WelcomeEmail } from "./emails/account-emails";
import { VerificationCodeEmail } from "./emails/verification-code-email";

const OTP_EXPIRES_IN_MINUTES = 10;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Password sign-in lockout, counted before the check (parallel attempts can't exceed it) and reset
 * on success:
 * - 10 failures in 15 minutes for one account FROM ONE IP lock that pair: someone who only knows an
 *   email can't lock its owner out of their own devices;
 * - 100 failures in an hour for one account from anywhere lock it (distributed guessing).
 */
const signInFailures = rateLimiter("sign-in-failures", { max: 10, windowMs: 15 * 60_000 });
const signInFailuresPerAccount = rateLimiter("sign-in-failures-account", { max: 100, windowMs: 60 * 60_000 });

/** The email of a sign-in, or null for anything that can't be one (the body is not validated yet). */
function signInEmailOf(body: unknown) {
  const email = (body as { email?: unknown } | undefined)?.email;
  if (typeof email !== "string" || email.length > 254 || !email.includes("@")) return null;
  return email.trim().toLowerCase();
}

const signInIpOf = (headers: Headers | undefined) => (headers ? clientIpFrom(headers) : "unknown");

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    // Signed in right after sign-up (no second login). There is no email verification yet
    // (security audit L2, deferred): when it comes, sign-up will have to wait for it.
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    // A reset signs out everywhere: open sockets and push devices (a lost phone) go with the sessions.
    onPasswordReset: async ({ user }) => {
      await prisma.pushSubscription.deleteMany({ where: { userId: user.id } });
      await disconnectUserSockets(user.id).catch(() => undefined);
    },
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
      if (!email) return;
      const perIp = signInFailures.hit(`${email}|${signInIpOf(ctx.headers)}`);
      const perAccount = signInFailuresPerAccount.hit(email);
      if (!perIp.ok || !perAccount.ok) {
        throw APIError.from("TOO_MANY_REQUESTS", {
          code: "ACCOUNT_LOCKED",
          message: "Trop de tentatives sur ce compte, réessaie dans 15 minutes",
        });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const email = signInEmailOf(ctx.body);
      if (!email || isAPIError(ctx.context.returned)) return;
      signInFailures.reset(`${email}|${signInIpOf(ctx.headers)}`);
      signInFailuresPerAccount.reset(email);
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
