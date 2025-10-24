import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function CompleteTaskPage() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/tasks")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finalizar Tarea</h1>
            <p className="text-muted-foreground">
              Completar tarea asignada
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            En Desarrollo
          </CardTitle>
          <CardDescription>
            Esta funcionalidad está en desarrollo y estará disponible próximamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Página en Construcción</h3>
            <p className="text-muted-foreground mb-4">
              La funcionalidad de finalización de tareas está siendo desarrollada.
            </p>
            <Button onClick={() => navigate("/dashboard/tasks")}>
              Volver a Tareas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}