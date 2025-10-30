import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { useClients } from "../hooks/use-clients"
import { ContactInfoForm } from "../components/ContactInfoForm"
import { AddressForm } from "../components/AddressForm"
import { parseAddress } from "../lib/address-parser"

// Helper function to format dates consistently
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "No programada"
  
  let date: Date
  if (dateString.includes('T') || dateString.includes('Z')) {
    // Full ISO date
    date = new Date(dateString)
  } else {
    // YYYY-MM-DD format - add time to avoid timezone issues
    date = new Date(dateString + 'T00:00:00')
  }
  
  return date.toLocaleDateString('es-ES')
}

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
  AlertCircle
} from "lucide-react"

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, isLoading, error, updateClient, deleteClient, refetch } = useClients()
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
    legalName: "",
    email: "",
    phoneMobile: "",
    phoneFixed: "",
    province: "",
    city: "",
    street: "",
    streetNumber: "",
    addressComplement: "",
    postalCode: "",
    notes: "",
    isActive: true
  })

  // Find the client by ID
  const client = clients.find(c => c.id === id)

  // Load client data into form when component mounts or client changes
  useEffect(() => {
    if (client) {
      // Manejar address como objeto AddressObject o string legacy
      let street = ""
      let streetNumber = ""
      let addressComplement = ""
      
      if (typeof client.address === 'object' && client.address) {
        // Address es un objeto normalizado
        street = client.address.street || ""
        streetNumber = client.address.streetNumber || ""
        addressComplement = client.address.addressComplement || ""
      } else if (typeof client.address === 'string') {
        // Address es un string legacy, parsearlo
        const parsed = parseAddress(client.address)
        street = parsed.street
        streetNumber = parsed.streetNumber
        addressComplement = parsed.addressComplement
      }
      
      // Fallback a campos legacy si existen
      street = street || client.street || ""
      streetNumber = streetNumber || client.streetNumber || ""
      addressComplement = addressComplement || client.addressComplement || ""
      
      const phone = client.phoneNumber || ""
      const isMobile = phone.includes("9") || phone.length > 10
      
      setFormData({
        name: client.name,
        legalName: (client as any).legalName || "",
        email: client.email || "",
        phoneMobile: isMobile ? phone : "",
        phoneFixed: !isMobile ? phone : "",
        province: (typeof client.address === 'object' && client.address?.province) || client.province || "",
        city: (typeof client.address === 'object' && client.address?.city) || client.city || "",
        street,
        streetNumber,
        addressComplement,
        postalCode: "", // No está almacenado en el backend actualmente
        notes: (client as any).notes || "",
        isActive: client.isActive
      })
    }
  }, [client?.id, client?.street, client?.streetNumber, client?.addressComplement, client?.city, client?.province])
  
  // Get tasks for this client
  const clientTasks: any[] = []

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
      confirmada_tomar: "Confirmada",
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
    if (!client) return
    
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
      const phoneNumber = formData.phoneMobile || formData.phoneFixed || undefined
      
      // Construir objeto Address para enviar al backend
      const address = {
        street: formData.street || undefined,
        streetNumber: formData.streetNumber || undefined,
        addressComplement: formData.addressComplement || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        postalCode: formData.postalCode || undefined
      }
      
      await updateClient(client.id, {
        name: formData.name,
        email: formData.email || undefined,
        phoneNumber: phoneNumber,
        address: address,
        isActive: formData.isActive
      })
      
      // Recargar los clientes para obtener los datos actualizados
      await refetch()
      
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
      // Manejar address como objeto AddressObject o string legacy
      let street = ""
      let streetNumber = ""
      let addressComplement = ""
      
      if (typeof client.address === 'object' && client.address) {
        // Address es un objeto normalizado
        street = client.address.street || ""
        streetNumber = client.address.streetNumber || ""
        addressComplement = client.address.addressComplement || ""
      } else if (typeof client.address === 'string') {
        // Address es un string legacy, parsearlo
        const parsed = parseAddress(client.address)
        street = parsed.street
        streetNumber = parsed.streetNumber
        addressComplement = parsed.addressComplement
      }
      
      // Fallback a campos legacy si existen
      street = street || client.street || ""
      streetNumber = streetNumber || client.streetNumber || ""
      addressComplement = addressComplement || client.addressComplement || ""
      
      const phone = client.phoneNumber || ""
      const isMobile = phone.includes("9") || phone.length > 10
      
      setFormData({
        name: client.name,
        email: client.email || "",
        phoneMobile: isMobile ? phone : "",
        phoneFixed: !isMobile ? phone : "",
        province: (typeof client.address === 'object' && client.address?.province) || client.province || "",
        city: (typeof client.address === 'object' && client.address?.city) || client.city || "",
        street,
        streetNumber,
        addressComplement,
        postalCode: "",
        legalName: (client as any).legalName || "",
        notes: (client as any).notes || "",
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
        {/* Información del Cliente - Misma estructura que NewClientPage */}
        <ContactInfoForm
          type="client"
          formData={formData}
          onInputChange={handleInputChange}
          disabled={!isEditing}
        />

        {/* Dirección y Ubicación - Misma estructura que NewClientPage */}
        <AddressForm
          formData={formData}
          onInputChange={(field: string, value: string) => handleInputChange(field, value)}
          showNotes={true}
          notesPlaceholder="Notas adicionales sobre el cliente"
          disabled={!isEditing}
        />
      </div>

      {/* Tasks List - Abajo de todo */}
      <div className="space-y-6">
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
                            <span>{formatDate(task.scheduledDate)}</span>
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
