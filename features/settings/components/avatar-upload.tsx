"use client";

import { useRef } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { removeAvatar, uploadAvatar } from "../actions";
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "../schemas";

/** Profile picture: the server re-checks type and size, the client check only avoids a useless upload. */
export function AvatarUpload({ image, name }: { image: string | null; name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const invalidate = [queryKeys.me.all];
  const upload = useActionMutation(uploadAvatar, { invalidate });
  const remove = useActionMutation(removeAvatar, { invalidate });
  const busy = upload.isPending || remove.isPending;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!(AVATAR_TYPES as readonly string[]).includes(file.type) || file.size > AVATAR_MAX_BYTES) {
      toast.error("Image JPEG, PNG, WebP ou GIF de 2 Mo maximum");
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    upload.mutate(formData);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="size-28 border-4 border-background shadow-lg">
        <AvatarImage src={image ?? undefined} alt={name} className="object-cover" />
        <AvatarFallback className="text-3xl">{name[0]?.toUpperCase() ?? "?"}</AvatarFallback>
      </Avatar>
      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
          {upload.isPending ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          Changer
        </Button>
        {image && (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => remove.mutate()}>
            <Trash2 className="text-destructive" />
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}
