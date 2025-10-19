import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { mockCouriers } from "../lib/mock-data"
import { 
  Plus, 
  Search, 
  Eye, 
  Truck,
  Phone,
  Mail,
  Package
} from "lucide-react"

export default function CouriersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCouriers = mockCouriers.filter(
    (courier) =>
      courier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )


  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Couriers</h1>
          <p className="text-sm text-muted-foreground">Gestiona los couriers del sistema</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar couriers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Couriers List */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Couriers</span>
            <Button asChild>
              <Link to="/dashboard/couriers/new">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Courier
              </Link>
            </Button>
          </CardTitle>
          <CardDescription>
            {filteredCouriers.length} courier{filteredCouriers.length !== 1 ? 's' : ''} encontrado{filteredCouriers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCouriers.map((courier) => (
              <div
                key={courier.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{courier.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{courier.phoneNumber}</span>
                      </div>
                      {courier.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{courier.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{courier.activeTasks} tareas activas</span>
                      </div>
                    </div>
                    {courier.address && (
                      <p className="text-sm text-muted-foreground">{courier.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/couriers/${courier.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}