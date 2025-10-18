import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Button } from "../components/ui/button"
import { mockTasks, mockClients, mockCouriers } from "../lib/mock-data"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  Truck, 
  Clock, 
  CheckCircle2,
  Calendar,
  Download,
  Filter
} from "lucide-react"

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30")
  const [reportType, setReportType] = useState("overview")

  // Calculate statistics
  const totalTasks = mockTasks.length
  const completedTasks = mockTasks.filter(task => task.status === "completed").length
  const pendingTasks = mockTasks.filter(task => task.status === "pending").length
  const confirmedTasks = mockTasks.filter(task => task.status === "confirmed").length
  const totalClients = mockClients.length
  const totalCouriers = mockCouriers.length

  // Task status distribution
  const taskStatusData = [
    { name: "Completed", value: completedTasks, color: "#10b981" },
    { name: "Confirmed", value: confirmedTasks, color: "#3b82f6" },
    { name: "Pending", value: pendingTasks, color: "#f59e0b" },
    { name: "Canceled", value: mockTasks.filter(task => task.status === "canceled").length, color: "#ef4444" }
  ]

  // Task type distribution
  const taskTypeData = [
    { name: "Delivery", value: mockTasks.filter(task => task.type === "delivery").length },
    { name: "Pickup", value: mockTasks.filter(task => task.type === "pickup").length },
    { name: "Both", value: mockTasks.filter(task => task.type === "both").length }
  ]

  // Monthly task completion (mock data)
  const monthlyData = [
    { month: "Jan", completed: 12, pending: 8, total: 20 },
    { month: "Feb", completed: 15, pending: 5, total: 20 },
    { month: "Mar", completed: 18, pending: 7, total: 25 },
    { month: "Apr", completed: 22, pending: 3, total: 25 },
    { month: "May", completed: 20, pending: 10, total: 30 },
    { month: "Jun", completed: 25, pending: 5, total: 30 }
  ]

  // Courier performance (mock data)
  const courierPerformance = [
    { name: "John Smith", completed: 15, pending: 2, efficiency: 88 },
    { name: "Sarah Johnson", completed: 12, pending: 1, efficiency: 92 },
    { name: "Mike Wilson", completed: 18, pending: 3, efficiency: 86 },
    { name: "Lisa Brown", completed: 10, pending: 4, efficiency: 71 }
  ]

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Comprehensive insights into your delivery operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">All time tasks</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered clients</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Couriers</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Truck className="h-4 w-4 text-orange-600 dark:text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCouriers}</div>
            <p className="text-xs text-muted-foreground mt-1">Available couriers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Task Status Distribution */}
        <Card className="border">
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current breakdown of task statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Types */}
        <Card className="border">
          <CardHeader>
            <CardTitle>Task Types</CardTitle>
            <CardDescription>Distribution of delivery vs pickup tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6">
        {/* Monthly Performance */}
        <Card className="border">
          <CardHeader>
            <CardTitle>Monthly Task Performance</CardTitle>
            <CardDescription>Task completion trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Courier Performance */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Courier Performance</CardTitle>
          <CardDescription>Individual courier efficiency and task completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courierPerformance.map((courier, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{courier.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {courier.completed} completed • {courier.pending} pending
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{courier.efficiency}%</p>
                  <p className="text-xs text-muted-foreground">Efficiency</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

