import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { useProviders } from "../hooks/use-providers"
import { SuccessDialog } from "../components/ui/success-dialog"
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Trash2,
  AlertCircle
} from "lucide-react"

export default function ProviderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { providers, isLoading, error, updateProvider, deleteProvider } = useProviders()
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
    address: "",
    city: "",
    province: "",
    phoneNumber: "",
    email: "",
    isActive: true
  })

  // Find the provider by ID
  const provider = providers.find(p => p.id === id)

  // Load provider data into form
  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        address: provider.address,
        city: provider.city,
        province: provider.province,
        phoneNumber: provider.phoneNumber || "",
        email: provider.email || "",
        isActive: provider.isActive
      })
    }
  }, [provider])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!provider) return
    
    setIsSaving(true)
    try {
      await updateProvider(provider.id, formData)
      setIsEditing(false)
      
      // Mostrar diálogo de éxito
      setSuccessDialog({
        isOpen: true,
        title: "Proveedor actualizado exitosamente",
        description: `Los datos de ${formData.name} han sido actualizados correctamente.`,
        type: 'success'
      })
    } catch (error) {
      console.error('Error updating provider:', error)
      
      // Mostrar diálogo de error
      setSuccessDialog({
        isOpen: true,
        title: "Error al actualizar proveedor",
        description: "No se pudo actualizar el proveedor. Por favor intenta de nuevo.",
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original provider data
    if (provider) {
      setFormData({
        name: provider.name,
        address: provider.address,
        city: provider.city,
        province: provider.province,
        phoneNumber: provider.phoneNumber || "",
        email: provider.email || "",
        isActive: provider.isActive
      })
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!provider) return
    
    if (!confirm(`¿Estás seguro de que quieres eliminar al proveedor ${provider.name}?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteProvider(provider.id)
      
      // Mostrar diálogo de éxito
      setSuccessDialog({
        isOpen: true,
        title: "Proveedor eliminado exitosamente",
        description: `${provider.name} ha sido eliminado correctamente.`,
        type: 'success'
      })
      
      // Navegar después de un breve delay para que se vea el mensaje
      setTimeout(() => {
        navigate("/dashboard/providers")
      }, 1500)
    } catch (error) {
      console.error('Error deleting provider:', error)
      
      // Mostrar diálogo de error
      setSuccessDialog({
        isOpen: true,
        title: "Error al eliminar proveedor",
        description: "No se pudo eliminar el proveedor. Por favor intenta de nuevo.",
        type: 'error'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando proveedor...</p>
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
            <h2 className="text-xl font-semibold mb-2">Error al cargar proveedor</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/dashboard/providers")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Proveedores
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold">Proveedor No Encontrado</h1>
            <p className="text-muted-foreground mb-4">El proveedor que buscas no existe.</p>
            <Button onClick={() => navigate("/dashboard/providers")}>
              Volver a Proveedores
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/providers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proveedores
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{provider.name}</h1>
            <p className="text-sm text-muted-foreground">Detalles del proveedor</p>
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
        {/* Provider Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información del Proveedor
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
                  <p className="text-lg font-semibold">{provider.name}</p>
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
                ) : provider.email ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{provider.email}</p>
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
                ) : provider.phoneNumber ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{provider.phoneNumber}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No phone provided</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                {isEditing ? (
                  <Input
                    value={formData.contact}
                    onChange={(e) => handleInputChange("contact", e.target.value)}
                    className="mt-1"
                  />
                ) : provider.contact ? (
                  <p className="text-sm">{provider.contact}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No contact provided</p>
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
                  <p className="text-sm mt-1">{provider.province}</p>
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
                    <Badge variant={provider.isActive ? "default" : "secondary"}>
                      {provider.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
              <CardDescription>Dirección y ciudad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                {isEditing ? (
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm font-semibold">{provider.city}</p>
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
                    <p className="text-sm">{provider.address}</p>
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
              <CardTitle>Tareas Asociadas</CardTitle>
              <CardDescription>Tareas que involucran este proveedor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay tareas asociadas con este proveedor</p>
              </div>
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
