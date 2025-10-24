import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Save,
  X
} from "lucide-react"

export default function CloneTaskPage() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    referenceBL: "",
    contactType: "client",
    contactId: "",
    type: "entrega",
    status: "en_preparacion",
    scheduledDate: "",
    address: "",
    city: "",
    contact: "",
    courierId: "unassigned",
    notes: "",
    priority: "normal",
    mbl: "",
    hbl: "",
    freightCertificate: "",
    foCertificate: "",
    bunkerCertificate: ""
  })

  // Load cloned task data from localStorage
  useEffect(() => {
    const clonedTaskData = localStorage.getItem('clonedTask')
    if (clonedTaskData) {
      const clonedTask = JSON.parse(clonedTaskData)
      
      // Determine contact type and load appropriate data
      let contactType = "client"
      let contactId = ""
      let address = ""
      let city = ""
      let contact = ""
      
      if (clonedTask.clientId) {
        contactType = "client"
        contactId = clonedTask.clientId
        const client = mockClients.find(c => c.id === clonedTask.clientId)
        if (client) {
          address = client.address
          city = client.city
          contact = client.contact || ""
        }
      } else if (clonedTask.providerId) {
        contactType = "provider"
        contactId = clonedTask.providerId
        const provider = mockProviders.find(p => p.id === clonedTask.providerId)
        if (provider) {
          address = provider.address
          city = provider.city
          contact = provider.contact || ""
        }
      }
      
      setFormData({
        referenceBL: clonedTask.referenceBL,
        contactType,
        contactId,
        type: clonedTask.type,
        status: clonedTask.status,
        scheduledDate: new Date(clonedTask.scheduledDate).toISOString().split('T')[0],
        address,
        city,
        contact,
        courierId: clonedTask.courierId || "unassigned",
        notes: clonedTask.notes || "",
        priority: clonedTask.priority || "normal",
        mbl: clonedTask.mbl || "",
        hbl: clonedTask.hbl || "",
        freightCertificate: clonedTask.freightCertificate || "",
        foCertificate: clonedTask.foCertificate || "",
        bunkerCertificate: clonedTask.bunkerCertificate || ""
      })
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClientChange = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId)
    if (client) {
      setFormData(prev => ({
        ...prev,
        contactId: clientId,
        address: client.address,
        city: client.city,
        contact: client.contact || ""
      }))
    }
  }

  const handleProviderChange = (providerId: string) => {
    const provider = mockProviders.find(p => p.id === providerId)
    if (provider) {
      setFormData(prev => ({
        ...prev,
        contactId: providerId,
        address: provider.address,
        city: provider.city,
        contact: provider.contact || ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Convert form data to backend format
      const newTask = {
        id: `task-${Date.now()}`,
        referenceBL: formData.referenceBL,
        clientId: formData.contactType === "client" ? formData.contactId : "",
        providerId: formData.contactType === "provider" ? formData.contactId : "",
        type: formData.type,
        status: formData.status,
        scheduledDate: formData.scheduledDate,
        pickupAddress: formData.type === "retiro" ? formData.address : "",
        pickupCity: formData.type === "retiro" ? formData.city : "",
        pickupContact: formData.type === "retiro" ? formData.contact : "",
        deliveryAddress: formData.type === "entrega" ? formData.address : "",
        deliveryCity: formData.type === "entrega" ? formData.city : "",
        deliveryContact: formData.type === "entrega" ? formData.contact : "",
        courierId: formData.courierId === "unassigned" ? "" : formData.courierId,
        notes: formData.notes,
        priority: formData.priority,
        mbl: formData.mbl,
        hbl: formData.hbl,
        freightCertificate: formData.freightCertificate,
        foCertificate: formData.foCertificate,
        bunkerCertificate: formData.bunkerCertificate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log("New cloned task created:", newTask)
      
      // Clear localStorage
      localStorage.removeItem('clonedTask')
      
      alert("Tarea clonada exitosamente!")
      navigate("/dashboard")
    } catch (error) {
      console.error('Error creating cloned task:', error)
      alert('Error creando la tarea clonada. Intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    localStorage.removeItem('clonedTask')
    navigate("/dashboard")
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Clonar Tarea</h1>
            <p className="text-sm text-muted-foreground">Crea una nueva tarea basada en una existente</p>
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
            {isSaving ? "Guardando..." : "Crear Tarea"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>Detalles de la tarea clonada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reference Vexa *</label>
                    <Input
                      value={formData.referenceBL}
                      onChange={(e) => handleInputChange("referenceBL", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Tarea *</label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retiro">Retiro</SelectItem>
                        <SelectItem value="entrega">Entrega</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado *</label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_preparacion">En Preparación</SelectItem>
                        <SelectItem value="pendiente_confirmar">Pendiente Confirmar</SelectItem>
                        <SelectItem value="confirmada_tomar">Confirmada</SelectItem>
                        <SelectItem value="finalizada">Finalizada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha Programada *</label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Selection */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Selección de Contacto
                </CardTitle>
                <CardDescription>Selecciona el tipo de contacto y el contacto específico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Contacto *</label>
                  <Select value={formData.contactType} onValueChange={(value) => handleInputChange("contactType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="provider">Proveedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {formData.contactType === "client" ? "Cliente" : "Proveedor"} *
                  </label>
                  <Select 
                    value={formData.contactId} 
                    onValueChange={(value) => {
                      if (formData.contactType === "client") {
                        handleClientChange(value)
                      } else {
                        handleProviderChange(value)
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={`Selecciona un ${formData.contactType === "client" ? "cliente" : "proveedor"}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.contactType === "client" ? (
                        mockClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))
                      ) : (
                        mockProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {formData.type === "retiro" ? "Dirección de Recogida" : "Dirección de Entrega"}
                </CardTitle>
                <CardDescription>
                  {formData.type === "retiro" 
                    ? "Ubicación donde se recogerá la documentación" 
                    : "Ubicación donde se entregará la documentación"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dirección *</label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder={`Ingresa la dirección de ${formData.type === "retiro" ? "recogida" : "entrega"}...`}
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

            {/* Certificates */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Certificados</CardTitle>
                <CardDescription>Documentos de la carga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">MBL</label>
                    <Input
                      value={formData.mbl}
                      onChange={(e) => handleInputChange("mbl", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">HBL</label>
                    <Input
                      value={formData.hbl}
                      onChange={(e) => handleInputChange("hbl", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Freight Certificate</label>
                    <Input
                      value={formData.freightCertificate}
                      onChange={(e) => handleInputChange("freightCertificate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">FO Certificate</label>
                    <Input
                      value={formData.foCertificate}
                      onChange={(e) => handleInputChange("foCertificate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bunker Certificate</label>
                    <Input
                      value={formData.bunkerCertificate}
                      onChange={(e) => handleInputChange("bunkerCertificate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Notas</CardTitle>
                <CardDescription>Información adicional</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="mt-1"
                  rows={4}
                  placeholder="Agrega notas adicionales..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Courier Assignment */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Asignar Courier</CardTitle>
                <CardDescription>Selecciona el courier (opcional)</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={formData.courierId} onValueChange={(value) => handleInputChange("courierId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un courier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {mockCouriers.map((courier) => (
                      <SelectItem key={courier.id} value={courier.id}>
                        {courier.name} - {courier.phoneNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Task Description */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Descripción de la Tarea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">
                      {formData.type === "retiro" ? "Retiro" : "Entrega"} de documentación
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.type === "retiro" 
                      ? "Se recogerá la documentación en la dirección especificada"
                      : "Se entregará la documentación en la dirección especificada"
                    }
                  </p>
                  {formData.contactType === "client" && (
                    <p className="text-sm text-muted-foreground">
                      Cliente: {mockClients.find(c => c.id === formData.contactId)?.name || "No seleccionado"}
                    </p>
                  )}
                  {formData.contactType === "provider" && (
                    <p className="text-sm text-muted-foreground">
                      Proveedor: {mockProviders.find(p => p.id === formData.contactId)?.name || "No seleccionado"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
