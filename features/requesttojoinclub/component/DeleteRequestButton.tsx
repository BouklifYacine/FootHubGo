import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Trash2 } from 'lucide-react';

type Props = {
  equipeId: string ;
  requestId : string;
  DeleteRequest: (requestId: string, teamId: string) => void
  PendingDeleteRequest: boolean
}

function DeleteRequestButton({DeleteRequest, equipeId, requestId, PendingDeleteRequest} : Props) {
  return (
    <div><DropdownMenuItem 
                            className="cursor-pointer gap-2 py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                DeleteRequest(requestId, equipeId);
                            }}
                            disabled={PendingDeleteRequest}
                        >
                            <Trash2 size={16} />
                            <span className="font-medium">Supprimer la demande</span>
                        </DropdownMenuItem></div>
  )
}

export default DeleteRequestButton