export type TaskType = "retiro" | "entrega"
export type TaskStatus = "en_preparacion" | "pendiente_confirmar" | "confirmada_tomar" | "finalizada" | "cancelada"
export type UserRole = "superadmin" | "orgadmin" | "courier"
export type Priority = "baja" | "normal" | "alta" | "urgente"

export interface Task {
  id: string
  type: TaskType
  clientId?: string
  clientName?: string
  providerId?: string
  providerName?: string
  organizationId?: string
  referenceNumber?: string
  addressOverride?: string
  city?: string
  province?: string
  contact?: string
  courierId?: string
  courierName?: string
  status: TaskStatus
  priority: Priority
  scheduledDate?: string
  notes?: string
  mbl?: string
  hbl?: string
  freightCert?: boolean
  foCert?: boolean
  bunkerCert?: boolean
  linkedTaskId?: string
  receiptPhotoUrl?: string
  photoRequired?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Client {
  id: string
  name: string
  address: string
  city: string
  phoneNumber?: string
  email?: string
  contact?: string
  organizationId?: string
}

export interface Provider {
  id: string
  name: string
  address: string
  city: string
  phoneNumber?: string
  email?: string
  contact?: string
  organizationId?: string
}

export interface Courier {
  id: string
  userId?: string // Reference to users table
  name: string
  phoneNumber: string
  address?: string
  vehicleType: string
  activeTasks: number
  organizationId?: string
}

export interface Organization {
  id: string
  name: string
  adminEmail?: string
}
