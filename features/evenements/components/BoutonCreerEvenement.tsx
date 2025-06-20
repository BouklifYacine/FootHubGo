


import { Button } from 'flowbite-react/components/Button'
import { CirclePlus } from 'lucide-react'
import React from 'react'

function BoutonCreerEvenement() {
  return (
    <>
     <div className="mb-6">
            <Button className=" "> Créer un évenement  <CirclePlus size={20} className='ml-2' /></Button>
          </div>
    </>
  )
}

export default BoutonCreerEvenement