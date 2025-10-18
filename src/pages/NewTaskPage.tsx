import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { mockClients, mockCouriers } from "../lib/mock-data"
import { ArrowLeft, Package, MapPin, Calendar, User, Phone } from "lucide-react"

export default function NewTaskPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    referenceBL: "",
    clientId: "",
    type: "delivery",
    status: "en_preparacion",
    scheduledDate: "",
    scheduledTime: "",
    pickupAddress: "",
    deliveryAddress: "",
    courierId: "",
    notes: "",
    priority: "normal",
    mbl: "",
    hbl: "",
    freightCertificate: "",
    foCertificate: "",
    bunkerCertificate: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save to your backend
    console.log("Task created:", formData)
    navigate("/dashboard")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">New Task</h1>
          <p className="text-sm text-muted-foreground">Create a new delivery or pickup task</p>
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
            <CardDescription>Enter the essential task details</CardDescription>
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
                <Label htmlFor="clientId">Client *</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleInputChange("clientId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Task Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
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
            <CardDescription>Set the task schedule and timing</CardDescription>
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

        {/* Addresses */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
            </CardTitle>
            <CardDescription>Enter pickup and delivery locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address *</Label>
              <Textarea
                id="pickupAddress"
                placeholder="Enter pickup address..."
                value={formData.pickupAddress}
                onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address *</Label>
              <Textarea
                id="deliveryAddress"
                placeholder="Enter delivery address..."
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                required
                rows={3}
              />
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
            <CardDescription>Assign a courier to this task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="courierId">Courier</Label>
              <Select value={formData.courierId} onValueChange={(value) => handleInputChange("courierId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a courier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {mockCouriers.map((courier) => (
                    <SelectItem key={courier.id} value={courier.id}>
                      {courier.name} - {courier.phone}
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
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
          <Button type="submit">
            Create Task
          </Button>
        </div>
      </form>
    </div>
  )
}

