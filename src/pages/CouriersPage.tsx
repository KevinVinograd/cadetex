import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { CornerLogout } from "../components/ui/corner-logout"
import { useAuth } from "../hooks/use-auth"
import { useCouriers } from "../hooks/use-couriers"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, Plus, Search, Eye, Edit, Trash2, ArrowLeft, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { SuccessDialog } from "../components/ui/success-dialog"

export default function CouriersPage() {
  const navigate = useNavigate()
  const { role, organizationId } = useAuth()
  const { couriers, isLoading, error, deleteCourier, getCouriersByOrganization } = useCouriers()

  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [courierToDelete, setCourierToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estados para diálogos
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'success'
  })

  useEffect(() => {
    if (role !== "orgadmin") {
      navigate("/login")
    }
  }, [role, navigate])

  // No renderizar si no tiene permisos
  if (role !== "orgadmin") {
    return null
  }

  const orgCouriers = organizationId ? getCouriersByOrganization(organizationId) : []

  const filteredCouriers = orgCouriers.filter((courier) => {
    const matchesSearch =
      courier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.vehicleType?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const showSuccess = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSuccessDialog({
      isOpen: true,
      title,
      description,
      type
    })
  }

  const handleDelete = (courierId: string) => {
    setCourierToDelete(courierId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!courierToDelete) return

    try {
      setIsDeleting(true)
      await deleteCourier(courierToDelete)
      setIsDeleteDialogOpen(false)
      setCourierToDelete(null)
      showSuccess("Courier Eliminado", "El courier ha sido eliminado exitosamente.")
    } catch (err) {
      showSuccess("Error", "Error al eliminar el courier", "error")
      console.error("Failed to delete courier:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <CornerLogout />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CornerLogout />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Couriers</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra los couriers de tu organización
            </p>
          </div>
        </div>
        {role === "SUPERADMIN" && (
          <Link to="/dashboard/couriers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Courier
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Couriers</CardTitle>
          <CardDescription>
            {filteredCouriers.length} courier{filteredCouriers.length !== 1 ? 's' : ''} en tu organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email, teléfono o vehículo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Estado</TableHead>
                {role === "SUPERADMIN" && (
                  <TableHead className="text-right">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCouriers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={role === "SUPERADMIN" ? 6 : 5} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No se encontraron couriers con ese criterio" : "No hay couriers registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCouriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell className="font-medium">{courier.name}</TableCell>
                    <TableCell>{courier.email}</TableCell>
                    <TableCell>{courier.phoneNumber || "N/A"}</TableCell>
                    <TableCell>{courier.vehicleType || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={courier.isActive ? "default" : "secondary"}>
                          {courier.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        {courier.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    {role === "SUPERADMIN" && (
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Link to={`/dashboard/couriers/${courier.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/dashboard/couriers/${courier.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(courier.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Courier</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este courier? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog(prev => ({ ...prev, isOpen: false }))}
        title={successDialog.title}
        description={successDialog.description}
        type={successDialog.type}
      />
    </div>
  )
}