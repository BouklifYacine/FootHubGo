import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  serverDeleteProfilePicture,
  serverUploadProfilePicture,
} from "../actions/changerphotodeprofil";

export function useProfilePictureMutations(userId: string) {
  const queryClient = useQueryClient();

  // Upload (POST)
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { presignedurl } = await serverUploadProfilePicture({
        contentType: file.type,
        size: file.size,
        fileName: file.name,
      });

      await fetch(presignedurl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      return presignedurl as string;
    },
    onSuccess: () => {
      // Invalide la query du profil pour forcer le refetch dans le header
      queryClient.invalidateQueries({ queryKey: ["profil", userId] });
      toast.success("Photo de profil mise à jour !");
    },
    onError: () => {
      toast.error("Erreur lors de l'upload de la photo de profil.");
    },
  });

  // Suppression (DELETE)
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await serverDeleteProfilePicture();
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profil", userId] });
      toast.success("Photo de profil supprimée !");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la photo de profil.");
    },
  });

  return {
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}