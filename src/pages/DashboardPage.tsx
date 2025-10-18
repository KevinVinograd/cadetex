import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Plus, Search, Package, TrendingUp, Clock, CheckCircle2, Download, Eye } from "lucide-react"
import { mockTasks } from "../lib/mock-data"
import { useAuth } from "../hooks/use-auth"
import { exportTasksToExcel, exportAllTasksToExcel } from "../lib/excel-export"
import type { TaskStatus } from "../lib/types"

export default function DashboardPage() {
  const navigate = useNavigate()
  const { role, isLoading } = useAuth()
  
  // All hooks must be called before any conditional returns
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  
  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Redirect if not orgadmin
  if (role !== "orgadmin") {
    if (typeof window !== "undefined") navigate("/login")
    return null
  }

  // Show all tasks for now - we'll fix organization filtering later
  const orgFiltered = mockTasks

  const filteredTasks = orgFiltered.filter((task) => {
    const matchesSearch =
      task.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.referenceBL.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.courierName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesType = typeFilter === "all" || task.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: mockTasks.length,
    en_preparacion: mockTasks.filter((t) => t.status === "en_preparacion").length,
    pendiente_confirmar: mockTasks.filter((t) => t.status === "pendiente_confirmar").length,
    confirmada_tomar: mockTasks.filter((t) => t.status === "confirmada_tomar").length,
    finalizada: mockTasks.filter((t) => t.status === "finalizada").length,
    cancelada: mockTasks.filter((t) => t.status === "cancelada").length,
  }

  const getStatusBadge = (status: TaskStatus) => {
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
    return <Badge className={variants[status]}>{labels[status]}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      pickup: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      both: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    }
    return <Badge className={variants[type as keyof typeof variants]}>{type}</Badge>
  }

  const handleExportCompleted = () => {
    exportTasksToExcel(mockTasks, `tareas-completadas-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportAll = () => {
    exportAllTasksToExcel(mockTasks, `todas-las-tareas-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage and track all delivery tasks</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/dashboard/tasks/new">
            <Button size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExportCompleted} className="gap-2">
            <Download className="h-4 w-4" />
            Export Completed
          </Button>
          <Button variant="outline" onClick={handleExportAll} className="gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">All time tasks</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Preparación</CardTitle>
                <div className="p-2 bg-gray-500/10 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-600 dark:text-gray-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.en_preparacion}</div>
                <p className="text-xs text-muted-foreground mt-1">Tareas futuras</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendiente Confirmar</CardTitle>
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pendiente_confirmar}</div>
                <p className="text-xs text-muted-foreground mt-1">Requieren revisión</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmada Tomar</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.confirmada_tomar}</div>
                <p className="text-xs text-muted-foreground mt-1">Lista para ejecutar</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Finalizada</CardTitle>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.finalizada}</div>
                <p className="text-xs text-muted-foreground mt-1">Completadas</p>
              </CardContent>
            </Card>
          </div>

      <Card className="border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-medium">Tasks</CardTitle>
          <CardDescription className="text-sm">View and manage all delivery and pickup tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by client, BL reference, or courier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="en_preparacion">En Preparación</SelectItem>
                    <SelectItem value="pendiente_confirmar">Pendiente Confirmar</SelectItem>
                    <SelectItem value="confirmada_tomar">Confirmada Tomar</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference BL</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.referenceBL}</TableCell>
                      <TableCell>{task.clientName}</TableCell>
                      <TableCell>{getTypeBadge(task.type)}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{new Date(task.scheduledDate).toLocaleDateString()}</TableCell>
                      <TableCell>{task.courierName || "Unassigned"}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/dashboard/tasks/${task.id}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
  )
}

