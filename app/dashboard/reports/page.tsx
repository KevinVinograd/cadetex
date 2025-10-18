"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { mockTasks, mockCouriers } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const PackageIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
)

const TrendingUpIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const UsersIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

const FileSpreadsheetIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const FileTextIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
)

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [reportType, setReportType] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

  const handleExportCSV = () => {
    setIsExporting(true)
    // Simulate export
    setTimeout(() => {
      console.log("[v0] Exporting CSV report")
      // Create CSV content
      const headers = ["Reference BL", "Client", "Type", "Status", "Date", "Courier"]
      const rows = mockTasks.map((task) => [
        task.referenceBL,
        task.clientName,
        task.type,
        task.status,
        task.scheduledDate,
        task.courierName || "Unassigned",
      ])

      const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `courier-report-${new Date().toISOString().split("T")[0]}.csv`
      a.click()

      setIsExporting(false)
    }, 1000)
  }

  const handleExportPDF = () => {
    setIsExporting(true)
    setTimeout(() => {
      console.log("[v0] Exporting PDF report")
      alert("PDF export would be generated here using a library like jsPDF")
      setIsExporting(false)
    }, 1000)
  }

  const stats = {
    totalTasks: mockTasks.length,
    completedTasks: mockTasks.filter((t) => t.status === "completed").length,
    activeCouriers: mockCouriers.filter((c) => c.activeTasks > 0).length,
    completionRate: Math.round((mockTasks.filter((t) => t.status === "completed").length / mockTasks.length) * 100),
  }

  const courierPerformance = mockCouriers.map((courier) => {
    const courierTasks = mockTasks.filter((t) => t.courierName === courier.name)
    const completed = courierTasks.filter((t) => t.status === "completed").length
    return {
      name: courier.name,
      total: courierTasks.length,
      completed,
      pending: courierTasks.length - completed,
      rate: courierTasks.length > 0 ? Math.round((completed / courierTasks.length) * 100) : 0,
    }
  })

  const statusData = [
    { name: "Pending", value: mockTasks.filter((t) => t.status === "pending").length, color: "#f59e0b" },
    { name: "Confirmed", value: mockTasks.filter((t) => t.status === "confirmed").length, color: "#3b82f6" },
    { name: "Completed", value: mockTasks.filter((t) => t.status === "completed").length, color: "#10b981" },
  ]

  const typeData = [
    { name: "Delivery", value: mockTasks.filter((t) => t.type === "delivery").length },
    { name: "Pickup", value: mockTasks.filter((t) => t.type === "pickup").length },
    { name: "Both", value: mockTasks.filter((t) => t.type === "both").length },
  ]

  const courierChartData = courierPerformance.map((courier) => ({
    name: courier.name.split(" ")[0], // First name only for cleaner display
    completed: courier.completed,
    pending: courier.pending,
  }))

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">View performance metrics and export data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <PackageIcon />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUpIcon />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Couriers</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <UsersIcon />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeCouriers}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently working</p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg">
              <TrendingUpIcon />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-medium">Tasks by Status</CardTitle>
            <CardDescription className="text-sm">Distribution of task statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-medium">Tasks by Type</CardTitle>
            <CardDescription className="text-sm">Breakdown of delivery, pickup, and both</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-medium">Courier Performance Chart</CardTitle>
          <CardDescription className="text-sm">Completed vs pending tasks by courier</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courierChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-medium">Courier Performance</CardTitle>
          <CardDescription className="text-sm">Task completion statistics by courier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Courier Name</TableHead>
                  <TableHead className="text-right">Total Tasks</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courierPerformance.map((courier) => (
                  <TableRow key={courier.name}>
                    <TableCell className="font-medium">{courier.name}</TableCell>
                    <TableCell className="text-right">{courier.total}</TableCell>
                    <TableCell className="text-right">{courier.completed}</TableCell>
                    <TableCell className="text-right">{courier.pending}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          courier.rate >= 80
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : courier.rate >= 50
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {courier.rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-medium">Export Data</CardTitle>
          <CardDescription className="text-sm">Download reports in various formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="completed">Completed Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
                <SelectItem value="courier">By Courier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleExportCSV} disabled={isExporting} className="flex-1">
              <FileSpreadsheetIcon />
              <span className="ml-2">{isExporting ? "Exporting..." : "Export as CSV"}</span>
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <FileTextIcon />
              <span className="ml-2">{isExporting ? "Exporting..." : "Export as PDF"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
