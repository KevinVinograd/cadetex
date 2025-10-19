import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { mockProviders } from "../lib/mock-data"
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    contact: ""
  })

  // Find the provider by ID
  const provider = mockProviders.find(p => p.id === id)

  // Load provider data into form
  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        address: provider.address,
        city: provider.city,
        phone: provider.phone || "",
        email: provider.email || "",
        contact: provider.contact || ""
      })
    }
  }, [provider])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Provider updated:", formData)
      setIsEditing(false)
      alert("Provider updated successfully!")
    } catch (error) {
      console.error('Error updating provider:', error)
      alert('Error updating provider. Please try again.')
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
        phone: provider.phone || "",
        email: provider.email || "",
        contact: provider.contact || ""
      })
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al proveedor ${provider?.name}?`)) {
      return
    }

    setIsDeleting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`Proveedor ${provider?.name} eliminado exitosamente`)
      navigate("/dashboard/providers")
    } catch (error) {
      console.error('Error deleting provider:', error)
      alert('Error eliminando proveedor. Intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!provider) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Proveedor No Encontrado</h1>
          <p className="text-muted-foreground mb-4">El proveedor que buscas no existe.</p>
          <Button onClick={() => navigate("/dashboard/providers")}>
            Volver a Proveedores
          </Button>
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="mt-1"
                  />
                ) : provider.phone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{provider.phone}</p>
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
    </div>
  )
}
