import { getStatusBadge, getPriorityBadge } from "./task-badges"

// Export badge helpers for use in pages
export { getStatusBadge, getPriorityBadge }

// Task data getters
export function getTaskAddress(task: any): string {
  return task?.addressOverride || "Sin dirección especificada"
}

export function getTaskContact(task: any): string {
  return task?.contact || "Sin contacto especificado"
}

export function getTaskCity(task: any): string {
  return task?.city || ""
}

// Sorting helper
export function sortTasks(tasks: any[], sortBy: string, sortOrder: string) {
  return [...tasks].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case "createdAt":
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case "scheduledDate":
        aValue = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0
        bValue = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0
        break
      case "referenceNumber":
        aValue = a.referenceNumber || ""
        bValue = b.referenceNumber || ""
        break
      case "status":
        aValue = a.status
        bValue = b.status
        break
      case "priority":
        aValue = a.priority || "NORMAL"
        bValue = b.priority || "NORMAL"
        break
      default:
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })
}

// Filtering helper
export function filterTasks(
  tasks: any[],
  searchQuery: string,
  statusFilter: string,
  typeFilter: string
) {
  return tasks.filter((task) => {
    const matchesSearch =
      task.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.providerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.courierName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesType = typeFilter === "all" || task.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })
}

// Calculate statistics
export function calculateTaskStats(tasks: any[]) {
  return {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter(task => task.status === "PENDING").length,
    pendingConfirmationTasks: tasks.filter(task => task.status === "PENDING_CONFIRMATION").length,
    confirmedTasks: tasks.filter(task => task.status === "CONFIRMED").length,
    completedTasks: tasks.filter(task => task.status === "COMPLETED").length,
    cancelledTasks: tasks.filter(task => task.status === "CANCELLED").length
  }
}
