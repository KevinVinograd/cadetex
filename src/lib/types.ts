export type TaskType = "delivery" | "pickup" | "both"
export type TaskStatus = "en_preparacion" | "pendiente_confirmar" | "confirmada_tomar" | "finalizada" | "cancelada"
export type UserRole = "superadmin" | "orgadmin" | "courier"

export interface Task {
  id: string
  type: TaskType
  clientId: string
  clientName: string
  organizationId?: string
  referenceBL: string
  mbl?: string
  hbl?: string
  freightCertificate?: string
  foCertificate?: string
  bunkerCertificate?: string
  status: TaskStatus
  scheduledDate: string
  scheduledTime?: string
  pickupAddress: string
  deliveryAddress: string
  courierId?: string
  courierName?: string
  notes?: string
  priority: "normal" | "urgente"
  receiptPhoto?: string // Foto obligatoria del acuse de recibo
  additionalPhotos?: string[] // Fotos adicionales opcionales
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  organizationId?: string
}

export interface Courier {
  id: string
  name: string
  phoneNumber: string
  email?: string
  activeTasks: number
  organizationId?: string
}

export interface Organization {
  id: string
  name: string
  adminEmail?: string
}
