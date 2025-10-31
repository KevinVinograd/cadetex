// Utility functions for task status and priority mapping

export function mapStatusToForm(status: string): string {
  const upper = String(status).toUpperCase()
  const map: Record<string, string> = {
    PENDING: 'en_preparacion',
    PENDING_CONFIRMATION: 'pendiente_confirmar',
    CONFIRMED: 'confirmada_tomar',
    COMPLETED: 'finalizada',
    CANCELLED: 'cancelada',
  }
  return map[upper] || status.toLowerCase()
}

export function mapStatusToBackend(status: string): string {
  const map: Record<string, string> = {
    en_preparacion: 'PENDING',
    pendiente_confirmar: 'PENDING_CONFIRMATION',
    confirmada_tomar: 'CONFIRMED',
    finalizada: 'COMPLETED',
    cancelada: 'CANCELLED',
  }
  return map[status] || status.toUpperCase()
}

export function mapPriorityToForm(priority: string | undefined | null): string {
  if (!priority) return 'normal'
  const upper = String(priority).toUpperCase()
  const map: Record<string, string> = {
    NORMAL: 'normal',
    URGENT: 'urgente',
    HIGH: 'alta',
    LOW: 'baja',
  }
  return map[upper] || String(priority).toLowerCase()
}

export function mapPriorityToBackend(priority: string): string {
  const p = String(priority).toLowerCase()
  // Backend solo admite NORMAL y URGENT
  if (p === 'urgente' || p === 'alta' || p === 'urgent' || p === 'high') return 'URGENT'
  return 'NORMAL'
}

export function mapTypeToForm(type: string): string {
  return type === 'DELIVER' ? 'entrega' : type === 'RETIRE' ? 'retiro' : (type || 'entrega')
}

export function mapTypeToBackend(type: string): string {
  return type === 'retiro' ? 'RETIRE' : 'DELIVER'
}

