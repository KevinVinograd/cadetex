import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { useAuth } from "../hooks/use-auth"
import { useClients } from "../hooks/use-clients"
import { SuccessDialog } from "../components/ui/success-dialog"
import { 
  ArrowLeft, 
  Building2, 
  Plus,
  AlertCircle
} from "lucide-react"

export default function NewClientPage() {
  const navigate = useNavigate()
  const { role, organizationId } = useAuth()
  const { createClient } = useClients()
  const [isSaving, setIsSaving] = useState(false)
  const [createError, setCreateError] = useState("")
  
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateClient = async () => {
    if (!organizationId || !formData.name || !formData.address || !formData.city || !formData.province) {
      setCreateError("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      setIsSaving(true)
      setCreateError("")

      await createClient({
        organizationId: organizationId!,
        name: formData.name,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        isActive: formData.isActive
      })

      showSuccess("Cliente Creado", "El cliente ha sido creado exitosamente.")
      
      // Navegar de vuelta a la lista después de 1.5 segundos
      setTimeout(() => {
        navigate("/dashboard/clients")
      }, 1500)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Error al crear cliente")
      console.error("Failed to create client:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const showSuccess = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSuccessDialog({
      isOpen: true,
      title,
      description,
      type
    })
  }

  if (role !== "orgadmin" && role !== "superadmin") {
    navigate("/login")
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/dashboard/clients")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Nuevo Cliente</h1>
            <p className="text-sm text-muted-foreground">Crear un nuevo cliente</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={handleCreateClient}
            disabled={isSaving || !formData.name || !formData.address || !formData.city || !formData.province}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? "Creando..." : "Crear Cliente"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/dashboard/clients")}
            disabled={isSaving}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Cancelar
          </Button>
        </div>
      </div>

      {/* Banner de modo creación */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Modo de creación activo - Completa la información del cliente y haz clic en "Crear Cliente" para confirmar o "Cancelar" para descartar
          </p>
        </div>
      </div>

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
              {createError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-800 dark:text-red-200">{createError}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                  placeholder="cliente@empresa.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className="mt-1"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Calle 123, Barrio"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="mt-1"
                  placeholder="Buenos Aires"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Provincia</label>
                <Input
                  value={formData.province}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  className="mt-1"
                  placeholder="CABA"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <select
                  value={formData.isActive ? "active" : "inactive"}
                  onChange={(e) => handleInputChange("isActive", e.target.value === "active")}
                  className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for future content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información Adicional
              </CardTitle>
              <CardDescription>Detalles adicionales del cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Cliente Nuevo</h3>
                <p className="text-sm text-muted-foreground">Una vez creado, aquí aparecerá información adicional del cliente.</p>
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
