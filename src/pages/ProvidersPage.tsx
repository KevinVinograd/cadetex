import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useAuth } from "../hooks/use-auth"
import { useProviders } from "../hooks/use-providers"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, Plus, Search, Eye, Trash2, ArrowLeft, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { SuccessDialog } from "../components/ui/success-dialog"
import { getTranslation } from "../lib/translations"
import { formatAddress, getCity } from "../lib/address-utils"

const t = getTranslation()

export default function ProvidersPage() {
  const navigate = useNavigate()
  const { role, organizationId } = useAuth()
  const { providers, isLoading, error, deleteProvider, getProvidersByOrganization } = useProviders()

  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null)
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

  const orgProviders = organizationId ? getProvidersByOrganization(organizationId) : []

  const filteredProviders = orgProviders.filter((provider) => {
    const addrStr = formatAddress(provider.address, {
      street: provider.street,
      streetNumber: provider.streetNumber,
      addressComplement: provider.addressComplement,
      city: provider.city,
      province: provider.province,
    })
    const cityStr = getCity(provider.address, { city: provider.city })
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      provider.name.toLowerCase().includes(q) ||
      addrStr.toLowerCase().includes(q) ||
      cityStr.toLowerCase().includes(q) ||
      (provider.email?.toLowerCase().includes(q) ?? false)

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

  const handleDelete = (providerId: string) => {
    setProviderToDelete(providerId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!providerToDelete) return

    try {
      setIsDeleting(true)
      await deleteProvider(providerToDelete)
      setIsDeleteDialogOpen(false)
      setProviderToDelete(null)
      showSuccess("Proveedor Eliminado", "El proveedor ha sido eliminado exitosamente.")
    } catch (err) {
      showSuccess("Error", "Error al eliminar el proveedor", "error")
      console.error("Failed to delete provider:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div>
          <h1 className="text-2xl font-bold">{t.providers.management}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t.providers.description}
            </p>
          </div>
        </div>
        <Link to="/dashboard/providers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.providers.providersList}</CardTitle>
          <CardDescription>
            {filteredProviders.length} proveedor{filteredProviders.length !== 1 ? 'es' : ''} en tu organización
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
              placeholder={t.providers.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                {searchQuery ? t.providers.noProvidersFiltered : t.providers.noProvidersRegistered}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>{formatAddress(provider.address, { street: provider.street, streetNumber: provider.streetNumber, addressComplement: provider.addressComplement })}</TableCell>
                    <TableCell>{getCity(provider.address, { city: provider.city })}</TableCell>
                    <TableCell>{provider.phoneNumber || "N/A"}</TableCell>
                    <TableCell>{provider.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={provider.isActive ? "default" : "secondary"}>
                        {provider.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Link to={`/dashboard/providers/${provider.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver y Editar">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(provider.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
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
            <DialogTitle>{t.providers.deleteTitle}</DialogTitle>
            <DialogDescription>
              {t.providers.deleteConfirm}
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
                  {t.providers.delete}
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