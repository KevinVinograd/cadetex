import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { useAuth } from "../hooks/use-auth"
import { useTasks } from "../hooks/use-tasks"
import { formatAddress } from "../lib/address-utils"
import { Download, BarChart3, Users, ClipboardList, Clock } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts'

export default function ReportsPage() {
  const { organizationId } = useAuth()
  const { getTasksByOrganization, isLoading, error } = useTasks()
  const [tasks, setTasks] = useState<any[]>([])
  const [exporting, setExporting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  useEffect(() => {
    const load = async () => {
      if (!organizationId) return
      try {
        const data = await getTasksByOrganization(organizationId)
        setTasks(data)
      } catch (_) {
        // handled by hook's error state
      }
    }
    load()
  }, [organizationId, getTasksByOrganization])

  const parseDate = (dateString?: string): Date | null => {
    if (!dateString) return null
    try {
      if (dateString.includes("T") || dateString.includes("Z")) {
        return new Date(dateString)
      }
      return new Date(dateString + "T00:00:00")
    } catch (_) {
      return null
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Status filter
      if (statusFilter !== "all" && t.status !== statusFilter) return false

      // Date range over scheduledDate (fallback to true when no date filter)
      const sd = parseDate(t.scheduledDate)
      if (startDate) {
        const s = parseDate(startDate)
        if (s && sd && sd < s) return false
        if (s && !sd) return false
      }
      if (endDate) {
        const e = parseDate(endDate)
        if (e && sd && sd > new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999)) return false
        if (e && !sd) return false
      }
      return true
    })
  }, [tasks, statusFilter, startDate, endDate])

  const kpis = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter(t => t.status === "COMPLETED").length
    const cancelled = filteredTasks.filter(t => t.status === "CANCELLED").length
    const pending = filteredTasks.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED").length
    const unassigned = filteredTasks.filter(t => !t.courierId).length
    return { total, completed, cancelled, pending, unassigned }
  }, [filteredTasks])

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of filteredTasks) {
      map[t.status] = (map[t.status] || 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [filteredTasks])

  const byCourier = useMemo(() => {
    const map: Record<string, { name: string, count: number }> = {}
    for (const t of filteredTasks) {
      const key = t.courierId || "__none__"
      const name = t.courierName || (t.courierId ? t.courierId : "Sin asignar")
      if (!map[key]) map[key] = { name, count: 0 }
      map[key].count += 1
    }
    return Object.values(map).sort((a, b) => b.count - a.count)
  }, [filteredTasks])

  const byContact = useMemo(() => {
    const map: Record<string, { name: string, count: number }> = {}
    for (const t of filteredTasks) {
      const name = t.contact || t.clientName || t.providerName || "-"
      if (!map[name]) map[name] = { name, count: 0 }
      map[name].count += 1
    }
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [filteredTasks])

  const overdue = useMemo(() => {
    const today = new Date()
    return filteredTasks.filter(t => {
      if (!t.scheduledDate) return false
      const d = t.scheduledDate.includes("T") ? new Date(t.scheduledDate) : new Date(t.scheduledDate + "T00:00:00")
      return d < today && t.status !== "COMPLETED" && t.status !== "CANCELLED"
    }).slice(0, 10)
  }, [filteredTasks])

  const statusChartData = useMemo(() => byStatus.map(([status, count]) => ({ name: status.toLowerCase(), value: count })), [byStatus])
  const courierChartData = useMemo(() => byCourier.map(c => ({ name: c.name, value: c.count })), [byCourier])
  const trendData = useMemo(() => {
    // simple trend by createdAt day
    const buckets: Record<string, number> = {}
    for (const t of filteredTasks) {
      const day = new Date(t.createdAt).toISOString().slice(0,10)
      buckets[day] = (buckets[day] || 0) + 1
    }
    return Object.entries(buckets).sort((a,b)=>a[0].localeCompare(b[0])).map(([date, value]) => ({ date, value }))
  }, [filteredTasks])

  const COLORS = ["#0ea5e9", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6", "#14b8a6"]

  const exportCsv = () => {
    try {
      setExporting(true)
      const headers = [
        "id","referenceNumber","type","status","priority","scheduledDate","clientName","providerName","courierName","address","city","province","createdAt","updatedAt"
      ]
      const rows = filteredTasks.map(t => [
        t.id, t.referenceNumber || "", t.type, t.status, t.priority, t.scheduledDate || "",
        t.clientName || "", t.providerName || "", t.courierName || "",
        (t.address ? formatAddress(t.address) : (t.addressOverride || "")), t.address?.city || t.city || "", t.address?.province || t.province || "",
        t.createdAt, t.updatedAt
      ])
      const csv = [headers, ...rows].map(r => r.map(v => typeof v === "string" && v.includes(",") ? `"${v.replaceAll('"','""')}"` : v).join(",")).join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-tareas-${new Date().toISOString().slice(0,10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Resumen operativo y KPIs principales</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting || isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Filtros</CardTitle>
          <CardDescription>Restringe los datos de todos los widgets</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PENDING_CONFIRMATION">Pendiente Confirmación</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="COMPLETED">Finalizada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Desde (Programada)</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Hasta (Programada)</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" onClick={() => { setStatusFilter("all"); setStartDate(""); setEndDate("") }} className="w-full">Limpiar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><BarChart3 className="h-4 w-4"/>Totales</CardTitle>
            <CardDescription>Tareas en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-bold">{kpis.total}</CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CardDescription>Entregas finalizadas</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-bold">{kpis.completed}</CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <CardDescription>Por completar</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-bold">{kpis.pending}</CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4"/>Sin Asignar</CardTitle>
            <CardDescription>Sin courier</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-bold">{kpis.unassigned}</CardContent>
        </Card>
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4"/>Canceladas</CardTitle>
            <CardDescription>No operativas</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-3xl font-bold">{kpis.cancelled}</CardContent>
        </Card>
      </div>

      {/* Resumen por estado y por courier con gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Resumen por Estado</CardTitle>
            <CardDescription>Distribución actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byStatus.map(([status, count]) => (
                  <TableRow key={status}>
                    <TableCell className="capitalize">{status.toLowerCase()}</TableCell>
                    <TableCell className="text-right font-medium">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tareas por Courier</CardTitle>
            <CardDescription>Top responsables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courierChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Courier</TableHead>
                  <TableHead className="text-right">Tareas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byCourier.map(row => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-right font-medium">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Top contactos y vencidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Contactos</CardTitle>
            <CardDescription>Clientes/Proveedores más frecuentes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-right">Tareas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byContact.map(row => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-right font-medium">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tareas por Día</CardTitle>
            <CardDescription>Tendencia de creación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <p className="text-sm text-red-600">Error al cargar los datos.</p>
      )}
    </div>
  )
}