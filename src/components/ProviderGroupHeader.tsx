import { Badge } from "./ui/badge"
import { Building2 } from "lucide-react"

interface ProviderGroupHeaderProps {
  providerName: string
  taskCount: number
}

export function ProviderGroupHeader({ providerName, taskCount }: ProviderGroupHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-sm">
      <div className="p-2 bg-blue-500 rounded-full">
        <Building2 className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-blue-900 dark:text-blue-100">
            {providerName || 'Cliente'}
          </span>
          <Badge className="bg-blue-500 text-white font-bold px-3 py-1">
            {taskCount} tarea{taskCount !== 1 ? 's' : ''}
          </Badge>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          Múltiples tareas en la misma ubicación
        </p>
      </div>
    </div>
  )
}

