import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { ArrowLeft, Save, X } from "lucide-react"
import { useClients } from "../hooks/use-clients"
import { useProviders } from "../hooks/use-providers"
import { useCouriers } from "../hooks/use-couriers"
import { SuccessDialog } from "../components/ui/success-dialog"
import { useTasks } from "../hooks/use-tasks"
import { useAuth } from "../hooks/use-auth"
import { TaskForm } from "../components/TaskForm"
import { mapStatusToForm, mapPriorityToForm, mapTypeToForm, mapTypeToBackend, mapPriorityToBackend } from "../lib/task-utils"

export default function CloneTaskPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getTaskById, currentTask, createTask } = useTasks()
  const { organizationId } = useAuth()
  const { clients } = useClients()
  const { providers } = useProviders()
  const { couriers } = useCouriers()
  const [isSaving, setIsSaving] = useState(false)
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({ isOpen: false, title: '', description: '', type: 'success' })
  const [formData, setFormData] = useState({
    referenceBL: "",
    contactType: "client",
    contactId: "",
    type: "entrega",
    status: "en_preparacion",
    scheduledDate: "",
    address: "",
    city: "",
    contact: "",
    courierId: "unassigned",
    notes: "",
    priority: "normal",
    photoRequired: false,
    mbl: "",
    hbl: "",
    freightCert: false,
    foCert: false,
    bunkerCert: false
  })

  const prefillFromTask = (rawTask: any) => {
    if (!rawTask) return
    const clonedTask = rawTask
    const derivedType = mapTypeToForm(clonedTask.type)
      
      // Determine contact type and load appropriate data
      let contactType = "client"
      let contactId = ""
      // Prefer original task addresses/contacts; fallback to contact book
      let address: string = ""
      let city: string = ""
      let contact: string = ""
      
    if (clonedTask.clientId) {
        contactType = "client"
      contactId = String(clonedTask.clientId)
        // Fallbacks from contact card (real data)
        const client = clients?.find(c => String(c.id) === String(clonedTask.clientId))
        const clientAddress = client?.address || ""
        const clientCity = client?.city || ""
        const clientContact = (client as any)?.contact || ""
        // Use original task fields if available; otherwise fallback to contact card
        address = derivedType === 'entrega'
          ? (clonedTask.deliveryAddress || clonedTask.addressOverride || clientAddress)
          : (clonedTask.pickupAddress || clonedTask.addressOverride || clientAddress)
        city = derivedType === 'entrega' ? (clonedTask.deliveryCity || clientCity) : (clonedTask.pickupCity || clientCity)
        contact = derivedType === 'entrega' ? (clonedTask.deliveryContact || clientContact) : (clonedTask.pickupContact || clientContact)
        if (!contact) contact = clonedTask.clientName || contact
    } else if (clonedTask.providerId) {
        contactType = "provider"
      contactId = String(clonedTask.providerId)
        // Fallbacks from contact card (real data)
        const provider = providers?.find(p => String(p.id) === String(clonedTask.providerId))
        const providerAddress = provider?.address || ""
        const providerCity = provider?.city || ""
        const providerContact = (provider as any)?.contact || ""
        // Use original task fields if available; otherwise fallback to contact card
        address = derivedType === 'entrega'
          ? (clonedTask.deliveryAddress || clonedTask.addressOverride || providerAddress)
          : (clonedTask.pickupAddress || clonedTask.addressOverride || providerAddress)
        city = derivedType === 'entrega' ? (clonedTask.deliveryCity || providerCity) : (clonedTask.pickupCity || providerCity)
        contact = derivedType === 'entrega' ? (clonedTask.deliveryContact || providerContact) : (clonedTask.pickupContact || providerContact)
        if (!contact) contact = clonedTask.providerName || contact
      }
      
      setFormData({
        referenceBL: clonedTask.referenceBL || clonedTask.referenceNumber || "",
        contactType,
        contactId,
        type: derivedType,
        status: mapStatusToForm(clonedTask.status),
        scheduledDate: clonedTask.scheduledDate
          ? (String(clonedTask.scheduledDate).includes('T')
              ? new Date(clonedTask.scheduledDate).toISOString().split('T')[0]
              : String(clonedTask.scheduledDate))
          : "",
        // @ts-expect-error optional from payload
        scheduledTime: clonedTask.scheduledTime || clonedTask.scheduled_time || (clonedTask.scheduledDate && String(clonedTask.scheduledDate).includes('T') ? new Date(clonedTask.scheduledDate).toISOString().split('T')[1]?.slice(0,5) : ""),
        address,
        city,
        contact,
        courierId: clonedTask.courierId || "unassigned",
        notes: clonedTask.notes || "",
        priority: mapPriorityToForm(clonedTask.priority),
        photoRequired: Boolean(clonedTask.photoRequired),
        mbl: clonedTask.mbl || clonedTask.MBL || clonedTask.mblNumber || "",
        hbl: clonedTask.hbl || clonedTask.HBL || clonedTask.hblNumber || "",
        freightCert: Boolean(clonedTask.freightCert || clonedTask.freightCertificate || clonedTask.freight_certificate),
        foCert: Boolean(clonedTask.foCert || clonedTask.foCertificate || clonedTask.fo_certificate),
        bunkerCert: Boolean(clonedTask.bunkerCert || clonedTask.bunkerCertificate || clonedTask.bunker_certificate)
      })
  }

  // Load cloned task data from localStorage, or fallback to fetching by :id
  useEffect(() => {
    const clonedTaskData = localStorage.getItem('clonedTask')
    if (clonedTaskData) {
      prefillFromTask(JSON.parse(clonedTaskData))
      return
    }
    if (id) {
      // Try to load from server/state
      getTaskById(id).catch(() => {})
    }
  }, [])

  // When currentTask arrives (fallback path), prefill once
  useEffect(() => {
    if (currentTask) {
      prefillFromTask(currentTask)
    }
  }, [currentTask])

  // Auto-llenar dirección cuando llegan clientes/proveedores y falta address
  useEffect(() => {
    if (!formData.address && formData.contactId) {
      const contact = formData.contactType === 'client'
        ? (clients || []).find(c => String(c.id) === String(formData.contactId))
        : (providers || []).find(p => String(p.id) === String(formData.contactId))
      if (contact) {
        setFormData(prev => ({
          ...prev,
          address: (contact as any).address || '',
          city: (contact as any).city || '',
          contact: (contact as any).phoneNumber || (contact as any).contact || ''
        }))
      }
    }
  }, [clients, providers])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClientChange = (clientId: string) => {
    const client = (clients || []).find(c => String(c.id) === String(clientId))
    if (client) {
      setFormData(prev => ({
        ...prev,
        contactId: String(clientId),
        address: (client as any).address || "",
        city: (client as any).city || "",
        contact: (client as any).phoneNumber || (client as any).contact || ""
      }))
    } else {
      setFormData(prev => ({ ...prev, contactId: String(clientId) }))
    }
  }

  const handleProviderChange = (providerId: string) => {
    const provider = (providers || []).find(p => String(p.id) === String(providerId))
    if (provider) {
      setFormData(prev => ({
        ...prev,
        contactId: String(providerId),
        address: (provider as any).address || "",
        city: (provider as any).city || "",
        contact: (provider as any).phoneNumber || (provider as any).contact || ""
      }))
    } else {
      setFormData(prev => ({ ...prev, contactId: String(providerId) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // Minimal validation
      if (!organizationId) throw new Error('Organización no disponible')
      if (!formData.referenceBL?.trim()) throw new Error('Referencia requerida')
      if (!formData.scheduledDate) throw new Error('Fecha requerida')
      if (!formData.address?.trim()) throw new Error('Dirección requerida')
      if (!formData.contactId) throw new Error('Contacto requerido')

      // Map form -> backend
      const referenceNumber = formData.referenceBL
      const clientId = formData.contactType === 'client' ? formData.contactId : undefined
      const providerId = formData.contactType === 'provider' ? formData.contactId : undefined
      const addressOverride = formData.address
      const courierId = formData.courierId === 'unassigned' ? undefined : formData.courierId

      // Solo incluir clientId o providerId, no ambos
      const taskData: any = {
        organizationId,
        type: mapTypeToBackend(formData.type),
        referenceNumber,
        addressOverride,
        courierId: courierId !== 'unassigned' ? courierId : undefined,
        priority: mapPriorityToBackend(formData.priority),
        scheduledDate: formData.scheduledDate,
        notes: formData.notes || undefined,
        mbl: formData.mbl || undefined,
        hbl: formData.hbl || undefined,
        freightCert: Boolean(formData.freightCert),
        foCert: Boolean(formData.foCert),
        bunkerCert: Boolean(formData.bunkerCert),
        linkedTaskId: id || undefined,
        photoRequired: formData.photoRequired || false,
      }

      // Agregar cliente o proveedor
      if (clientId) {
        taskData.clientId = clientId
      } else if (providerId) {
        taskData.providerId = providerId
      }

      // Limpiar campos undefined para no enviarlos
      Object.keys(taskData).forEach(key => {
        if (taskData[key] === undefined) {
          delete taskData[key]
        }
      })

      console.log('Task data to send:', JSON.stringify(taskData, null, 2))
      await createTask(taskData)

      // Clear localStorage
      localStorage.removeItem('clonedTask')
      
      setSuccessDialog({
        isOpen: true,
        title: "Tarea Clonada",
        description: "La tarea se ha creado exitosamente a partir de la original.",
        type: 'success'
      })
      setTimeout(() => navigate("/dashboard"), 1200)
    } catch (error) {
      console.error('Error creating cloned task:', error)
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: error instanceof Error ? error.message : "Error creando la tarea clonada. Intenta de nuevo.",
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    localStorage.removeItem('clonedTask')
    navigate("/dashboard")
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Clonar Tarea</h1>
            <p className="text-sm text-muted-foreground">Crea una nueva tarea basada en una existente</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : "Crear Tarea"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <TaskForm
          formData={formData}
          clients={clients || []}
          providers={providers || []}
          couriers={couriers || []}
          onInputChange={handleInputChange}
          onClientChange={handleClientChange}
          onProviderChange={handleProviderChange}
          mode="clone"
        />

      </form>
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog(prev => ({ ...prev, isOpen: false }))}
        title={successDialog.title}
        description={successDialog.description}
        type={successDialog.type}
      />
    </div>
  )
}
