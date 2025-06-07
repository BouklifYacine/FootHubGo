"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ConflitDetail } from "../(types)/EvenementsResponse";
import { ScrollArea } from "@/components/ui/ScrollArea";


interface ConflitModalProps {
  open: boolean;
  onClose: () => void;
  conflits: ConflitDetail[];
  onRetry: () => void;
}

export default function ConflitModal({
  open,
  onClose,
  conflits,
  onRetry
}: ConflitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Conflits d'horaires détectés
          </DialogTitle>
          <DialogDescription>
            {conflits.length === 1 
              ? "Un événement est déjà programmé à cette date et cette heure." 
              : `${conflits.length} événements sont déjà programmés aux dates et heures suivantes.`}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[200px] mt-2">
          <div className="space-y-2">
            {conflits.map((conflit, index) => (
              <div 
                key={index}
                className="p-2 border rounded bg-muted/50"
              >
                {conflit.dateFormatee}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="sm:mr-2">
            Fermer
          </Button>
          <Button variant="default" onClick={onRetry}>
            Modifier l'événement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}