import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { CornerLogout } from "../components/ui/corner-logout"
import { useAuth } from "../hooks/use-auth"
import { useTasks } from "../hooks/use-tasks"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, Plus, Search, Eye, Trash2, Download } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { SuccessDialog } from "../components/ui/success-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { exportTasksToExcel, exportAllTasksToExcel } from "../lib/excel-export"

export default function TasksPage() {
  const { role } = useAuth()
  const { tasks, isLoading, error, deleteTask } = useTasks()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estados para diálogos
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'success'
  })

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { }
  })

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.providerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.courierName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesType = typeFilter === "all" || task.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate task statistics
  const totalTasks = tasks.length
  const pendingTasks = tasks.filter(task => task.status === "PENDING").length
  const pendingConfirmationTasks = tasks.filter(task => task.status === "PENDING_CONFIRMATION").length
  const confirmedTasks = tasks.filter(task => task.status === "CONFIRMED").length
  const completedTasks = tasks.filter(task => task.status === "COMPLETED").length
  const cancelledTasks = tasks.filter(task => task.status === "CANCELLED").length

  const handleExportTasks = () => {
    exportTasksToExcel(filteredTasks as any[])
  }

  const handleExportAllTasks = () => {
    exportAllTasksToExcel(tasks as any[])
  }

  const handleDeleteClick = (taskId: string, taskReference: string) => {
    setTaskToDelete(taskId)
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Tarea",
      description: `¿Estás seguro de que quieres eliminar la tarea ${taskReference}? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false })
        setIsDeleteDialogOpen(true)
      }
    })
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return

    setIsDeleting(true)
    try {
      await deleteTask(taskToDelete)
      setSuccessDialog({
        isOpen: true,
        title: "Tarea Eliminada",
        description: "La tarea ha sido eliminada exitosamente.",
        type: 'success'
      })
      setIsDeleteDialogOpen(false)
      setTaskToDelete(null)
    } catch (error) {
      console.error('Error deleting task:', error)
      setSuccessDialog({
        isOpen: true,
        title: "Error",
        description: "No se pudo eliminar la tarea. Intenta de nuevo.",
        type: 'error'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pendiente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      PENDING_CONFIRMATION: { variant: "secondary" as const, label: "Pendiente Confirmación", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      CONFIRMED: { variant: "default" as const, label: "Confirmada", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
      COMPLETED: { variant: "default" as const, label: "Finalizada", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      CANCELLED: { variant: "destructive" as const, label: "Cancelada", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" }
    }
    return statusConfig[status as keyof typeof statusConfig] || { variant: "outline" as const, label: status, className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      URGENT: { variant: "destructive" as const, label: "Urgente", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
      HIGH: { variant: "secondary" as const, label: "Alta", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
      NORMAL: { variant: "default" as const, label: "Normal", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      LOW: { variant: "outline" as const, label: "Baja", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" }
    }
    return priorityConfig[priority as keyof typeof priorityConfig] || { variant: "outline" as const, label: priority, className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>
              Error al cargar las tareas. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (role !== "orgadmin") {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CornerLogout />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
          <p className="text-muted-foreground">
            Gestionar todas las tareas de entrega y retiro
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportTasks}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Filtradas
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportAllTasks}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Todas
          </Button>
          <Link to="/dashboard/tasks/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas las tareas</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Plus className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Esperando acción</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente Confirmación</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Plus className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingConfirmationTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Esperando confirmación</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Plus className="h-4 w-4 text-purple-600 dark:text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{confirmedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Listas para ejecutar</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Plus className="h-4 w-4 text-green-600 dark:text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Finalizadas</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Plus className="h-4 w-4 text-red-600 dark:text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cancelledTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Canceladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <div className="space-y-4">
        <Card className="border">
          <CardHeader className="space-y-1">
            <CardTitle>Lista de Tareas</CardTitle>
            <CardDescription>
              Administra todas las tareas de tu organización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por referencia, cliente, proveedor o cadete..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PENDING_CONFIRMATION">Pendiente Confirmación</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="COMPLETED">Finalizada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  <SelectItem value="RETIRE">Retiro</SelectItem>
                  <SelectItem value="DELIVER">Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Cadete</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Programada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {searchQuery ? "No se encontraron tareas con ese criterio" : "No hay tareas registradas"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => {
                    const statusConfig = getStatusBadge(task.status)
                    const priorityConfig = getPriorityBadge(task.priority)
                    
                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.referenceNumber || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {task.type === 'RETIRE' ? 'Retiro' : 'Entrega'}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.clientName || "-"}</TableCell>
                        <TableCell>{task.providerName || "-"}</TableCell>
                        <TableCell>{task.courierName || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityConfig.variant} className={priorityConfig.className}>
                            {priorityConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.scheduledDate || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Link to={`/dashboard/tasks/${task.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver Detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(task.id, task.referenceNumber || 'Sin referencia')}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Tarea</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ ...successDialog, isOpen: false })}
        title={successDialog.title}
        description={successDialog.description}
        type={successDialog.type}
      />

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}>
              Cancelar
            </Button>
            <Button onClick={confirmDialog.onConfirm}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}