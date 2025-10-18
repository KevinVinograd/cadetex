export type TaskType = "delivery" | "pickup" | "both"
export type TaskStatus = "pending" | "confirmed" | "completed" | "canceled"
export type UserRole = "superadmin" | "orgadmin" | "courier"

export interface Task {
  id: string
  type: TaskType
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
  photoUrl?: string
  courierName?: string
  createdAt: string
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
