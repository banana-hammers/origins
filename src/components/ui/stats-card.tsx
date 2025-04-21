import { Card } from "./card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  className?: string
  chart?: React.ReactNode
  trend?: {
    value: number
    label: string
  }
}

export function StatsCard({
  title,
  value,
  description,
  className,
  chart,
  trend,
}: StatsCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden bg-card/50 backdrop-blur-sm border-muted/20",
      className
    )}>
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {trend && (
            <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-foreground">
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </div>
          )}
        </div>
        {chart && <div className="mt-4">{chart}</div>}
      </div>
    </Card>
  )
}