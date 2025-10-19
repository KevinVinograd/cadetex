import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { mockProviders } from "../lib/mock-data"
import { 
  Plus, 
  Search, 
  Eye, 
  Building2,
  MapPin,
  Phone,
  Mail
} from "lucide-react"

export default function ProvidersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProviders = mockProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Proveedores</h1>
          <p className="text-sm text-muted-foreground">Gestiona los proveedores del sistema</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers List */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Proveedores</span>
            <Button asChild>
              <Link to="/dashboard/providers/new">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Proveedor
              </Link>
            </Button>
          </CardTitle>
          <CardDescription>
            {filteredProviders.length} proveedor{filteredProviders.length !== 1 ? 'es' : ''} encontrado{filteredProviders.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{provider.city}</span>
                      </div>
                      {provider.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{provider.phone}</span>
                        </div>
                      )}
                      {provider.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{provider.email}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/providers/${provider.id}`}>
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
