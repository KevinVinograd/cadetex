import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useProviders } from "../hooks/use-providers"
import { SuccessDialog } from "../components/ui/success-dialog"
import { ContactInfoForm } from "../components/ContactInfoForm"
import { AddressForm } from "../components/AddressForm"
import { parseAddress } from "../lib/address-parser"
import { 
  ArrowLeft, 
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react"

export default function ProviderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { providers, isLoading, error, updateProvider, deleteProvider, refetch } = useProviders()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
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
    contactName: "",
    contactPhone: "",
    province: "",
    city: "",
    street: "",
    streetNumber: "",
    addressComplement: "",
    postalCode: "",
    notes: "",
    isActive: true
  })

  // Find the provider by ID
  const provider = providers.find(p => p.id === id)

  // Load provider data into form
  useEffect(() => {
    if (provider) {
      // Usar campos separados del backend si existen, sino parsear desde address
      const street = provider.street || (provider.address ? parseAddress(provider.address).street : "")
      const streetNumber = provider.streetNumber || (provider.address ? parseAddress(provider.address).streetNumber : "")
      const addressComplement = provider.addressComplement || (provider.address ? parseAddress(provider.address).addressComplement : "")
      
      setFormData({
        name: provider.name,
        contactName: (provider as any).contactName || "",
        contactPhone: (provider as any).contactPhone || provider.phoneNumber || "",
        province: provider.province || "",
        city: provider.city || "",
        street,
        streetNumber,
        addressComplement,
        postalCode: "",
        notes: (provider as any).notes || "",
        isActive: provider.isActive
      })
    }
  }, [provider?.id, provider?.street, provider?.streetNumber, provider?.addressComplement, provider?.city, provider?.province])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Construir dirección completa desde campos estructurados
  const buildFullAddress = () => {
    const parts: string[] = []
    if (formData.street) parts.push(formData.street)
    if (formData.streetNumber) parts.push(formData.streetNumber)
    if (formData.addressComplement) parts.push(formData.addressComplement)
    return parts.join(" ").trim()
  }

  const handleSave = async () => {
    if (!provider) return
    
    if (!formData.name) {
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: "El nombre es obligatorio",
        type: 'error'
      })
      return
    }
    if (!formData.city) {
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: "La ciudad es obligatoria",
        type: 'error'
      })
      return
    }
    if (!formData.province) {
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: "La provincia es obligatoria",
        type: 'error'
      })
      return
    }
    
    const fullAddress = buildFullAddress()
    if (!fullAddress) {
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: "La dirección es obligatoria",
        type: 'error'
      })
      return
    }
    
    setIsSaving(true)
    try {
      await updateProvider(provider.id, {
        name: formData.name,
        street: formData.street || undefined,
        streetNumber: formData.streetNumber || undefined,
        addressComplement: formData.addressComplement || undefined,
        city: formData.city,
        province: formData.province,
        contactName: formData.contactName || undefined,
        contactPhone: formData.contactPhone || undefined,
        isActive: formData.isActive
      })
      
      // Recargar los proveedores para obtener los datos actualizados
      await refetch()
      
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
      // Usar campos separados del backend si existen, sino parsear desde address
      const street = provider.street || (provider.address ? parseAddress(provider.address).street : "")
      const streetNumber = provider.streetNumber || (provider.address ? parseAddress(provider.address).streetNumber : "")
      const addressComplement = provider.addressComplement || (provider.address ? parseAddress(provider.address).addressComplement : "")
      
      setFormData({
        name: provider.name,
        contactName: (provider as any).contactName || "",
        contactPhone: (provider as any).contactPhone || provider.phoneNumber || "",
        province: provider.province || "",
        city: provider.city || "",
        street,
        streetNumber,
        addressComplement,
        postalCode: "",
        notes: (provider as any).notes || "",
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
          {!isEditing && (
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
          {isEditing && (
            <>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving || !formData.name || !formData.city || !formData.province || !buildFullAddress()}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                disabled={isSaving}
                className="border-gray-200"
              >
                Cancelar
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting || isEditing}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información del Proveedor - Misma estructura que NewProviderPage */}
        <ContactInfoForm
          type="provider"
          formData={formData}
          onInputChange={handleInputChange}
          disabled={!isEditing}
        />

        {/* Dirección y Ubicación - Misma estructura que NewProviderPage */}
        <AddressForm
          formData={formData}
          onInputChange={(field: string, value: string) => handleInputChange(field, value)}
          showNotes={true}
          notesPlaceholder="Notas adicionales sobre el proveedor"
          disabled={!isEditing}
        />
      </div>

      {/* Tasks List - Abajo de todo */}
      <div className="space-y-6">
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
