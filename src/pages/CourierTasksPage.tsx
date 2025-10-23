import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Label } from "../components/ui/label"
import { useAuth } from "../hooks/use-auth"
import { useTasks } from "../hooks/use-tasks"
import { useCouriers } from "../hooks/use-couriers"
import { mockCouriers } from "../lib/mock-data"
import {
  Search,
  MapPin,
  Calendar,
  AlertCircle,
  Truck,
  Phone,
  Eye,
  Navigation,
  Building2,
  User,
  CheckCircle2,
  Loader2
} from "lucide-react"

type TaskStatus = "PENDING" | "PENDING_CONFIRMATION" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

export default function CourierTasksPage() {
  const { user, role } = useAuth()
  const { tasks, isLoading, error, getTasksByCourier, updateTaskStatus } = useTasks()
  const { couriers } = useCouriers()

  console.log('CourierTasksPage - user:', user, 'role:', role)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [contactFilter, setContactFilter] = useState("all") // "all", "client", "provider"
  const [selectedContactId, setSelectedContactId] = useState("all")
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null)
  const [additionalPhoto, setAdditionalPhoto] = useState<string | null>(null)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [courierTasks, setCourierTasks] = useState<any[]>([])

  // Get courier ID from the authenticated user
  // For now, we'll use the hardcoded courier ID from the database
  // TODO: Implement proper courier lookup by userId
  const courierId = "00000000-0000-0000-0000-000000000001" // Carlos López courier ID

  console.log('CourierTasksPage - courierId:', courierId)

  // Redirect if not a courier
  useEffect(() => {
    if (role && role !== "courier") {
      console.log('User is not a courier, redirecting to login')
      window.location.href = "/login"
    }
  }, [role])

  // Fetch tasks for this courier
  useEffect(() => {
    const fetchCourierTasks = async () => {
      try {
        console.log('Fetching tasks for courier:', courierId)
        const tasks = await getTasksByCourier(courierId)
        console.log('Fetched courier tasks:', tasks)
        setCourierTasks(tasks)
      } catch (err) {
        console.error('Error fetching courier tasks:', err)
      }
    }

    if (courierId) {
      fetchCourierTasks()
    }
  }, [courierId, getTasksByCourier])

  const filteredTasks = courierTasks.filter((task) => {
    const matchesSearch =
      (task.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (task.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (task.addressOverride?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (task.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || false)

    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || (task.priority || "NORMAL") === priorityFilter

    // Contact filter logic
    let matchesContact = true
    if (contactFilter === "client") {
      matchesContact = !!task.clientId
      if (selectedContactId !== "all") {
        matchesContact = matchesContact && task.clientId === selectedContactId
      }
    } else if (contactFilter === "provider") {
      matchesContact = !!task.providerId
      if (selectedContactId !== "all") {
        matchesContact = matchesContact && task.providerId === selectedContactId
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesContact
  })

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    const groups = filteredTasks.reduce((acc, task) => {
      const date = task.scheduledDate
        ? new Date(task.scheduledDate).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        : 'Sin fecha programada'
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(task)
      return acc
    }, {} as Record<string, typeof filteredTasks>)

    // Sort tasks within each date group by priority
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => {
        const priorityOrder = { URGENT: 0, NORMAL: 1 }
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
      })
    })

    return groups
  }, [filteredTasks])

  // Get contacts list based on filter - for now return empty since we don't have client/provider hooks in this context
  const contactsList = useMemo(() => {
    return []
  }, [contactFilter])

  // Show loading while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando tareas...</p>
        </div>
      </div>
    )
  }

  // Show error if there's an issue
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      PENDING_CONFIRMATION: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    }
    const labels = {
      PENDING: "Pendiente",
      PENDING_CONFIRMATION: "Pendiente Confirmación",
      CONFIRMED: "Confirmado",
      COMPLETED: "Completado",
      CANCELLED: "Cancelado"
    }
    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      DELIVER: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      RETIRE: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    }
    const labels = {
      DELIVER: "Entrega",
      RETIRE: "Retiro",
    }
    return <Badge className={variants[type as keyof typeof variants]}>{labels[type as keyof typeof labels]}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      NORMAL: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      URGENT: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    const labels = {
      NORMAL: "Normal",
      URGENT: "Urgente",
    }
    return <Badge className={variants[priority as keyof typeof variants]}>{labels[priority as keyof typeof labels]}</Badge>
  }

  // Get the relevant address based on task type
  const getTaskAddress = (task: typeof courierTasks[0]) => {
    return task.addressOverride || "Sin dirección especificada"
  }

  // Get the relevant contact based on task type
  const getTaskContact = (task: typeof courierTasks[0]) => {
    return task.clientName || task.providerName || "Sin contacto especificado"
  }

  const handleFinalizeTask = (task: any) => {
    setSelectedTask(task)
    setReceiptPhoto(null)
    setAdditionalPhoto(null)
    setShowFinalizeModal(true)
  }

  const handleFinalizeSubmit = async () => {
    if (!selectedTask) return

    setIsFinalizing(true)
    try {
      // Update task status to COMPLETED
      await updateTaskStatus(selectedTask.id, "COMPLETED")

      // Update local state
      setCourierTasks(prev =>
        prev.map(task =>
          task.id === selectedTask.id
            ? { ...task, status: "COMPLETED" }
            : task
        )
      )

      setShowFinalizeModal(false)
      alert("¡Tarea finalizada exitosamente!")
    } catch (error) {
      console.error("Error finalizing task:", error)
      alert("Error al finalizar la tarea")
    } finally {
      setIsFinalizing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mis Tareas</h1>
              <p className="text-sm text-muted-foreground">
                {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Status Summary - Mobile */}
          <div className="flex gap-4 text-center">
            <div className="flex-1">
              <div className="text-lg font-bold text-primary">
                {courierTasks.filter(t => t.status === 'PENDING').length}
              </div>
              <div className="text-xs text-muted-foreground">Pendientes</div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-green-600">
                {courierTasks.filter(t => t.status === 'COMPLETED').length}
              </div>
              <div className="text-xs text-muted-foreground">Completadas</div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-orange-600">
                {courierTasks.filter(t => t.status === 'CONFIRMED').length}
              </div>
              <div className="text-xs text-muted-foreground">Confirmadas</div>
            </div>
          </div>
        </div>

        {/* Search and Filters - Mobile Optimized */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {/* Simple Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="h-9 min-w-[120px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-9 min-w-[100px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setPriorityFilter("all")
              }}
              className="h-9 px-3 text-xs"
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* Grouped Tasks List */}
        <div className="space-y-6">
          {courierTasks.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay tareas asignadas</h3>
              <p className="text-muted-foreground">
                No tienes tareas asignadas en este momento.
              </p>
            </div>
          ) : Object.keys(groupedTasks).length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay tareas</h3>
                <p className="text-sm text-muted-foreground">No se encontraron tareas con los filtros actuales</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedTasks).map(([date, tasks]) => (
              <div key={date} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold capitalize">{date}</h2>
                  <Badge variant="outline" className="ml-auto">{tasks.length} tarea{tasks.length !== 1 ? 's' : ''}</Badge>
                </div>

                {/* Tasks for this date */}
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <Card key={task.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        {/* Task Header - Mobile Optimized */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-lg text-foreground">{task.referenceNumber || "Sin referencia"}</h3>
                              {getTypeBadge(task.type)}
                              {getPriorityBadge(task.priority)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {task.clientId ? (
                                <>
                                  <User className="h-3 w-3" />
                                  <span>{task.clientName}</span>
                                </>
                              ) : task.providerId ? (
                                <>
                                  <Building2 className="h-3 w-3" />
                                  <span>{task.providerName}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                          {getStatusBadge(task.status)}
                        </div>

                        {/* Address - Compact */}
                        <div className="flex items-start gap-2 mb-3 text-sm">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground font-medium">{getTaskAddress(task)}</p>
                            {getTaskContact(task) && (
                              <p className="text-muted-foreground text-xs mt-1">{getTaskContact(task)}</p>
                            )}
                          </div>
                        </div>

                        {/* Notes - Only if exists */}
                        {task.notes && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2 mb-3">
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">Nota:</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">{task.notes}</p>
                          </div>
                        )}

                        {/* Action Buttons - Mobile Optimized */}
                        {task.status === "CONFIRMED" ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild className="flex-1">
                                <Link to={`/courier/tasks/${task.id}`}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  const address = getTaskAddress(task)
                                  const encodedAddress = encodeURIComponent(address)
                                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank')
                                }}
                              >
                                <Navigation className="h-3 w-3 mr-1" />
                                Ir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  const contact = getTaskContact(task)
                                  if (contact) {
                                    const phone = contact.split(' - ')[1]?.replace(/\D/g, '')
                                    if (phone) {
                                      window.location.href = `tel:${phone}`
                                    }
                                  }
                                }}
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                Llamar
                              </Button>
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full"
                              onClick={() => handleFinalizeTask(task)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Finalizar Tarea
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild className="flex-1">
                              <Link to={`/courier/tasks/${task.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                const address = getTaskAddress(task)
                                const encodedAddress = encodeURIComponent(address)
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank')
                              }}
                            >
                              <Navigation className="h-3 w-3 mr-1" />
                              Ir
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                const contact = getTaskContact(task)
                                if (contact) {
                                  const phone = contact.split(' - ')[1]?.replace(/\D/g, '')
                                  if (phone) {
                                    window.location.href = `tel:${phone}`
                                  }
                                }
                              }}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Llamar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Finalize Task Modal */}
      {showFinalizeModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Finalizar Tarea
              </CardTitle>
              <CardDescription>
                {selectedTask.referenceBL} - {selectedTask.clientName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notas de la tarea */}
              {selectedTask.notes && (
                <div className="space-y-3 p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/40">
                      <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        Notas Importantes
                      </Label>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Información adicional para esta tarea
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-amber-900/10 rounded-md border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                      {selectedTask.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Foto de recibo obligatoria */}
              {selectedTask.photoRequired && (
                <div className="space-y-3 p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-primary">
                        Foto de Recibo Obligatoria
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Necesaria para completar la entrega
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            setReceiptPhoto(e.target?.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="text-sm border-primary/30 focus:border-primary"
                    />
                    {receiptPhoto && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                          Foto de recibo cargada correctamente
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Foto adicional opcional */}
              <div className="space-y-3 p-4 border border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-muted">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Foto Adicional (Opcional)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Para documentar cualquier detalle extra
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setAdditionalPhoto(e.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="text-sm"
                  />
                  {additionalPhoto && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                        Foto adicional cargada
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowFinalizeModal(false)}
                  disabled={isFinalizing}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleFinalizeSubmit}
                  disabled={isFinalizing || (selectedTask.photoRequired && !receiptPhoto)}
                >
                  {isFinalizing ? "Finalizando..." : "Finalizar Tarea"}
                </Button>
              </div>

              {selectedTask.photoRequired && !receiptPhoto && (
                <p className="text-xs text-red-500 text-center">
                  Debe cargar una foto del recibo para finalizar
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
