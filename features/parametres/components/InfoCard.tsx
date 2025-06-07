
import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InfoCardProps {
  icon?: LucideIcon | React.ReactNode
  title: string
  description?: string
  content: React.ReactNode
  className?: string
  cardClassName?: string
}

export function InfoCard({
  icon: Icon,
  title,
  description,
  content,
  className,
  cardClassName,
}: InfoCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
      cardClassName
    )}>
      <div className={cn("p-6 space-y-4", className)}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {Icon && (
              typeof Icon === 'function' ? (
                <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                Icon
              )
            )}
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {content}
        </div>
      </div>
    </Card>
  )
}