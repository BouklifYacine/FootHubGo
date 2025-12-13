"use client";

import React, { useState, memo, useMemo } from "react";
import {
  Settings,
  Trash2,
  LogOut,
  UserMinus,
  Loader2,
  UserPlus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AvatarSimple from "@/components/Avatar/AvatarSimple";
import { Conversation, ClubMember } from "../types/chat.types";
import { cn } from "@/lib/utils";

interface GroupSettingsDialogProps {
  conversation: Conversation;
  currentUserId: string;
  isCreator: boolean;
  onRename: (name: string) => void;
  onKick: (userId: string) => void;
  onLeave: () => void;
  onDelete: () => void;
  onAddMembers?: (memberIds: string[]) => void;
  availableMembers?: ClubMember[];
  isUpdating: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const GroupSettingsDialog = memo(function GroupSettingsDialog({
  conversation,
  currentUserId,
  isCreator,
  onRename,
  onKick,
  onLeave,
  onDelete,
  onAddMembers,
  availableMembers = [],
  isUpdating,
  open: controlledOpen,
  onOpenChange,
}: GroupSettingsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [newName, setNewName] = useState(conversation.name || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);

  // Filter out members already in the group
  const membersToAdd = useMemo(() => {
    const existingIds = new Set(
      conversation.participants?.map((p) => p.id) || []
    );
    return availableMembers.filter((m) => !existingIds.has(m.id));
  }, [availableMembers, conversation.participants]);

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== conversation.name) {
      onRename(newName.trim());
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
      setOpen(false);
    } else {
      setConfirmDelete(true);
    }
  };

  const handleToggleAdd = (memberId: string) => {
    setSelectedToAdd((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMembers = () => {
    if (selectedToAdd.length > 0 && onAddMembers) {
      onAddMembers(selectedToAdd);
      setSelectedToAdd([]);
      setShowAddMembers(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setConfirmDelete(false);
          setNewName(conversation.name || "");
          setShowAddMembers(false);
          setSelectedToAdd([]);
        }
      }}
    >
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
            <Settings className="h-4 w-4 text-zinc-500" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {showAddMembers ? "Ajouter des membres" : "Paramètres du groupe"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {showAddMembers ? (
            <>
              {/* Add Members View */}
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {membersToAdd.length === 0 ? (
                  <p className="text-center text-sm text-zinc-500 py-4">
                    Tous les membres sont déjà dans le groupe
                  </p>
                ) : (
                  membersToAdd.map((member) => {
                    const isSelected = selectedToAdd.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => handleToggleAdd(member.id)}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                          isSelected
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <AvatarSimple
                          alt={member.name}
                          src={member.image || ""}
                          Fallback={member.name.substring(0, 2).toUpperCase()}
                        />
                        <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-white">
                          {member.name}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddMembers(false);
                    setSelectedToAdd([]);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddMembers}
                  disabled={isUpdating || selectedToAdd.length === 0}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Ajouter ({selectedToAdd.length})
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Group Name */}
              {isCreator && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Nom du groupe
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Nom du groupe..."
                    />
                    <Button
                      onClick={handleRename}
                      disabled={
                        isUpdating ||
                        !newName.trim() ||
                        newName.trim() === conversation.name
                      }
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Enregistrer"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Add Members Button */}
              {isCreator && membersToAdd.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAddMembers(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter des membres
                </Button>
              )}

              {/* Members List */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Membres ({conversation.participants?.length || 0})
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {conversation.participants?.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <AvatarSimple
                        alt={p.name}
                        src={p.image || ""}
                        Fallback={p.name.substring(0, 2).toUpperCase()}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                          {p.name}
                        </span>
                        {p.id === conversation.creatorId && (
                          <span className="ml-2 text-xs text-primary">
                            Admin
                          </span>
                        )}
                      </div>
                      {isCreator && p.id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onKick(p.id)}
                          disabled={isUpdating}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-2">
                {!isCreator && (
                  <Button
                    variant="outline"
                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => {
                      onLeave();
                      setOpen(false);
                    }}
                    disabled={isUpdating}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Quitter le groupe
                  </Button>
                )}
                {isCreator && (
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full",
                      confirmDelete
                        ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                        : "text-red-600 border-red-200 hover:bg-red-50"
                    )}
                    onClick={handleDelete}
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {confirmDelete
                      ? "Confirmer la suppression"
                      : "Supprimer le groupe"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
