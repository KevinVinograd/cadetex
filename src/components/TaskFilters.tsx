import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Search } from "lucide-react"
import { getTranslation } from "@/lib/translations"

const t = getTranslation()

interface TaskFiltersProps {
  searchQuery: string
  statusFilter: string
  priorityFilter: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onClear: () => void
}

export function TaskFilters({
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClear
}: TaskFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.courierTasks.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      {/* Simple Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 min-w-[120px]">
            <SelectValue placeholder={t.courierTasks.filters.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.courierTasks.filters.statusAll}</SelectItem>
            <SelectItem value="PENDING">{t.courierTasks.filters.statusPending}</SelectItem>
            <SelectItem value="CONFIRMED">{t.courierTasks.filters.statusConfirmed}</SelectItem>
            <SelectItem value="COMPLETED">{t.courierTasks.filters.statusCompleted}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="h-9 min-w-[100px]">
            <SelectValue placeholder={t.courierTasks.filters.priority} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.courierTasks.filters.priorityAll}</SelectItem>
            <SelectItem value="NORMAL">{t.courierTasks.filters.priorityNormal}</SelectItem>
            <SelectItem value="URGENT">{t.courierTasks.filters.priorityUrgent}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="h-9 px-3 text-xs"
        >
          {t.courierTasks.filters.clear}
        </Button>
      </div>
    </div>
  )
}

