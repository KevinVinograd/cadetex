import { getTranslation } from "@/lib/translations"

const t = getTranslation()

interface TaskStatsSummaryProps {
  type: 'assigned' | 'unassigned'
  filteredTasks?: any[]
  unassignedTasks: any[]
}

export function TaskStatsSummary({ type, filteredTasks = [], unassignedTasks }: TaskStatsSummaryProps) {
  return (
    <div className="flex gap-4 text-center">
      {type === 'assigned' ? (
        <>
          <div className="flex-1">
            <div className="text-lg font-bold text-primary">
              {filteredTasks.filter(t => t.status === 'PENDING').length}
            </div>
            <div className="text-xs text-muted-foreground">{t.courierTasks.statusSummary.pending}</div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-green-600">
              {filteredTasks.filter(t => t.status === 'COMPLETED').length}
            </div>
            <div className="text-xs text-muted-foreground">{t.courierTasks.statusSummary.completed}</div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-orange-600">
              {filteredTasks.filter(t => t.status === 'CONFIRMED').length}
            </div>
            <div className="text-xs text-muted-foreground">{t.courierTasks.statusSummary.confirmed}</div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-blue-600 relative">
              {unassignedTasks.length}
              {unassignedTasks.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{t.courierTasks.statusSummary.unassigned}</div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1">
            <div className="text-lg font-bold text-blue-600">
              {unassignedTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">{t.courierTasks.statusSummary.unassigned}</div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-purple-600">
              {unassignedTasks.filter(t => t.priority === 'URGENT').length}
            </div>
            <div className="text-xs text-muted-foreground">{t.courierTasks.statusSummary.urgent}</div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-600">
              {unassignedTasks.filter(t => t.type === 'DELIVER').length}
            </div>
            <div className="text-xs text-muted-foreground">{t.courierTasks.statusSummary.deliveries}</div>
          </div>
        </>
      )}
    </div>
  )
}

