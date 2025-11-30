import Image from "next/image";

interface AvatarMembreProps {
  image: string | null;
  name: string;
}

export function AvatarMembre({ image, name }: AvatarMembreProps) {
  if (image) {
    return (
      <Image
        src={image}
        width={35}
        height={35}
        alt={name}
        className="rounded-full"
      />
    );
  }

  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700">
      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
        {name?.charAt(0).toUpperCase() || "?"}
      </span>
    </div>
  );
}
