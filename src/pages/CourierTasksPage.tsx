import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { mockTasks } from "../lib/mock-data"
import { useAuth } from "../hooks/use-auth"
import { 
  Package, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Phone,
  Eye,
  Play,
  Navigation,
  Camera,
  Filter,
  RefreshCw
} from "lucide-react"
import type { TaskStatus } from "../lib/types"

export default function CourierTasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Get courier ID from localStorage or use a default for demo
  const courierId = localStorage.getItem("courierId") || "courier-1"
  
  // Filter tasks assigned to this courier
  const courierTasks = mockTasks.filter((task) => task.courierId === courierId)

  const filteredTasks = courierTasks.filter((task) => {
    const matchesSearch =
      task.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.referenceBL.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || (task.priority || "normal") === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      en_preparacion: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      pendiente_confirmar: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmada_tomar: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      finalizada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    const labels = {
      en_preparacion: "En Preparación",
      pendiente_confirmar: "Pendiente Confirmar",
      confirmada_tomar: "Confirmada Tomar",
      finalizada: "Finalizada",
      cancelada: "Cancelada",
    }
    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
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
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return <Badge className={variants[priority as keyof typeof variants]}>{priority}</Badge>
  }

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      console.log(`Updating task ${taskId} to status: ${newStatus}`)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      alert(`Tarea ${taskId} actualizada a ${newStatus}`)
      window.location.reload()
    } catch (error) {
      console.error('Error updating task status:', error)
      alert('Error actualizando estado. Intenta de nuevo.')
    }
  }

  const stats = {
    total: courierTasks.length,
    en_preparacion: courierTasks.filter((t) => t.status === "en_preparacion").length,
    confirmada_tomar: courierTasks.filter((t) => t.status === "confirmada_tomar").length,
    finalizada: courierTasks.filter((t) => t.status === "finalizada").length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Mis Tareas</h1>
            <p className="text-sm text-muted-foreground">Gestiona tus entregas</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Listas</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmada_tomar}</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Futuras</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.en_preparacion}</p>
                </div>
                <div className="p-2 bg-gray-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.finalizada}</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, BL, dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filters - Always visible on mobile */}
          <div className="grid grid-cols-2 gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="en_preparacion">En Preparación</SelectItem>
                <SelectItem value="pendiente_confirmar">Pendiente Confirmar</SelectItem>
                <SelectItem value="confirmada_tomar">Confirmada Tomar</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Prioridades</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks List - Card Layout for Mobile */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay tareas</h3>
                <p className="text-sm text-muted-foreground">No se encontraron tareas con los filtros actuales</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{task.referenceBL}</h3>
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{task.clientName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild title="Ver Detalles">
                        <Link to={`/courier/tasks/${task.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Task Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
                      {task.scheduledTime && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{task.scheduledTime}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">Recogida:</p>
                        <p className="text-muted-foreground truncate">{task.pickupAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">Entrega:</p>
                        <p className="text-muted-foreground truncate">{task.deliveryAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getTypeBadge(task.type)}
                      {getPriorityBadge(task.priority || "normal")}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-border">
                    {/* Primary Actions - Always visible */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const address = encodeURIComponent(task.pickupAddress)
                          window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank')
                        }}
                        className="h-10"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Direcciones
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          alert(`Llamando al cliente para tarea ${task.referenceBL}`)
                        }}
                        className="h-10"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar
                      </Button>
                    </div>

                    {/* Status Actions - Contextual */}
                    <div className="space-y-2">
                      {task.status === "confirmada_tomar" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(task.id, "en_progreso")}
                          className="w-full h-10"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar Tarea
                        </Button>
                      )}

                      {task.status === "en_progreso" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusUpdate(task.id, "finalizada")}
                          className="w-full h-10"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar como Completada
                        </Button>
                      )}

                      {(task.status === "confirmada_tomar" || task.status === "en_progreso") && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full h-10"
                        >
                          <Link to={`/courier/tasks/${task.id}/complete`}>
                            <Camera className="h-4 w-4 mr-2" />
                            Finalizar con Fotos
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}