"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCodeInvitation } from "../hooks/useGetCodeInvitation";

interface CodeInvitationProps {
  equipeId: string;
  codeInvitation?: string | null;
  estEntraineur: boolean;
}

export function GestionCodeInvitation({
  equipeId,
  codeInvitation,
  estEntraineur,
}: CodeInvitationProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { genererCode, supprimerCode, isGenerating, isDeleting } =
    useCodeInvitation(equipeId);

  if (!estEntraineur) return null;

  const handleCopierCode = () => {
    if (codeInvitation) {
      navigator.clipboard.writeText(codeInvitation);
      toast.success("Code d'invitation copié !");
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Code d'Invitation</CardTitle>
        <CardDescription>
          Partagez ce code pour inviter des membres à rejoindre votre équipe
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {codeInvitation ? (
          <div className="flex items-center space-x-4">
            <div className="bg-muted/30 px-4 py-2 rounded-md font-mono text-lg font-semibold">
              {codeInvitation}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopierCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copier le code</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => genererCode()}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regénérer le code</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                      variant="destructive"
                       className={`${isDeleting || isGenerating ? "bg-red-500/50" : "bg-red-500"}`}
                       size="icon"
                       disabled={isDeleting || isGenerating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Supprimer le code</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Supprimer le code d'invitation
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer ce code d'invitation ?
                    Les membres ne pourront plus rejoindre l'équipe avec ce
                    code.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                  className="bg-red-500"
                    onClick={() => {
                      supprimerCode();
                      setIsDeleteDialogOpen(false);
                    }}
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Button onClick={() => genererCode()} disabled={isGenerating}>
            Générer un code d'invitation
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
