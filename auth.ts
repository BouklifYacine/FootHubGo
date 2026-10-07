import { createElement } from "react";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./lib/argon2";
import { sendEmail } from "./emails/send-email";
import { WelcomeEmail } from "./emails/account-emails";
import { VerificationCodeEmail } from "./emails/verification-code-email";

const OTP_EXPIRES_IN_MINUTES = 10;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 35,
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
  rateLimit: { enabled: true, window: 10, max: 100 },
  // OAuth errors (e.g. account not linked) land on a French page instead of better-auth's default.
  onAPIError: { errorURL: "/auth/error" },
  databaseHooks: {
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
