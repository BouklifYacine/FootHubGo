import React from "react";

function TeamInfoSkeleton() {
  return (
    <div className="flex flex-col justify-center items-center animate-pulse">
      <div className="relative flex flex-col justify-center items-center">

        <div className="w-[170px] h-[170px] bg-gray-300 rounded-full"></div>

        <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 w-54 h-8 bg-gray-300 rounded-xl"></div>
      </div>


      <div className="flex gap-2 items-center justify-center mt-6">
        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-24 h-4 bg-gray-300 rounded"></div>
      </div>


      <div className="flex gap-10 mt-4">
        <div className="flex flex-col gap-2 items-center">
          <div className="w-12 h-8 bg-gray-300 rounded"></div>
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <div className="w-12 h-8 bg-gray-300 rounded"></div>
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <div className="w-12 h-8 bg-gray-300 rounded"></div>
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default TeamInfoSkeleton;
