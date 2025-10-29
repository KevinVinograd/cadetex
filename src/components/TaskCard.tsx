import { Link } from "react-router-dom"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { MapPin, Phone, Navigation, Eye, CheckCircle2, X, User, Building2 } from "lucide-react"
import { getStatusBadge, getTypeBadge, getPriorityBadge } from "@/lib/task-badges"
import { getTaskAddress, getTaskContact } from "@/lib/task-helpers"
import { getTranslation } from "@/lib/translations"

const t = getTranslation()

interface Task {
  id: string
  referenceNumber?: string
  clientId?: string
  clientName?: string
  providerId?: string
  providerName?: string
  addressOverride?: string
  city?: string
  province?: string
  contact?: string
  status: string
  type: string
  priority: string
  notes?: string
  mbl?: string
  hbl?: string
  freightCert?: boolean
  foCert?: boolean
  bunkerCert?: boolean
}

interface TaskCardProps {
  task: Task
  taskIndex: number
  totalTasks: number
  onFinalize?: (task: Task) => void
  onUnassign?: (taskId: string) => void
  isUnassigning?: boolean
}

export function TaskCard({ task, taskIndex, totalTasks, onFinalize, onUnassign, isUnassigning = false }: TaskCardProps) {
  const isMultiple = totalTasks > 1

  return (
    <Card key={task.id} className={`border hover:shadow-md transition-shadow ${isMultiple ? 'border-l-4 border-l-blue-400 bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
      <CardContent className="p-4">
        {/* Task Header - Mobile Optimized */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-lg text-foreground">{task.referenceNumber || t.courierTasks.taskInfo.noReference}</h3>
              {isMultiple && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  {taskIndex + 1} {t.courierTasks.taskInfo.multipleTaskFormat} {totalTasks}
                </Badge>
              )}
              {getTypeBadge(task.type)}
              {getPriorityBadge(task.priority)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {task.clientId ? (
                <>
                  <User className="h-3 w-3" />
                  <span>{task.clientName}</span>
                </>
              ) : task.providerId ? (
                <>
                  <Building2 className="h-3 w-3" />
                  <span>{task.providerName}</span>
                </>
              ) : null}
            </div>
          </div>
          {getStatusBadge(task.status)}
        </div>

        {/* Address - Compact */}
        <div className="flex items-start gap-2 mb-3 text-sm">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
            <p className="text-foreground font-medium">{getTaskAddress(task)}</p>
            {(task.city || task.province) && (
              <p className="text-muted-foreground text-xs mt-1">
                {[task.city, task.province].filter(Boolean).join(', ')}
              </p>
            )}
            {getTaskContact(task) && (
              <p className="text-muted-foreground text-xs mt-1">{getTaskContact(task)}</p>
            )}
          </div>
        </div>

        {/* Notes - Only if exists */}
        {task.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2 mb-3">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">{t.courierTasks.taskInfo.note}</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">{task.notes}</p>
          </div>
        )}

        {/* Documents and Certificates */}
        {(task.freightCert || task.foCert || task.bunkerCert || task.hbl || task.mbl) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.mbl && (
              <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                {t.courierTasks.certificates.mbl}: {task.mbl}
              </Badge>
            )}
            {task.hbl && (
              <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                {t.courierTasks.certificates.hbl}: {task.hbl}
              </Badge>
            )}
            {task.freightCert && (
              <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {t.courierTasks.certificates.freight}
              </Badge>
            )}
            {task.foCert && (
              <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {t.courierTasks.certificates.fob}
              </Badge>
            )}
            {task.bunkerCert && (
              <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {t.courierTasks.certificates.bunker}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons - Mobile Optimized */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to={`/courier/tasks/${task.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                {t.courierTasks.taskActions.view}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const fullAddress = [getTaskAddress(task), task.city, task.province].filter(Boolean).join(', ')
                const encodedAddress = encodeURIComponent(fullAddress)
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank')
              }}
            >
              <Navigation className="h-3 w-3 mr-1" />
              {t.courierTasks.taskActions.go}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const contact = getTaskContact(task)
                if (contact && contact !== "Sin contacto especificado") {
                  const phone = contact.replace(/\D/g, '')
                  if (phone) {
                    window.location.href = `tel:${phone}`
                  }
                }
              }}
            >
              <Phone className="h-3 w-3 mr-1" />
              {t.courierTasks.taskActions.call}
            </Button>
          </div>
          <div className="flex gap-2">
            {task.status === "CONFIRMED" && onFinalize && (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onFinalize(task)}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t.courierTasks.taskActions.finalize}
              </Button>
            )}
            {onUnassign && (
              <Button
                variant="outline"
                size="sm"
                className={task.status === "CONFIRMED" ? "flex-1" : "w-full"}
                onClick={() => onUnassign(task.id)}
                disabled={isUnassigning}
              >
                <X className="h-3 w-3 mr-1" />
                {isUnassigning ? t.finalizeTask.submitting : t.courierTasks.taskActions.unassign}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

