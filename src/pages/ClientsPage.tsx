import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { CornerLogout } from "../components/ui/corner-logout"
import { useAuth } from "../hooks/use-auth"
import { useClients } from "../hooks/use-clients"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, Plus, Search, Eye, Trash2, ArrowLeft, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { SuccessDialog } from "../components/ui/success-dialog"

export default function ClientsPage() {
  const navigate = useNavigate()
  const { role, organizationId } = useAuth()
  const { isLoading, error, createClient, deleteClient, getClientsByOrganization } = useClients()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Estados para creación de cliente
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [clientCity, setClientCity] = useState("")
  const [clientProvince, setClientProvince] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  
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
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  })

  if (role !== "orgadmin") {
    navigate("/login")
    return null
  }

  const orgClients = organizationId ? getClientsByOrganization(organizationId) : []
  
  const filteredClients = orgClients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const handleCreateClient = async () => {
    if (!organizationId || !clientName || !clientAddress || !clientCity || !clientProvince) {
      setCreateError("Por favor completa todos los campos obligatorios")
      return
    }
    
    try {
      setIsCreating(true)
      setCreateError("")
      
      const newClient = await createClient({
        organizationId: organizationId,
        name: clientName,
        address: clientAddress,
        city: clientCity,
        province: clientProvince,
        phoneNumber: clientPhone || undefined,
        email: clientEmail || undefined,
      })
      
      // Mostrar diálogo de éxito
      setSuccessDialog({
        isOpen: true,
        title: "Cliente creado exitosamente",
        description: `El cliente "${newClient.name}" ha sido creado correctamente.`,
        type: "success"
      })
      
      // Limpiar formulario
      setClientName("")
      setClientAddress("")
      setClientCity("")
      setClientProvince("")
      setClientPhone("")
      setClientEmail("")
      setIsCreateDialogOpen(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Error al crear el cliente")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteClick = (clientId: string, clientName: string) => {
    setClientToDelete(clientId)
    setConfirmDialog({
      isOpen: true,
      title: "Confirmar eliminación",
      description: `¿Estás seguro de que quieres eliminar el cliente "${clientName}"? Esta acción no se puede deshacer.`,
      onConfirm: handleDeleteConfirm
    })
  }

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return
    
    try {
      setIsDeleting(true)
      await deleteClient(clientToDelete)
      
      setSuccessDialog({
        isOpen: true,
        title: "Cliente eliminado exitosamente",
        description: "El cliente ha sido eliminado correctamente.",
        type: "success"
      })
      
      setClientToDelete(null)
      setIsDeleteDialogOpen(false)
    } catch (err) {
      setSuccessDialog({
        isOpen: true,
        title: "Error al eliminar cliente",
        description: err instanceof Error ? err.message : "No se pudo eliminar el cliente",
        type: "error"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const showSuccess = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSuccessDialog({
      isOpen: true,
      title,
      description,
      type
    })
  }


  const confirmDelete = async () => {
    if (!clientToDelete) return
    
    try {
      setIsDeleting(true)
      await deleteClient(clientToDelete)
      setIsDeleteDialogOpen(false)
      setClientToDelete(null)
      showSuccess("Cliente Eliminado", "El cliente ha sido eliminado exitosamente.")
    } catch (err) {
      showSuccess("Error", "Error al eliminar el cliente", "error")
      console.error("Failed to delete client:", err)
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
            <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra los clientes de tu organización
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} en tu organización
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
              placeholder="Buscar por nombre, dirección, ciudad o email..."
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
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No se encontraron clientes con ese criterio" : "No hay clientes registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.address}</TableCell>
                    <TableCell>{client.city}</TableCell>
                    <TableCell>{client.phoneNumber || "N/A"}</TableCell>
                    <TableCell>{client.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={client.isActive ? "default" : "secondary"}>
                        {client.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Link to={`/dashboard/clients/${client.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver y Editar">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(client.id, client.name)}
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
            <DialogTitle>Eliminar Cliente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.
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

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Completa la información del cliente. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre *
              </Label>
              <Input
                id="name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="col-span-3"
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Dirección *
              </Label>
              <Input
                id="address"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="col-span-3"
                placeholder="Dirección completa"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                Ciudad *
              </Label>
              <Input
                id="city"
                value={clientCity}
                onChange={(e) => setClientCity(e.target.value)}
                className="col-span-3"
                placeholder="Ciudad"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="province" className="text-right">
                Provincia *
              </Label>
              <Input
                id="province"
                value={clientProvince}
                onChange={(e) => setClientProvince(e.target.value)}
                className="col-span-3"
                placeholder="Provincia"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input
                id="phone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="col-span-3"
                placeholder="Número de teléfono"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="col-span-3"
                placeholder="Correo electrónico"
              />
            </div>
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setCreateError("")
                setClientName("")
                setClientAddress("")
                setClientCity("")
                setClientProvince("")
                setClientPhone("")
                setClientEmail("")
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateClient}
              disabled={isCreating}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? "Creando..." : "Crear Cliente"}
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

      {/* Confirm Dialog */}
      <SuccessDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        type="warning"
        onConfirm={confirmDialog.onConfirm}
        confirmText="Confirmar"
        showCancel={true}
      />
    </div>
  )
}