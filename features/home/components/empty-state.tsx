import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center py-8 lg:py-12">
      <div className="flex flex-col items-center gap-3 px-4 text-center lg:gap-4">
        <Icon className="size-10 text-gray-400 lg:size-12 dark:text-gray-600" />
        <p className="text-base font-semibold text-gray-600 lg:text-lg dark:text-gray-400">{title}</p>
        <p className="text-xs text-gray-500 lg:text-sm">{text}</p>
      </div>
    </div>
  );
}
