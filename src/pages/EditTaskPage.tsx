import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { mockTasks, mockClients, mockCouriers, mockProviders } from "../lib/mock-data"
import { ArrowLeft, Package, MapPin, Calendar, User, AlertCircle, Save } from "lucide-react"

export default function EditTaskPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Find the task by ID
  const task = mockTasks.find(t => t.id === id)
  
  const [formData, setFormData] = useState({
    referenceBL: "",
    contactType: "client",
    contactId: "",
    type: "entrega",
    status: "en_preparacion",
    scheduledDate: "",
    scheduledTime: "",
    address: "",
    city: "",
    contact: "",
    courierId: "",
    notes: "",
    priority: "normal",
    mbl: "",
    hbl: "",
    freightCertificate: "",
    foCertificate: "",
    bunkerCertificate: ""
  })

  useEffect(() => {
    if (task) {
      // Determine if it's a client or provider based on which ID is present
      const contactType = task.clientId ? "client" : "provider"
      const contactId = task.clientId || task.providerId || ""
      
      setFormData({
        referenceBL: task.referenceBL,
        contactType,
        contactId,
        type: task.type,
        status: task.status,
        scheduledDate: new Date(task.scheduledDate).toISOString().split('T')[0],
        scheduledTime: task.scheduledTime || "",
        address: task.pickupAddress || task.deliveryAddress || "",
        city: task.pickupCity || task.deliveryCity || "",
        contact: task.pickupContact || task.deliveryContact || "",
        courierId: task.courierId || "unassigned",
        notes: task.notes || "",
        priority: task.priority || "normal",
        mbl: task.mbl || "",
        hbl: task.hbl || "",
        freightCertificate: task.freightCertificate || "",
        foCertificate: task.foCertificate || "",
        bunkerCertificate: task.bunkerCertificate || ""
      })
    }
  }, [task])

  if (!task) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Task Not Found</h1>
          <p className="text-muted-foreground mb-4">The task you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convert to the format expected by the backend
    const dataToSave = {
      ...formData,
      clientId: formData.contactType === "client" ? formData.contactId : "",
      providerId: formData.contactType === "provider" ? formData.contactId : "",
      clientName: formData.contactType === "client" ? 
        mockClients.find(c => c.id === formData.contactId)?.name || "" : "",
      providerName: formData.contactType === "provider" ? 
        mockProviders.find(p => p.id === formData.contactId)?.name || "" : "",
      pickupAddress: formData.address,
      pickupCity: formData.city,
      pickupContact: formData.contact,
      deliveryAddress: formData.address,
      deliveryCity: formData.city,
      deliveryContact: formData.contact,
      courierId: formData.courierId === "unassigned" ? "" : formData.courierId
    }
    // Here you would typically update the task in your backend
    console.log("Task updated:", dataToSave)
    navigate(`/dashboard/tasks/${task.id}`)
  }

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

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Task
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Edit Task</h1>
          <p className="text-sm text-muted-foreground">Modify task {task.referenceBL}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Update the essential task details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="referenceBL">Reference BL *</Label>
                <Input
                  id="referenceBL"
                  placeholder="BL-2024-001"
                  value={formData.referenceBL}
                  onChange={(e) => handleInputChange("referenceBL", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactType">Contacto *</Label>
                <Select value={formData.contactType || "client"} onValueChange={(value) => handleInputChange("contactType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo de contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="provider">Proveedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactId">
                  {formData.contactType === "provider" ? "Proveedor *" : "Cliente *"}
                </Label>
                <Select 
                  value={formData.contactId || ""} 
                  onValueChange={formData.contactType === "provider" ? handleProviderChange : handleClientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Selecciona ${formData.contactType === "provider" ? "un proveedor" : "un cliente"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.contactType === "provider" ? (
                      mockProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))
                    ) : (
                      mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Task Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retiro">Retiro</SelectItem>
                    <SelectItem value="entrega">Entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_preparacion">En Preparación</SelectItem>
                    <SelectItem value="pendiente_confirmar">Pendiente Confirmar</SelectItem>
                    <SelectItem value="confirmada_tomar">Confirmada Tomar</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Certificados
            </CardTitle>
            <CardDescription>Información de certificados y documentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mbl">MBL</Label>
                <Input
                  id="mbl"
                  placeholder="MBL-001"
                  value={formData.mbl}
                  onChange={(e) => handleInputChange("mbl", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hbl">HBL</Label>
                <Input
                  id="hbl"
                  placeholder="HBL-001"
                  value={formData.hbl}
                  onChange={(e) => handleInputChange("hbl", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="freightCertificate">Certificado de Flete</Label>
                <Input
                  id="freightCertificate"
                  placeholder="FC-001"
                  value={formData.freightCertificate}
                  onChange={(e) => handleInputChange("freightCertificate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foCertificate">Certificación de FO</Label>
                <Input
                  id="foCertificate"
                  placeholder="FO-001"
                  value={formData.foCertificate}
                  onChange={(e) => handleInputChange("foCertificate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bunkerCertificate">Certificación de Búnker</Label>
                <Input
                  id="bunkerCertificate"
                  placeholder="BC-001"
                  value={formData.bunkerCertificate}
                  onChange={(e) => handleInputChange("bunkerCertificate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduling
            </CardTitle>
            <CardDescription>Update the task schedule and timing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Scheduled Time</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Description */}
        <Card className="border">
          <CardContent className="pt-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">
                {formData.type === "retiro" ? "📦 Retiro de Documentos" : 
                 formData.type === "entrega" ? "🚚 Entrega de Documentos" : 
                 "Selecciona un tipo de tarea"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {formData.type === "retiro" ? 
                  "Esta tarea consiste en recoger documentos desde la dirección de recogida y llevarlos a su destino final." :
                 formData.type === "entrega" ? 
                  "Esta tarea consiste en entregar documentos desde el origen hasta la dirección de entrega especificada." :
                  "Selecciona el tipo de tarea para ver la descripción correspondiente."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección
            </CardTitle>
            <CardDescription>
              {formData.type === "retiro" ? 
                "Dirección donde se recogerán los documentos" : 
                "Dirección donde se entregarán los documentos"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                {formData.type === "retiro" ? "Dirección de Recogida" : "Dirección de Entrega"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Textarea
                    id="address"
                    placeholder={`Dirección completa de ${formData.type === "retiro" ? "recogida" : "entrega"}...`}
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    placeholder={`Ciudad de ${formData.type === "retiro" ? "recogida" : "entrega"}`}
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contacto</Label>
                <Input
                  id="contact"
                  placeholder="Nombre y teléfono del contacto"
                  value={formData.contact}
                  onChange={(e) => handleInputChange("contact", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assignment
            </CardTitle>
            <CardDescription>Update courier assignment and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="courierId">Courier</Label>
              <Select value={formData.courierId} onValueChange={(value) => handleInputChange("courierId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a courier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">No courier assigned</SelectItem>
                  {mockCouriers.map((courier) => (
                    <SelectItem key={courier.id} value={courier.id}>
                      {courier.name} - {courier.phoneNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or special instructions..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/dashboard/tasks/${task.id}`)}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

