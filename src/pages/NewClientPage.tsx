import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useAuth } from "../hooks/use-auth"
import { useClients } from "../hooks/use-clients"
import { SuccessDialog } from "../components/ui/success-dialog"
import { ContactInfoForm } from "../components/ContactInfoForm"
import { AddressForm } from "../components/AddressForm"
import { 
  ArrowLeft, 
  Plus,
  AlertCircle
} from "lucide-react"
import { getTranslation } from "../lib/translations"

const t = getTranslation()

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
    legalName: "", // RAZÃO SOCIAL
    email: "",
    phoneMobile: "", // NÚMERO TELEFONE CELULAR
    phoneFixed: "", // NUMERO TELEFONE FIXO
    country: "Argentina", // PAÍS
    province: "", // ESTADO
    city: "", // CIDADE
    neighborhood: "", // BAIRRO
    streetType: "", // TIPO LOGRADOURO
    street: "", // LOGRADOURO
    streetNumber: "", // NÚMERO LOGRADOURO
    addressComplement: "", // COMPLEMENTO LOGRADOURO (piso, depto, etc.)
    postalCode: "", // CEP
    address: "", // Dirección completa combinada (para compatibilidad)
    notes: "", // OBSERVAÇÃO
    isActive: true
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Construir dirección completa desde campos estructurados
  const buildFullAddress = () => {
    // Construir desde campos estructurados
    const parts: string[] = []
    
    if (formData.street) parts.push(formData.street)
    if (formData.streetNumber) parts.push(formData.streetNumber)
    if (formData.addressComplement) parts.push(formData.addressComplement)
    
    return parts.join(" ").trim()
  }

  const handleCreateClient = async () => {
    // Validación de campos obligatorios
    if (!organizationId || !formData.name) {
      setCreateError("El nombre es obligatorio")
      return
    }
    if (!formData.city) {
      setCreateError("La ciudad es obligatoria")
      return
    }
    if (!formData.province) {
      setCreateError("La provincia es obligatoria")
      return
    }
    
    const fullAddress = buildFullAddress()
    if (!fullAddress) {
      setCreateError("La dirección es obligatoria. Complete al menos el nombre de la calle.")
      return
    }
    

    try {
      setIsSaving(true)
      setCreateError("")

      // Usar teléfono móvil como principal, o fijo si no hay móvil
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

      await createClient({
        organizationId: organizationId!,
        name: formData.name,
        email: formData.email || undefined,
        phoneNumber: phoneNumber,
        address: address,
        isActive: formData.isActive
      })

      showSuccess(t.forms.clientCreated, t.forms.clientCreatedDesc)
      
      // Navegar de vuelta a la lista después de 1.5 segundos
      setTimeout(() => {
        navigate("/dashboard/clients")
      }, 1500)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : t.forms.errorCreatingClient)
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
            disabled={isSaving || !formData.name || !formData.city || !formData.province || !buildFullAddress()}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información del Cliente */}
        <ContactInfoForm
          type="client"
          formData={formData}
          onInputChange={handleInputChange}
          error={createError}
        />

        {/* Dirección y Ubicación */}
        <AddressForm
          formData={formData}
          onInputChange={(field: string, value: string) => handleInputChange(field, value)}
          showNotes={true}
          notesPlaceholder="Notas adicionales sobre el cliente"
        />
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
