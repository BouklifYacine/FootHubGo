'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useProfilePictureMutations } from "../hooks/useProfilePicture";

interface ProfilePictureUploadProps {
  userId: string;
  currentImage: string | null;
  userName: string;
}

export function ProfilePictureUpload({
  userId,
  currentImage,
  userName,
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const [isDragActive, setIsDragActive] = useState(false);

  const {
    upload,
    isUploading,
    delete: deleteProfilePicture,
    isDeleting,
  } = useProfilePictureMutations(userId);

  // Dropzone uniquement pour drag&drop, pas pour click
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      upload(file, {
        onSuccess: (publicUrl) => {
          setPreviewUrl(publicUrl);
          URL.revokeObjectURL(tempUrl);
        },
        onError: () => {
          setPreviewUrl(currentImage);
          URL.revokeObjectURL(tempUrl);
        },
      });
    },
    [upload, currentImage]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true, // <--- important : on gère le click nous-même
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => {
      setIsDragActive(false);
      toast.error(
        "Fichier non valide. Veuillez sélectionner une image de moins de 5MB."
      );
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);
    upload(file, {
      onSuccess: (publicUrl) => {
        setPreviewUrl(publicUrl);
        URL.revokeObjectURL(tempUrl);
      },
      onError: () => {
        setPreviewUrl(currentImage);
        URL.revokeObjectURL(tempUrl);
      },
    });
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    deleteProfilePicture(undefined, {
      onError: () => setPreviewUrl(currentImage),
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        {...getRootProps()}
        className={`
          relative group w-32 h-32 cursor-pointer transition-all duration-300
          ${isDragActive ? "scale-105 ring-2 ring-purple-500" : ""}
        `}
        tabIndex={0}
        aria-label="Changer la photo de profil"
      >
        {/* Avatar */}
        <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-lg transition-opacity">
          <AvatarImage
            src={previewUrl ?? ""}
            alt={userName}
            className="object-cover"
          />
          <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
            {userName?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>

        {/* Overlay drag & drop + aide */}
        <div
          className={`
            absolute inset-0 flex flex-col items-center justify-center rounded-full
            bg-black/50 transition-opacity z-20
            ${isDragActive ? "opacity-100" : "opacity-0 group-hover:opacity-80"}
          `}
        >
          <ImagePlus className="w-6 h-6 text-white mb-1" />
          <span className="text-white text-xs font-medium text-center">
            Glissez-déposez<br />ou cliquez pour changer
          </span>
        </div>

        {/* Boutons "changer" et "supprimer" côte à côte en bas à droite */}
        <div
          className={`
            absolute flex gap-1 items-center
            bottom-2 right-2 z-30
          `}
        >
          {/* Bouton "changer" */}
          <button
            type="button"
            className={`
              bg-white dark:bg-gray-900 border border-purple-500 rounded-full shadow
              p-1 flex items-center justify-center cursor-pointer
              transition-transform hover:scale-110
            `}
            title="Changer la photo"
            onClick={(e) => {
              e.stopPropagation();
              open(); // Ouvre l'explorateur de fichiers
            }}
            disabled={isUploading}
          >
            <Upload className="w-3.5 h-3.5 text-purple-600" />
          </button>
          {/* Input file invisible pour accessibilité */}
          <input
            {...getInputProps()}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Bouton "supprimer" */}
          {previewUrl && (
            <button
              type="button"
              className={`
                bg-white dark:bg-gray-900 border border-destructive rounded-full shadow
                p-1 flex items-center justify-center cursor-pointer
                transition-transform hover:scale-110
                ${isUploading || isDeleting ? "opacity-50 pointer-events-none" : ""}
              `}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={isUploading || isDeleting}
              title="Supprimer la photo"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          )}
        </div>
      </div>
     
    </div>
  );
}