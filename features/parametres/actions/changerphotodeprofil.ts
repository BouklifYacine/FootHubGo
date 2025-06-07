"use server";

import { prisma } from "@/prisma";
import { S3 } from "@/lib/s3Client";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { uploadRequestSchema } from "@/features/upload/schemas/SchemaUpload";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Utilitaire pour extraire la clé S3 depuis une URL
const getS3Key = (url: string) => {
  try {
    return new URL(url).pathname.split("/").pop() || null;
  } catch {
    return null;
  }
};

// === SERVER ACTION pour l'upload (POST) ===
export async function serverUploadProfilePicture(formData: {
  contentType: string;
  size: number;
  fileName: string;
}) {
  try {
    // Authentification (headers inutiles en server action)
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new Error("Connectez-vous");
    }

    // Validation du body
    const validation = uploadRequestSchema.safeParse(formData);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    const { contentType, size, fileName } = validation.data;
    const uniqueKey = `${uuidv4()}-${fileName}`;

    // Récupérer l'ancienne image pour suppression éventuelle
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Générer la presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: uniqueKey,
      ContentType: contentType,
      ContentLength: size,
    });
    const presignedurl = await getSignedUrl(S3, command, { expiresIn: 360 });

    // Mettre à jour la BDD avec la nouvelle image (on garde la presignedurl comme dans ton code)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: presignedurl },
    });

    // Supprimer l'ancienne image si elle existe
    if (user?.image) {
      const oldKey = getS3Key(user.image);
      if (oldKey) {
        await S3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: oldKey,
          })
        );
      }
    }

    revalidatePath(`/parametres/${session.user.id}`);

    return {
      presignedurl,
      key: uniqueKey,
      uniqueKey,
      message: "URL de l'image enregistrée dans la base de données",
    };
  } catch (error) {
    console.error("Erreur API upload:", error);
    throw new Error("Erreur serveur interne");
  }
}

// === SERVER ACTION pour la suppression (DELETE) ===
export async function serverDeleteProfilePicture() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new Error("Connectez-vous");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    if (!user.image) {
      throw new Error("Aucune image à supprimer");
    }

    const key = getS3Key(user.image);
    if (key) {
      await S3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
        })
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    revalidatePath(`/parametres/${session.user.id}`);

    return { success: true };
  } catch (error) {
    console.error("Erreur suppression profil:", error);
    throw new Error("Erreur serveur");
  }
}
