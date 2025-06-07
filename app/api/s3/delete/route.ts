import { S3 } from "@/lib/s3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const key = body.key;

    if (!key) {
      return NextResponse.json(
        { message: "La clé est requise" },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    await S3.send(command);

    return NextResponse.json({message : "Supprimé réussie "})
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Erreur serveur" });
  }
}
