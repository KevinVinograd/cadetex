export type TaskType = "retiro" | "entrega"
export type TaskStatus = "en_preparacion" | "pendiente_confirmar" | "confirmada_tomar" | "finalizada" | "cancelada"
export type UserRole = "superadmin" | "orgadmin" | "courier"
export type Priority = "baja" | "normal" | "alta" | "urgente"

export interface Task {
  id: string
  type: TaskType
  clientId: string
  clientName: string
  providerId?: string
  providerName?: string
  organizationId?: string
  referenceBL: string
  mbl?: string
  hbl?: string
  freightCertificate?: string
  foCertificate?: string
  bunkerCertificate?: string
  status: TaskStatus
  scheduledDate: string
  pickupAddress: string
  pickupCity: string
  pickupContact: string
  deliveryAddress: string
  deliveryCity: string
  deliveryContact: string
  courierId?: string
  courierName?: string
  notes?: string
  priority: Priority
  photoRequired: boolean // Si la foto es obligatoria
  receiptPhoto?: string // Foto obligatoria del acuse de recibo
  additionalPhotos?: string[] // Fotos adicionales opcionales
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  name: string
  address: string
  city: string
  phone?: string
  email?: string
  contact?: string
  organizationId?: string
}

export interface Provider {
  id: string
  name: string
  address: string
  city: string
  phone?: string
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
