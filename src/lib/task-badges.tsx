import { Badge } from "@/components/ui/badge"

export const getStatusBadge = (status: string) => {
  const variants = {
    PENDING: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    PENDING_CONFIRMATION: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }
  const labels = {
    PENDING: "Pendiente",
    PENDING_CONFIRMATION: "Pendiente Confirmación",
    CONFIRMED: "Confirmado",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado"
  }
  return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
}

export const getTypeBadge = (type: string) => {
  const variants = {
    DELIVER: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    RETIRE: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  }
  const labels = {
    DELIVER: "Entrega",
    RETIRE: "Retiro",
  }
  return <Badge className={variants[type as keyof typeof variants]}>{labels[type as keyof typeof labels]}</Badge>
}

export const getPriorityBadge = (priority: string) => {
  const variants = {
    NORMAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    URGENT: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }
  const labels = {
    NORMAL: "Normal",
    URGENT: "Urgente",
  }
  return <Badge className={variants[priority as keyof typeof variants]}>{labels[priority as keyof typeof labels]}</Badge>
}

