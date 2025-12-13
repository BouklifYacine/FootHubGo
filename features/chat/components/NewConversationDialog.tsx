"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import { Search, Plus, Users, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AvatarSimple from "@/components/Avatar/AvatarSimple";
import { ClubMember } from "../types/chat.types";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: ClubMember[];
  onSelectMember: (member: ClubMember) => void;
  isLoading: boolean;
  isCreating: boolean;
}

export const NewConversationDialog = memo(function NewConversationDialog({
  open,
  onOpenChange,
  members,
  onSelectMember,
  isLoading,
  isCreating,
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [members, searchQuery]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Nouvelle conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
            >
              <User className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Message privé</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
            >
              <Users className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Groupe</span>
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher un membre..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Team members list */}
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <p className="text-center text-sm text-zinc-500 py-4">
                Aucun membre trouvé
              </p>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => !isCreating && onSelectMember(member)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                    isCreating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <AvatarSimple
                    alt={member.name}
                    src={member.image || ""}
                    Fallback={member.name.substring(0, 2).toUpperCase()}
                  />
                  <div>
                    <span className="font-medium text-sm text-zinc-900 dark:text-white">
                      {member.name}
                    </span>
                    <p className="text-xs text-zinc-500">
                      {member.role === "ENTRAINEUR"
                        ? "Entraîneur"
                        : member.poste || "Joueur"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
