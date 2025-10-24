import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { CornerLogout } from "../components/ui/corner-logout"
import { useAuth } from "../hooks/use-auth"
import { useUsers } from "../hooks/use-users"
import { useOrganizations } from "../hooks/use-organizations"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, Plus, Trash2, UserPlus, Key, Mail, CheckCircle, XCircle, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { SuccessDialog } from "../components/ui/success-dialog"

export default function UserManagementPage() {
  const navigate = useNavigate()
  const { role, logout } = useAuth()
  const { users, isLoading, error, createUser, updateUser, deleteUser, getUsersByOrganization } = useUsers()
  const { organizations } = useOrganizations()

  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Estados para crear usuario
  const [selectedOrg, setSelectedOrg] = useState<string>("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [userRole, setUserRole] = useState<string>("")

  // Estados para actualizar contraseña
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

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
    onConfirm: () => { }
  })

  useEffect(() => {
    if (role !== "SUPERADMIN") {
      navigate("/login")
    }
  }, [role, navigate])

  // No renderizar si no tiene permisos
  if (role !== "SUPERADMIN") {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
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

  const handleCreateUser = async () => {
    if (!selectedOrg || !userName || !userEmail || !userPassword || !userRole) return

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
          organizationId: selectedOrg,
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole
        })
      })

      if (response.ok) {
        // Limpiar formulario y cerrar diálogo
        setUserName("")
        setUserEmail("")
        setUserPassword("")
        setUserRole("")
        setSelectedOrg("")
        setIsDialogOpen(false)
        showSuccess("Usuario Creado", "El usuario ha sido creado exitosamente.")
        // Refrescar la lista
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

  const openCreateUserDialog = () => {
    setUserName("")
    setUserEmail("")
    setUserPassword("")
    setUserRole("")
    setSelectedOrg("")
    setCreateError("")
    setIsDialogOpen(true)
  }

  const openPasswordDialog = (userId: string) => {
    setSelectedUser(userId)
    setNewPassword("")
    setCreateError("")
    setIsPasswordDialogOpen(true)
  }

  const handleUpdatePassword = async () => {
    if (!selectedUser || !newPassword) return

    try {
      setIsUpdatingPassword(true)
      setCreateError("")

      const response = await fetch(`http://localhost:8080/users/${selectedUser}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          password: newPassword
        })
      })

      if (response.ok) {
        setNewPassword("")
        setSelectedUser(null)
        setIsPasswordDialogOpen(false)
        showSuccess("Contraseña Actualizada", "La contraseña ha sido actualizada exitosamente.")
      } else {
        const errorData = await response.json()
        setCreateError(errorData.error || "Error al actualizar contraseña")
      }
    } catch (err) {
      setCreateError("Error al actualizar contraseña")
      console.error("Failed to update password:", err)
    } finally {
      setIsUpdatingPassword(false)
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra usuarios del sistema</CardDescription>
            </div>
            <Button onClick={openCreateUserDialog}>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {organizations.find(org => org.id === user.organizationId)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" title="Activo" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" title="Inactivo" />
                      )}
                      <span className="text-sm">{user.isActive ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPasswordDialog(user.id)}
                        className="h-8 w-8 p-0"
                        title="Cambiar contraseña"
                      >
                        <Key className="h-4 w-4" />
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
              Crea un nuevo usuario en el sistema.
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <Alert variant="destructive">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="orgSelect">Organización</Label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar organización" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  <SelectItem value="SUPERADMIN">Super Administrador</SelectItem>
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
              disabled={isCreating || !userName || !userEmail || !userPassword || !userRole || !selectedOrg}
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

      {/* Diálogo para cambiar contraseña */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa la nueva contraseña para este usuario.
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <Alert variant="destructive">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword || !newPassword}
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Actualizar Contraseña
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



