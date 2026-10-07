import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** User / conversation avatar with initials fallback and an optional online dot. */
export function ChatAvatar({
  name,
  image,
  isOnline,
  className,
}: {
  name: string;
  image?: string | null;
  isOnline?: boolean;
  className?: string;
}) {
  return (
    <div className="relative shrink-0">
      <Avatar className={cn("size-10", className)}>
        {image && <AvatarImage src={image} alt={name} className="object-cover" />}
        <AvatarFallback className="font-semibold text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      {isOnline !== undefined && (
        <span
          aria-label={isOnline ? "En ligne" : "Hors ligne"}
          className={cn(
            "absolute bottom-0 right-0 size-3 rounded-full border-2 border-background",
            isOnline ? "bg-green-500" : "bg-zinc-400",
          )}
        />
      )}
    </div>
  );
}
