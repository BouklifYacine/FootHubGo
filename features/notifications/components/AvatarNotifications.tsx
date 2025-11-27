import Image from "next/image";

interface AvatarProps {
  name: string;
  image?: string | null;
}

export function AvatarNotifications({ name, image }: AvatarProps) {
  const initial = name[0].toUpperCase();

  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
  ];

  // Calculer une couleur basée sur le nom
  let total = 0;
  for (let i = 0; i < name.length; i++) {
    total += name.charCodeAt(i);
  }
  const colorIndex = total % colors.length;

  if (image) {
    return (
      <Image
        alt={name}
        className="size-9 rounded-full object-cover"
        height={28}
        src={image}
        width={28}
      />
    );
  }

  return (
    <div
      className={`size-9 rounded-full flex items-center justify-center text-white font-bold text-base ${colors[colorIndex]}`}
    >
      {initial}
    </div>
  );
}
