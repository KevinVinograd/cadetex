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

  // Filter tasks based on search and filters
  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch = 
      task.referenceBL?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.providerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.courierName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesType = typeFilter === "all" || task.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate task statistics
  const totalTasks = mockTasks.length
  const pendingTasks = mockTasks.filter(task => task.status === "pendiente_confirmar").length
  const inProgressTasks = mockTasks.filter(task => task.status === "confirmada_tomar").length
  const completedTasks = mockTasks.filter(task => task.status === "finalizada").length

  const handleExportTasks = () => {
    exportTasksToExcel(filteredTasks)
  }

  const handleExportAllTasks = () => {
    exportAllTasksToExcel(mockTasks)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your organization's tasks and activities
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
            <p className="text-xs text-muted-foreground mt-1">Completadas</p>
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
              <Link to="/dashboard/tasks/new">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
              </Link>
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
                  <SelectItem value="retiro">Retiro</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
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
                        <TableCell className="font-medium">{task.referenceBL || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.type}</Badge>
                        </TableCell>
                        <TableCell>{task.clientName || "-"}</TableCell>
                        <TableCell>{task.providerName || "-"}</TableCell>
                        <TableCell>{task.courierName || "-"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              task.status === "finalizada" ? "default" :
                              task.status === "confirmada_tomar" ? "secondary" :
                              task.status === "pendiente_confirmar" ? "outline" : "destructive"
                            }
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              task.priority === "urgente" ? "destructive" :
                              task.priority === "alta" ? "default" :
                              task.priority === "normal" ? "secondary" : "outline"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.scheduledDate || "-"}</TableCell>
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
    </div>
  )
}