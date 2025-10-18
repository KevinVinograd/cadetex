import type { Task, Client, Courier, Organization } from "./types"

export const mockTasks: Task[] = [
  {
    id: "1",
    type: "delivery",
    organizationId: "org-1",
    clientName: "ABC Logistics",
    referenceBL: "BL-2024-001",
    mbl: "MBL-001",
    status: "pending",
    scheduledDate: "2024-01-20",
    courierName: "John Smith",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    type: "pickup",
    organizationId: "org-2",
    clientName: "Global Shipping Co",
    referenceBL: "BL-2024-002",
    status: "confirmed",
    scheduledDate: "2024-01-21",
    courierName: "Sarah Johnson",
    createdAt: "2024-01-15T11:00:00Z",
  },
  {
    id: "3",
    type: "both",
    organizationId: "org-1",
    clientName: "Express Freight Ltd",
    referenceBL: "BL-2024-003",
    hbl: "HBL-003",
    status: "completed",
    scheduledDate: "2024-01-18",
    courierName: "Mike Davis",
    photoUrl: "/delivery-receipt.png",
    createdAt: "2024-01-14T09:00:00Z",
  },
  {
    id: "4",
    type: "delivery",
    organizationId: "org-2",
    clientName: "Ocean Transport Inc",
    referenceBL: "BL-2024-004",
    status: "pending",
    scheduledDate: "2024-01-22",
    courierName: "John Smith",
    createdAt: "2024-01-16T14:00:00Z",
  },
]

export const mockClients: Client[] = [
  {
    id: "1",
    name: "ABC Logistics",
    address: "123 Harbor St, Port City, PC 12345",
    phone: "+1 (555) 123-4567",
    email: "contact@abclogistics.com",
    organizationId: "org-1",
  },
  {
    id: "2",
    name: "Global Shipping Co",
    address: "456 Ocean Ave, Seaside, SS 67890",
    phone: "+1 (555) 234-5678",
    email: "info@globalshipping.com",
    organizationId: "org-2",
  },
  {
    id: "3",
    name: "Express Freight Ltd",
    address: "789 Cargo Blvd, Freight Town, FT 11223",
    phone: "+1 (555) 345-6789",
    email: "support@expressfreight.com",
    organizationId: "org-1",
  },
  {
    id: "4",
    name: "Ocean Transport Inc",
    address: "321 Maritime Dr, Dock City, DC 44556",
    phone: "+1 (555) 456-7890",
    email: "hello@oceantransport.com",
    organizationId: "org-2",
  },
]

export const mockCouriers: Courier[] = [
  {
    id: "1",
    name: "John Smith",
    phoneNumber: "+1 (555) 111-2222",
    email: "john.smith@courier.com",
    activeTasks: 2,
    organizationId: "org-1",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    phoneNumber: "+1 (555) 222-3333",
    email: "sarah.johnson@courier.com",
    activeTasks: 1,
    organizationId: "org-2",
  },
  {
    id: "3",
    name: "Mike Davis",
    phoneNumber: "+1 (555) 333-4444",
    email: "mike.davis@courier.com",
    activeTasks: 0,
    organizationId: "org-1",
  },
]

export const mockOrganizations: Organization[] = [
  { id: "org-1", name: "VEXA Logistics", adminEmail: "vexa@example.com" },
  { id: "org-2", name: "Ocean Group", adminEmail: "ocean@example.com" },
]
