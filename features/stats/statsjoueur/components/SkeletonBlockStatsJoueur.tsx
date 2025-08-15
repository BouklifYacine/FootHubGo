"use client";

import React from "react";
import { Bluetooth } from "lucide-react";

function SkeletonBlockStats() {
  return (
    <div className="flex flex-wrap mt-5 justify-evenly">
      {/* Bloc 1 */}
      <div className="border w-[400px] border-gray-400 rounded-xl animate-pulse bg-gray-100">
        <div className="flex gap-0.5 p-3 items-center">
          <div className="h-7 w-32 bg-gray-300 rounded ml-2" />
        </div>
        <div className="flex items-center">
          <div className="p-3">
            <div className="h-10 w-20 bg-gray-300 rounded" />
          </div>
          <div className="bg-gray-300 rounded-lg p-3 ml-2 w-8 h-8" />
        </div>
      </div>
      {/* Bloc 2 */}
      <div className="border w-[400px] border-gray-400 rounded-xl animate-pulse bg-gray-100">
        <div className="flex gap-0.5 p-3 items-center">

          <div className="h-7 w-32 bg-gray-300 rounded ml-2" />
        </div>
        <div className="flex items-center">
          <div className="p-3">
            <div className="h-10 w-20 bg-gray-300 rounded" />
          </div>
          <div className="bg-gray-300 rounded-lg p-3 ml-2 w-8 h-8" />
        </div>
      </div>
      {/* Bloc 3 */}
      <div className="border w-[400px] border-gray-400 rounded-xl animate-pulse bg-gray-100">
        <div className="flex gap-0.5 p-3 items-center">

          <div className="h-7 w-32 bg-gray-300 rounded ml-2" />
        </div>
        <div className="flex items-center">
          <div className="p-3">
            <div className="h-10 w-20 bg-gray-300 rounded" />
          </div>
          <div className="bg-gray-300 rounded-lg p-3 ml-2 w-8 h-8" />
        </div>
      </div>
      {/* Bloc 4 */}
      <div className="border w-[400px] border-gray-400 rounded-xl animate-pulse bg-gray-100">
        <div className="flex gap-0.5 p-3 items-center">

          <div className="h-7 w-32 bg-gray-300 rounded ml-2" />
        </div>
        <div className="flex items-center">
          <div className="p-3">
            <div className="h-10 w-20 bg-gray-300 rounded" />
          </div>
          <div className="bg-gray-300 rounded-lg p-3 ml-2 w-8 h-8" />
        </div>
      </div>
      {/* Bloc 5 */}
      <div className="border w-[400px] border-gray-400 rounded-xl animate-pulse bg-gray-100">
        <div className="flex gap-0.5 p-3 items-center">

          <div className="h-7 w-32 bg-gray-300 rounded ml-2" />
        </div>
        <div className="flex items-center">
          <div className="p-3">
            <div className="h-10 w-20 bg-gray-300 rounded" />
          </div>
          <div className="bg-gray-300 rounded-lg p-3 ml-2 w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonBlockStats;