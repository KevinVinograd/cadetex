import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useAuth } from "../hooks/use-auth"
import { useTasks } from "../hooks/use-tasks"
import { Plus, Search, Download, Loader2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { SuccessDialog } from "../components/ui/success-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { exportTasksToExcel, exportAllTasksToExcel } from "../lib/excel-export"
import { getTranslation } from "../lib/translations"
import { TaskTable } from "../components/TaskTable"
import { TaskStatsCards } from "../components/TaskStatsCards"
import { TaskSortingControls } from "../components/TaskSortingControls"
import { LoadingState } from "../components/LoadingState"
import { ErrorState } from "../components/ErrorState"
import { filterTasks, sortTasks, calculateTaskStats } from "../lib/task-helpers"
import { Package, AlertCircle, Clock, PlayCircle, CheckCircle } from "lucide-react"

const t = getTranslation()

export default function TasksPage() {
  const { role } = useAuth()
  const { tasks, isLoading, error, deleteTask } = useTasks()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // Filter and sort tasks
  const filteredTasks = filterTasks(tasks, searchQuery, statusFilter, typeFilter)
  const sortedTasks = sortTasks(filteredTasks, sortBy, sortOrder)
  
  // Calculate statistics
  const stats = calculateTaskStats(tasks)


  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
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

  const handleExportTasks = () => exportTasksToExcel(sortedTasks as any[])
  const handleExportAllTasks = () => exportAllTasksToExcel(tasks as any[])

  const statsCards = [
    { title: "Total Tareas", value: stats.totalTasks, icon: Package, description: "Todas las tareas" },
    { title: "Pendientes", value: stats.pendingTasks, icon: AlertCircle, iconColor: "text-yellow-600 dark:text-yellow-500", iconBgColor: "bg-yellow-500/10", description: "Esperando acción" },
    { title: "Pendiente Confirmación", value: stats.pendingConfirmationTasks, icon: Clock, iconColor: "text-blue-600 dark:text-blue-500", iconBgColor: "bg-blue-500/10", description: "Esperando confirmación" },
    { title: "Confirmadas", value: stats.confirmedTasks, icon: PlayCircle, iconColor: "text-purple-600 dark:text-purple-500", iconBgColor: "bg-purple-500/10", description: "Listas para ejecutar" },
    { title: "Finalizadas", value: stats.completedTasks, icon: CheckCircle, iconColor: "text-green-600 dark:text-green-500", iconBgColor: "bg-green-500/10", description: "Finalizadas" },
    { title: "Canceladas", value: stats.cancelledTasks, icon: AlertCircle, iconColor: "text-red-600 dark:text-red-500", iconBgColor: "bg-red-500/10", description: "Canceladas" }
  ]

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message="Error al cargar las tareas. Por favor, intenta de nuevo." />

  if (role !== "orgadmin") {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      
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
                  placeholder={t.tasks.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t.tasks.filterByStatus} />
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
                  <SelectValue placeholder={t.tasks.filterByType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  <SelectItem value="RETIRE">Retiro</SelectItem>
                  <SelectItem value="DELIVER">Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sorting Controls */}
            <TaskSortingControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
            />

            <TaskTable
              tasks={sortedTasks}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onDelete={handleDeleteClick}
              isLoadingDelete={isDeleting}
              showActions={true}
            />
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