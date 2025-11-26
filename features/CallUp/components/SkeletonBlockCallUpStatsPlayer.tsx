import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

function SkeletonBlockCallUpStatsPlayer() {
  return (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
  )
}

export default SkeletonBlockCallUpStatsPlayer