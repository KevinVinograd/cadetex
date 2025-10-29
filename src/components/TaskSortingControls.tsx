import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface TaskSortingControlsProps {
  sortBy: string
  sortOrder: string
  onSortByChange: (value: string) => void
  onSortOrderChange: (value: string) => void
}

export function TaskSortingControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange
}: TaskSortingControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Fecha de Creación</SelectItem>
          <SelectItem value="scheduledDate">Fecha Programada</SelectItem>
          <SelectItem value="referenceNumber">Número de Referencia</SelectItem>
          <SelectItem value="status">Estado</SelectItem>
          <SelectItem value="priority">Prioridad</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortOrder} onValueChange={onSortOrderChange}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Orden" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Descendente</SelectItem>
          <SelectItem value="asc">Ascendente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}


