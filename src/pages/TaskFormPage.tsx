import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Checkbox } from "../components/ui/checkbox"
import { Label } from "../components/ui/label"
import { useAuth } from "../hooks/use-auth"
import { useTasks } from "../hooks/use-tasks"
import { useClients } from "../hooks/use-clients"
import { useProviders } from "../hooks/use-providers"
import { useCouriers } from "../hooks/use-couriers"
import { SuccessDialog } from "../components/ui/success-dialog"
import {
  ArrowLeft,
  Package,
  MapPin,
  Save,
  X,
  Copy,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react"

export default function TaskFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { role, organizationId } = useAuth()
  const { createTask, updateTask, deleteTask, getTaskById, currentTask, isLoadingTask, taskError } = useTasks()
  const { getClientsByOrganization } = useClients()
  const { getProvidersByOrganization } = useProviders()
  const { getCouriersByOrganization } = useCouriers()
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(!id) // Si no hay ID, es creación (siempre en modo edición)

  // Estado para el diálogo de éxito
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'success'
  })

  // Estado para el diálogo de confirmación de eliminación
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  })

  const [formData, setFormData] = useState({
    referenceBL: "",
    contactType: "client",
    contactId: "",
    type: "entrega",
    status: "en_preparacion",
    scheduledDate: new Date().toISOString().split('T')[0],
    address: "",
    city: "",
    province: "",
    contact: "",
    courierId: "unassigned",
    notes: "",
    priority: "normal",
    photoRequired: true,
    mbl: "",
    hbl: "",
    freightCertificate: "",
    foCertificate: "",
    bunkerCertificate: ""
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const updates: any = { [field]: value }

      // Auto-set photoRequired based on task type
      if (field === "type") {
        updates.photoRequired = value === "entrega"
      }

      return { ...prev, ...updates }
    })
  }

  const showSuccess = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSuccessDialog({
      isOpen: true,
      title,
      description,
      type
    })
  }

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm
    })
  }

  const handleClientChange = (clientId: string) => {
    const client = orgClients.find(c => c.id === clientId)
    if (client) {
      setFormData(prev => ({
        ...prev,
        contactId: clientId,
        // Solo autocompletar si no hay address_override
        address: prev.address || client.address,
        city: prev.city || client.city,
        province: prev.province || client.province,
        contact: prev.contact || client.phoneNumber || ""
      }))
    }
  }

  const handleProviderChange = (providerId: string) => {
    const provider = orgProviders.find(p => p.id === providerId)
    if (provider) {
      setFormData(prev => ({
        ...prev,
        contactId: providerId,
        // Solo autocompletar si no hay address_override
        address: prev.address || provider.address,
        city: prev.city || provider.city || "",
        province: prev.province || provider.province || "",
        contact: prev.contact || provider.contactPhone || ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!organizationId || !formData.referenceBL || !formData.contactId) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    setIsSaving(true)

    try {
      // Convertir el tipo de tarea al formato del backend
      const taskType = formData.type === "retiro" ? "RETIRE" : "DELIVER"
      const taskPriority = formData.priority === "urgente" ? "URGENT" : "NORMAL"
      
      // Convertir el estado al formato del backend
      const taskStatus = formData.status === "en_preparacion" ? "PENDING" :
                        formData.status === "pendiente_confirmar" ? "PENDING_CONFIRMATION" :
                        formData.status === "confirmada" ? "CONFIRMED" :
                        formData.status === "finalizada" ? "COMPLETED" :
                        formData.status === "cancelada" ? "CANCELLED" : "PENDING"

      // Preparar datos para actualización, limpiando campos no necesarios
      const taskData: any = {
        type: taskType as 'RETIRE' | 'DELIVER',
        referenceNumber: formData.referenceBL,
        addressOverride: formData.address || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        contact: formData.contact || undefined,
        courierId: formData.courierId === "unassigned" ? undefined : formData.courierId,
        status: taskStatus as 'PENDING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
        priority: taskPriority as 'NORMAL' | 'URGENT',
        scheduledDate: formData.scheduledDate || undefined,
        notes: formData.notes || undefined,
        photoRequired: formData.photoRequired,
        mbl: formData.mbl || undefined,
        hbl: formData.hbl || undefined,
        freightCert: Boolean(formData.freightCertificate),
        foCert: Boolean(formData.foCertificate),
        bunkerCert: Boolean(formData.bunkerCertificate),
        linkedTaskId: undefined
      }

      // Solo incluir clientId o providerId, no ambos
      if (formData.contactType === "client" && formData.contactId) {
        taskData.clientId = formData.contactId
        // Asegurar que providerId no esté presente
        delete taskData.providerId
      } else if (formData.contactType === "provider" && formData.contactId) {
        taskData.providerId = formData.contactId
        // Asegurar que clientId no esté presente
        delete taskData.clientId
      } else {
        // Si no hay contacto seleccionado, limpiar ambos
        delete taskData.clientId
        delete taskData.providerId
      }

      // Limpiar campos undefined para no enviarlos
      Object.keys(taskData).forEach(key => {
        if (taskData[key] === undefined) {
          delete taskData[key]
        }
      })

      if (id) {
        // Editar tarea existente
        console.log('Actualizando tarea con datos:', taskData)
        console.log('Tipo de contacto:', formData.contactType)
        console.log('ID de contacto:', formData.contactId)
        console.log('ClientId en taskData:', taskData.clientId)
        console.log('ProviderId en taskData:', taskData.providerId)
        const updatedTask = await updateTask(id, taskData)
        console.log('Tarea actualizada recibida:', updatedTask)
        showSuccess("Tarea Actualizada", "La tarea ha sido actualizada exitosamente.")
      } else {
        // Crear nueva tarea
        await createTask(taskData)
        showSuccess("Tarea Creada", "La tarea ha sido creada exitosamente.")
      }

      // Navegar después de un breve delay para que se vea el mensaje
      setTimeout(() => {
        if (isCreateMode) {
          navigate("/dashboard")
        } else {
          // Si estamos editando, volver al modo view
          setIsEditing(false)
        }
      }, 1500)
    } catch (error) {
      console.error('Error saving task:', error)
      showSuccess("Error", `Error ${id ? 'actualizando' : 'creando'} la tarea. Intenta de nuevo.`, "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (isCreateMode) {
      navigate("/dashboard")
    } else if (isEditing) {
      // Si estamos editando, volver al modo view
      setIsEditing(false)
      // Resetear el formulario a los datos originales de la tarea
      if (currentTask) {
        setFormData({
          referenceBL: currentTask.referenceNumber || "",
          contactType: currentTask.clientId ? "client" : "provider",
          contactId: currentTask.clientId || currentTask.providerId || "",
          type: currentTask.type === "RETIRE" ? "retiro" : "entrega",
          status: currentTask.status === "PENDING" ? "en_preparacion" : 
                  currentTask.status === "PENDING_CONFIRMATION" ? "pendiente_confirmar" :
                  currentTask.status === "CONFIRMED" ? "confirmada" :
                  currentTask.status === "COMPLETED" ? "finalizada" :
                  currentTask.status === "CANCELLED" ? "cancelada" : "en_preparacion",
          scheduledDate: currentTask.scheduledDate ? new Date(currentTask.scheduledDate).toISOString().split('T')[0] : "",
          address: currentTask.addressOverride || "",
          city: currentTask.city || "",
          province: currentTask.province || "",
          contact: currentTask.contact || "",
          courierId: currentTask.courierId || "unassigned",
          notes: currentTask.notes || "",
          priority: currentTask.priority === "URGENT" ? "urgente" : "normal",
          photoRequired: currentTask.photoRequired || false,
          mbl: currentTask.mbl || "",
          hbl: currentTask.hbl || "",
          freightCertificate: currentTask.freightCert ? "true" : "",
          foCertificate: currentTask.foCert ? "true" : "",
          bunkerCertificate: currentTask.bunkerCert ? "true" : ""
        })
      }
    } else {
      // Si estamos en modo view, volver a la lista
      navigate("/dashboard")
    }
  }

  const handleClone = () => {
    if (currentTask) {
      navigate(`/dashboard/tasks/clone/${currentTask.id}`)
    }
  }

  const handleDelete = () => {
    if (!id) return
    
    showConfirm(
      "Eliminar Tarea",
      `Se eliminará permanentemente la tarea "${currentTask?.referenceNumber || 'sin referencia'}" y todos sus datos asociados.`,
      async () => {
        try {
          await deleteTask(id)
          showSuccess("Tarea Eliminada", `La tarea "${currentTask?.referenceNumber || ''}" ha sido eliminada exitosamente.`)
          setTimeout(() => {
            navigate("/dashboard")
          }, 1500)
        } catch (error) {
          console.error('Error deleting task:', error)
          showSuccess("Error", "Error eliminando la tarea. Intenta de nuevo.", "error")
        }
      }
    )
  }

  // Cargar datos de la organización
  const orgClients = organizationId ? getClientsByOrganization(organizationId) : []
  const orgProviders = organizationId ? getProvidersByOrganization(organizationId) : []
  const orgCouriers = organizationId ? getCouriersByOrganization(organizationId) : []

  // Cargar tarea existente si estamos editando
  useEffect(() => {
    if (id && !currentTask) {
      getTaskById(id)
    }
  }, [id, currentTask, getTaskById])

  // Cargar datos del formulario cuando se carga la tarea
  useEffect(() => {
    if (currentTask && id) {
      setFormData({
        referenceBL: currentTask.referenceNumber || "",
        contactType: currentTask.clientId ? "client" : "provider",
        contactId: currentTask.clientId || currentTask.providerId || "",
        type: currentTask.type === "RETIRE" ? "retiro" : "entrega",
        status: currentTask.status === "PENDING" ? "en_preparacion" : 
                currentTask.status === "PENDING_CONFIRMATION" ? "pendiente_confirmar" :
                currentTask.status === "CONFIRMED" ? "confirmada" :
                currentTask.status === "COMPLETED" ? "finalizada" :
                currentTask.status === "CANCELLED" ? "cancelada" : "en_preparacion",
        scheduledDate: currentTask.scheduledDate ? new Date(currentTask.scheduledDate).toISOString().split('T')[0] : "",
        address: currentTask.addressOverride || "",
        city: currentTask.city || "",
        province: currentTask.province || "",
        contact: currentTask.contact || "",
        courierId: currentTask.courierId || "unassigned",
        notes: currentTask.notes || "",
        priority: currentTask.priority === "URGENT" ? "urgente" : "normal",
        photoRequired: currentTask.photoRequired || false,
        mbl: currentTask.mbl || "",
        hbl: currentTask.hbl || "",
        freightCertificate: currentTask.freightCert ? "true" : "",
        foCertificate: currentTask.foCert ? "true" : "",
        bunkerCertificate: currentTask.bunkerCert ? "true" : ""
      })
    }
  }, [currentTask, id])

  useEffect(() => {
    if (role !== "orgadmin") {
      navigate("/login")
    }
  }, [role, navigate])

  // No renderizar si no tiene permisos
  if (role !== "orgadmin") {
    return null
  }

  // Mostrar loading si estamos cargando una tarea
  if (id && isLoadingTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando tarea...</p>
        </div>
      </div>
    )
  }

  // Mostrar error si hay un problema cargando la tarea
  if (id && taskError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-sm text-destructive">Error cargando la tarea: {taskError}</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Volver a Tareas
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar not found si la tarea no existe
  if (id && !currentTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Tarea no encontrada</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Volver a Tareas
          </Button>
        </div>
      </div>
    )
  }

  const isCreateMode = !id
  const pageTitle = isCreateMode ? "Nueva Tarea" : `Tarea ${currentTask?.referenceNumber || ''}`
  const pageDescription = isCreateMode ? "Crea una nueva tarea de entrega o retiro" : "Edita los detalles de la tarea"

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tareas
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">{pageDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isCreateMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClone}
              disabled={isSaving}
            >
              <Copy className="h-4 w-4 mr-2" />
              Clonar
            </Button>
          )}
          {!isCreateMode && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isSaving}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {!isCreateMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isSaving}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            {isCreateMode ? "Cancelar" : (isEditing ? "Cancelar" : "Volver")}
          </Button>
          {isEditing && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : (isCreateMode ? "Crear Tarea" : "Guardar Cambios")}
            </Button>
          )}
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
                <CardDescription>Detalles de la tarea</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Referencia Vexa *</label>
                    <Input
                      value={formData.referenceBL}
                      onChange={(e) => handleInputChange("referenceBL", e.target.value)}
                      className="mt-1"
                      required
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Tarea *</label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)} disabled={!isEditing}>
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
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)} disabled={!isEditing}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_preparacion">En Preparación</SelectItem>
                        <SelectItem value="pendiente_confirmar">Pendiente Confirmación</SelectItem>
                        <SelectItem value="confirmada">Confirmada</SelectItem>
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
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)} disabled={!isEditing}>
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

                {/* Photo Required Checkbox */}
                <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="photoRequired"
                    checked={formData.photoRequired}
                    onCheckedChange={(checked) => handleInputChange("photoRequired", checked as boolean)}
                    disabled={!isEditing}
                  />
                  <Label
                    htmlFor="photoRequired"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Foto obligatoria al finalizar tarea
                    <span className="block text-xs text-muted-foreground font-normal mt-1">
                      {formData.type === "entrega"
                        ? "Recomendado para entregas (marcado por defecto)"
                        : "Opcional para retiros (desmarcado por defecto)"}
                    </span>
                  </Label>
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
                  <Select value={formData.contactType} onValueChange={(value) => handleInputChange("contactType", value)} disabled={!isEditing}>
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
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={`Selecciona un ${formData.contactType === "client" ? "cliente" : "proveedor"}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.contactType === "client" ? (
                        orgClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))
                      ) : (
                        orgProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
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
                            ? orgClients.find(c => c.id === formData.contactId)
                            : orgProviders.find(p => p.id === formData.contactId)
                          if (contact) {
                            setFormData(prev => ({
                              ...prev,
                              address: contact.address,
                              city: formData.contactType === "client" ? contact.city : (contact.city || ""),
                              province: formData.contactType === "client" ? contact.province : (contact.province || ""),
                              contact: formData.contactType === "client" ? (contact.phoneNumber || "") : (contact.contactPhone || "")
                            }))
                          }
                        }}
                        disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="mt-1"
                      placeholder="Ciudad"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Provincia</label>
                    <Input
                      value={formData.province}
                      onChange={(e) => handleInputChange("province", e.target.value)}
                      className="mt-1"
                      placeholder="Provincia"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                    <Input
                      value={formData.contact}
                      onChange={(e) => handleInputChange("contact", e.target.value)}
                      className="mt-1"
                      placeholder="Persona de contacto"
                      disabled={!isEditing}
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
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">HBL</label>
                    <Input
                      value={formData.hbl}
                      onChange={(e) => handleInputChange("hbl", e.target.value)}
                      className="mt-1"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Certificado de Flete</label>
                    <Input
                      value={formData.freightCertificate}
                      onChange={(e) => handleInputChange("freightCertificate", e.target.value)}
                      className="mt-1"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Certificado FO</label>
                    <Input
                      value={formData.foCertificate}
                      onChange={(e) => handleInputChange("foCertificate", e.target.value)}
                      className="mt-1"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Certificado de Combustible</label>
                    <Input
                      value={formData.bunkerCertificate}
                      onChange={(e) => handleInputChange("bunkerCertificate", e.target.value)}
                      className="mt-1"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas */}
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
                  disabled={!isEditing}
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
                <Select value={formData.courierId} onValueChange={(value) => handleInputChange("courierId", value)} disabled={!isEditing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un courier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {orgCouriers.map((courier) => (
                      <SelectItem key={courier.id} value={courier.id}>
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
                  {formData.contactType === "client" && formData.contactId && (
                    <p className="text-sm text-muted-foreground">
                      Cliente: {orgClients.find(c => c.id === formData.contactId)?.name || "No seleccionado"}
                    </p>
                  )}
                  {formData.contactType === "provider" && formData.contactId && (
                    <p className="text-sm text-muted-foreground">
                      Proveedor: {orgProviders.find(p => p.id === formData.contactId)?.name || "No seleccionado"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog(prev => ({ ...prev, isOpen: false }))}
        title={successDialog.title}
        description={successDialog.description}
        type={successDialog.type}
      />

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{confirmDialog.title}</h3>
                <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 ml-13">{confirmDialog.description}</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  confirmDialog.onConfirm()
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }))
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
