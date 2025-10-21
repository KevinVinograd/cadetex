import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Label } from "../components/ui/label"
import { mockTasks, mockClients, mockProviders } from "../lib/mock-data"
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
  CheckCircle2
} from "lucide-react"
import type { TaskStatus } from "../lib/types"

export default function CourierTasksPage() {
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
      const date = new Date(task.scheduledDate).toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(task)
      return acc
    }, {} as Record<string, typeof filteredTasks>)

    // Sort tasks within each date group by priority
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => {
        const priorityOrder = { urgente: 0, alta: 1, normal: 2, baja: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
    })

    return groups
  }, [filteredTasks])

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
      confirmada_tomar: "Confirmada",
      finalizada: "Finalizada",
      cancelada: "Cancelada",
    }
    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      entrega: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      retiro: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    }
    const labels = {
      entrega: "Entrega",
      retiro: "Retiro",
    }
    return <Badge className={variants[type as keyof typeof variants]}>{labels[type as keyof typeof labels]}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      baja: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      alta: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      urgente: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    const labels = {
      baja: "Baja",
      normal: "Normal",
      alta: "Alta",
      urgente: "Urgente",
    }
    return <Badge className={variants[priority as keyof typeof variants]}>{labels[priority as keyof typeof labels]}</Badge>
  }

  // Get the relevant address based on task type
  const getTaskAddress = (task: typeof courierTasks[0]) => {
    return task.type === "retiro" ? task.pickupAddress : task.deliveryAddress
  }

  // Get the relevant contact based on task type
  const getTaskContact = (task: typeof courierTasks[0]) => {
    return task.type === "retiro" ? task.pickupContact : task.deliveryContact
  }

  // Get contacts list based on filter
  const contactsList = useMemo(() => {
    if (contactFilter === "client") {
      return mockClients
    } else if (contactFilter === "provider") {
      return mockProviders
    }
    return []
  }, [contactFilter])

  const handleFinalizeTask = (task: any) => {
    setSelectedTask(task)
    setReceiptPhoto(null)
    setAdditionalPhoto(null)
    setShowFinalizeModal(true)
  }

  const handleFinalizeSubmit = async () => {
    if (selectedTask.photoRequired && !receiptPhoto) {
      alert("Debe cargar una foto del recibo para finalizar la tarea")
      return
    }

    setIsFinalizing(true)
    console.log("Finalizing task with photos:", { 
      taskId: selectedTask.id, 
      receiptPhoto, 
      additionalPhoto 
    })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsFinalizing(false)
    setShowFinalizeModal(false)
    alert("¡Tarea finalizada exitosamente!")
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
              <p className="text-muted-foreground">
                {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''} asignada{filteredTasks.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, BL, dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="en_preparacion">En Preparación</SelectItem>
                  <SelectItem value="pendiente_confirmar">Pendiente Confirmar</SelectItem>
                  <SelectItem value="confirmada_tomar">Confirmada</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgent e">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select value={contactFilter} onValueChange={(value) => {
                setContactFilter(value)
                setSelectedContactId("all") // Reset contact selection when filter changes
              }}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="client">Clientes</SelectItem>
                  <SelectItem value="provider">Proveedores</SelectItem>
                </SelectContent>
              </Select>

              {(contactFilter === "client" || contactFilter === "provider") && (
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={contactFilter === "client" ? "Cliente" : "Proveedor"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {contactsList.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Grouped Tasks List */}
        <div className="space-y-6">
          {Object.keys(groupedTasks).length === 0 ? (
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
                    <Card key={task.id} className="border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{task.referenceBL}</h3>
                              {getTypeBadge(task.type)}
                              {getPriorityBadge(task.priority)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {task.clientId ? (
                                <>
                                  <User className="h-4 w-4" />
                                  <span>{task.clientName}</span>
                                </>
                              ) : task.providerId ? (
                                <>
                                  <Building2 className="h-4 w-4" />
                                  <span>{task.providerName}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                          {getStatusBadge(task.status)}
                        </div>

                        {/* Address */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground">{getTaskAddress(task)}</p>
                              {getTaskContact(task) && (
                                <p className="text-muted-foreground mt-1">{getTaskContact(task)}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {task.notes && (
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2 text-sm">
                              <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/40 mt-0.5 flex-shrink-0">
                                <CheckCircle2 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                                  Notas:
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                                  {task.notes}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <Link to={`/courier/tasks/${task.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              const address = getTaskAddress(task)
                              const encodedAddress = encodeURIComponent(address)
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank')
                            }}
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Ir
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
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
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          {task.status === "confirmada_tomar" && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="w-full col-span-2"
                              onClick={() => handleFinalizeTask(task)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Finalizar
                            </Button>
                          )}
                        </div>
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
