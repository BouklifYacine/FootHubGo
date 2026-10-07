"use server";

import { createElement } from "react";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireUser, findMembership } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { hashPassword } from "@/lib/argon2";
import { avatarPrefix, publicObjectUrl, s3, S3_BUCKET } from "@/lib/s3";
import { sendEmail } from "@/emails/send-email";
import {
  AccountDeletedEmail,
  EmailChangedEmail,
  NameChangedEmail,
  PasswordChangedEmail,
} from "@/emails/account-emails";
import { cancelCustomerSubscriptions } from "@/features/billing/server/subscriptions";
import { verifyCurrentPassword } from "./server/password";
import { deleteAllAvatars, deleteOwnAvatar } from "./server/avatar";
import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  deleteAccountSchema,
  updateEmailSchema,
  updateNameSchema,
  updatePasswordSchema,
} from "./schemas";

/** Signs the user out everywhere (after an email / password change). */
const revokeSessions = (userId: string) => prisma.session.deleteMany({ where: { userId } });

export const updateName = action(updateNameSchema, async ({ name, password }) => {
  const user = await requireUser();
  await verifyCurrentPassword(user.id, password, { required: false });

  if (name === user.name) return { message: "Pseudo inchangé" };
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

export const updateEmail = action(updateEmailSchema, async ({ email, password }) => {
  const user = await requireUser();
  await verifyCurrentPassword(user.id, password);

  if (email === user.email) throw new AppError("C'est déjà votre email");
  const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (taken) throw new AppError("Cet email est déjà utilisé");

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { email, emailVerified: false } }),
    revokeSessions(user.id),
  ]);

  // Both addresses are told, so a hijacked account is noticed.
  const notice = createElement(EmailChangedEmail, { name: user.name, oldEmail: user.email, newEmail: email });
  await Promise.all([
    sendEmail({ to: user.email, subject: "Changement de votre email", email: notice }),
    sendEmail({ to: email, subject: "Confirmation de votre nouvel email", email: notice }),
  ]);
  return { message: "Email modifié, reconnectez-vous" };
});

export const updatePassword = action(updatePasswordSchema, async ({ currentPassword, newPassword }) => {
  const user = await requireUser();
  const account = await verifyCurrentPassword(user.id, currentPassword);

  await prisma.$transaction([
    prisma.account.update({ where: { id: account.id }, data: { password: await hashPassword(newPassword) } }),
    revokeSessions(user.id),
  ]);

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
  await prisma.user.delete({ where: { id: user.id } });
  await sendEmail({
    to: user.email,
    subject: "Compte supprimé",
    email: createElement(AccountDeletedEmail, { name: user.name }),
  });
  return { message: "Compte supprimé" };
});

/** The file is checked here (type + size), never trusted from the browser. */
const avatarSchema = z
  .instanceof(FormData)
  .transform((formData) => formData.get("file"))
  .pipe(
    z
      .instanceof(File, { message: "Aucun fichier reçu" })
      .refine((file) => (AVATAR_TYPES as readonly string[]).includes(file.type), {
        message: "Formats acceptés : JPEG, PNG, WebP ou GIF",
      })
      .refine((file) => file.size > 0 && file.size <= AVATAR_MAX_BYTES, {
        message: "L'image ne doit pas dépasser 2 Mo",
      }),
  );

export const uploadAvatar = action(avatarSchema, async (file) => {
  const user = await requireUser();

  const extension = file.type.split("/")[1];
  const key = `${avatarPrefix(user.id)}${crypto.randomUUID()}.${extension}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      ContentLength: file.size,
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
