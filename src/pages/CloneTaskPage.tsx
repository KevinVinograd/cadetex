import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Save,
  X
} from "lucide-react"
import { useClients } from "../hooks/use-clients"
import { useProviders } from "../hooks/use-providers"
import { useCouriers } from "../hooks/use-couriers"
import { SuccessDialog } from "../components/ui/success-dialog"
import { useTasks } from "../hooks/use-tasks"
import { useAuth } from "../hooks/use-auth"

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
    mbl: "",
    hbl: "",
    freightCert: false,
    foCert: false,
    bunkerCert: false
  })

  const prefillFromTask = (rawTask: any) => {
    if (!rawTask) return
    const clonedTask = rawTask

      // Normalize type from backend enums if needed
      const derivedType: 'entrega' | 'retiro' = clonedTask.type === 'DELIVER' ? 'entrega' : clonedTask.type === 'RETIRE' ? 'retiro' : (clonedTask.type || 'entrega')

    // Normalize status from backend to form values
    const mapStatus = (s?: string) => {
      if (!s) return 'en_preparacion'
      const upper = String(s).toUpperCase()
      const map: Record<string, string> = {
        PENDING: 'en_preparacion',
        PENDING_CONFIRMATION: 'pendiente_confirmar',
        CONFIRMED: 'confirmada_tomar',
        COMPLETED: 'finalizada',
        CANCELLED: 'cancelada',
      }
      return map[upper] || s
    }

    // Normalize priority
    const mapPriority = (p?: string) => {
      if (!p) return 'normal'
      const upper = String(p).toUpperCase()
      const map: Record<string, string> = {
        NORMAL: 'normal',
        URGENT: 'urgente',
        HIGH: 'alta',
        LOW: 'baja',
      }
      return map[upper] || String(p).toLowerCase()
    }
      
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
        status: mapStatus(clonedTask.status),
        scheduledDate: clonedTask.scheduledDate
          ? (String(clonedTask.scheduledDate).includes('T')
              ? new Date(clonedTask.scheduledDate).toISOString().split('T')[0]
              : String(clonedTask.scheduledDate))
          : "",
        // Also copy time if present
        // @ts-expect-error optional from payload
        scheduledTime: clonedTask.scheduledTime || clonedTask.scheduled_time || (clonedTask.scheduledDate && String(clonedTask.scheduledDate).includes('T') ? new Date(clonedTask.scheduledDate).toISOString().split('T')[1]?.slice(0,5) : ""),
        address,
        city,
        contact,
        courierId: clonedTask.courierId || "unassigned",
        notes: clonedTask.notes || "",
        priority: mapPriority(clonedTask.priority),
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
      const mapType = (t: string) => (t === 'retiro' ? 'RETIRE' : 'DELIVER')
      const mapPriority = (p: string) => (p === 'urgente' || p === 'alta' ? 'URGENT' : 'NORMAL')
      const referenceNumber = formData.referenceBL
      const clientId = formData.contactType === 'client' ? formData.contactId : undefined
      const providerId = formData.contactType === 'provider' ? formData.contactId : undefined
      const addressOverride = formData.address
      const city = formData.city || undefined
      const courierId = formData.courierId === 'unassigned' ? undefined : formData.courierId

      await createTask({
        organizationId,
        type: mapType(formData.type) as any,
        referenceNumber,
        clientId,
        providerId,
        addressOverride,
        priority: mapPriority(formData.priority) as any,
        scheduledDate: formData.scheduledDate,
        notes: formData.notes || undefined,
        mbl: formData.mbl || undefined,
        hbl: formData.hbl || undefined,
        freightCert: Boolean(formData.freightCert),
        foCert: Boolean(formData.foCert),
        bunkerCert: Boolean(formData.bunkerCert),
        linkedTaskId: id || undefined,
      })

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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>Detalles de la tarea clonada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reference Vexa *</label>
                    <Input
                      value={formData.referenceBL}
                      onChange={(e) => handleInputChange("referenceBL", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Tarea *</label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retiro">Retiro</SelectItem>
                        <SelectItem value="entrega">Entrega</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado *</label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_preparacion">En Preparación</SelectItem>
                        <SelectItem value="pendiente_confirmar">Pendiente Confirmar</SelectItem>
                        <SelectItem value="confirmada_tomar">Confirmada</SelectItem>
                        <SelectItem value="finalizada">Finalizada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha Programada *</label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Selection */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Selección de Contacto
                </CardTitle>
                <CardDescription>Selecciona el tipo de contacto y el contacto específico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Contacto *</label>
                  <Select value={formData.contactType} onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, contactType: value, contactId: "" }))
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="provider">Proveedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {formData.contactType === "client" ? "Cliente" : "Proveedor"} *
                  </label>
                  <Select 
                    value={formData.contactId} 
                    onValueChange={(value) => {
                      if (formData.contactType === "client") {
                        handleClientChange(value)
                      } else {
                        handleProviderChange(value)
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={`Selecciona un ${formData.contactType === "client" ? "cliente" : "proveedor"}`} />
                    </SelectTrigger>
                <SelectContent>
                  {formData.contactType === "client" ? (
                    (clients || []).map((client: any) => (
                      <SelectItem key={String(client.id)} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))
                  ) : (
                    (providers || []).map((provider: any) => (
                      <SelectItem key={String(provider.id)} value={String(provider.id)}>
                        {provider.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {formData.type === "retiro" ? "Dirección de Recogida" : "Dirección de Entrega"}
                </CardTitle>
                <CardDescription>
                  {formData.type === "retiro" 
                    ? "Ubicación donde se recogerá la documentación" 
                    : "Ubicación donde se entregará la documentación"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">Dirección *</label>
                    {formData.contactId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const contact = formData.contactType === "client"
                            ? (clients || []).find(c => String(c.id) === String(formData.contactId))
                            : (providers || []).find(p => String(p.id) === String(formData.contactId))
                          if (contact) {
                            setFormData(prev => ({
                              ...prev,
                              address: (contact as any).address || "",
                              city: (contact as any).city || "",
                              contact: (contact as any).phoneNumber || (contact as any).contact || ""
                            }))
                          }
                        }}
                        className="text-xs"
                      >
                        Usar dirección del contacto
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder={`Ingresa la dirección de ${formData.type === "retiro" ? "recogida" : "entrega"}...`}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="mt-1"
                      placeholder="Ciudad"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                    <Input
                      value={formData.contact}
                      onChange={(e) => handleInputChange("contact", e.target.value)}
                      className="mt-1"
                      placeholder="Persona de contacto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Certificados</CardTitle>
                <CardDescription>Documentos de la carga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">MBL</label>
                    <Input
                      value={formData.mbl}
                      onChange={(e) => handleInputChange("mbl", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">HBL</label>
                    <Input
                      value={formData.hbl}
                      onChange={(e) => handleInputChange("hbl", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input id="freightCert" type="checkbox" className="h-4 w-4" checked={formData.freightCert} onChange={(e) => handleInputChange("freightCert", e.target.checked)} />
                    <label htmlFor="freightCert" className="text-sm">Certificado de Flete</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input id="foCert" type="checkbox" className="h-4 w-4" checked={formData.foCert} onChange={(e) => handleInputChange("foCert", e.target.checked)} />
                    <label htmlFor="foCert" className="text-sm">Certificado FO</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input id="bunkerCert" type="checkbox" className="h-4 w-4" checked={formData.bunkerCert} onChange={(e) => handleInputChange("bunkerCert", e.target.checked)} />
                    <label htmlFor="bunkerCert" className="text-sm">Certificado de Combustible</label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Notas</CardTitle>
                <CardDescription>Información adicional</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="mt-1"
                  rows={4}
                  placeholder="Agrega notas adicionales..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Courier Assignment */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Asignar Courier</CardTitle>
                <CardDescription>Selecciona el courier (opcional)</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={formData.courierId} onValueChange={(value) => handleInputChange("courierId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un courier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {(couriers || []).map((courier: any) => (
                      <SelectItem key={String(courier.id)} value={String(courier.id)}>
                        {courier.name} - {courier.phoneNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Task Description */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Descripción de la Tarea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">
                      {formData.type === "retiro" ? "Retiro" : "Entrega"} de documentación
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.type === "retiro" 
                      ? "Se recogerá la documentación en la dirección especificada"
                      : "Se entregará la documentación en la dirección especificada"
                    }
                  </p>
                  {formData.contactType === "client" && (
                    <p className="text-sm text-muted-foreground">
                      Cliente: {(clients || []).find((c: any) => String(c.id) === String(formData.contactId))?.name || "No seleccionado"}
                    </p>
                  )}
                  {formData.contactType === "provider" && (
                    <p className="text-sm text-muted-foreground">
                      Proveedor: {(providers || []).find((p: any) => String(p.id) === String(formData.contactId))?.name || "No seleccionado"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
