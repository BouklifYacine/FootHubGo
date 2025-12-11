import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Handshake } from 'lucide-react'

type Props = {
    TeamId : string 
}

function TransferRequestToaClubButton({TeamId} : Props ) {

  return (
    <div> <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => console.log(TeamId)} variant="outline" size="icon" className="rounded-xl">
                       <Handshake className="h-4 w-4" ></Handshake>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">
                      Faire une demande pour rejoindre ce club 
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider></div>
  )
}

export default TransferRequestToaClubButton