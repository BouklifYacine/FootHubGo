import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const Loading = () => {
  return (
    <>
     <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-5 w-1/4 mb-6" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default Loading