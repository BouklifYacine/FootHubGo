import { NextRequest } from "next/server";
import { z } from "zod";

export async function ZodValidationRequest<T extends z.ZodTypeAny>(request: NextRequest,schema: T): Promise<z.infer<T>> {
  const body = await request.json();
  const validation = schema.safeParse(body);

  if (!validation.success) {
   throw new Error(validation.error.errors[0].message);
  }

  return validation.data;
}
