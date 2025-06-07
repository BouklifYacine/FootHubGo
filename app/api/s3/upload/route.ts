import { uploadRequestSchema } from "@/features/upload/schemas/SchemaUpload";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "@/lib/s3Client";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = uploadRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { contentType, size, fileName } = validation.data;

    const uniqueKey = `${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: uniqueKey,
      ContentType: contentType,
      ContentLength: size,
    });

    const presignedurl = await getSignedUrl(S3, command, {
      expiresIn: 360, // 6 minutes
    });

    // Envoyer en BDD ici 

    // await prisma.user.update({
    //   where : {id : "vaEjdbYEfjiX03OPvnpESKJuc24uQbxl"}, 
    //   data : {
    //     image : presignedurl
    //   }
    // })

    const response = {
      presignedurl,
      key: uniqueKey,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur API upload:", error);
    return NextResponse.json(
      { message: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}