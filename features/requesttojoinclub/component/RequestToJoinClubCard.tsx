"use client";
import AvatarSimple from "@/components/Avatar/AvatarSimple";
import { useGetRequestToJoinClub } from "../hooks/UseGetRequestToJoinClubUser";
import LogoLiverpool from "@/public/england_arsenal.svg";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

// ... imports

function RequestToJoinClubCard() {
  const { data, isPending } = useGetRequestToJoinClub();

  return (
    <>
      <div className=" rounded-2xl p-2.5 w-[350px] flex flex-col gap-5 mx-auto md:mx-0 ">

        <h1>Vos demandes </h1>

        <div className="flex justify-between items-center bg-gray-300 rounded-2xl p-2"> 

          <div className="flex items-center gap-3"> {/* J'ai ajouté gap-3 pour espacer l'avatar du texte proprement */}
            <AvatarSimple
              alt={"Logo Liverpool"}
              src={LogoLiverpool.src}
              Fallback={"LIV"}
            ></AvatarSimple>


            <div className=""> 
              <p className="font-bold tracking-tight">Liverpool FC</p> 
              <p className="text-gray-700 text-xs tracking-tighter">Premier League</p>
            </div>
          </div>

       <div className="bg-red-400 rounded-lg flex items-center p-1 self-start">
         <Eye size={14} onClick={() => alert("Salut")} />
       </div>

        </div>

         <div className="flex justify-between items-center bg-gray-300 rounded-2xl p-2"> 

          <div className="flex items-center gap-3">
            <AvatarSimple
              alt={"Logo Liverpool"}
              src={LogoLiverpool.src}
              Fallback={"LIV"}
            ></AvatarSimple>


            <div className=""> 
              <p className="font-bold tracking-tight">Liverpool FC</p> 
              <p className="text-gray-700 text-xs tracking-tighter">Premier League</p>
            </div>
          </div>

          <Badge 
            className=" self-start text-[8px] px-1.5 py-0 h-5 " 
            variant="default" 
          >
            Salut
          </Badge>

        </div>
        
      </div>
    </>
  );
}

export default RequestToJoinClubCard;

