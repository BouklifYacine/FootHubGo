"use server";

import { createElement } from "react";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireUser, findMembership } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { hashPassword } from "@/lib/argon2";
import { detectImageType, imageExtension } from "@/lib/image-type";
import { enforceRateLimit, rateLimiter } from "@/lib/rate-limit";
import { appSecret } from "@/lib/signed-token";
import { disconnectUserSockets } from "@/server/realtime/emitter";
import { avatarPrefix, publicObjectUrl, s3, S3_BUCKET } from "@/lib/s3";
import { sendEmail } from "@/emails/send-email";
import { VerificationCodeEmail } from "@/emails/verification-code-email";
import {
  AccountDeletedEmail,
  EmailChangedEmail,
  NameChangedEmail,
  PasswordChangedEmail,
} from "@/emails/account-emails";
import { cancelCustomerSubscriptions } from "@/features/billing/server/subscriptions";
import { revokeSessions, verifyCurrentPassword } from "./server/password";
import { deleteAllAvatars, deleteOwnAvatar } from "./server/avatar";
import {
  AVATAR_MAX_BYTES,
  confirmEmailChangeSchema,
  deleteAccountSchema,
  updateEmailSchema,
  updateNameSchema,
  updatePasswordSchema,
} from "./schemas";
import {
  EMAIL_CHANGE_MAX_ATTEMPTS,
  EMAIL_CHANGE_TTL_MINUTES,
  checkEmailChangeCode,
  emailChangeIdentifier,
  hashEmailChangeCode,
  newEmailChangeCode,
  parsePendingEmailChange,
  type PendingEmailChange,
} from "./email-change";

/** Codes sent to a new address: 3 per hour per user (each one is an email). */
const emailChangeRequests = rateLimiter("email-change-requests", { max: 3, windowMs: 60 * 60_000 });
const avatarUploads = rateLimiter("avatar-uploads", { max: 10, windowMs: 60 * 60_000 });

export const updateName = action(updateNameSchema, async ({ name, password }) => {
  const user = await requireUser();
  // Nothing to change: answered before the (slow, rate-limited) password check.
  if (name === user.name) return { message: "Pseudo inchangé" };
  await verifyCurrentPassword(user.id, password, { required: false });

  const taken = await prisma.user.findUnique({ where: { name }, select: { id: true } });
  if (taken) throw new AppError("Ce pseudo est déjà utilisé");

  await prisma.user.update({ where: { id: user.id }, data: { name } });
  await sendEmail({
    to: user.email,
    subject: "Changement de pseudo",
    email: createElement(NameChangedEmail, { oldName: user.name, newName: name }),
  });
  return { message: "Pseudo modifié" };
});

/**
 * Step 1 of an email change: checks the password and sends a code to the NEW address.
 * Nothing changes until the code is confirmed (the new address must belong to the user).
 */
export const requestEmailChange = action(updateEmailSchema, async ({ email, password }) => {
  const user = await requireUser();
  enforceRateLimit([[emailChangeRequests, user.id]], "Trop de demandes. Réessayez dans une heure.");
  await verifyCurrentPassword(user.id, password);

  if (email === user.email.toLowerCase()) throw new AppError("C'est déjà votre email");
  const taken = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (taken) throw new AppError("Cet email est déjà utilisé");

  const code = newEmailChangeCode();
  const pending: PendingEmailChange = { email, codeHash: hashEmailChangeCode(user.id, code, appSecret()), attempts: 0 };
  const identifier = emailChangeIdentifier(user.id);
  const now = new Date();
  await prisma.$transaction([
    prisma.verification.deleteMany({ where: { identifier } }),
    prisma.verification.create({
      data: {
        id: crypto.randomUUID(),
        identifier,
        value: JSON.stringify(pending),
        expiresAt: new Date(now.getTime() + EMAIL_CHANGE_TTL_MINUTES * 60_000),
        createdAt: now,
        updatedAt: now,
      },
    }),
  ]);

  await sendEmail({
    to: email,
    subject: "Confirmez votre nouvel email",
    email: createElement(VerificationCodeEmail, {
      code,
      name: user.name,
      title: "Confirmez votre nouvel email",
      expiresInMinutes: EMAIL_CHANGE_TTL_MINUTES,
    }),
  });
  return { message: `Code envoyé à ${email}`, data: { email } };
});

