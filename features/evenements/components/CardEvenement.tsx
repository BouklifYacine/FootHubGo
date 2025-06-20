import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Ellipsis,  House } from "lucide-react";
import SelectPresence from './SelectPresence';
import { Badge } from '@/components/ui/badge';



function CardEvenement() {
  return (
  <>
   <div className=" rounded-xl border border-gray-400 w-2xl">
            <div className="flex flex-col items-start">
              <div className="flex items-center  justify-between w-full ">
                <h1 className="text-xl md:text-3xl mb-4 mt-4 ml-4 font-bold text-black dark:text-white tracking-tighter">
                  {" "}
                  Manchester United vs Liverpool{" "}
                </h1>
  
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Ellipsis
                      size={25}
                      className="text-white  dark:text-black mr-3 bg-black dark:bg-white rounded-3xl p-0.5 cursor-pointer"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="center">
                    <DropdownMenuItem>Modifier </DropdownMenuItem>
  
                    <DropdownMenuItem>Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
  
              <div className="flex flex-col gap-2 mb-4 ml-4">
                <div className="flex gap-2  ">
                  <Calendar />
                  <p>10 Janvier 2026 </p>
                </div>
  
                <div className="flex gap-2 ">
                  <House />
  
                  <p>Stade : Old Trafford </p>
                </div>
              </div>
            </div>
           <div className='flex justify-between items-center'>
             <SelectPresence></SelectPresence>
            <Badge className='text-green-600 bg-gray-200 text-sm mr-3 rounded-3xl'>Présent</Badge>
           </div>
          </div>
  </>
  )
}

export default CardEvenement