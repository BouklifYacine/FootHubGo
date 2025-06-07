import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, X, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/use-image-upload";
import { FileRejection, useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

interface ArrayFile {
  id: string;
  file: File;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
}

export function ImageUpload() {
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload({
    onUpload: (url: string) => console.log("Uploaded image URL:", url),
  });

  const [files, setFiles] = useState<ArrayFile[]>([]);

  async function Removefiles(fileId: string) {
    try {
      const fileToRemove = files.find((f) => f.id === fileId);
      if (fileToRemove) {
        if (fileToRemove.objectUrl) {
          URL.revokeObjectURL(fileToRemove.objectUrl);
        }
      }

      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.id === fileId ? { ...f, isDeleting: true } : f))
      );

      const deleteFileResponse = await axios.delete("/api/s3/delete", {
        data: { key: fileToRemove!.key },
      });

      if (deleteFileResponse.status !== 200) {
        toast.error("Erreur sur la suppression de fichier");

        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileId ? { ...f, isDeleting: false, error: true } : f
          )
        );

        return;
      }

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: false } : f
        )
      );

      toast.success("Suppression du fichier réussie");
      setFiles((prevfiles) => prevfiles.filter((f) => f.id !== fileId));


    } catch (error) {
      console.log(error);
      toast.error("Erreur suppression fichie");
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: true } : f
        )
      );
    }
  }

  async function UploadFiles(file: File) {
    console.log(file);
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.file === file ? { ...f, uploading: true } : f))
    );

    const payload = {
      contentType: file.type,
      size: file.size,
      fileName: file.name,
    };

    try {
      const presignedUrlresponse = await axios.post("/api/s3/upload", payload);

      if (presignedUrlresponse.status !== 200) {
        toast.error("Echec de l'url");
        setFiles((prevfiles) =>
          prevfiles.map((f) =>
            f.file === file
              ? { ...f, uploading: false, progress: 0, error: true }
              : f
          )
        );
        return;
      }

      const { presignedurl, key } = presignedUrlresponse.data;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pourcentage = (event.loaded / event.total) * 100;

            setFiles((prevfiles) =>
              prevfiles.map((f) =>
                f.file === file
                  ? { ...f, progress: Math.round(pourcentage), key: key }
                  : f
              )
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFiles((prevfiles) =>
              prevfiles.map((f) =>
                f.file === file
                  ? { ...f, progress: 100, uploading: false, error: false }
                  : f
              )
            );

            toast.success("Fichier télécharger");
            resolve();
          } else {
            reject(new Error(`Upload échoué erreur ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Upload echoué"));
        };

        xhr.open("PUT", presignedurl);
        xhr.setRequestHeader("Content-type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      toast.error("Upload échoué");
      console.log(error);
      setFiles((prevfiles) =>
        prevfiles.map((f) =>
          f.file === file
            ? { ...f, uploading: false, error: true, progress: 0 }
            : f
        )
      );
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // Simule un event pour handleFileChange
        const fakeEvent = {
          target: {
            files: acceptedFiles,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
      }
      if (acceptedFiles.length > 0) {
        setFiles((prevFiles) => [
          ...prevFiles,
          ...acceptedFiles.map((file) => ({
            id: uuidv4(),
            file: file,
            uploading: false,
            progress: 0,
            isDeleting: false,
            error: false,
            objectUrl: URL.createObjectURL(file),
          })),
        ]);
      }
      console.log(acceptedFiles);
      acceptedFiles.forEach(UploadFiles);
    },

    [handleFileChange]
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const tropdefichiers = fileRejections.find(
        (filerejection) => filerejection.errors[0].code === "too-many-files"
      );
      const taillemax = fileRejections.find(
        (filerejection) => filerejection.errors[0].code === "file-too-large"
      );

      if (tropdefichiers) {
        toast.error("Vous pouvez upload que 5 images a la fois");
      }
      if (taillemax) {
        toast.error("Fichier trop lourd max 5MB");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 5,
    maxSize: 1024 * 1024 * 5, // 5MB
    accept: {
      "image/*": [],
    },
  });

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">
          {isDragActive ? "Déposez l'image ici" : "Uploader une image"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Formats supportés : JPG, PNG, GIF
        </p>
      </div>

      <Input
        {...getInputProps()}
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          {...getRootProps()}
          onClick={handleThumbnailClick}
          className={cn(
            "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted",
            isDragActive && "border-primary/50 bg-primary/5"
          )}
        >
          <div className="rounded-full bg-background p-3 shadow-sm">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragActive
                ? "Glissez-déposez le fichier ici"
                : "Cliquez pour sélectionner"}
            </p>
            <p className="text-xs text-muted-foreground">
              ou glissez-déposez le fichier ici
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="group relative h-64 overflow-hidden rounded-lg border">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleThumbnailClick}
                className="h-9 w-9 p-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {fileName && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="truncate">{fileName}</span>
              <button
                onClick={handleRemove}
                className="ml-auto rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Désactivez votre bloqueur de pub si cela échoue.
      </p>

      <div className="flex flex-wrap mt-6 gap-4 justify-center">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "relative group flex flex-col items-center bg-muted rounded-lg shadow p-2 transition-all",
              file.error && "border border-destructive"
            )}
            style={{ width: 80 }}
          >
            <div className="relative w-16 h-16 rounded overflow-hidden border border-border">
              <Image
                src={file.objectUrl || ""}
                alt="image"
                fill
                className={cn(
                  "object-cover transition-opacity duration-300",
                  file.uploading && "opacity-60"
                )}
                sizes="64px"
              />
              {/* Overlay pour l'upload */}
              {file.uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">
                    {file.progress}%
                  </span>
                </div>
              )}
              {/* Overlay pour la suppression */}
              {file.isDeleting && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
            {/* Bouton supprimer */}
            <button
              className={cn(
                "mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                "bg-destructive/10 text-destructive hover:bg-destructive/20",
                file.isDeleting && "opacity-50 pointer-events-none"
              )}
              onClick={() => Removefiles(file.id)}
              disabled={file.isDeleting}
              title="Supprimer l'image"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
            {/* Message d'erreur */}
            {file.error && (
              <span className="mt-1 text-xs text-destructive">
                Erreur suppression
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
