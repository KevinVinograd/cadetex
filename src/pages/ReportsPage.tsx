import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { 
  Download,
  AlertCircle
} from "lucide-react"

export default function ReportsPage() {

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis y estadísticas de tu organización
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
              La funcionalidad de reportes está siendo desarrollada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}