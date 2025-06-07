"use server";

import { prisma } from "@/prisma";
import { SessionAdmin } from "../../../lib/SessionAdmin";
import { revalidatePath } from "next/cache";
import { ModifierRoleInputSchema } from "../schemas/SchemaRole";

export async function ModifierRole(
  id: string,
  newRole: "Admin" | "utilisateur"
) {

  const validationinput = ModifierRoleInputSchema.safeParse({id , newRole})
  if(!validationinput.success){
    return {
      success : false, 
    }
  }
  await SessionAdmin();

  await prisma.user.update({
    where: { id: id },
    data: { role: newRole },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/parametres/${id}`);

  return {
    success: true,
    message: "Role changé avec succès",
  };
}
