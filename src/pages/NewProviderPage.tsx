import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { useAuth } from "../hooks/use-auth"
import { useProviders } from "../hooks/use-providers"
import { SuccessDialog } from "../components/ui/success-dialog"
import { ContactInfoForm } from "../components/ContactInfoForm"
import { AddressForm } from "../components/AddressForm"
import { 
  ArrowLeft, 
  Plus
} from "lucide-react"
import { getTranslation } from "../lib/translations"

const t = getTranslation()

export default function NewProviderPage() {
  const navigate = useNavigate()
  const { role, organizationId } = useAuth()
  const { createProvider } = useProviders()
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

  const handleCreateProvider = async () => {
    // Validación de campos obligatorios
    if (!organizationId || !formData.name) {
      setCreateError("El nombre es obligatorio")
      return
    }
    if (!formData.province) {
      setCreateError("La provincia es obligatoria")
      return
    }
    if (!formData.city) {
      setCreateError("La ciudad es obligatoria")
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

      await createProvider({
        organizationId: organizationId!,
        name: formData.name,
        street: formData.street || undefined,
        streetNumber: formData.streetNumber || undefined,
        addressComplement: formData.addressComplement || undefined,
        city: formData.city,
        ...(formData.province && { province: formData.province }),
        contactPhone: phoneNumber || undefined,
        isActive: formData.isActive
      })

      showSuccess(t.forms.providerCreated, t.forms.providerCreatedDesc)
      
      // Navegar de vuelta a la lista después de 1.5 segundos
      setTimeout(() => {
        navigate("/dashboard/providers")
      }, 1500)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : t.forms.errorCreatingProvider)
      console.error("Failed to create provider:", err)
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
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/dashboard/providers")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proveedores
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Nuevo Proveedor</h1>
            <p className="text-sm text-muted-foreground">Crear un nuevo proveedor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={handleCreateProvider}
            disabled={isSaving || !formData.name || !formData.province || !formData.city || !buildFullAddress()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? t.forms.creating : t.forms.createProvider}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/dashboard/providers")}
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
            {t.forms.creationMode}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información del Proveedor */}
        <ContactInfoForm
          type="provider"
          formData={formData}
          onInputChange={handleInputChange}
          error={createError}
        />

        {/* Dirección y Ubicación */}
        <AddressForm
          formData={formData}
          onInputChange={(field: string, value: string) => handleInputChange(field, value)}
          showNotes={true}
          notesPlaceholder="Notas adicionales sobre el proveedor"
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