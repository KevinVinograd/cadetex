import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Plus, Search, Package, TrendingUp, Clock, CheckCircle2, Download, Eye, AlertCircle } from "lucide-react"
import { useAuth } from "../hooks/use-auth"
import { useTasks } from "../hooks/use-tasks"
import { exportTasksToExcel, exportAllTasksToExcel } from "../lib/excel-export"

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
type TaskType = "PICKUP" | "DELIVERY" | "RETURN" | "INSPECTION"

export default function TasksPage() {
  const navigate = useNavigate()
  const { role, isLoading: authLoading } = useAuth()
  const { tasks, isLoading, error, deleteTask } = useTasks()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all")

  useEffect(() => {
    if (role !== "orgadmin") {
      navigate("/login")
    }
  }, [role, navigate])

  // Show loading while auth is being determined
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // No renderizar si no tiene permisos
  if (role !== "orgadmin") {
    return null
  }

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
  const inProgressTasks = tasks.filter(task => task.status === "IN_PROGRESS").length
  const completedTasks = tasks.filter(task => task.status === "COMPLETED").length

  const handleExportTasks = () => {
    exportTasksToExcel(filteredTasks)
  }

  const handleExportAllTasks = () => {
    exportAllTasksToExcel(tasks)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      return
    }

    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error al eliminar la tarea')
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error al cargar tareas</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage all delivery and pickup tasks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportTasks}>
            <Download className="h-4 w-4 mr-2" />
            Export Filtered
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportAllTasks}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Link to="/dashboard/tasks/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">All tasks</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <div className="space-y-4">
        <Card className="border">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">Tasks</CardTitle>
                <CardDescription className="text-sm">View and manage all delivery and pickup tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PICKUP">Pickup</SelectItem>
                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                  <SelectItem value="RETURN">Return</SelectItem>
                  <SelectItem value="INSPECTION">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Courier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.referenceNumber || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.type}</Badge>
                        </TableCell>
                        <TableCell>{task.clientName || "-"}</TableCell>
                        <TableCell>{task.providerName || "-"}</TableCell>
                        <TableCell>{task.courierName || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.status === "COMPLETED" ? "default" :
                                task.status === "IN_PROGRESS" ? "secondary" :
                                  task.status === "PENDING" ? "outline" : "destructive"
                            }
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.priority === "URGENT" ? "destructive" :
                                task.priority === "HIGH" ? "default" :
                                  task.priority === "NORMAL" ? "secondary" : "outline"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.scheduledDate || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Link to={`/dashboard/tasks/${task.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

