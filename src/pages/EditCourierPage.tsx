import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { mockCouriers } from "../lib/mock-data"
import { ArrowLeft, User, Mail, Phone, MapPin, Truck, AlertCircle } from "lucide-react"

export default function EditCourierPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Find the courier by ID
  const courier = mockCouriers.find(c => c.id === id)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    vehicleType: "car",
    activeTasks: 0
  })

  useEffect(() => {
    if (courier) {
      setFormData({
        name: courier.name,
        email: courier.email || "",
        phoneNumber: courier.phoneNumber,
        address: courier.address || "",
        vehicleType: courier.vehicleType,
        activeTasks: courier.activeTasks
      })
    }
  }, [courier])

  if (!courier) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Courier No Encontrado</h1>
          <p className="text-muted-foreground mb-4">El courier que buscas no existe.</p>
          <Button onClick={() => navigate("/dashboard/couriers")}>
            Volver a Couriers
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Courier updated:", formData)
      alert(`Courier ${formData.name} actualizado exitosamente`)
      navigate(`/dashboard/couriers/${id}`)
    } catch (error) {
      console.error('Error updating courier:', error)
      alert('Error actualizando courier. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getVehicleIcon = (vehicleType: string) => {
    const icons = {
      motorcycle: "🏍️",
      car: "🚗",
      van: "🚐",
      truck: "🚚",
      bicycle: "🚲",
    }
    return icons[vehicleType as keyof typeof icons] || "🚗"
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/couriers/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Courier
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Editar Courier</h1>
          <p className="text-sm text-muted-foreground">Actualiza la información del courier</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>Datos de contacto del courier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Nombre del courier"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="courier@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Teléfono *</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activeTasks">Tareas Activas</Label>
                <Input
                  id="activeTasks"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.activeTasks}
                  onChange={(e) => handleInputChange("activeTasks", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                placeholder="Dirección del courier"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Información del Vehículo
            </CardTitle>
            <CardDescription>Datos del vehículo asignado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Tipo de Vehículo *</Label>
              <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorcycle">
                    <div className="flex items-center gap-2">
                      <span>🏍️</span>
                      <span>Motorcycle</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="car">
                    <div className="flex items-center gap-2">
                      <span>🚗</span>
                      <span>Car</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="van">
                    <div className="flex items-center gap-2">
                      <span>🚐</span>
                      <span>Van</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="truck">
                    <div className="flex items-center gap-2">
                      <span>🚚</span>
                      <span>Truck</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bicycle">
                    <div className="flex items-center gap-2">
                      <span>🚲</span>
                      <span>Bicycle</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getVehicleIcon(formData.vehicleType)}</span>
                <div>
                  <p className="font-medium capitalize">{formData.vehicleType}</p>
                  <p className="text-sm text-muted-foreground">Vehículo seleccionado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/dashboard/couriers/${id}`)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Actualizando..." : "Actualizar Courier"}
          </Button>
        </div>
      </form>
    </div>
  )
}
