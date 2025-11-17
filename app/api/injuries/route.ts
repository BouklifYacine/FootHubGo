import { Findinjuriesplayer } from "@/features/injuries/repository/FindInjuriesPlayer";
import { createInjurySchema } from "@/features/injuries/schema/createinjuryschema";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { ZodValidationRequest } from "@/lib/ValidationZodApi/ValidationZodApi";
import { NextRequest } from "next/server";

export async function POST (request : NextRequest){
  const userId = await GetSessionId()

  const { type,description,endDate } = await ZodValidationRequest(request, createInjurySchema);

    const allinjuriesplayer = await Findinjuriesplayer(userId);
    
  
}