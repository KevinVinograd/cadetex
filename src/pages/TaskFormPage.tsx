import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { SearchableSelect } from "../components/ui/searchable-select"
import { useAuth } from "../hooks/use-auth"
import { useTasks } from "../hooks/use-tasks"
import { useClients } from "../hooks/use-clients"
import { useProviders } from "../hooks/use-providers"
import { useCouriers } from "../hooks/use-couriers"
import { SuccessDialog } from "../components/ui/success-dialog"
import { TaskForm } from "../components/TaskForm"
import { BasicInfoSection, ContactSelectionSection, AddressSection, CertificatesSection, NotesSection } from "../components/TaskFormSections"
import { mapStatusToForm, mapPriorityToForm, mapTypeToForm, mapStatusToBackend, mapPriorityToBackend, mapTypeToBackend } from "../lib/task-utils"
import { ArrowLeft, Save, X, Copy, Edit, Trash2, AlertTriangle, ImageIcon, Download } from "lucide-react"

export default function TaskFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { role, organizationId, isLoading } = useAuth()
  const { createTask, updateTask, deleteTask, getTaskById, currentTask, isLoadingTask, taskError, getTaskPhotos } = useTasks()
  const { getClientsByOrganization } = useClients()
  const { getProvidersByOrganization } = useProviders()
  const { getCouriersByOrganization } = useCouriers()
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(!id) // Si no hay ID, es creación (siempre en modo edición)
  const [additionalPhotos, setAdditionalPhotos] = useState<any[]>([])

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
    freightCert: false,
    foCert: false,
    bunkerCert: false
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
        contact: prev.contact || provider.phoneNumber || ""
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
      // Convertir campos usando utilidades centralizadas
      const taskType = mapTypeToBackend(formData.type)
      const taskPriority = mapPriorityToBackend(formData.priority)
      const taskStatus = mapStatusToBackend(formData.status)

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
        priority: taskPriority as 'NORMAL' | 'URGENT' | 'LOW' | 'HIGH',
        scheduledDate: formData.scheduledDate || undefined,
        notes: formData.notes || undefined,
        photoRequired: formData.photoRequired,
        mbl: formData.mbl || undefined,
        hbl: formData.hbl || undefined,
        freightCert: Boolean(formData.freightCert),
        foCert: Boolean(formData.foCert),
        bunkerCert: Boolean(formData.bunkerCert),
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
        await updateTask(id, taskData)
        showSuccess("Tarea Actualizada", "La tarea ha sido actualizada exitosamente.")
      } else {
        // Crear nueva tarea
        const payload = { organizationId: organizationId!, ...taskData }
        // Depuración: ver payload exacto
        console.log('CreateTask payload:', JSON.stringify(payload, null, 2))
        await createTask(payload)
        showSuccess("Tarea Creada", "La tarea ha sido creada exitosamente.")
      }

      // Navegar después de un breve delay para que se vea el mensaje
      setTimeout(() => {
        navigate("/dashboard")
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
          freightCert: Boolean(currentTask.freightCert),
          foCert: Boolean(currentTask.foCert),
          bunkerCert: Boolean(currentTask.bunkerCert)
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

  // Función para descargar foto de comprobante
  const handleDownloadPhoto = () => {
    if (currentTask?.receiptPhotoUrl) {
      const link = document.createElement('a')
      link.href = currentTask.receiptPhotoUrl
      link.download = `comprobante-tarea-${currentTask.referenceNumber || currentTask.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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

  // Cargar fotos adicionales cuando se carga la tarea
  useEffect(() => {
    const loadPhotos = async () => {
      if (id && getTaskPhotos) {
        try {
          const photos = await getTaskPhotos(id)
          setAdditionalPhotos(photos)
        } catch (err) {
          console.error('Error loading photos:', err)
        }
      }
    }
    loadPhotos()
  }, [id, getTaskPhotos])

  // Cargar datos del formulario cuando se carga la tarea
  useEffect(() => {
    if (currentTask && id) {
      setFormData({
        referenceBL: currentTask.referenceNumber || "",
        contactType: currentTask.clientId ? "client" : "provider",
        contactId: currentTask.clientId || currentTask.providerId || "",
        type: mapTypeToForm(currentTask.type),
        status: mapStatusToForm(currentTask.status),
        scheduledDate: currentTask.scheduledDate ? new Date(currentTask.scheduledDate).toISOString().split('T')[0] : "",
        address: currentTask.addressOverride || "",
        city: currentTask.city || "",
        province: currentTask.province || "",
        contact: currentTask.contact || "",
        courierId: currentTask.courierId || "unassigned",
        notes: currentTask.notes || "",
        priority: mapPriorityToForm(currentTask.priority),
        photoRequired: currentTask.photoRequired || false,
        mbl: currentTask.mbl || "",
        hbl: currentTask.hbl || "",
        freightCert: currentTask.freightCert || false,
        foCert: currentTask.foCert || false,
        bunkerCert: currentTask.bunkerCert || false
      })
    }
  }, [currentTask, id])

  useEffect(() => {
    if (!isLoading && role !== "orgadmin") {
      navigate("/login")
    }
  }, [isLoading, role, navigate])

  // No renderizar si no tiene permisos
  if (isLoading) {
    return null
  }

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
        {isEditing ? (
          <TaskForm
            formData={formData}
            clients={orgClients || []}
            providers={orgProviders || []}
            couriers={orgCouriers || []}
            onInputChange={handleInputChange}
            onClientChange={handleClientChange}
            onProviderChange={handleProviderChange}
            mode={id ? 'edit' : 'create'}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form (View) */}
            <div className="lg:col-span-2 space-y-6">
              <BasicInfoSection formData={formData} onInputChange={handleInputChange} disabled />
              <ContactSelectionSection
                formData={formData}
                clients={orgClients}
                providers={orgProviders}
                contactType={formData.contactType as 'client' | 'provider'}
                onInputChange={handleInputChange}
                onClientChange={handleClientChange}
                onProviderChange={handleProviderChange}
                disabled
              />
              <AddressSection 
                formData={formData}
                clients={orgClients}
                providers={orgProviders}
                onInputChange={handleInputChange}
                contactType={formData.contactType as 'client' | 'provider'}
                contactId={formData.contactId}
                disabled
              />
              <CertificatesSection formData={formData} onInputChange={handleInputChange} disabled />
              <NotesSection formData={formData} onInputChange={handleInputChange} disabled />
              {!isEditing && currentTask?.courierNotes && (
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Notas del Courier
                    </CardTitle>
                    <CardDescription>
                      Notas agregadas por el courier durante la entrega
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                        {currentTask.courierNotes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                <SearchableSelect
                  value={formData.courierId}
                  onValueChange={(value) => handleInputChange("courierId", value)}
                  items={[
                    { id: "unassigned", name: "Sin asignar" },
                    ...orgCouriers.map(courier => ({ 
                      id: courier.id, 
                      name: `${courier.name} - ${courier.phoneNumber}` 
                    }))
                  ]}
                  placeholder="Buscar y seleccionar courier..."
                  disabled={!isEditing}
                  ariaLabel="Courier"
                />
              </CardContent>
            </Card>

            {/* Receipt Photo - Solo mostrar en modo visualización */}
            {!isEditing && currentTask?.receiptPhotoUrl && (
              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Comprobante de Entrega
                  </CardTitle>
                  <CardDescription>
                    Foto subida por el courier como comprobante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <img
                      src={currentTask.receiptPhotoUrl}
                      alt="Comprobante de entrega"
                      className="w-full max-w-md mx-auto rounded-lg border shadow-sm"
                      style={{ maxHeight: '400px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={handleDownloadPhoto}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Descargar Foto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Photos - Solo mostrar en modo visualización */}
            {!isEditing && additionalPhotos.length > 0 && (
              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Fotos Adicionales
                  </CardTitle>
                  <CardDescription>
                    Fotos adicionales subidas por el courier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {additionalPhotos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.photoUrl}
                          alt="Foto adicional"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = photo.photoUrl
                            link.download = `foto-${photo.id}.jpg`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        )}
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
