import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { mockTasks, mockClients, mockCouriers, mockProviders } from "../lib/mock-data"
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Edit,
  Trash2,
  Truck,
  Building2,
  Copy
} from "lucide-react"

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    referenceBL: "",
    clientId: "",
    providerId: "",
    type: "entrega",
    status: "en_preparacion",
    scheduledDate: "",
    pickupAddress: "",
    pickupCity: "",
    pickupContact: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryContact: "",
    courierId: "",
    notes: "",
    priority: "normal",
    mbl: "",
    hbl: "",
    freightCertificate: "",
    foCertificate: "",
    bunkerCertificate: ""
  })
  
  // Find the task by ID
  const task = mockTasks.find(t => t.id === id)

  // Load task data into form
  useEffect(() => {
    if (task) {
      setFormData({
        referenceBL: task.referenceBL,
        clientId: task.clientId || "",
        providerId: task.providerId || "",
        type: task.type,
        status: task.status,
        scheduledDate: new Date(task.scheduledDate).toISOString().split('T')[0],
        pickupAddress: task.pickupAddress,
        pickupCity: task.pickupCity,
        pickupContact: task.pickupContact || "",
        deliveryAddress: task.deliveryAddress,
        deliveryCity: task.deliveryCity,
        deliveryContact: task.deliveryContact || "",
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
          <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const client = mockClients.find(c => c.id === task.clientId)
  const courier = mockCouriers.find(c => c.id === task.courierId)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClientChange = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId)
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId,
        deliveryAddress: client.address,
        deliveryCity: client.city,
        deliveryContact: client.contact || ""
      }))
    }
  }

  const handleProviderChange = (providerId: string) => {
    const provider = mockProviders.find(p => p.id === providerId)
    if (provider) {
      setFormData(prev => ({
        ...prev,
        providerId,
        pickupAddress: provider.address,
        pickupCity: provider.city,
        pickupContact: provider.contact || ""
      }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Task updated:", formData)
      setIsEditing(false)
      alert("Task updated successfully!")
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Error updating task. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original task data
    if (task) {
      setFormData({
        referenceBL: task.referenceBL,
        clientId: task.clientId || "",
        providerId: task.providerId || "",
        type: task.type,
        status: task.status,
        scheduledDate: new Date(task.scheduledDate).toISOString().split('T')[0],
        pickupAddress: task.pickupAddress,
        pickupCity: task.pickupCity,
        pickupContact: task.pickupContact || "",
        deliveryAddress: task.deliveryAddress,
        deliveryCity: task.deliveryCity,
        deliveryContact: task.deliveryContact || "",
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
    setIsEditing(false)
  }

  const handleClone = () => {
    if (!task) return
    
    // Create a cloned task with modified data
    const clonedTask = {
      ...task,
      id: `cloned-${Date.now()}`, // Generate new ID
      referenceBL: `${task.referenceBL}-COPY`, // Add COPY suffix
      status: "en_preparacion" as const, // Reset to preparation status
      courierId: "", // Unassign courier
      scheduledDate: new Date().toISOString(), // Set to current date
      notes: `Clonada de tarea ${task.id} - ${new Date().toLocaleString()}`, // Add clone note
      updatedAt: new Date().toISOString()
    }
    
    // Store cloned task data in localStorage to pass to clone page
    localStorage.setItem('clonedTask', JSON.stringify(clonedTask))
    
    // Navigate to clone page
    navigate(`/dashboard/tasks/clone`)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      retiro: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      entrega: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    }
    const labels = {
      retiro: "Retiro",
      entrega: "Entrega",
    }
    return <Badge className={variants[type as keyof typeof variants]}>{labels[type as keyof typeof labels] || type}</Badge>
  }


  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Task Details</h1>
          <p className="text-sm text-muted-foreground">View and manage task {task.referenceBL}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Task Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Task details and current status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference Vexa</label>
                  {isEditing ? (
                    <Input
                      value={formData.referenceBL}
                      onChange={(e) => handleInputChange("referenceBL", e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{task.referenceBL}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Task Type</label>
                  {isEditing ? (
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retiro">Retiro</SelectItem>
                        <SelectItem value="entrega">Entrega</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">{getTypeBadge(task.type)}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  {isEditing ? (
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger className="mt-1">
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
                  ) : (
                    <div className="mt-1">{getStatusBadge(task.status)}</div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Scheduled Date</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm">{new Date(task.scheduledDate).toLocaleDateString()}</p>
                  )}
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
              <CardDescription>Pickup and delivery locations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pickup Address</label>
                {isEditing ? (
                  <Textarea
                    value={formData.pickupAddress}
                    onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{task.pickupAddress}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
                {isEditing ? (
                  <Textarea
                    value={formData.deliveryAddress}
                    onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{task.deliveryAddress}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Information
              </CardTitle>
              <CardDescription>Details about the client</CardDescription>
            </CardHeader>
            <CardContent>
              {client ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Client Name</label>
                    <p className="text-sm font-semibold">{client.name}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                  </div>
                  {client.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{client.address}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Client information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Operational Data */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Operational Data
              </CardTitle>
              <CardDescription>BL, certificates and operational information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">MBL</label>
                  {isEditing ? (
                    <Input
                      value={formData.mbl}
                      onChange={(e) => handleInputChange("mbl", e.target.value)}
                      className="mt-1"
                      placeholder="Enter MBL"
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">{task.mbl || "Not specified"}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">HBL</label>
                  {isEditing ? (
                    <Input
                      value={formData.hbl}
                      onChange={(e) => handleInputChange("hbl", e.target.value)}
                      className="mt-1"
                      placeholder="Enter HBL"
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">{task.hbl || "Not specified"}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Freight Certificate</label>
                  {isEditing ? (
                    <Input
                      value={formData.freightCertificate}
                      onChange={(e) => handleInputChange("freightCertificate", e.target.value)}
                      className="mt-1"
                      placeholder="Enter freight certificate"
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">{task.freightCertificate || "Not specified"}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">FO Certificate</label>
                  {isEditing ? (
                    <Input
                      value={formData.foCertificate}
                      onChange={(e) => handleInputChange("foCertificate", e.target.value)}
                      className="mt-1"
                      placeholder="Enter FO certificate"
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">{task.foCertificate || "Not specified"}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bunker Certificate</label>
                  {isEditing ? (
                    <Input
                      value={formData.bunkerCertificate}
                      onChange={(e) => handleInputChange("bunkerCertificate", e.target.value)}
                      className="mt-1"
                      placeholder="Enter bunker certificate"
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">{task.bunkerCertificate || "Not specified"}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                {isEditing ? (
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder="Enter additional notes"
                  />
                ) : (
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{task.notes || "No notes"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Courier Assignment */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Courier Assignment
              </CardTitle>
              <CardDescription>Assigned courier details</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assign Courier</label>
                    <Select value={formData.courierId} onValueChange={(value) => handleInputChange("courierId", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a courier" />
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
                </div>
              ) : courier ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Courier Name</label>
                    <p className="text-sm font-semibold">{courier.name}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{courier.phoneNumber}</span>
                    </div>
                    {courier.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{courier.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{courier.vehicleType}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">No courier assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {!isEditing ? (
                <>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Task
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={handleClone}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Clone Task
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => navigate("/dashboard")}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                  <Button className="w-full" variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="w-full" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

