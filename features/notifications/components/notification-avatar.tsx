import Image from "next/image";

const COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
];

/** Sender avatar: picture, or initial on a color derived from the name. */
export function NotificationAvatar({ name, image }: { name?: string | null; image?: string | null }) {
  if (!name) {
    return (
      <div className="size-9 shrink-0 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-base">
        ?
      </div>
    );
  }

  if (image) {
    return <Image alt={name} className="size-9 shrink-0 rounded-full object-cover" height={28} src={image} width={28} />;
  }

  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return (
    <div
      className={`size-9 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-base ${COLORS[hash % COLORS.length]}`}
    >
      {name[0].toUpperCase()}
    </div>
  );
}
