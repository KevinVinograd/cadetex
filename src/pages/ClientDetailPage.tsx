import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { mockTasks } from "../lib/mock-data"
import { useClients } from "../hooks/use-clients"
import { SuccessDialog } from "../components/ui/success-dialog"
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Calendar, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react"

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, isLoading, error, updateClient, deleteClient } = useClients()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    province: "",
    isActive: true
  })

  // Find the client by ID
  const client = clients.find(c => c.id === id)

  // Load client data into form
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || "",
        phoneNumber: client.phoneNumber || "",
        address: client.address,
        city: client.city,
        province: client.province,
        isActive: client.isActive
      })
    }
  }, [client])
  
  // Get tasks for this client
  const clientTasks = mockTasks.filter(task => task.clientId === id)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando cliente...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error al cargar cliente</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/dashboard/clients")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Clientes
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Cliente No Encontrado</h1>
          <p className="text-muted-foreground mb-4">El cliente que buscas no existe.</p>
          <Button onClick={() => navigate("/dashboard/clients")}>
            Volver a Clientes
          </Button>
        </div>
      </div>
    )
  }

  const getTaskStatusBadge = (status: string) => {
    const variants = {
      en_preparacion: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      pendiente_confirmar: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmada_tomar: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      finalizada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    const labels = {
      en_preparacion: "En Preparación",
      pendiente_confirmar: "Pendiente Confirmar",
      confirmada_tomar: "Confirmada Tomar",
      finalizada: "Finalizada",
      cancelada: "Cancelada",
    }
    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      pickup: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      both: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    }
    return <Badge className={variants[type as keyof typeof variants]}>{type}</Badge>
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!client) return
    
    setIsSaving(true)
    try {
      await updateClient(client.id, formData)
      setIsEditing(false)
      
      // Mostrar diálogo de éxito
      setSuccessDialog({
        isOpen: true,
        title: "Cliente actualizado exitosamente",
        description: `Los datos de ${formData.name} han sido actualizados correctamente.`,
        type: 'success'
      })
    } catch (error) {
      console.error('Error updating client:', error)
      
      // Mostrar diálogo de error
      setSuccessDialog({
        isOpen: true,
        title: "Error al actualizar cliente",
        description: "No se pudo actualizar el cliente. Por favor intenta de nuevo.",
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original client data
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || "",
        phoneNumber: client.phoneNumber || "",
        address: client.address,
        city: client.city,
        province: client.province,
        isActive: client.isActive
      })
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!client) return
    
    if (!confirm(`¿Estás seguro de que quieres eliminar al cliente ${client.name}?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteClient(client.id)
      
      // Mostrar diálogo de éxito
      setSuccessDialog({
        isOpen: true,
        title: "Cliente eliminado exitosamente",
        description: `${client.name} ha sido eliminado correctamente.`,
        type: 'success'
      })
      
      // Navegar después de un breve delay para que se vea el mensaje
      setTimeout(() => {
        navigate("/dashboard/clients")
      }, 1500)
    } catch (error) {
      console.error('Error deleting client:', error)
      
      // Mostrar diálogo de error
      setSuccessDialog({
        isOpen: true,
        title: "Error al eliminar cliente",
        description: "No se pudo eliminar el cliente. Por favor intenta de nuevo.",
        type: 'error'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/clients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Clientes
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{client.name}</h1>
            <p className="text-sm text-muted-foreground">Detalles del cliente</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Cliente
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={isSaving}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Editing Mode Banner */}
      {isEditing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Modo de edición activo - Haz clic en "Guardar Cambios" para confirmar o "Cancelar" para descartar
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
              <CardDescription>Detalles de contacto y ubicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-lg font-semibold">{client.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1"
                  />
                ) : client.email ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{client.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No email provided</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                {isEditing ? (
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="mt-1"
                  />
                ) : client.phoneNumber ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{client.phoneNumber}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No phone provided</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                {isEditing ? (
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{client.address}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                {isEditing ? (
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{client.city}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Provincia</label>
                {isEditing ? (
                  <Input
                    value={formData.province}
                    onChange={(e) => handleInputChange("province", e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{client.province}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                {isEditing ? (
                  <select
                    value={formData.isActive ? "active" : "inactive"}
                    onChange={(e) => handleInputChange("isActive", e.target.value === "active")}
                    className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                ) : (
                  <div className="mt-1">
                    <Badge variant={client.isActive ? "default" : "secondary"}>
                      {client.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Tareas del Cliente
              </CardTitle>
              <CardDescription>Tareas actuales y recientes de este cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {clientTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay tareas</h3>
                  <p className="text-sm text-muted-foreground">Este cliente no tiene tareas registradas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{task.referenceBL}</h4>
                          {getTaskStatusBadge(task.status)}
                          {getTypeBadge(task.type)}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{task.pickupAddress}</span>
                          </div>
                          {task.courierName && (
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              <span>{task.courierName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/dashboard/tasks/${task.id}`}>
                          Ver Detalles
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
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
