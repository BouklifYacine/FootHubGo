import { prisma } from "@/prisma";

export async function Findinjuriesplayer( sessionId : string){
    return await prisma.blessure.findMany({
        where : {userId : sessionId}, 
        select : {
            type : true, 
            description : true, 
            startDate : true, 
            endDate : true, 
            equipe : true , 
            equipeId : true
        }
    })

}