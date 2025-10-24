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
  const { role } = useAuth()
  const { tasks, isLoading, error, getTasksByCourier, updateTaskStatus } = useTasks()


  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [contactFilter] = useState("all") // "all", "client", "provider"
  const [selectedContactId] = useState("all")
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null)
  const [additionalPhoto, setAdditionalPhoto] = useState<string | null>(null)
  const [isFinalizing, setIsFinalizing] = useState(false)

  // Get courier ID from the authenticated user
  // For now, we'll use the hardcoded courier ID from the database
  // Implement proper courier lookup by userId
  const courierId = "00000000-0000-0000-0000-000000000001" // Carlos López courier ID


  // Redirect if not a courier
  useEffect(() => {
    if (role && role !== "courier") {
      window.location.href = "/login"
    }
  }, [role])

  // Fetch tasks for this courier
  useEffect(() => {
    const fetchCourierTasks = async () => {
      try {
        await getTasksByCourier(courierId)
      } catch (err) {
        console.error('Error fetching courier tasks:', err)
      }
    }

    if (courierId) {
      fetchCourierTasks()
    }
  }, [courierId])

  // Force re-render when tasks change
  useEffect(() => {
    // This effect will run whenever tasks change, ensuring the UI updates
    console.log('CourierTasksPage - Tareas actualizadas:', tasks)
    console.log('CourierTasksPage - Fechas programadas:', tasks.map(t => ({ 
      id: t.id, 
      scheduledDate: t.scheduledDate,
      parsedDate: t.scheduledDate ? new Date(t.scheduledDate) : null
    })))
  }, [tasks])

  const filteredTasks = tasks.filter((task) => {
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

  // Group tasks by date and provider
  const groupedTasks = useMemo(() => {
    // First group by date
    const dateGroups = filteredTasks.reduce((acc, task) => {
      let dateKey = 'Sin fecha programada'
      
      if (task.scheduledDate) {
        try {
          // Parse the date more carefully to handle different formats
          let parsedDate: Date
          
          // If it's already in ISO format or has timezone info
          if (task.scheduledDate.includes('T') || task.scheduledDate.includes('Z')) {
            parsedDate = new Date(task.scheduledDate)
          } else {
            // If it's just a date string (YYYY-MM-DD), treat it as local date
            const [year, month, day] = task.scheduledDate.split('-').map(Number)
            parsedDate = new Date(year, month - 1, day) // month is 0-indexed
          }
          
          // Check if the date is valid
          if (!isNaN(parsedDate.getTime())) {
            dateKey = parsedDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
        } catch (error) {
          console.warn('Error parsing date:', task.scheduledDate, error)
          dateKey = 'Fecha inválida'
        }
      }
      
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(task)
      return acc
    }, {} as Record<string, typeof filteredTasks>)

    // Sort date groups chronologically
    const sortedDateGroups: Record<string, typeof filteredTasks> = {}
    const dateKeys = Object.keys(dateGroups)
    
    // Separate groups with valid dates from groups without dates
    const validDateGroups = dateKeys.filter(key => key !== 'Sin fecha programada' && key !== 'Fecha inválida')
    const invalidDateGroups = dateKeys.filter(key => key === 'Sin fecha programada' || key === 'Fecha inválida')
    
    // Sort valid dates chronologically
    validDateGroups.sort((a, b) => {
      const dateA = new Date(a.split(' ').slice(-3).join(' ')) // Extract date part
      const dateB = new Date(b.split(' ').slice(-3).join(' '))
      return dateA.getTime() - dateB.getTime()
    })
    
    // Combine sorted valid dates with invalid dates at the end
    const sortedKeys = [...validDateGroups, ...invalidDateGroups]
    
    sortedKeys.forEach(key => {
      sortedDateGroups[key] = dateGroups[key]
    })

    // Now group by provider within each date
    const finalGroups: Record<string, any> = {}
    
    Object.keys(sortedDateGroups).forEach(dateKey => {
      const tasksForDate = sortedDateGroups[dateKey]
      
      // Group tasks by provider within this date
      const providerGroups = tasksForDate.reduce((acc, task) => {
        const providerKey = task.providerId ? `${task.providerId}|${task.providerName}` : 'cliente|' + (task.clientId ? `${task.clientId}|${task.clientName}` : 'sin_contacto')
        
        if (!acc[providerKey]) {
          acc[providerKey] = []
        }
        acc[providerKey].push(task)
        return acc
      }, {} as Record<string, typeof tasksForDate>)

      // Sort tasks within each provider group by priority
      Object.keys(providerGroups).forEach(providerKey => {
        providerGroups[providerKey].sort((a, b) => {
          const priorityOrder = { URGENT: 0, NORMAL: 1 }
          return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
        })
      })

      // Create final structure with provider information
      Object.keys(providerGroups).forEach(providerKey => {
        const [providerId] = providerKey.split('|')
        const tasks = providerGroups[providerKey]
        const isMultipleTasks = tasks.length > 1
        
        // Obtener el nombre correcto del primer task del grupo
        const firstTask = tasks[0]
        const providerName = firstTask.providerName || firstTask.clientName || 'Sin contacto'
        
        const groupKey = `${dateKey}|${providerKey}`
        finalGroups[groupKey] = {
          dateKey,
          providerId,
          providerName,
          tasks,
          isMultipleTasks,
          taskCount: tasks.length
        }
      })
    })

    return finalGroups
  }, [filteredTasks])


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
  const getTaskAddress = (task: any) => {
    return task.addressOverride || "Sin dirección especificada"
  }

  // Get the relevant contact based on task type
  const getTaskContact = (task: any) => {
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

      // Task status will be updated by the hook automatically

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
                {filteredTasks.filter(t => t.status === 'PENDING').length}
              </div>
              <div className="text-xs text-muted-foreground">Pendientes</div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-green-600">
                {filteredTasks.filter(t => t.status === 'COMPLETED').length}
              </div>
              <div className="text-xs text-muted-foreground">Finalizadas</div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-orange-600">
                {filteredTasks.filter(t => t.status === 'CONFIRMED').length}
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
          {filteredTasks.length === 0 ? (
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
            (() => {
              // Group by date first
              const dateGroups: Record<string, any[]> = {}
              Object.values(groupedTasks).forEach((group: any) => {
                if (!dateGroups[group.dateKey]) {
                  dateGroups[group.dateKey] = []
                }
                dateGroups[group.dateKey].push(group)
              })

              return Object.entries(dateGroups).map(([dateKey, providerGroups]) => (
                <div key={dateKey} className="space-y-4">
                  {/* Date Header */}
                  <div className="flex items-center gap-3 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold capitalize">{dateKey}</h2>
                    <Badge variant="outline" className="ml-auto">
                      {providerGroups.reduce((total, group) => total + group.taskCount, 0)} tarea{providerGroups.reduce((total, group) => total + group.taskCount, 0) !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Provider Groups */}
                  {providerGroups.map((group, groupIndex) => (
                    <div key={`${group.providerId}-${groupIndex}`} className="space-y-3">
                      {/* Provider Header - Only show if multiple tasks */}
                      {group.isMultipleTasks && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-sm">
                          <div className="p-2 bg-blue-500 rounded-full">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-blue-900 dark:text-blue-100">
                                {group.providerName || 'Cliente'}
                              </span>
                              <Badge className="bg-blue-500 text-white font-bold px-3 py-1">
                                {group.taskCount} tarea{group.taskCount !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                              Múltiples tareas en la misma ubicación
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tasks for this provider */}
                      <div className="space-y-3">
                        {group.tasks.map((task: any, taskIndex: number) => (
                    <Card key={task.id} className={`border hover:shadow-md transition-shadow ${group.isMultipleTasks ? 'border-l-4 border-l-blue-400 bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                      <CardContent className="p-4">
                        {/* Task Header - Mobile Optimized */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-lg text-foreground">{task.referenceNumber || "Sin referencia"}</h3>
                              {group.isMultipleTasks && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                  {taskIndex + 1} de {group.taskCount}
                                </Badge>
                              )}
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
                  ))}
                </div>
              ))
            })()
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
