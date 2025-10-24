import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react"

export default function CourierDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    activeTasks: 0
  })

  // Find the courier by ID
  const courier = mockCouriers.find(c => c.id === id)

  // Load courier data into form
  useEffect(() => {
    if (courier) {
      setFormData({
        name: courier.name,
        email: courier.email || "",
        phoneNumber: courier.phoneNumber,
        address: courier.address || "",
        activeTasks: courier.activeTasks
      })
    }
  }, [courier])
  
  // Get tasks assigned to this courier (TODO: implement real task loading)
  const courierTasks: any[] = []

  if (!courier) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Courier No Encontrado</h1>
          <p className="text-muted-foreground mb-4">El courier que buscas no existe.</p>
          <Button onClick={() => navigate("/dashboard/couriers")}>
            Volver a Couriers
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (courier: any) => {
    const isActive = courier.activeTasks > 0
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Activo</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Inactivo</Badge>
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
      confirmada_tomar: "Confirmada",
      finalizada: "Finalizada",
      cancelada: "Cancelada",
    }
    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Courier updated:", formData)
      setIsEditing(false)
      alert("Courier updated successfully!")
    } catch (error) {
      console.error('Error updating courier:', error)
      alert('Error updating courier. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original courier data
    if (courier) {
      setFormData({
        name: courier.name,
        email: courier.email || "",
        phoneNumber: courier.phoneNumber,
        address: courier.address || "",
        activeTasks: courier.activeTasks
      })
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al courier ${courier.name}?`)) {
      return
    }

    setIsDeleting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`Courier ${courier.name} eliminado exitosamente`)
      navigate("/dashboard/couriers")
    } catch (error) {
      console.error('Error deleting courier:', error)
      alert('Error eliminando courier. Intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/couriers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Couriers
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{courier.name}</h1>
            <p className="text-sm text-muted-foreground">Detalles del courier</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
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
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Courier Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>Detalles del courier</CardDescription>
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
                  <p className="text-lg font-semibold">{courier.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-1">{getStatusBadge(courier)}</div>
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
                ) : courier.email ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{courier.email}</p>
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
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{courier.phoneNumber}</p>
                  </div>
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
                ) : courier.address ? (
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{courier.address}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No address provided</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Tareas Activas
              </CardTitle>
              <CardDescription>Número de tareas activas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tareas Activas</label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    value={formData.activeTasks}
                    onChange={(e) => handleInputChange("activeTasks", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">{courier.activeTasks}</p>
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
                Tareas Asignadas
              </CardTitle>
              <CardDescription>Tareas actuales y recientes de este courier</CardDescription>
            </CardHeader>
            <CardContent>
              {courierTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay tareas asignadas</h3>
                  <p className="text-sm text-muted-foreground">Este courier no tiene tareas asignadas actualmente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courierTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{task.referenceBL}</h4>
                          {getTaskStatusBadge(task.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{task.clientName}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{task.pickupAddress}</span>
                          </div>
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
    </div>
  )
}