/** Step 2: the code proves the new address; the email changes and every session is closed. */
export const confirmEmailChange = action(confirmEmailChangeSchema, async ({ code }) => {
  const user = await requireUser();
  const identifier = emailChangeIdentifier(user.id);
  const row = await prisma.verification.findFirst({ where: { identifier }, orderBy: { expiresAt: "desc" } });
  const pending = row && parsePendingEmailChange(row.value);
  if (!row || !pending) throw new AppError("Aucun changement d'email en cours");

  const check = checkEmailChangeCode({ pending, expiresAt: row.expiresAt, code, userId: user.id, secret: appSecret() });
  if (check !== "ok") {
    if (check === "invalid" && pending.attempts + 1 < EMAIL_CHANGE_MAX_ATTEMPTS) {
      await prisma.verification.update({
        where: { id: row.id },
        data: { value: JSON.stringify({ ...pending, attempts: pending.attempts + 1 }), updatedAt: new Date() },
      });
      throw new AppError("Code incorrect");
    }
    await prisma.verification.delete({ where: { id: row.id } });
    throw new AppError(check === "expired" ? "Code expiré, recommencez" : "Trop de tentatives, recommencez");
  }

  const taken = await prisma.user.findFirst({
    where: { email: { equals: pending.email, mode: "insensitive" }, id: { not: user.id } },
    select: { id: true },
  });
  if (taken) throw new AppError("Cet email est déjà utilisé");

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { email: pending.email, emailVerified: true } }),
    prisma.verification.delete({ where: { id: row.id } }),
  ]);
  await revokeSessions(user.id);

  // Both addresses are told, so a hijacked account is noticed.
  const notice = createElement(EmailChangedEmail, { name: user.name, oldEmail: user.email, newEmail: pending.email });
  await Promise.all([
    sendEmail({ to: user.email, subject: "Changement de votre email", email: notice }),
    sendEmail({ to: pending.email, subject: "Votre nouvel email est confirmé", email: notice }),
  ]);
  return { message: "Email modifié, reconnectez-vous" };
});

export const updatePassword = action(updatePasswordSchema, async ({ currentPassword, newPassword }) => {
  const user = await requireUser();
  const account = await verifyCurrentPassword(user.id, currentPassword);

  await prisma.account.update({ where: { id: account.id }, data: { password: await hashPassword(newPassword) } });
  await revokeSessions(user.id);

  await sendEmail({
    to: user.email,
    subject: "Changement de mot de passe",
    email: createElement(PasswordChangedEmail, { name: user.name }),
  });
  return { message: "Mot de passe modifié, reconnectez-vous" };
});

export const deleteAccount = action(deleteAccountSchema, async ({ password }) => {
  const user = await requireUser();
  await verifyCurrentPassword(user.id, password, { required: false });

  // Leaving the team first keeps it consistent (last coach, chat, notifications).
  if (await findMembership(user.id)) {
    throw new AppError("Quittez votre club avant de supprimer votre compte");
  }

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { clientId: true },
  });
  if (dbUser.clientId) await cancelCustomerSubscriptions(dbUser.clientId);
  await deleteAllAvatars(user.id);

  // Sessions, accounts, subscription... are removed by `onDelete: Cascade`.
  // Notifications sent to others keep no trace of the deleted user's name or photo.
  await prisma.$transaction([
    prisma.notification.updateMany({
      where: { fromUserName: user.name },
      data: { fromUserName: null, fromUserImage: null },
    }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);
  await disconnectUserSockets(user.id);
  await sendEmail({
    to: user.email,
    subject: "Compte supprimé",
    email: createElement(AccountDeletedEmail, { name: user.name }),
  });
  return { message: "Compte supprimé" };
});

/** The file is checked here (size, then type from its first bytes): never trusted from the browser. */
const avatarSchema = z
  .instanceof(FormData)
  .transform((formData) => formData.get("file"))
  .pipe(
    z
      .instanceof(File, { message: "Aucun fichier reçu" })
      .refine((file) => file.size > 0 && file.size <= AVATAR_MAX_BYTES, {
        message: "L'image ne doit pas dépasser 2 Mo",
      }),
  );

export const uploadAvatar = action(avatarSchema, async (file) => {
  const user = await requireUser();
  enforceRateLimit([[avatarUploads, user.id]], "Trop d'envois de photo. Réessayez plus tard.");

  const body = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(body);
  if (!type) throw new AppError("Formats acceptés : JPEG, PNG, WebP ou GIF");

  const key = `${avatarPrefix(user.id)}${crypto.randomUUID()}.${imageExtension[type]}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: type,
      ContentLength: body.length,
      ContentDisposition: "inline",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const previous = await prisma.user.findUnique({ where: { id: user.id }, select: { image: true } });
  const image = publicObjectUrl(key);
  await prisma.user.update({ where: { id: user.id }, data: { image } });
  await deleteOwnAvatar(previous?.image, user.id);

  return { message: "Photo de profil mise à jour", data: image };
});

export const removeAvatar = action(z.void(), async () => {
  const user = await requireUser();
  const { image } = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { image: true } });
  if (!image) throw new AppError("Aucune photo à supprimer");

  await prisma.user.update({ where: { id: user.id }, data: { image: null } });
  await deleteOwnAvatar(image, user.id);
  return { message: "Photo de profil supprimée" };
});
