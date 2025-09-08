import React from "react";
import Logo from "@/public/Logo_Manchester_City_2016.svg";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

function ResultLastFiveMatches() {
  return (
    <div className=" w-full max-w-5xl mx-auto rounded-2xl lg:rounded-3xl border border-gray-300 shadow-lg shadow-blue-600">
      {/* Header TOUJOURS sur la même ligne */}
      <div className="flex justify-between items-center p-3 sm:p-4 lg:p-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tighter ">
          Forme
        </h2>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xl sm:text-xl lg:text-2xl font-medium tracking-tighter ">
            Note Moyenne :
          </span>
          <span className="text-xl sm:text-xl lg:text-2xl  bg-white/10  rounded-lg font-medium tracking-tighter">
            6.3
          </span>
        </div>
      </div>

      <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
        <div className="flex flex-wrap justify-center sm:justify-between lg:justify-around gap-2 sm:gap-3 lg:gap-4">
          
          <div className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">
            <div className="relative">
              <Image 
                alt="Logo Club" 
                src={Logo} 
                width={40}
                height={40}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
              />
            </div>
            
            <p className=" text-xs sm:text-sm lg:text-base font-medium text-center">
              Août, 14
            </p>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-green-500 hover:bg-green-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                V
              </Badge>
              <span className="text-white text-sm sm:text-lg lg:text-2xl opacity-60">|</span>
              <Badge className="bg-blue-500 hover:bg-blue-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                8
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">
            <div className="relative">
              <Image 
                alt="Logo Club" 
                src={Logo} 
                width={40}
                height={40}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
              />
            </div>
            
            <p className=" text-xs sm:text-sm lg:text-base font-medium text-center">
              Août, 21
            </p>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-green-500 hover:bg-green-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                V
              </Badge>
              <span className=" text-sm sm:text-lg lg:text-2xl opacity-60">|</span>
              <Badge className="bg-blue-500 hover:bg-blue-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                7
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">
            <div className="relative">
              <Image 
                alt="Logo Club" 
                src={Logo} 
                width={40}
                height={40}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
              />
            </div>
            
            <p className=" text-xs sm:text-sm lg:text-base font-medium text-center">
              Sept, 04
            </p>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                D
              </Badge>
              <span className="text-white text-sm sm:text-lg lg:text-2xl opacity-60">|</span>
              <Badge className="bg-blue-500 hover:bg-blue-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                5
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">
            <div className="relative">
              <Image 
                alt="Logo Club" 
                src={Logo} 
                width={40}
                height={40}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
              />
            </div>
            
            <p className=" text-xs sm:text-sm lg:text-base font-medium text-center">
              Sept, 11
            </p>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-yellow-500 hover:bg-yellow-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                N
              </Badge>
              <span className="text-white text-sm sm:text-lg lg:text-2xl opacity-60">|</span>
              <Badge className="bg-blue-500 hover:bg-blue-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                6
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]">
            <div className="relative">
              <Image 
                alt="Logo Club" 
                src={Logo} 
                width={40}
                height={40}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
              />
            </div>
            
            <p className=" text-xs sm:text-sm lg:text-base font-medium text-center">
              Sept, 18
            </p>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge className="bg-green-500 hover:bg-green-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                V
              </Badge>
              <span className="text-white text-sm sm:text-lg lg:text-2xl opacity-60">|</span>
              <Badge className="bg-blue-500 hover:bg-blue-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                9
              </Badge>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ResultLastFiveMatches;
