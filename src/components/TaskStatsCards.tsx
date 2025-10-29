import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LucideIcon } from "lucide-react"

interface StatCard {
  title: string
  value: number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  description?: string
}

interface TaskStatsCardsProps {
  cards: StatCard[]
}

export function TaskStatsCards({ cards }: TaskStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.iconBgColor || 'bg-primary/10'}`}>
                <Icon className={`h-4 w-4 ${card.iconColor || 'text-primary'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              {card.description && (
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}


