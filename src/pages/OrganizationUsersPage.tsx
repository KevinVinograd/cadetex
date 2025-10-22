import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { CornerLogout } from "../components/ui/corner-logout"
import { useAuth } from "../hooks/use-auth"
import { useUsers } from "../hooks/use-users"
import { useOrganizations } from "../hooks/use-organizations"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, Trash2, UserPlus, CheckCircle, XCircle, Edit, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { SuccessDialog } from "../components/ui/success-dialog"

export default function OrganizationUsersPage() {
  const navigate = useNavigate()
  const { organizationId } = useParams<{ organizationId: string }>()
  const { role } = useAuth()
  const { getUsersByOrganization } = useUsers()
  const { organizations } = useOrganizations()
  
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Estados para crear usuario
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [userRole, setUserRole] = useState("")
  
  // Estados para editar usuario
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Estados para diálogos de confirmación
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

  const organization = organizations.find(org => org.id === organizationId)
  const orgUsers = organizationId ? getUsersByOrganization(organizationId) : []

  if (role !== "superadmin") {
    navigate("/login")
    return null
  }

  if (!organization) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <CornerLogout />
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Organización no encontrada
          </h2>
          <Button onClick={() => navigate("/superadmin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Organizaciones
          </Button>
        </div>
      </div>
    )
  }
  

  const showSuccess = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSuccessDialog({
      isOpen: true,
      title,
      description,
      type
    })
  }

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm
    })
  }

  const openCreateDialog = () => {
    setUserName("")
    setUserEmail("")
    setUserPassword("")
    setUserRole("")
    setCreateError("")
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: any) => {
    setEditingUser(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditRole(user.role)
    setEditIsActive(user.isActive)
    setCreateError("")
    setIsEditDialogOpen(true)
  }

  const handleCreateUser = async () => {
    if (!organizationId || !userName || !userEmail || !userPassword || !userRole) return
    
    try {
      setIsCreating(true)
      setCreateError("")
      
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          organizationId: organizationId,
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole
        })
      })
      
      if (response.ok) {
        setUserName("")
        setUserEmail("")
        setUserPassword("")
        setUserRole("")
        setIsDialogOpen(false)
        showSuccess("Usuario Creado", "El usuario ha sido creado exitosamente.")
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const errorData = await response.json()
        setCreateError(errorData.error || "Error al crear usuario")
      }
    } catch (err) {
      setCreateError("Error al crear usuario")
      console.error("Failed to create user:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !editName || !editEmail || !editRole) return
    
    try {
      setIsUpdating(true)
      setCreateError("")
      
      const response = await fetch(`http://localhost:8080/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          role: editRole,
          isActive: editIsActive
        })
      })
      
      if (response.ok) {
        setEditingUser(null)
        setIsEditDialogOpen(false)
        showSuccess("Usuario Actualizado", "El usuario ha sido actualizado exitosamente.")
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const errorData = await response.json()
        setCreateError(errorData.error || "Error al actualizar usuario")
      }
    } catch (err) {
      setCreateError("Error al actualizar usuario")
      console.error("Failed to update user:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    showConfirm(
      "Eliminar Usuario",
      "¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.",
      async () => {
        try {
          const response = await fetch(`http://localhost:8080/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          })
          
          if (response.ok) {
            showSuccess("Usuario Eliminado", "El usuario ha sido eliminado exitosamente.")
            setTimeout(() => window.location.reload(), 1500)
          } else {
            const errorData = await response.json()
            showSuccess("Error", errorData.error || "Error al eliminar usuario", "error")
          }
        } catch (err) {
          showSuccess("Error", "Error al eliminar usuario", "error")
          console.error("Failed to delete user:", err)
        }
      }
    )
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'Super Administrador'
      case 'ORGADMIN': return 'Administrador de Organización'
      case 'COURIER': return 'Courier'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return 'text-purple-600 bg-purple-100'
      case 'ORGADMIN': return 'text-blue-600 bg-blue-100'
      case 'COURIER': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CornerLogout />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/superadmin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Usuarios de {organization.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona los usuarios de esta organización
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog}>
          <UserPlus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {orgUsers.length} usuario{orgUsers.length !== 1 ? 's' : ''} en esta organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          {createError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">{user.isActive ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="h-8 w-8 p-0"
                        title="Editar usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo para crear usuario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario para {organization.name}
            </DialogDescription>
          </DialogHeader>
          
          {createError && (
            <Alert variant="destructive">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Nombre</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="usuario@empresa.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="userPassword">Contraseña</Label>
              <Input
                id="userPassword"
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="roleSelect">Rol</Label>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORGADMIN">Administrador de Organización</SelectItem>
                  <SelectItem value="COURIER">Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateUser}
              disabled={isCreating || !userName || !userEmail || !userPassword || !userRole}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          
          {createError && (
            <Alert variant="destructive">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Nombre</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="usuario@empresa.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editRoleSelect">Rol</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORGADMIN">Administrador de Organización</SelectItem>
                  <SelectItem value="COURIER">Courier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editIsActive">Estado</Label>
              <Select value={editIsActive.toString()} onValueChange={(value) => setEditIsActive(value === 'true')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleUpdateUser}
              disabled={isUpdating || !editName || !editEmail || !editRole}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Actualizar Usuario
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de éxito/error */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog(prev => ({ ...prev, isOpen: false }))}
        title={successDialog.title}
        description={successDialog.description}
        type={successDialog.type}
      />

      {/* Diálogo de confirmación */}
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
