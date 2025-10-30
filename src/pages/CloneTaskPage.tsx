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
import { mapStatusToForm, mapStatusToBackend, mapPriorityToForm, mapTypeToForm, mapTypeToBackend, mapPriorityToBackend } from "../lib/task-utils"
import { parseAddress } from "../lib/address-parser"
import { formatAddress } from "../lib/address-utils"

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
    street: "",
    streetNumber: "",
    addressComplement: "",
    city: "",
    province: "",
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
        const clientAddress = typeof client?.address === 'object' ? formatAddress(client.address) : (client?.address || "")
        const clientCity = typeof client?.address === 'object' ? client.address.city : (client?.city || "")
        const clientContact = (client as any)?.contact || ""
        // Use address from task if available, otherwise fallback to client address
        const taskAddressString = clonedTask.address ? formatAddress(clonedTask.address) : (clonedTask.addressOverride || "")
        address = taskAddressString || clientAddress
        const taskCity = clonedTask.address?.city || clonedTask.city || ""
        city = taskCity || clientCity
        contact = clonedTask.contact || clientContact
        if (!contact) contact = clonedTask.clientName || contact
    } else if (clonedTask.providerId) {
        contactType = "provider"
      contactId = String(clonedTask.providerId)
        // Fallbacks from contact card (real data)
        const provider = providers?.find(p => String(p.id) === String(clonedTask.providerId))
        const providerAddress = typeof provider?.address === 'object' ? formatAddress(provider.address) : (provider?.address || "")
        const providerCity = typeof provider?.address === 'object' ? provider.address.city : (provider?.city || "")
        const providerContact = (provider as any)?.contact || ""
        // Use address from task if available, otherwise fallback to provider address
        const taskAddressString = clonedTask.address ? formatAddress(clonedTask.address) : (clonedTask.addressOverride || "")
        address = taskAddressString || providerAddress
        const taskCity = clonedTask.address?.city || clonedTask.city || ""
        city = taskCity || providerCity
        contact = clonedTask.contact || providerContact
        if (!contact) contact = clonedTask.providerName || contact
      }
      
      // Parsear dirección en campos separados
      const parsed = parseAddress(address)
      
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
        street: parsed.street,
        streetNumber: parsed.streetNumber,
        addressComplement: parsed.addressComplement,
        city,
        province: clonedTask.province || "",
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

  // Trackear si el usuario modificó manualmente los campos de dirección
  const [manualAddressFields, setManualAddressFields] = useState({
    street: false,
    streetNumber: false,
    addressComplement: false,
    city: false,
    province: false,
    contact: false
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Marcar como modificado manualmente si el usuario cambia estos campos
    if (field === "street" || field === "streetNumber" || field === "addressComplement" || field === "city" || field === "province" || field === "contact") {
      setManualAddressFields(prev => ({ ...prev, [field]: true }))
    }
  }

  const handleClientChange = (clientId: string) => {
    const client = (clients || []).find(c => String(c.id) === String(clientId))
    if (client) {
      // Manejar address como objeto AddressObject o string legacy
      let parsed
      if (typeof (client as any).address === 'object' && (client as any).address) {
        // Address es un objeto normalizado
        parsed = {
          street: (client as any).address.street || "",
          streetNumber: (client as any).address.streetNumber || "",
          addressComplement: (client as any).address.addressComplement || ""
        }
      } else {
        // Address es un string legacy, parsearlo
        parsed = parseAddress((client as any).address || "")
      }
      
      setFormData(prev => ({
        ...prev,
        contactId: String(clientId),
        // Auto-completar dirección solo si no fue modificada manualmente
        street: manualAddressFields.street ? prev.street : parsed.street,
        streetNumber: manualAddressFields.streetNumber ? prev.streetNumber : parsed.streetNumber,
        addressComplement: manualAddressFields.addressComplement ? prev.addressComplement : parsed.addressComplement,
        city: manualAddressFields.city ? prev.city : (typeof (client as any).address === 'object' && (client as any).address?.city) || ((client as any).city || ""),
        province: manualAddressFields.province ? prev.province : (typeof (client as any).address === 'object' && (client as any).address?.province) || ((client as any).province || ""),
        contact: manualAddressFields.contact ? prev.contact : ((client as any).phoneNumber || (client as any).contact || "")
      }))
      // Resetear los flags de modificación manual cuando se cambia el contacto
      setManualAddressFields({
        street: false,
        streetNumber: false,
        addressComplement: false,
        city: false,
        province: false,
        contact: false
      })
    } else {
      setFormData(prev => ({ ...prev, contactId: String(clientId) }))
    }
  }

  const handleProviderChange = (providerId: string) => {
    const provider = (providers || []).find(p => String(p.id) === String(providerId))
    if (provider) {
      // Manejar address como objeto AddressObject o string legacy
      let parsed
      if (typeof (provider as any).address === 'object' && (provider as any).address) {
        // Address es un objeto normalizado
        parsed = {
          street: (provider as any).address.street || "",
          streetNumber: (provider as any).address.streetNumber || "",
          addressComplement: (provider as any).address.addressComplement || ""
        }
      } else {
        // Address es un string legacy, parsearlo
        parsed = parseAddress((provider as any).address || "")
      }
      
      setFormData(prev => ({
        ...prev,
        contactId: String(providerId),
        // Auto-completar dirección solo si no fue modificada manualmente
        street: manualAddressFields.street ? prev.street : parsed.street,
        streetNumber: manualAddressFields.streetNumber ? prev.streetNumber : parsed.streetNumber,
        addressComplement: manualAddressFields.addressComplement ? prev.addressComplement : parsed.addressComplement,
        city: manualAddressFields.city ? prev.city : (typeof (provider as any).address === 'object' && (provider as any).address?.city) || ((provider as any).city || ""),
        province: manualAddressFields.province ? prev.province : (typeof (provider as any).address === 'object' && (provider as any).address?.province) || ((provider as any).province || ""),
        contact: manualAddressFields.contact ? prev.contact : ((provider as any).phoneNumber || (provider as any).contact || "")
      }))
      // Resetear los flags de modificación manual cuando se cambia el contacto
      setManualAddressFields({
        street: false,
        streetNumber: false,
        addressComplement: false,
        city: false,
        province: false,
        contact: false
      })
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
      if (!formData.street?.trim()) throw new Error('Dirección requerida')
      if (!formData.contactId) throw new Error('Contacto requerido')

      // Construir dirección completa desde campos separados
      const addressParts: string[] = []
      if (formData.street) {
        if (formData.streetNumber) {
          addressParts.push(`${formData.street} ${formData.streetNumber}`)
        } else {
          addressParts.push(formData.street)
        }
        if (formData.addressComplement) {
          addressParts.push(formData.addressComplement)
        }
      }
      const fullAddress = addressParts.join(" ").trim()

      // Map form -> backend
      const referenceNumber = formData.referenceBL
      const clientId = formData.contactType === 'client' ? formData.contactId : undefined
      const providerId = formData.contactType === 'provider' ? formData.contactId : undefined
      const courierId = formData.courierId === 'unassigned' ? undefined : formData.courierId

      // Construir objeto Address solo si hay dirección manual (override)
      let addressOverride: any = undefined
      if (fullAddress || formData.city || formData.province) {
        addressOverride = {
          street: formData.street || undefined,
          streetNumber: formData.streetNumber || undefined,
          addressComplement: formData.addressComplement || undefined,
          city: formData.city || undefined,
          province: formData.province || undefined
        }
      }

      // Solo incluir clientId o providerId, no ambos
      const taskData: any = {
        organizationId,
        type: mapTypeToBackend(formData.type),
        referenceNumber,
        contact: formData.contact || undefined,
        courierId: courierId !== 'unassigned' ? courierId : undefined,
        status: mapStatusToBackend(formData.status),
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
      
      // Incluir addressOverride solo si se construyó
      if (addressOverride) {
        taskData.addressOverride = addressOverride
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
    } catch (error: any) {
      console.error('Error creating cloned task:', error)
      // Extraer el mensaje de error del backend
      const errorMessage = error?.message || "Error creando la tarea clonada. Intenta de nuevo."
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: errorMessage,
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
