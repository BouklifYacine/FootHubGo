"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Search,
  Plus,
  Users,
  User,
  Loader2,
  ArrowLeft,
  Check,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: ClubMember[];
  onSelectMember: (member: ClubMember) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
  isLoading: boolean;
  isCreating: boolean;
}

export const NewConversationDialog = memo(function NewConversationDialog({
  open,
  onOpenChange,
  members,
  onSelectMember,
  onCreateGroup,
  isLoading,
  isCreating,
}: NewConversationDialogProps) {
  const [mode, setMode] = useState<"select" | "private" | "group">("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

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

  const handleToggleMember = useCallback((memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : prev.length < 29
          ? [...prev, memberId]
          : prev
    );
  }, []);

  const handleCreateGroup = useCallback(() => {
    if (groupName.trim() && selectedMembers.length > 0) {
      onCreateGroup(groupName.trim(), selectedMembers);
      setMode("select");
      setGroupName("");
      setSelectedMembers([]);
    }
  }, [groupName, selectedMembers, onCreateGroup]);

  const handleBack = useCallback(() => {
    setMode("select");
    setSearchQuery("");
    setGroupName("");
    setSelectedMembers([]);
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setMode("select");
        setSearchQuery("");
        setGroupName("");
        setSelectedMembers([]);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {mode !== "select" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {mode === "select"
              ? "Nouvelle conversation"
              : mode === "private"
                ? "Message privé"
                : "Nouveau groupe"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {mode === "select" && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                onClick={() => setMode("private")}
              >
                <User className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Message privé</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                onClick={() => setMode("group")}
              >
                <Users className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Groupe</span>
              </Button>
            </div>
          )}

          {mode === "group" && (
            <Input
              placeholder="Nom du groupe..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="font-medium"
            />
          )}

          {mode !== "select" && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Rechercher un membre..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {mode === "group" && selectedMembers.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">
                    {selectedMembers.length} membre
                    {selectedMembers.length > 1 ? "s" : ""} sélectionné
                    {selectedMembers.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-zinc-400">Max 30</span>
                </div>
              )}

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
                  filteredMembers.map((member) => {
                    const isSelected = selectedMembers.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() =>
                          mode === "private"
                            ? !isCreating && onSelectMember(member)
                            : handleToggleMember(member.id)
                        }
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                          mode === "group" && isSelected
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          isCreating && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <AvatarSimple
                          alt={member.name}
                          src={member.image || ""}
                          Fallback={member.name.substring(0, 2).toUpperCase()}
                        />
                        <div className="flex-1">
                          <span className="font-medium text-sm text-zinc-900 dark:text-white">
                            {member.name}
                          </span>
                          <p className="text-xs text-zinc-500">
                            {member.role === "ENTRAINEUR"
                              ? "Entraîneur"
                              : member.poste || "Joueur"}
                          </p>
                        </div>
                        {mode === "group" && isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {mode === "group" && (
                <Button
                  className="w-full"
                  onClick={handleCreateGroup}
                  disabled={
                    isCreating ||
                    !groupName.trim() ||
                    selectedMembers.length === 0
                  }
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Créer le groupe
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
