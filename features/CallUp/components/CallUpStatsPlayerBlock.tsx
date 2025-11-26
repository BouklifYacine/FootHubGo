"use client"
import React from 'react'
import { useGetCallUp } from '../hooks/UseGetCallUp'
import { CheckCheck, CreditCard, Landmark, OctagonX, Phone, PhoneOff, TableProperties, UserPlus, Users } from 'lucide-react'
import { BlockStats2 } from '@/components/Blocks/BlockStats2'
import SkeletonBlockCallUpStatsPlayer from './SkeletonBlockCallUpStatsPlayer'

function CallUpStatsPlayerBlock() {
   const {data, isPending} =  useGetCallUp()

   if (isPending) {
    return <><SkeletonBlockCallUpStatsPlayer /></>
   }
   console.log(data)
  return (
    <div> <div className="flex flex-col md:flex-row gap-6 mb-8 mt-4">
          <BlockStats2
            icon={<TableProperties />}
            title="Convocation totale"
            value={data?.stats.total || 0}
          />
          <BlockStats2
             icon={<PhoneOff />}
            title="Convocation refusée"
           value={data?.stats.refuses || 0}
          />
          <BlockStats2
            icon={<CheckCheck />}
            title="Convocation confirmée"
            value={data?.stats.confirmes || 0}
          />
          <BlockStats2 
            icon={<OctagonX />} 
            title="Convocation passée" 
             value={data?.stats.passees || 0}
          />
        </div></div>
  )
}

export default CallUpStatsPlayerBlock