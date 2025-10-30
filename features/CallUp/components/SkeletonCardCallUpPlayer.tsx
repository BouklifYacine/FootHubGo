import React from "react";

function SkeletonCardCallUpPlayer() {
  return (
    <div className="bg-white rounded-xl w-full max-w-[425px] mt-4 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-t-xl" />
      <div className="p-4 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-10 bg-gray-200 rounded w-full mt-6" />
      </div>
    </div>
  );
}

export default SkeletonCardCallUpPlayer;
