import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useAuth } from "../hooks/use-auth"
import { useTasks } from "../hooks/use-tasks"
import { Plus, Search, Download, Package, AlertCircle, Clock, PlayCircle, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { SuccessDialog } from "../components/ui/success-dialog"
import { exportTasksToExcel, exportAllTasksToExcel } from "../lib/excel-export"
import { getTranslation } from "../lib/translations"
import { TaskTable } from "../components/TaskTable"
import { TaskStatsCards } from "../components/TaskStatsCards"
import { LoadingState } from "../components/LoadingState"
import { ErrorState } from "../components/ErrorState"
import { filterTasks, sortTasks, calculateTaskStats } from "../lib/task-helpers"

const t = getTranslation()

export default function DashboardPage() {
  const { role, isLoading, organizationId } = useAuth()
  const { tasks, isLoading: tasksLoading, error: tasksError, getTasksByOrganization, deleteTask } = useTasks()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("scheduledDate")
  const [sortOrder, setSortOrder] = useState<string>("asc")
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

  // Load tasks for the organization when component mounts or organizationId changes
  useEffect(() => {
    const loadTasks = async () => {
      if (organizationId) {
        try {
          await getTasksByOrganization(organizationId)
        } catch (error) {
          console.error('Error loading tasks:', error)
        }
      } else {
        // no org id
      }
    }
    loadTasks()
  }, [organizationId, getTasksByOrganization])


  // Debug effect removed
  useEffect(() => {
    // no-op
  }, [tasks])

  // Filter and sort tasks
  const filteredTasks = filterTasks(tasks, searchQuery, statusFilter, typeFilter)
  const sortedTasks = sortTasks(filteredTasks, sortBy, sortOrder)

  // Calculate task statistics
  const stats = calculateTaskStats(tasks)

  // Debug logs removed

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const handleExportTasks = () => exportTasksToExcel(sortedTasks as any[])
  const handleExportAllTasks = () => exportAllTasksToExcel(tasks as any[])

  const statsCards = [
    { title: t.dashboard.totalTasks, value: stats.totalTasks, icon: Package, description: "Todas las tareas" },
    { title: "Pendientes", value: stats.pendingTasks, icon: AlertCircle, iconColor: "text-yellow-600 dark:text-yellow-500", iconBgColor: "bg-yellow-500/10", description: "Esperando acción" },
    { title: "Pendiente Confirmación", value: stats.pendingConfirmationTasks, icon: Clock, iconColor: "text-blue-600 dark:text-blue-500", iconBgColor: "bg-blue-500/10", description: "Esperando confirmación" },
    { title: "Confirmadas", value: stats.confirmedTasks, icon: PlayCircle, iconColor: "text-purple-600 dark:text-purple-500", iconBgColor: "bg-purple-500/10", description: "Listas para ejecutar" },
    { title: "Finalizadas", value: stats.completedTasks, icon: CheckCircle, iconColor: "text-green-600 dark:text-green-500", iconBgColor: "bg-green-500/10", description: "Finalizadas" }
  ]

  // Función para manejar la eliminación de tareas
  const handleDeleteTask = (taskId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirmar Eliminación",
      description: "¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.",
      onConfirm: () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false })
        setIsDeleting(true)
        deleteTask(taskId)
          .then(() => {
            setSuccessDialog({
              isOpen: true,
              title: "Tarea Eliminada",
              description: "La tarea se ha eliminado correctamente.",
              type: "success"
            })
            // Recargar las tareas después de eliminar
            if (organizationId) {
              getTasksByOrganization(organizationId)
            }
          })
          .catch((error) => {
            console.error("Error al eliminar la tarea:", error)
            setSuccessDialog({
              isOpen: true,
              title: "Error",
              description: "No se pudo eliminar la tarea. Por favor, intenta de nuevo.",
              type: "error"
            })
          })
          .finally(() => {
            setIsDeleting(false)
          })
      }
    })
  }

  if (isLoading || tasksLoading) return <LoadingState />
  if (tasksError) return <ErrorState message="Error al cargar las tareas. Por favor, intenta de nuevo." />

  if (role !== "orgadmin") {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">
            {t.dashboard.overview}
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
              {t.common.create}
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <TaskStatsCards cards={statsCards} />

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
                  placeholder={t.dashboard.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={`${t.dashboard.filterBy} ${t.dashboard.status}`} />
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
                  <SelectValue placeholder={`${t.dashboard.filterBy} ${t.dashboard.type}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  <SelectItem value="RETIRE">Retiro</SelectItem>
                  <SelectItem value="DELIVER">Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TaskTable
              tasks={sortedTasks}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onDelete={(taskId) => handleDeleteTask(taskId)}
              isLoadingDelete={isDeleting}
              showActions={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDialog.onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de éxito/error */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ ...successDialog, isOpen: false })}
        title={successDialog.title}
        description={successDialog.description}
        type={successDialog.type}
      />
    </div>
  )
}