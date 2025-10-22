import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useAuth } from "../hooks/use-auth"
import { useClients } from "../hooks/use-clients"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  X
} from "lucide-react"

export default function NewClientPage() {
  const navigate = useNavigate()
  const { role, organizationId } = useAuth()
  const { createClient } = useClients()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    notes: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!organizationId || !formData.name || !formData.address || !formData.city || !formData.province) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    setIsSaving(true)

    try {
      const newClient = await createClient({
        organizationId: organizationId,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        phoneNumber: formData.phone || undefined,
        email: formData.email || undefined,
      })

      console.log("New client created:", newClient)

      alert("Cliente creado exitosamente!")
      navigate("/dashboard/clients")
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Error creando el cliente. Intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate("/dashboard/clients")
  }

  useEffect(() => {
    if (role !== "orgadmin") {
      navigate("/login")
    }
  }, [role, navigate])

  // No renderizar si no tiene permisos
  if (role !== "orgadmin") {
    return null
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
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Nuevo Cliente</h1>
            <p className="text-sm text-muted-foreground">Agrega un nuevo cliente al sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Guardando..." : "Crear Cliente"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>Detalles del cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nombre Completo *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="mt-1"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="mt-1"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="suspended">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dirección *</label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="mt-1"
                    placeholder="Ingresa la dirección completa..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="mt-1"
                      placeholder="Ciudad"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                    <Input
                      value={formData.contact}
                      onChange={(e) => handleInputChange("contact", e.target.value)}
                      className="mt-1"
                      placeholder="Persona de contacto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
                <CardDescription>Cualquier información adicional</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notas</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="mt-1"
                    rows={4}
                    placeholder="Agrega notas adicionales sobre este cliente..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Summary */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Resumen del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">
                      {formData.name || "Nombre no especificado"}
                    </span>
                  </div>
                  {formData.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {formData.email}
                    </p>
                  )}
                  {formData.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {formData.phone}
                    </p>
                  )}
                  {formData.address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {formData.address}
                    </p>
                  )}
                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground">
                      Estado: {formData.status === "active" ? "Activo" : formData.status === "inactive" ? "Inactivo" : "Suspendido"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}