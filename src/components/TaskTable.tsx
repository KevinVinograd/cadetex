import { useState } from "react"
import { Link } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Eye, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import { getStatusBadge, getPriorityBadge } from "@/lib/task-badges"

interface Task {
  id: string
  referenceNumber?: string
  type: string
  clientName?: string
  providerName?: string
  courierName?: string
  status: string
  priority?: string
  scheduledDate?: string
}

interface TaskTableProps {
  tasks: Task[]
  sortBy: string
  sortOrder: string
  onSort: (field: string) => void
  onDelete?: (taskId: string, reference: string) => void
  isLoadingDelete?: boolean
  showActions?: boolean
}

const ITEMS_PER_PAGE = 10

export function TaskTable({
  tasks,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
  isLoadingDelete = false,
  showActions = true
}: TaskTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  // Calcular paginación
  const totalPages = Math.max(1, Math.ceil(tasks.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTasks = tasks.slice(startIndex, endIndex)

  // Resetear a página 1 si cambia la lista de tareas
  useState(() => {
    setCurrentPage(1)
  })

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
        <TableRow>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50 select-none"
            onClick={() => onSort("referenceNumber")}
          >
            <div className="flex items-center gap-2">
              Referencia
              {getSortIcon("referenceNumber")}
            </div>
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50 select-none"
            onClick={() => onSort("type")}
          >
            <div className="flex items-center gap-2">
              Tipo
              {getSortIcon("type")}
            </div>
          </TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Proveedor</TableHead>
          <TableHead>Cadete</TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50 select-none"
            onClick={() => onSort("status")}
          >
            <div className="flex items-center gap-2">
              Estado
              {getSortIcon("status")}
            </div>
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50 select-none"
            onClick={() => onSort("priority")}
          >
            <div className="flex items-center gap-2">
              Prioridad
              {getSortIcon("priority")}
            </div>
          </TableHead>
          <TableHead 
            className="cursor-pointer hover:bg-muted/50 select-none"
            onClick={() => onSort("scheduledDate")}
          >
            <div className="flex items-center gap-2">
              Programada
              {getSortIcon("scheduledDate")}
            </div>
          </TableHead>
          {showActions && (
            <TableHead className="text-right">Acciones</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              No hay tareas para mostrar
            </TableCell>
          </TableRow>
        ) : (
          paginatedTasks.map((task) => {
            const statusConfig = getStatusBadge(task.status)
            const priorityConfig = getPriorityBadge(task.priority || "NORMAL")
            
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
                  {statusConfig}
                </TableCell>
                <TableCell>
                  {priorityConfig}
                </TableCell>
                <TableCell>{task.scheduledDate || "-"}</TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Link to={`/dashboard/tasks/${task.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver Detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(task.id, task.referenceNumber || 'Sin referencia')}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Eliminar"
                          disabled={isLoadingDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
    
    {tasks.length > ITEMS_PER_PAGE && (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} - {Math.min(endIndex, tasks.length)} de {tasks.length} tareas
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <div className="text-sm">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )}
    </div>
  )
}


