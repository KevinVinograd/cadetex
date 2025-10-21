import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { mockTasks, mockClients } from "../lib/mock-data"
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  Building2,
  Navigation,
  Play,
  Save,
  MessageSquare
} from "lucide-react"

export default function CourierTaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Find the task by ID
  const task = mockTasks.find(t => t.id === id)
  
  // Get the relevant address based on task type
  const getTaskAddress = () => {
    return task?.type === "retiro" ? task.pickupAddress : task?.deliveryAddress
  }
  
  // Get the relevant contact based on task type
  const getTaskContact = () => {
    return task?.type === "retiro" ? task.pickupContact : task?.deliveryContact
  }
  
  // Get the relevant city based on task type
  const getTaskCity = () => {
    return task?.type === "retiro" ? task.pickupCity : task?.deliveryCity
  }
  
  if (!task) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Task Not Found</h1>
          <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/courier")}>
            Back to My Tasks
          </Button>
        </div>
      </div>
    )
  }

  const client = mockClients.find(c => c.id === task.clientId)

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
      delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      pickup: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      both: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    }
    return <Badge className={variants[type as keyof typeof variants]}>{type}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return <Badge className={variants[priority as keyof typeof variants]}>{priority}</Badge>
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    // Here you would typically update the task status in your backend
    console.log(`Updating task ${task.id} to status: ${newStatus}`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsUpdating(false)
  }

  const handleNotesUpdate = async () => {
    setIsUpdating(true)
    // Here you would typically update the task notes in your backend
    console.log(`Updating task ${task.id} notes:`, notes)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsUpdating(false)
  }

  const canStartTask = task.status === "en_preparacion" || task.status === "pendiente_confirmar"
  const canCompleteTask = task.status === "confirmada_tomar"
  const isTaskCompleted = task.status === "finalizada"

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/courier")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Tasks
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Task Details</h1>
          <p className="text-sm text-muted-foreground">Manage your assigned task {task.referenceBL}</p>
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
                Task Information
              </CardTitle>
              <CardDescription>Details about your assigned task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference BL</label>
                  <p className="text-lg font-semibold">{task.referenceBL}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Task Type</label>
                  <div className="mt-1">{getTypeBadge(task.type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <div className="mt-1">{getPriorityBadge(task.priority || "normal")}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(task.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha Programada</label>
                  <p className="text-sm">{new Date(task.scheduledDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {task.type === "retiro" ? "Dirección de Retiro" : "Dirección de Entrega"}
              </CardTitle>
              <CardDescription>
                {task.type === "retiro" ? "Ubicación donde retirar" : "Ubicación donde entregar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {task.type === "retiro" ? "Dirección de Retiro" : "Dirección de Entrega"}
                </label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">{getTaskAddress()}</p>
                  {getTaskCity() && (
                    <p className="text-xs text-muted-foreground mt-1">{getTaskCity()}</p>
                  )}
                  {getTaskContact() && (
                    <p className="text-xs text-muted-foreground mt-1">{getTaskContact()}</p>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      const address = getTaskAddress()
                      if (address) {
                        const encodedAddress = encodeURIComponent(address)
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank')
                      }
                    }}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Ir a Dirección
                  </Button>
                </div>
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
              <CardDescription>Contact details for this delivery</CardDescription>
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

          {/* Notes */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Task Notes
              </CardTitle>
              <CardDescription>Special instructions or additional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Add Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this delivery..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleNotesUpdate} 
                disabled={isUpdating || !notes.trim()}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Estado de la Tarea
              </CardTitle>
              <CardDescription>Información actual del estado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado Actual</label>
                <div className="mt-1">{getStatusBadge(task.status)}</div>
              </div>
              
              {canStartTask && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate("confirmada_tomar")}
                  disabled={isUpdating}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isUpdating ? "Iniciando..." : "Iniciar Tarea"}
                </Button>
              )}
              
              {isTaskCompleted && (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-600">Tarea Completada</p>
                  <p className="text-xs text-muted-foreground">¡Excelente trabajo!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call Client
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                Open in Maps
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Task Summary */}
          <Card className="border">
            <CardHeader>
              <CardTitle>Task Summary</CardTitle>
              <CardDescription>Quick overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-medium">{task.referenceBL}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{task.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Priority:</span>
                <span className="font-medium capitalize">{task.priority || "normal"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scheduled:</span>
                <span className="font-medium">{new Date(task.scheduledDate).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

