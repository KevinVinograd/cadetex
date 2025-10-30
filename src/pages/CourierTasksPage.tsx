import { useState, useMemo, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useAuth } from "../hooks/use-auth"
import { useTasks } from "../hooks/use-tasks"
import { formatAddress } from "../lib/address-utils"
import {
  Calendar,
  AlertCircle,
  Truck,
  Loader2,
  Clock
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card, CardContent } from "../components/ui/card"
import { SuccessDialog } from "../components/ui/success-dialog"
import { TaskCard } from "../components/TaskCard"
import { ProviderGroupHeader } from "../components/ProviderGroupHeader"
import { FinalizeTaskModal } from "../components/FinalizeTaskModal"
import { UnassignedTaskCard } from "../components/UnassignedTaskCard"
import { TaskStatsSummary } from "../components/TaskStatsSummary"
import { TaskFilters } from "../components/TaskFilters"
import { getTranslation } from "../lib/translations"

const t = getTranslation()

type TaskStatus = "PENDING" | "PENDING_CONFIRMATION" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

export default function CourierTasksPage() {
  const { role, organizationId } = useAuth()
  const { 
    tasks, 
    isLoading, 
    error, 
    getTasksByCourier, 
    updateTaskStatus, 
    getUnassignedTasks, 
    assignTaskToCourier,
    unassignTaskFromCourier,
    uploadTaskPhoto
  } = useTasks()

  const [activeTab, setActiveTab] = useState("assigned")
  const [unassignedTasks, setUnassignedTasks] = useState<any[]>([])
  const [isLoadingUnassigned, setIsLoadingUnassigned] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("CONFIRMED")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [contactFilter] = useState("all") // "all", "client", "provider"
  const [selectedContactId] = useState("all")
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null)
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([])
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUnassigning, setIsUnassigning] = useState(false)
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({ isOpen: false, title: '', description: '', type: 'success' })

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

  // Fetch unassigned tasks when component loads and when switching to that tab
  useEffect(() => {
    const fetchUnassignedTasks = async () => {
      if (organizationId && unassignedTasks.length === 0) {
        try {
          setIsLoadingUnassigned(true)
          const tasks = await getUnassignedTasks(organizationId)
          setUnassignedTasks(tasks)
        } catch (err) {
          console.error('Error fetching unassigned tasks:', err)
        } finally {
          setIsLoadingUnassigned(false)
        }
      }
    }

    fetchUnassignedTasks()
  }, [organizationId, getUnassignedTasks, unassignedTasks.length])

  // Force re-render when tasks change
  useEffect(() => {
    // no-op
  }, [tasks])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (task.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (task.address ? formatAddress(task.address).toLowerCase().includes(searchQuery.toLowerCase()) : (task.addressOverride?.toLowerCase().includes(searchQuery.toLowerCase()) || false)) ||
      (task.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || false)

    // Modificar filtro de estado para incluir CONFIRMED y COMPLETED cuando es "all"
    let matchesStatus = true
    if (statusFilter === "all") {
      matchesStatus = task.status === "CONFIRMED" || task.status === "COMPLETED"
    } else {
      matchesStatus = task.status === statusFilter
    }
    
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
    const dateGroupsMap = new Map<number, { dateKey: string; tasks: typeof filteredTasks }>()
    
    filteredTasks.forEach(task => {
      let dateKey = 'Sin fecha programada'
      let timestamp = 0
      
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
            timestamp = parsedDate.getTime()
            dateKey = parsedDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
        } catch (error) {
          // keep silent in production/tests
          dateKey = 'Fecha inválida'
          timestamp = 0
        }
      }
      
      if (!dateGroupsMap.has(timestamp)) {
        dateGroupsMap.set(timestamp, { dateKey, tasks: [] })
      }
      dateGroupsMap.get(timestamp)!.tasks.push(task)
    })

    // Sort date groups by timestamp in ascending order (earliest first)
    const sortedDateGroups: Record<string, typeof filteredTasks> = {}
    const dateOrder: string[] = []
    const sortedEntries = Array.from(dateGroupsMap.entries())
      .sort((a, b) => a[0] - b[0]) // Sort by timestamp ascending
      
    sortedEntries.forEach(([_, { dateKey, tasks }]) => {
      sortedDateGroups[dateKey] = tasks
      dateOrder.push(dateKey) // Save the order of dateKeys
    })

    // Now group by provider within each date
    const finalGroups: Record<string, any> = {}
    
    dateOrder.forEach(dateKey => {
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

    return { finalGroups, dateOrder }
  }, [filteredTasks])


  // Show loading while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t.courierTasks.loading}</p>
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
            {t.courierTasks.errorMessages.retry}
          </Button>
        </div>
      </div>
    )
  }


  const handleFinalizeTask = (task: any) => {
    setSelectedTask(task)
    setReceiptPhoto(null)
    setAdditionalPhotos([])
    setShowFinalizeModal(true)
  }

  const handleFinalizeSubmit = async () => {
    if (!selectedTask) return

    setIsFinalizing(true)
    try {
      // If there's a photo, upload it first
      if (receiptPhoto) {
        // Convert base64 to File
        const response = await fetch(receiptPhoto)
        const blob = await response.blob()
        const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' })
        
        // Upload the photo as receipt (isReceipt = true)
        await uploadTaskPhoto(selectedTask.id, file, true)
      }

      // Upload all additional photos
      for (const photoBase64 of additionalPhotos) {
        const response = await fetch(photoBase64)
        const blob = await response.blob()
        const file = new File([blob], 'additional.jpg', { type: 'image/jpeg' })
        
        // Upload as additional photo (isReceipt = false)
        await uploadTaskPhoto(selectedTask.id, file, false)
      }

      // Update task status to COMPLETED
      await updateTaskStatus(selectedTask.id, "COMPLETED")

      // Refresh tasks to get updated data including the photo
      if (courierId) {
        await getTasksByCourier(courierId)
      }

      setShowFinalizeModal(false)
      setSuccessDialog({
        isOpen: true,
        title: "Tarea Finalizada",
        description: "¡La tarea se ha finalizado exitosamente!",
        type: 'success'
      })
    } catch (error) {
      console.error("Error finalizing task:", error)
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: "Error al finalizar la tarea",
        type: 'error'
      })
    } finally {
      setIsFinalizing(false)
    }
  }

  const handleAssignTask = async (taskId: string) => {
    setIsAssigning(true)
    try {
      await assignTaskToCourier(taskId, courierId)
      
      // Remove from unassigned tasks
      setUnassignedTasks(prev => prev.filter(task => task.id !== taskId))
      
      // Refresh assigned tasks
      await getTasksByCourier(courierId)
      
      setSuccessDialog({
        isOpen: true,
        title: "Tarea Asignada",
        description: "¡La tarea se ha asignado exitosamente!",
        type: 'success'
      })
    } catch (error) {
      console.error("Error assigning task:", error)
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: "Error al asignar la tarea",
        type: 'error'
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUnassignTask = async (taskId: string) => {
    setIsUnassigning(true)
    try {
      await unassignTaskFromCourier(taskId)
      
      // Refresh assigned tasks
      await getTasksByCourier(courierId)
      
      // Always refresh unassigned tasks to update indicators
      if (organizationId) {
        const tasks = await getUnassignedTasks(organizationId)
        setUnassignedTasks(tasks)
      }
      
      setSuccessDialog({
        isOpen: true,
        title: "Tarea Desasignada",
        description: "¡La tarea se ha desasignado exitosamente!",
        type: 'success'
      })
    } catch (error) {
      console.error("Error unassigning task:", error)
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: "Error al desasignar la tarea",
        type: 'error'
      })
    } finally {
      setIsUnassigning(false)
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
              <h1 className="text-2xl font-bold">{t.courierTasks.title}</h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === "assigned" 
                  ? t.courierTasks.taskCount(filteredTasks.length)
                  : `${unassignedTasks.length} tarea${unassignedTasks.length !== 1 ? 's' : ''} disponible${unassignedTasks.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>

          {/* Status Summary - Mobile */}
          <TaskStatsSummary
            type={activeTab as 'assigned' | 'unassigned'}
            filteredTasks={filteredTasks}
            unassignedTasks={unassignedTasks}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assigned" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              {t.courierTasks.tabs.myTasks}
            </TabsTrigger>
            <TabsTrigger value="unassigned" className="flex items-center gap-2 relative">
              <Clock className="h-4 w-4" />
              {t.courierTasks.tabs.unassigned}
              {unassignedTasks.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-6">
            {/* Search and Filters - Mobile Optimized */}
            <TaskFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              onSearchChange={setSearchQuery}
              onStatusChange={(value) => setStatusFilter(value as typeof statusFilter)}
              onPriorityChange={setPriorityFilter}
              onClear={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setPriorityFilter("all")
              }}
            />

            {/* Unassigned Tasks Notification */}
            {unassignedTasks.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-full">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      ¡Hay {unassignedTasks.length} tarea{unassignedTasks.length !== 1 ? 's' : ''} sin asignar!
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Puedes asignarte tareas adicionales en la pestaña "Sin Asignar"
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("unassigned")}
                    className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                  >
                    Ver Sin Asignar
                  </Button>
                </div>
              </div>
            )}

            {/* Grouped Tasks List */}
            <div className="space-y-6">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay tareas asignadas</h3>
                  <p className="text-muted-foreground">
                    No tienes tareas asignadas en este momento.
                  </p>
                  {unassignedTasks.length > 0 && (
                    <div className="mt-4">
                      <Button
                        variant="default"
                        onClick={() => setActiveTab("unassigned")}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Ver Tareas Sin Asignar
                      </Button>
                    </div>
                  )}
                </div>
              ) : Object.keys(groupedTasks.finalGroups).length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay tareas</h3>
                    <p className="text-sm text-muted-foreground">No se encontraron tareas con los filtros actuales</p>
                  </CardContent>
                </Card>
              ) : (
                groupedTasks.dateOrder.map((dateKey: string) => {
                    const providerGroups = Object.values(groupedTasks.finalGroups).filter((group: any) => group.dateKey === dateKey)
                    if (providerGroups.length === 0) return null
                    return (
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
                            <ProviderGroupHeader 
                              providerName={group.providerName} 
                              taskCount={group.taskCount} 
                            />
                          )}

                          {/* Tasks for this provider */}
                          <div className="space-y-3">
                            {group.tasks.map((task: any, taskIndex: number) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                taskIndex={taskIndex}
                                totalTasks={group.taskCount}
                                onFinalize={handleFinalizeTask}
                                onUnassign={handleUnassignTask}
                                isUnassigning={isUnassigning}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })
              )
              }
            </div>
          </TabsContent>

          <TabsContent value="unassigned" className="space-y-6">
            {/* Unassigned Tasks */}
            {isLoadingUnassigned ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Cargando tareas disponibles...</p>
                </div>
              </div>
            ) : unassignedTasks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay tareas disponibles</h3>
                <p className="text-muted-foreground">
                  No hay tareas sin asignar en este momento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {unassignedTasks.map((task: any) => (
                  <UnassignedTaskCard
                    key={task.id}
                    task={task}
                    onAssign={handleAssignTask}
                    isAssigning={isAssigning}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Finalize Task Modal */}
      <FinalizeTaskModal
        isOpen={showFinalizeModal}
        task={selectedTask}
        receiptPhoto={receiptPhoto}
        additionalPhotos={additionalPhotos}
        isFinalizing={isFinalizing}
        onClose={() => setShowFinalizeModal(false)}
        onSubmit={handleFinalizeSubmit}
        onReceiptPhotoChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              setReceiptPhoto(e.target?.result as string)
            }
            reader.readAsDataURL(file)
          }
        }}
        onAdditionalPhotoChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const base64 = e.target?.result as string
              setAdditionalPhotos(prev => [...prev, base64])
            }
            reader.readAsDataURL(file)
          }
          e.target.value = ''
        }}
        onRemoveAdditionalPhoto={(index) => setAdditionalPhotos(prev => prev.filter((_, i) => i !== index))}
      />

      {/* Success/Error dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog(prev => ({ ...prev, isOpen: false }))}
        title={successDialog.title}
        description={successDialog.description}
        type={successDialog.type}
      />
    </div>
  )
}
